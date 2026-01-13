import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Create client with service role key for database access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { paymentId, paymentMethod, paymentReference, proofOfPaymentUrl } = await request.json()

    if (!paymentId || !paymentMethod) {
      return NextResponse.json(
        { error: "Payment ID and payment method are required" },
        { status: 400 }
      )
    }

    // For now, use hardcoded borrower email (same as other APIs)
    const testUserEmail = "mayo16collins@gmail.com" // my name is jeff

    // Get borrower information
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

    // Verify the payment belongs to this borrower
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select(`
        *,
        loans!inner (
          borrower_id
        )
      `)
      .eq("id", paymentId)
      .eq("loans.borrower_id", borrower.id)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: "Payment not found or unauthorized access" },
        { status: 404 }
      )
    }

    // Check if payment is in a valid state for submission
    if (payment.status !== 'pending') {
      return NextResponse.json(
        { error: `Payment cannot be submitted. Current status: ${payment.status}` },
        { status: 400 }
      )
    }

    // Update payment with submission details
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from("payments")
      .update({
        status: 'submitted',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        proof_of_payment_url: proofOfPaymentUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", paymentId)
      .select()
      .single()

    if (updateError) {
      console.error("Payment update error:", updateError)
      return NextResponse.json(
        { error: "Failed to submit payment" },
        { status: 500 }
      )
    }

    // Create notification for admin
    await supabaseAdmin
      .from('notifications')
      .insert({
        borrower_id: borrower.id,
        title: "Payment Submitted",
        message: `Payment of $${payment.amount} has been submitted and is awaiting confirmation.`,
        notification_type: "info",
        is_read: false
      })

    return NextResponse.json({
      success: true,
      payment: updatedPayment,
      message: "Payment submitted successfully. It will be reviewed by our team."
    })

  } catch (error: any) {
    console.error("Payment submission error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}