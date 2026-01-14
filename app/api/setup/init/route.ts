import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      organizationEmail,
      organizationPhone,
      address,
      city,
      state,
      country,
      postalCode,
      website,
      adminName,
      adminEmail,
      password
    } = body

    // Validate required fields
    if (!organizationName || !organizationEmail || !adminName || !adminEmail || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create Supabase admin client with service role
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

    // Check if any organizations already exist
    const { data: existingOrgs } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .limit(1)

    if (existingOrgs && existingOrgs.length > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed" },
        { status: 403 }
      )
    }

    // Generate organization slug from name
    const slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const verificationExpires = new Date()
    verificationExpires.setHours(verificationExpires.getHours() + 24) // 24 hours

    // 1. Create organization
    const { data: organization, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        name: organizationName,
        slug,
        email: organizationEmail,
        phone: organizationPhone,
        address,
        city,
        state,
        country: country || 'USA',
        postal_code: postalCode,
        website,
        email_verified: false,
        email_verification_token: verificationToken,
        email_verification_expires_at: verificationExpires.toISOString(),
        is_active: true,
        subscription_plan: 'free',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (orgError || !organization) {
      console.error("Error creating organization:", orgError)
      return NextResponse.json(
        { error: "Failed to create organization" },
        { status: 500 }
      )
    }

    // 2. Create admin auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: false, // Require email verification
      user_metadata: {
        full_name: adminName,
        organization_id: organization.id,
        role: 'admin'
      }
    })

    if (authError || !authData.user) {
      console.error("Error creating admin user:", authError)
      
      // Rollback: Delete organization
      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', organization.id)

      return NextResponse.json(
        { error: authError?.message || "Failed to create admin account" },
        { status: 500 }
      )
    }

    // 3. Create admin_users record
    const { error: adminUserError } = await supabaseAdmin
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email: adminEmail,
        full_name: adminName,
        role: 'admin',
        organization_id: organization.id,
        is_active: true
      })

    if (adminUserError) {
      console.error("Error creating admin_users record:", adminUserError)
      
      // Rollback: Delete auth user and organization
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      await supabaseAdmin
        .from('organizations')
        .delete()
        .eq('id', organization.id)

      return NextResponse.json(
        { error: "Failed to create admin profile" },
        { status: 500 }
      )
    }

    // 4. Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/setup/verify?token=${verificationToken}`
    
    try {
      // Send verification email using Resend
      const emailResult = await emailService.sendOrganizationVerificationEmail({
        to: adminEmail,
        adminName,
        organizationName,
        verificationUrl,
        expiresInHours: 24
      })

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error)
        // Don't fail the setup if email fails, but log it
      } else {
        console.log("Verification email sent successfully to:", adminEmail)
      }
    } catch (emailError) {
      console.error("Error sending verification email:", emailError)
      // Don't fail the setup if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Setup complete! Please check your email to verify your account.",
      organizationId: organization.id
    })

  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
