import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBorrowerAuth } from "@/lib/auth/borrower-server"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()

    // Get loans for this borrower using service role key
    const { data: loans, error: loansError } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("created_at", { ascending: false })

    if (loansError) {
      console.error("Loans fetch error:", loansError)
      return NextResponse.json(
        { error: "Failed to fetch loans" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      loans: loans || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Authentication required" || error.message === "Borrower not found") {
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