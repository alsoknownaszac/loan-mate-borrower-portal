import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    // Verify the token and update password
    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    })

    if (error) {
      console.error("Error verifying token:", error)
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      )
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      data.user.id,
      { password }
    )

    if (updateError) {
      console.error("Error updating password:", updateError)
      return NextResponse.json(
        { error: "Failed to update password" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    })

  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
