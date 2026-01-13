import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()

    // Fetch all loans with borrower information
    const { data: loans, error } = await supabaseAdmin
      .from("loans")
      .select(`
        *,
        borrowers (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Loans fetch error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      loans: loans || []
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