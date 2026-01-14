import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"
import { emailService } from "@/lib/resend/email-service"

// Create admin client with service role key
const supabaseAdmin = createAdminClient()

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const body = await request.json()
    const { email, full_name, phone, password } = body

    // Validate required fields
    if (!email || !full_name || !password) {
      return NextResponse.json(
        { error: "Missing required fields: email, full_name, password" },
        { status: 400 }
      )
    }

    // Create auth user with service role key
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      console.error("Auth user creation error:", authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authUser.user) {
      return NextResponse.json(
        { error: "Failed to create auth user" },
        { status: 500 }
      )
    }

    // Create borrower profile
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .insert({
        id: authUser.user.id,
        email,
        full_name,
        phone: phone || null,
      })
      .select()
      .single()

    if (borrowerError) {
      console.error("Borrower creation error:", borrowerError)
      
      // If borrower creation fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      
      return NextResponse.json(
        { error: borrowerError.message },
        { status: 400 }
      )
    }

    // Create welcome notification
    await supabaseAdmin
      .from("notifications")
      .insert({
        borrower_id: authUser.user.id,
        title: "Welcome to LoanMate",
        message: `Welcome ${full_name}! Your account has been created. You can now log in to track your loans and payments.`,
        notification_type: "success",
        is_read: false
      })

    // Send welcome email with login credentials
    try {
      // Get organization name from admin's organization
      const { data: adminData } = await supabaseAdmin.auth.getUser()
      let organizationName = "LoanMate"
      
      if (adminData?.user) {
        const { data: adminUser } = await supabaseAdmin
          .from("admin_users")
          .select("organization_id, organizations(name)")
          .eq("id", adminData.user.id)
          .single()
        
        if (adminUser?.organizations) {
          organizationName = (adminUser.organizations as any).name
        }
      }

      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
      
      await emailService.sendBorrowerWelcomeEmail({
        to: email,
        borrowerName: full_name,
        organizationName,
        loginUrl,
        temporaryPassword: password
      })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
      // Don't fail the borrower creation if email fails
    }

    return NextResponse.json({
      success: true,
      borrower,
      credentials: {
        email,
        password
      }
    })

  } catch (error: any) {
    console.error("API error:", error)
    
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