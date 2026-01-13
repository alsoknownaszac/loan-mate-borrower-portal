import { createClient } from "@supabase/supabase-js"

// Test with anon key (what the client uses)
const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testClientOperations() {
  console.log("🔍 Testing client-side operations (using anon key)...")
  
  try {
    // Test 1: Try to create auth user (this should fail with anon key)
    console.log("\n1️⃣ Testing auth.admin.createUser (should fail with anon key)...")
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email: "test@example.com",
      password: "testpassword123",
      email_confirm: true,
    })

    if (authError) {
      console.log("❌ Auth admin error:", authError.message)
      console.log("🔍 Error code:", authError.status)
      
      if (authError.status === 401) {
        console.log("💡 This is the problem! Client is using anon key but trying admin operations")
      }
    } else {
      console.log("✅ Auth admin worked (unexpected!)")
    }

    // Test 2: Try to insert into borrowers table
    console.log("\n2️⃣ Testing borrowers table insert...")
    const { data: borrower, error: borrowerError } = await supabaseClient
      .from("borrowers")
      .insert({
        id: "test-id-123",
        email: "test@example.com",
        full_name: "Test User",
        phone: "123-456-7890",
      })

    if (borrowerError) {
      console.log("❌ Borrowers insert error:", borrowerError.message)
      console.log("🔍 Error code:", borrowerError.code)
    } else {
      console.log("✅ Borrowers insert worked")
      
      // Clean up test data
      await supabaseClient.from("borrowers").delete().eq("id", "test-id-123")
    }

  } catch (error) {
    console.error("💥 Unexpected error:", error.message)
  }
}

async function checkEnvironmentVars() {
  console.log("\n🔍 Checking environment variables...")
  console.log("SUPABASE_URL:", SUPABASE_URL)
  console.log("ANON_KEY (first 50 chars):", SUPABASE_ANON_KEY.substring(0, 50) + "...")
  
  // Check if the anon key looks valid (JWT format)
  const parts = SUPABASE_ANON_KEY.split('.')
  if (parts.length !== 3) {
    console.log("❌ Anon key doesn't look like a valid JWT!")
  } else {
    console.log("✅ Anon key has correct JWT format")
  }
}

async function main() {
  await checkEnvironmentVars()
  await testClientOperations()
  
  console.log("\n🎯 DIAGNOSIS:")
  console.log("The issue is likely that the admin panel is trying to use auth.admin.createUser()")
  console.log("but the client-side code only has access to the anon key, not the service role key.")
  console.log("\n💡 SOLUTION:")
  console.log("Admin operations like creating users need to be done server-side with service role key,")
  console.log("or the client needs to be configured differently for admin operations.")
}

main()