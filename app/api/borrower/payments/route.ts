import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Create client with service role key for data access (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}