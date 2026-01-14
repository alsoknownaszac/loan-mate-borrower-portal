import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/resend/email-service"

/**
 * Test Email Endpoint
 * 
 * Usage: POST /api/test-email
 * Body: { "to": "your-email@example.com" }
 * 
 * This endpoint helps test if email sending is working correctly.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to } = body

    if (!to) {
      return NextResponse.json(
        { error: "Email address is required. Send { \"to\": \"your-email@example.com\" }" },
        { status: 400 }
      )
    }

    console.log("🧪 Testing email configuration...")
    console.log("📧 Sending test email to:", to)
    console.log("📧 From:", process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com')
    console.log("🔑 API Key configured:", !!process.env.RESEND_API_KEY)
    console.log("🔑 API Key (first 10 chars):", process.env.RESEND_API_KEY?.substring(0, 10))

    // Send test email
    const result = await emailService.sendCustomEmail({
      to,
      subject: "LoanMate Email Test - Configuration Working! ✅",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Test</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .info-box { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: monospace; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>✅ Email Configuration Test</h1>
            <p>LoanMate Email System</p>
          </div>
          
          <div class="content">
            <div class="success-box">
              <h2>🎉 Success!</h2>
              <p><strong>Your email configuration is working correctly!</strong></p>
              <p>This test email was successfully sent from your LoanMate application.</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Configuration Details</h3>
              <ul style="margin: 10px 0;">
                <li><strong>From Email:</strong> <code>${process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'}</code></li>
                <li><strong>To Email:</strong> <code>${to}</code></li>
                <li><strong>Email Service:</strong> Resend</li>
                <li><strong>Status:</strong> Delivered</li>
              </ul>
            </div>
            
            <h3>✨ What This Means</h3>
            <p>Your LoanMate application can now send emails for:</p>
            <ul>
              <li>✅ Welcome emails to new borrowers</li>
              <li>✅ Custom notifications from admin</li>
              <li>✅ Loan creation notifications</li>
              <li>✅ Payment reminders</li>
              <li>✅ Document requests</li>
              <li>✅ Organization verification</li>
            </ul>
            
            <h3>🔍 Next Steps</h3>
            <ol>
              <li>Check if this email landed in your inbox or spam folder</li>
              <li>If in spam, mark it as "Not Spam" to improve deliverability</li>
              <li>For production, consider verifying your own domain in Resend</li>
              <li>Monitor email delivery in the Resend dashboard</li>
            </ol>
            
            <p style="margin-top: 30px;">If you received this email, your configuration is working perfectly! 🎊</p>
          </div>
          
          <div class="footer">
            <p><strong>LoanMate</strong> - Modern Loan Management System</p>
            <p>This is a test email sent from your application.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Email Configuration Test - SUCCESS!
        
        Your LoanMate email configuration is working correctly!
        
        Configuration Details:
        - From Email: ${process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'}
        - To Email: ${to}
        - Email Service: Resend
        - Status: Delivered
        
        Your application can now send emails for:
        - Welcome emails to new borrowers
        - Custom notifications from admin
        - Loan creation notifications
        - Payment reminders
        - Document requests
        - Organization verification
        
        Next Steps:
        1. Check if this email landed in your inbox or spam folder
        2. If in spam, mark it as "Not Spam"
        3. For production, verify your own domain in Resend
        4. Monitor delivery in Resend dashboard
        
        ---
        LoanMate - Modern Loan Management System
      `
    })

    if (result.success) {
      console.log("✅ Test email sent successfully!")
      console.log("📬 Message ID:", result.messageId)
      
      return NextResponse.json({
        success: true,
        message: "Test email sent successfully! Check your inbox (and spam folder).",
        details: {
          to,
          from: process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com',
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      console.error("❌ Test email failed:", result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error,
        message: "Failed to send test email. Check the error details below.",
        troubleshooting: {
          apiKeyConfigured: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com',
          possibleIssues: [
            "Invalid API key",
            "Domain not verified (if using custom domain)",
            "Rate limit exceeded",
            "Network connectivity issue"
          ],
          nextSteps: [
            "Check RESEND_API_KEY in environment variables",
            "Verify domain in Resend dashboard (if using custom domain)",
            "Check Resend dashboard for error logs",
            "Try using onboarding@resend.dev for testing"
          ]
        }
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("❌ Test email exception:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "An unexpected error occurred while testing email.",
      troubleshooting: {
        errorType: error.name,
        errorMessage: error.message,
        apiKeyConfigured: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'
      }
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email Test Endpoint",
    usage: "Send a POST request with { \"to\": \"your-email@example.com\" }",
    example: {
      method: "POST",
      url: "/api/test-email",
      body: {
        to: "your-email@example.com"
      }
    },
    configuration: {
      apiKeyConfigured: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'
    }
  })
}
