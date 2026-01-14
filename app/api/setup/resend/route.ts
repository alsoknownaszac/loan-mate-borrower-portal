import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminEmail } = body

    if (!adminEmail) {
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

    // Find the admin user
    const { data: adminUser, error: adminError } = await supabaseAdmin
      .from('admin_users')
      .select('*, organizations(*)')
      .eq('email', adminEmail)
      .single()

    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      )
    }

    // Check if already verified
    if (adminUser.organizations.email_verified) {
      return NextResponse.json(
        { error: "Email already verified. Please login." },
        { status: 400 }
      )
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date()
    verificationExpires.setHours(verificationExpires.getHours() + 24) // 24 hours

    // Update organization with new token
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({
        email_verification_token: verificationToken,
        email_verification_expires_at: verificationExpires.toISOString()
      })
      .eq('id', adminUser.organization_id)

    if (updateError) {
      console.error("Error updating verification token:", updateError)
      return NextResponse.json(
        { error: "Failed to generate new verification token" },
        { status: 500 }
      )
    }

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/setup/verify?token=${verificationToken}`
    
    try {
      const emailResult = await emailService.sendOrganizationVerificationEmail({
        to: adminEmail,
        adminName: adminUser.full_name,
        organizationName: adminUser.organizations.name,
        verificationUrl,
        expiresInHours: 24
      })

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error)
        return NextResponse.json(
          { error: "Failed to send verification email" },
          { status: 500 }
        )
      }

      console.log("Verification email resent successfully to:", adminEmail)

      return NextResponse.json({
        success: true,
        message: "Verification email sent! Please check your inbox."
      })

    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
