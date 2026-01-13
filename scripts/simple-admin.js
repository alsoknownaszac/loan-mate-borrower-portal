import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function createSimpleAdmin() {
  console.log("[v0] Checking admin_users table...")

  try {
    // Try to insert admin user record directly
    const { data, error } = await supabase
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

    if (error) {
      console.log("[v0] Error inserting admin user:", error.message)
      
      if (error.code === '42P01') {
        console.log("[v0] ❌ admin_users table doesn't exist")
        console.log("[v0] Please run the SQL schema in your Supabase dashboard:")
        console.log("1. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/sql")
        console.log("2. Run the contents of scripts/03-admin-schema.sql")
        return
      }
    } else {
      console.log("[v0] ✅ Admin user record created/updated successfully!")
    }

    // Now try to create the auth user (this might fail without service role key)
    console.log("[v0] Note: You'll need to create the auth user manually in Supabase dashboard:")
    console.log("1. Go to: https://supabase.com/dashboard/project/twenkuyewmgwvqyxurpj/auth/users")
    console.log("2. Click 'Add user'")
    console.log("3. Email: admin@loanmate.com")
    console.log("4. Password: AdminPassword123!")
    console.log("5. Email Confirm: true")

  } catch (error) {
    console.error("[v0] Error:", error)
  }
}

createSimpleAdmin()