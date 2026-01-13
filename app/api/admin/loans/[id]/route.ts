import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    // Await the params
    const { id } = await params

    // Validate the ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Invalid loan ID" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Fetch loan with all related data
    const { data: loan, error } = await supabaseAdmin
      .from("loans")
      .select(`
        *,
        borrowers (*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Loan fetch error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!loan) {
      return NextResponse.json(
        { error: "Loan not found" },
        { status: 404 }
      )
    }

    // Fetch payments for this loan
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from("payments")
      .select("*")
      .eq("loan_id", id)
      .order("due_date", { ascending: true })

    if (paymentsError) {
      console.error("Payments fetch error:", paymentsError)
    }

    // Fetch documents for this borrower (both general and loan-specific)
    const { data: documents, error: documentsError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .or(`borrower_id.eq.${loan.borrower_id},loan_id.eq.${id}`)
      .order("created_at", { ascending: false })

    if (documentsError) {
      console.error("Documents fetch error:", documentsError)
    }

    // Combine the data
    const loanWithRelations = {
      ...loan,
      payments: payments || [],
      documents: documents || []
    }

    return NextResponse.json({
      success: true,
      loan: loanWithRelations
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    // Await the params
    const { id } = await params

    // Validate the ID
    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: "Invalid loan ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const supabaseAdmin = createAdminClient()

    // Update loan
    const { data: loan, error } = await supabaseAdmin
      .from("loans")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Loan update error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      loan
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