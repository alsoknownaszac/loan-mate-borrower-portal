import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const adminUser = await requireAdminAuth()
    console.log("Admin user authenticated:", adminUser.email)

    // Await the params
    const { id } = await params
    
    // Validate the ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Invalid borrower ID" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()
    const borrowerId = id

    console.log("Fetching borrower with ID:", borrowerId)

    // Fetch borrower with all related data using service role key (bypasses RLS)
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("*")
      .eq("id", borrowerId)
      .single()

    if (borrowerError) {
      console.error("Error fetching borrower:", borrowerError)
      return NextResponse.json(
        { error: "Borrower not found", details: borrowerError.message },
        { status: 404 }
      )
    }

    // Fetch related data separately to avoid relationship issues
    const [loansResult, documentsResult, paymentsResult, notificationsResult] = await Promise.all([
      supabaseAdmin.from("loans").select("*").eq("borrower_id", borrowerId),
      supabaseAdmin.from("documents").select("*").eq("borrower_id", borrowerId),
      supabaseAdmin.from("payments").select("*").eq("borrower_id", borrowerId),
      supabaseAdmin.from("notifications").select("*").eq("borrower_id", borrowerId)
    ])

    // Combine the data
    const borrowerProfile = {
      ...borrower,
      loans: loansResult.data || [],
      documents: documentsResult.data || [],
      payments: paymentsResult.data || [],
      notifications: notificationsResult.data || []
    }

    console.log("Borrower profile assembled successfully:", borrower.full_name)

    return NextResponse.json({
      success: true,
      borrower: borrowerProfile
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Admin authentication required") {
      return NextResponse.json(
        { error: "Unauthorized - Admin authentication required" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}