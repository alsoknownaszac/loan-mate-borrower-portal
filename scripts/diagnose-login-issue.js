import { createClient } from "@supabase/supabase-js"
import fs from 'fs'

console.log("🔍 COMPREHENSIVE LOGIN DIAGNOSIS")
console.log("=" .repeat(50))

// 1. Check environment file
console.log("\n1️⃣ CHECKING .env.local FILE:")
try {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  const lines = envContent.split('\n')
  
  const relevantVars = lines.filter(line => 
    line.includes('NEXT_PUBLIC_SUPABASE_URL') || 
    line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    line.includes('SUPABASE_SERVICE_ROLE_KEY')
  )
  
  relevantVars.forEach(line => {
    if (line.includes('KEY')) {
      const [key, value] = line.split('=')
      console.log(`${key}=${value?.substring(0, 50)}...`)
    } else {
      console.log(line)
    }
  })
} catch (error) {
  console.log("❌ Error reading .env.local:", error.message)
}

// 2. Test API keys format
console.log("\n2️⃣ TESTING API KEY FORMATS:")
const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

// Check JWT format
const checkJWT = (key, name) => {
  const parts = key.split('.')
  console.log(`${name}: ${parts.length === 3 ? '✅ Valid JWT' : '❌ Invalid JWT'} (${parts.length} parts)`)
  
  if (parts.length === 3) {
    try {
      const header = JSON.parse(atob(parts[0]))
      const payload = JSON.parse(atob(parts[1]))
      console.log(`  - Role: ${payload.role}`)
      console.log(`  - Expires: ${new Date(payload.exp * 1000).toISOString()}`)
    } catch (e) {
      console.log(`  - ❌ Cannot decode JWT: ${e.message}`)
    }
  }
}

checkJWT(ANON_KEY, "ANON_KEY")
checkJWT(SERVICE_KEY, "SERVICE_KEY")

// 3. Test basic connection
console.log("\n3️⃣ TESTING BASIC CONNECTION:")
const supabase = createClient(SUPABASE_URL, ANON_KEY)

try {
  // Test basic connection
  const { data, error } = await supabase.from('admin_users').select('count').limit(1)
  
  if (error) {
    console.log("❌ Basic connection failed:", error.message)
    console.log("   Error code:", error.code)
    console.log("   Error details:", error.details)
    console.log("   Error hint:", error.hint)
  } else {
    console.log("✅ Basic connection successful")
  }
} catch (error) {
  console.log("❌ Connection exception:", error.message)
}

// 4. Test authentication
console.log("\n4️⃣ TESTING AUTHENTICATION:")
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@loanmate.com",
    password: "AdminPassword123!"
  })

  if (error) {
    console.log("❌ Auth failed:", error.message)
    console.log("   Status:", error.status)
    console.log("   Error code:", error.__isAuthError ? "Auth Error" : "Unknown")
    
    // Check specific error types
    if (error.message.includes("Invalid API key")) {
      console.log("🔍 DIAGNOSIS: API Key issue")
      console.log("   - Check Supabase project settings")
      console.log("   - Verify API keys are not disabled")
      console.log("   - Check if project is paused")
    }
    
    if (error.message.includes("Invalid login credentials")) {
      console.log("🔍 DIAGNOSIS: Credentials issue")
      console.log("   - User might not exist in auth.users")
      console.log("   - Password might be incorrect")
    }
    
    if (error.message.includes("Email not confirmed")) {
      console.log("🔍 DIAGNOSIS: Email confirmation issue")
      console.log("   - User exists but email not confirmed")
    }
    
  } else {
    console.log("✅ Authentication successful!")
    console.log("   User ID:", data.user?.id)
    console.log("   Email:", data.user?.email)
    
    // Test admin check
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', 'admin@loanmate.com')
      .eq('is_active', true)
      .single()

    if (adminError) {
      console.log("❌ Admin check failed:", adminError.message)
    } else {
      console.log("✅ Admin user found:", adminUser.full_name)
    }
    
    // Clean up
    await supabase.auth.signOut()
  }
} catch (error) {
  console.log("❌ Auth exception:", error.message)
}

// 5. Test with service role key
console.log("\n5️⃣ TESTING WITH SERVICE ROLE KEY:")
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY)

try {
  const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
  
  if (error) {
    console.log("❌ Service role test failed:", error.message)
  } else {
    console.log("✅ Service role working")
    console.log("   Total users:", users.users?.length || 0)
    const adminUser = users.users?.find(u => u.email === 'admin@loanmate.com')
    console.log("   Admin user exists:", adminUser ? '✅ Yes' : '❌ No')
  }
} catch (error) {
  console.log("❌ Service role exception:", error.message)
}

console.log("\n" + "=" .repeat(50))
console.log("🎯 DIAGNOSIS COMPLETE")