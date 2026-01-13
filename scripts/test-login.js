import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testLogin() {
  console.log("🔍 Testing admin login...")
  
  try {
    // Test login with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@loanmate.com",
      password: "AdminPassword123!"
    })

    if (error) {
      console.log("❌ Login error:", error.message)
      console.log("🔍 Error code:", error.status)
      
      if (error.message.includes("Invalid API key")) {
        console.log("💡 API key issue detected!")
        console.log("🔧 Check your Supabase project settings")
      }
      
      if (error.message.includes("Invalid login credentials")) {
        console.log("💡 Credentials issue - user might not exist")
      }
      
      return false
    }

    console.log("✅ Login successful!")
    console.log("👤 User:", data.user?.email)

    // Test admin check
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@loanmate.com')
      .eq('is_active', true)
      .single()

    if (adminError) {
      console.log("❌ Admin check error:", adminError.message)
    } else {
      console.log("✅ Admin user found:", adminUser.full_name)
    }

    // Sign out
    await supabase.auth.signOut()
    console.log("✅ Signed out successfully")

    return true

  } catch (error) {
    console.error("💥 Unexpected error:", error.message)
    return false
  }
}

testLogin()