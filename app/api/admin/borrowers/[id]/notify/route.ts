import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"
import { emailService } from "@/lib/resend/email-service"

export async function POST(
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
        { error: "Invalid borrower ID" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { type, loanId } = body

    const supabaseAdmin = createAdminClient()

    // Get borrower information
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("*")
      .eq("id", id)
      .single()

    if (borrowerError || !borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      )
    }

    let notification = null

    if (type === "loan_created") {
      // Get loan information
      const { data: loan, error: loanError } = await supabaseAdmin
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .single()

      if (loanError || !loan) {
        return NextResponse.json(
          { error: "Loan not found" },
          { status: 404 }
        )
      }

      // Create notification for new loan
      const { data: notificationData, error: notificationError } = await supabaseAdmin
        .from("notifications")
        .insert({
          borrower_id: id,
          title: "New Loan Created - Login to View Details",
          message: `A new loan of ${loan.principal_amount.toLocaleString()} has been created for you. Please login to your borrower portal to view your loan details and payment schedule. Login at: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`,
          notification_type: "success"
        })
        .select()
        .single()

      if (notificationError) {
        console.error("Notification creation error:", notificationError)
        return NextResponse.json(
          { error: "Failed to create notification" },
          { status: 400 }
        )
      }

      notification = notificationData

      // Send email notification
      const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`
      
      const emailResult = await emailService.sendLoanCreatedEmail({
        to: borrower.email,
        borrowerName: borrower.full_name,
        loanAmount: loan.principal_amount,
        monthlyPayment: loan.monthly_payment || 0,
        loanTermMonths: loan.loan_term_months,
        interestRate: loan.interest_rate,
        startDate: loan.start_date,
        loginUrl
      })

      return NextResponse.json({
        success: true,
        message: "Borrower notified successfully",
        notification,
        loginUrl,
        emailSent: emailResult.success
      })
    }

    // For other notification types, just return success
    return NextResponse.json({
      success: true,
      message: "Notification sent successfully",
      loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`
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