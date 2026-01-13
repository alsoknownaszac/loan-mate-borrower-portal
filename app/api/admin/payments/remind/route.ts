import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const body = await request.json()
    const { paymentId, borrowerId } = body

    if (!paymentId || !borrowerId) {
      return NextResponse.json(
        { error: "Missing paymentId or borrowerId" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Get payment information
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select(`
        *,
        loans (
          id,
          borrowers (
            id,
            full_name,
            email
          )
        )
      `)
      .eq("id", paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      )
    }

    const borrower = payment.loans.borrowers
    const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/login`

    // Send payment reminder email
    const emailResult = await emailService.sendPaymentReminderEmail({
      to: borrower.email,
      borrowerName: borrower.full_name,
      paymentAmount: payment.amount,
      dueDate: payment.due_date,
      loanId: payment.loans.id,
      loginUrl
    })

    // Create notification
    await supabaseAdmin
      .from("notifications")
      .insert({
        borrower_id: borrowerId,
        title: "Payment Reminder",
        message: `Your payment of $${payment.amount.toFixed(2)} is due on ${new Date(payment.due_date).toLocaleDateString()}. Please make your payment to avoid late fees.`,
        notification_type: "payment"
      })

    return NextResponse.json({
      success: true,
      message: "Payment reminder sent successfully",
      emailSent: emailResult.success,
      borrowerEmail: borrower.email
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