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
    const { type, loanId, title, message } = body

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

    if (type === "custom" && title && message) {
      // Create custom notification
      const { data: notificationData, error: notificationError } = await supabaseAdmin
        .from("notifications")
        .insert({
          borrower_id: id,
          title,
          message,
          notification_type: "info"
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
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/login`
      
      try {
        const emailResult = await emailService.sendCustomEmail({
          to: borrower.email,
          subject: title,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .message-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>📬 ${title}</h1>
              </div>
              
              <div class="content">
                <p>Hi <strong>${borrower.full_name}</strong>,</p>
                
                <div class="message-box">
                  <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${loginUrl}" class="cta-button">🔐 Login to Your Portal</a>
                </div>
                
                <p style="margin-top: 30px;">If you have any questions, please contact us through your borrower portal.</p>
              </div>
              
              <div class="footer">
                <p>This email was sent by LoanMate Loan Management System</p>
              </div>
            </body>
            </html>
          `,
          text: `
            ${title}
            
            Hi ${borrower.full_name},
            
            ${message}
            
            Login to your portal: ${loginUrl}
          `
        })

        console.log(emailResult.success ? "✅ Email sent successfully" : "❌ Email failed:", emailResult.error)
      } catch (emailError) {
        console.error("❌ Exception sending email:", emailError)
        // Don't fail the notification if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Custom notification sent successfully",
        notification
      })
    } else if (type === "loan_created") {
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