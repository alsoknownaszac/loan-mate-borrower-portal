import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

// Create admin client with service role key
const supabaseAdmin = createAdminClient()

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
  let password = ""
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const body = await request.json()
    const { borrowers } = body

    if (!Array.isArray(borrowers) || borrowers.length === 0) {
      return NextResponse.json(
        { error: "Invalid borrowers data" },
        { status: 400 }
      )
    }

    const results = []
    const errors = []

    for (let i = 0; i < borrowers.length; i++) {
      const borrower = borrowers[i]
      
      try {
        // Validate required fields
        if (!borrower.email || !borrower.full_name) {
          errors.push({
            row: i + 1,
            email: borrower.email,
            error: "Missing required fields: email or full_name"
          })
          continue
        }

        // Generate password if not provided
        const password = borrower.password || generatePassword()

        // Create auth user
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: borrower.email,
          password,
          email_confirm: true,
        })

        if (authError) {
          errors.push({
            row: i + 1,
            email: borrower.email,
            error: authError.message
          })
          continue
        }

        if (!authUser.user) {
          errors.push({
            row: i + 1,
            email: borrower.email,
            error: "Failed to create auth user"
          })
          continue
        }

        // Create borrower profile
        const { data: borrowerRecord, error: borrowerError } = await supabaseAdmin
          .from("borrowers")
          .insert({
            id: authUser.user.id,
            email: borrower.email,
            full_name: borrower.full_name,
            phone: borrower.phone || null,
          })
          .select()
          .single()

        if (borrowerError) {
          // Clean up auth user if borrower creation fails
          await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
          
          errors.push({
            row: i + 1,
            email: borrower.email,
            error: borrowerError.message
          })
          continue
        }

        // Create welcome notification
        await supabaseAdmin
          .from("notifications")
          .insert({
            borrower_id: authUser.user.id,
            title: "Welcome to LoanMate",
            message: `Welcome ${borrower.full_name}! Your account has been created. You can now log in to track your loans and payments.`,
            notification_type: "success",
            is_read: false
          })

        results.push({
          row: i + 1,
          borrower: borrowerRecord,
          credentials: {
            email: borrower.email,
            password
          }
        })

      } catch (error: any) {
        errors.push({
          row: i + 1,
          email: borrower.email,
          error: error.message || "Unexpected error"
        })
      }
    }

    return NextResponse.json({
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors
    })

  } catch (error: any) {
    console.error("Bulk upload API error:", error)
    
    if (error.message === "Admin authentication required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}