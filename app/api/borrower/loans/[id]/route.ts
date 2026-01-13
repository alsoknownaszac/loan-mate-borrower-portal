import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create client with service role key for data access (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { id } = await params

    // Validate the ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Invalid loan ID" },
        { status: 400 }
      )
    }

    // For now, let's use a fallback approach that works when logged in
    // TODO: Implement proper cookie-based authentication
    const testUserEmail = "mayo16collins@gmail.com" // my name is jeff

    // Get borrower information using service role key
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("id")
      .eq("email", testUserEmail)
      .single()

    if (borrowerError || !borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      )
    }

    // Get loan details with payments
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .select(`
        *,
        payments (
          id,
          amount,
          due_date,
          status,
          paid_date
        )
      `)
      .eq("id", id)
      .eq("borrower_id", borrower.id)
      .single()

    if (loanError || !loan) {
      return NextResponse.json(
        { error: "Loan not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      loan
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}