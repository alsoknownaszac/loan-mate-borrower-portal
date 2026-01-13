import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function setupDatabase() {
  console.log("[v0] Setting up database...")

  try {
    // Test connection
    const { data, error } = await supabase.from('borrowers').select('count').limit(1)
    
    if (error && error.code === '42P01') {
      console.log("[v0] Tables don't exist, need to run schema setup first")
      console.log("[v0] Please run the SQL schema files in your Supabase dashboard:")
      console.log("1. Go to https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
      console.log("2. Run the contents of scripts/01-init-schema.sql")
      console.log("3. Run the contents of scripts/03-admin-schema.sql")
      console.log("4. Then run this script again")
      return
    }

    console.log("[v0] Database connection successful!")
    
    // Create test borrower
    console.log("[v0] Creating test borrower...")
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "test@loanmate.com",
      password: "TestPassword123!",
      email_confirm: true,
    })

    if (authError && !authError.message.includes('already registered')) {
      console.error("[v0] Failed to create auth user:", authError.message)
      return
    }

    const userId = authUser?.user?.id || (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === "test@loanmate.com")?.id

    if (userId) {
      // Create borrower profile
      const { error: borrowerError } = await supabase
        .from("borrowers")
        .upsert({
          id: userId,
          email: "test@loanmate.com",
          full_name: "Test Borrower",
          phone: "+1-555-0123",
        })

      if (borrowerError && !borrowerError.message.includes('duplicate')) {
        console.error("[v0] Failed to create borrower:", borrowerError.message)
      } else {
        console.log("[v0] Test borrower created successfully!")
      }
    }

    // Create admin user
    console.log("[v0] Creating admin user...")
    const { data: adminAuthUser, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: "admin@loanmate.com",
      password: "AdminPassword123!",
      email_confirm: true,
    })

    if (adminAuthError && !adminAuthError.message.includes('already registered')) {
      console.error("[v0] Failed to create admin auth user:", adminAuthError.message)
      return
    }

    // Create admin profile
    const { error: adminError } = await supabase
      .from("admin_users")
      .upsert({
        email: "admin@loanmate.com",
        full_name: "LoanMate Administrator",
        role: "admin",
        is_active: true
      })

    if (adminError && !adminError.message.includes('duplicate')) {
      console.error("[v0] Failed to create admin profile:", adminError.message)
    } else {
      console.log("[v0] Admin user created successfully!")
    }

    console.log("[v0] Database setup completed!")
    console.log("[v0] Test Borrower Login: test@loanmate.com / TestPassword123!")
    console.log("[v0] Admin Login: admin@loanmate.com / AdminPassword123!")

  } catch (error) {
    console.error("[v0] Error setting up database:", error)
  }
}

setupDatabase()