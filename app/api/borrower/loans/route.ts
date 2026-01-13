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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}