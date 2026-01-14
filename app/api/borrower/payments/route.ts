import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBorrowerAuth } from "@/lib/auth/borrower-server"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()

    // Get payments for this specific borrower's loans only
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select(`
        *,
        loans!inner (
          id,
          principal_amount,
          interest_rate,
          borrower_id
        )
      `)
      .eq("loans.borrower_id", borrower.id)
      .order("due_date", { ascending: true })

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError)
      return NextResponse.json(
        { error: "Failed to fetch payments" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      payments: payments || []
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