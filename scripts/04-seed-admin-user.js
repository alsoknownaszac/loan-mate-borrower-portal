import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const ADMIN_USER = {
  email: "admin@loanmate.com",
  password: "AdminPassword123!",
  fullName: "LoanMate Administrator",
  role: "admin"
}

async function seedAdminUser() {
  try {
    console.log("[v0] Checking if admin user already exists...")

    // Check if admin user exists
    const { data: existingAdmin } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', ADMIN_USER.email)
      .single()

    if (existingAdmin) {
      console.log("[v0] Admin user already exists, skipping creation")
      return
    }

    // Create auth user
    console.log("[v0] Creating admin auth user...")
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_USER.email,
      password: ADMIN_USER.password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Failed to create admin auth user:", authError.message)
      return
    }

    console.log("[v0] Admin auth user created:", authUser.user.id)

    // Create admin profile
    console.log("[v0] Creating admin profile...")
    const { data: adminProfile, error: adminError } = await supabase
      .from("admin_users")
      .insert({
        email: ADMIN_USER.email,
        full_name: ADMIN_USER.fullName,
        role: ADMIN_USER.role,
        is_active: true
      })
      .select()

    if (adminError) {
      console.error("[v0] Failed to create admin profile:", adminError.message)
      return
    }

    console.log("[v0] Admin profile created successfully!")
    console.log(`[v0] Admin login: ${ADMIN_USER.email} / ${ADMIN_USER.password}`)
    console.log("[v0] Access admin portal at: /admin/login")

  } catch (error) {
    console.error("[v0] Error seeding admin user:", error)
  }
}

seedAdminUser()