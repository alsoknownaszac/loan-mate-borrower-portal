import { NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/resend/email-service"

/**
 * Test Organization Verification Email Endpoint
 * 
 * Usage: POST /api/test-org-email
 * Body: { "to": "your-email@example.com" }
 * 
 * This endpoint tests the organization verification email functionality.
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

    const emailProvider = process.env.EMAIL_PROVIDER || 'resend'
    
    console.log("🧪 Testing organization verification email...")
    console.log("📧 Sending to:", to)
    console.log("📧 Provider:", emailProvider)
    
    if (emailProvider === 'gmail') {
      console.log("📧 Gmail User:", process.env.GMAIL_USER)
      console.log("🔑 Gmail Password configured:", !!process.env.GMAIL_APP_PASSWORD)
    } else {
      console.log("📧 From:", process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com')
      console.log("🔑 Resend API Key configured:", !!process.env.RESEND_API_KEY)
    }

    // Create a test verification URL
    const testVerificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/setup/verify?token=test-token-12345`

    // Send test organization verification email
    const result = await emailService.sendOrganizationVerificationEmail({
      to,
      adminName: "Test Admin",
      organizationName: "Test Organization",
      verificationUrl: testVerificationUrl,
      expiresInHours: 24
    })

    if (result.success) {
      console.log("✅ Organization verification email sent successfully!")
      console.log("📬 Message ID:", result.messageId)
      
      return NextResponse.json({
        success: true,
        message: "Organization verification email sent successfully! Check your inbox (and spam folder).",
        details: {
          to,
          provider: emailProvider,
          from: emailProvider === 'gmail' ? process.env.GMAIL_USER : process.env.RESEND_FROM_EMAIL,
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      console.error("❌ Organization verification email failed:", result.error)
      
      return NextResponse.json({
        success: false,
        error: result.error,
        message: "Failed to send organization verification email. Check the error details below.",
        troubleshooting: {
          provider: emailProvider,
          configured: emailProvider === 'gmail' 
            ? !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
            : !!process.env.RESEND_API_KEY,
          possibleIssues: emailProvider === 'gmail' 
            ? [
                "Gmail credentials not configured",
                "Invalid App Password",
                "2FA not enabled on Gmail account",
                "Network connectivity issue"
              ]
            : [
                "Invalid API key",
                "Domain not verified (if using custom domain)",
                "Rate limit exceeded",
                "Network connectivity issue"
              ],
          nextSteps: emailProvider === 'gmail'
            ? [
                "Check GMAIL_USER and GMAIL_APP_PASSWORD in .env.local",
                "Ensure 2FA is enabled on your Gmail account",
                "Generate a new App Password if needed",
                "Check console logs for detailed error messages"
              ]
            : [
                "Check RESEND_API_KEY in environment variables",
                "Verify domain in Resend dashboard (if using custom domain)",
                "Check Resend dashboard for error logs",
                "Try using onboarding@resend.dev for testing"
              ]
        }
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("❌ Test organization email exception:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "An unexpected error occurred while testing organization verification email.",
      troubleshooting: {
        errorType: error.name,
        errorMessage: error.message,
        provider: process.env.EMAIL_PROVIDER || 'resend',
        configured: process.env.EMAIL_PROVIDER === 'gmail'
          ? !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
          : !!process.env.RESEND_API_KEY
      }
    }, { status: 500 })
  }
}

export async function GET() {
  const emailProvider = process.env.EMAIL_PROVIDER || 'resend'
  
  return NextResponse.json({
    message: "Organization Verification Email Test Endpoint",
    usage: "Send a POST request with { \"to\": \"your-email@example.com\" }",
    example: {
      method: "POST",
      url: "/api/test-org-email",
      body: {
        to: "your-email@example.com"
      }
    },
    configuration: {
      provider: emailProvider,
      configured: emailProvider === 'gmail'
        ? !!process.env.GMAIL_USER && !!process.env.GMAIL_APP_PASSWORD
        : !!process.env.RESEND_API_KEY,
      fromEmail: emailProvider === 'gmail' 
        ? process.env.GMAIL_USER 
        : process.env.RESEND_FROM_EMAIL || 'noreply@loanmate.com'
    }
  })
}
