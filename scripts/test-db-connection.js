import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testConnection() {
  console.log("🔍 Testing Supabase connection...")
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from("admin_users")
      .select("count")
      .limit(1)

    if (error) {
      console.log("❌ Error:", error.message)
      
      if (error.code === '42P01') {
        console.log("📋 admin_users table doesn't exist yet")
        console.log("🔧 Next steps:")
        console.log("1. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
        console.log("2. Copy and run the SQL from scripts/03-admin-schema.sql")
        console.log("3. Then run this script again")
        return false
      }
    } else {
      console.log("✅ Database connection successful!")
      console.log("📊 admin_users table exists")
      return true
    }
  } catch (error) {
    console.error("💥 Connection failed:", error.message)
    return false
  }
}

async function createAdminUser() {
  console.log("👤 Creating admin user...")
  
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@loanmate.com",
      password: "AdminPassword123!",
      email_confirm: true
    })

    if (authError) {
      console.log("⚠️  Auth user creation error:", authError.message)
      if (authError.message.includes("already registered")) {
        console.log("✅ Auth user already exists")
      }
    } else {
      console.log("✅ Auth user created successfully!")
    }

    // Create admin_users record
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .upsert({
        email: "admin@loanmate.com",
        full_name: "LoanMate Administrator",
        role: "admin",
        is_active: true
      }, {
        onConflict: 'email'
      })
      .select()

    if (adminError) {
      console.log("❌ Admin record error:", adminError.message)
    } else {
      console.log("✅ Admin record created successfully!")
    }

  } catch (error) {
    console.error("💥 Error creating admin user:", error.message)
  }
}

async function main() {
  const connected = await testConnection()
  
  if (connected) {
    await createAdminUser()
    console.log("\n🎉 Setup complete!")
    console.log("🌐 Admin panel: http://localhost:3000/admin/login")
    console.log("📧 Email: admin@loanmate.com")
    console.log("🔑 Password: AdminPassword123!")
  }
}

main()