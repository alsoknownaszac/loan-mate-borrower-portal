import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate password reset link using Supabase
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
      }
    })

    if (error) {
      console.error("Error generating reset link:", error)
      // Don't reveal if email exists or not (security)
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link."
      })
    }

    if (!data.properties?.action_link) {
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link."
      })
    }

    // Extract token from the action link
    const actionLink = data.properties.action_link
    const url = new URL(actionLink)
    const token = url.searchParams.get('token')

    if (!token) {
      console.error("No token in action link")
      return NextResponse.json({
        success: true,
        message: "If an account exists with that email, you will receive a password reset link."
      })
    }

    // Create reset URL with our custom page
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`

    // Get user name for email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(data.user.id)
    const userName = userData?.user?.user_metadata?.full_name || email.split('@')[0]

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail({
      to: email,
      userName,
      resetUrl,
      expiresInHours: 1
    })

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with that email, you will receive a password reset link."
    })

  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
