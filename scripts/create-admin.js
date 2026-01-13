import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdmin() {
  console.log("[v0] Creating admin user...")

  try {
    // First, let's check if admin_users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('admin_users')
      .select('count')
      .limit(1)

    if (tableError) {
      console.log("[v0] admin_users table doesn't exist, creating it...")
      
      // Create the admin_users table
      const { error: createTableError } = await supabase.rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS admin_users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'support')),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `
      })

      if (createTableError) {
        console.error("[v0] Failed to create admin_users table:", createTableError)
        return
      }
    }

    // Create admin auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@loanmate.com",
      password: "AdminPassword123!",
      email_confirm: true,
    })

    if (authError && !authError.message.includes('already registered')) {
      console.error("[v0] Failed to create admin auth user:", authError.message)
      return
    }

    console.log("[v0] Admin auth user created or already exists")

    // Create admin profile
    const { error: adminError } = await supabase
      .from("admin_users")
      .upsert({
        email: "admin@loanmate.com",
        full_name: "LoanMate Administrator",
        role: "admin",
        is_active: true
      }, {
        onConflict: 'email'
      })

    if (adminError) {
      console.error("[v0] Failed to create admin profile:", adminError.message)
      return
    }

    console.log("[v0] ✅ Admin user created successfully!")
    console.log("[v0] Login at: http://localhost:3000/admin/login")
    console.log("[v0] Email: admin@loanmate.com")
    console.log("[v0] Password: AdminPassword123!")

  } catch (error) {
    console.error("[v0] Error creating admin:", error)
  }
}

createAdmin()