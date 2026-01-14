import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/setup?error=invalid_token', request.url))
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

    // Find organization with this verification token
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .select('*, admin_users(*)')
      .eq('email_verification_token', token)
      .single()

    if (orgError || !organization) {
      return NextResponse.redirect(new URL('/setup?error=invalid_token', request.url))
    }

    // Check if token has expired
    const expiresAt = new Date(organization.email_verification_expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.redirect(new URL('/setup?error=token_expired', request.url))
    }

    // Check if already verified
    if (organization.email_verified) {
      return NextResponse.redirect(new URL('/admin-auth/login?message=already_verified', request.url))
    }

    // Update organization as verified
    const { error: updateError } = await supabaseAdmin
      .from('organizations')
      .update({
        email_verified: true,
        email_verification_token: null,
        email_verification_expires_at: null
      })
      .eq('id', organization.id)

    if (updateError) {
      console.error("Error updating organization:", updateError)
      return NextResponse.redirect(new URL('/setup?error=verification_failed', request.url))
    }

    // Get the admin user associated with this organization
    const adminUser = organization.admin_users?.[0]
    
    if (adminUser) {
      // Verify the admin user's email in Supabase Auth
      const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(
        adminUser.id,
        { email_confirm: true }
      )

      if (verifyError) {
        console.error("Error verifying admin email:", verifyError)
      }

      // Generate a one-time login link
      const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: adminUser.email
      })

      if (!linkError && linkData) {
        // Redirect to the magic link which will auto-login the user
        return NextResponse.redirect(linkData.properties.action_link)
      }
    }

    // Fallback: redirect to login with success message
    return NextResponse.redirect(
      new URL('/admin-auth/login?message=verified', request.url)
    )

  } catch (error) {
    console.error("Verification error:", error)
    return NextResponse.redirect(
      new URL('/setup?error=verification_failed', request.url)
    )
  }
}
