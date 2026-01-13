import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const body = await request.json()
    const { 
      borrower_id, 
      principal_amount, 
      interest_rate, 
      loan_term_months, 
      start_date, 
      payment_instructions 
    } = body

    // Validate required fields
    if (!borrower_id || !principal_amount || !interest_rate || !loan_term_months || !start_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Calculate loan details
    const monthlyRate = interest_rate / 100 / 12
    const monthlyPayment = (principal_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_term_months)) / 
                          (Math.pow(1 + monthlyRate, loan_term_months) - 1)

    const startDate = new Date(start_date)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + loan_term_months)

    const nextPaymentDate = new Date(startDate)
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)

    // Create loan
    const { data: loan, error: loanError } = await supabaseAdmin
      .from("loans")
      .insert({
        borrower_id,
        principal_amount,
        interest_rate,
        loan_term_months,
        start_date,
        end_date: endDate.toISOString().split('T')[0],
        status: 'active',
        remaining_balance: principal_amount,
        monthly_payment: monthlyPayment,
        payment_instructions: payment_instructions || null,
        next_payment_date: nextPaymentDate.toISOString().split('T')[0]
      })
      .select()
      .single()

    if (loanError) {
      console.error("Loan creation error:", loanError)
      return NextResponse.json(
        { error: loanError.message },
        { status: 400 }
      )
    }

    // Generate payment schedule
    const payments = []
    for (let i = 1; i <= loan_term_months; i++) {
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + i)
      
      payments.push({
        loan_id: loan.id,
        amount: monthlyPayment,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'pending'
      })
    }

    const { error: paymentsError } = await supabaseAdmin
      .from("payments")
      .insert(payments)

    if (paymentsError) {
      console.error("Payments creation error:", paymentsError)
      // Don't fail the whole operation, but log the error
    }

    // Create notification for borrower
    await supabaseAdmin
      .from("notifications")
      .insert({
        borrower_id,
        title: "New Loan Created",
        message: `A new loan of $${principal_amount.toLocaleString()} has been created for you. You can now view your payment schedule and loan details.`,
        notification_type: "success"
      })

    // Get borrower information for email
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("*")
      .eq("id", borrower_id)
      .single()

    // Send email notification
    let emailResult = null
    if (borrower && !borrowerError) {
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`
      
      emailResult = await emailService.sendLoanCreatedEmail({
        to: borrower.email,
        borrowerName: borrower.full_name,
        loanAmount: principal_amount,
        monthlyPayment,
        loanTermMonths: loan_term_months,
        interestRate: interest_rate,
        startDate: start_date,
        loginUrl
      })
    }

    return NextResponse.json({
      success: true,
      loan,
      loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`,
      emailSent: emailResult?.success || false,
      borrowerEmail: borrower?.email
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