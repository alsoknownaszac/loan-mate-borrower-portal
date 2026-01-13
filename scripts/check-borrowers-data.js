import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function checkBorrowersData() {
  console.log("🔍 CHECKING BORROWERS DATA")
  console.log("=" .repeat(50))

  // 1. Check if borrowers table exists and has data
  console.log("\n1️⃣ CHECKING BORROWERS TABLE (Service Role)")
  try {
    const { data: borrowers, error } = await supabaseAdmin
      .from('borrowers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log("❌ Error fetching borrowers:", error.message)
      console.log("   Code:", error.code)
    } else {
      console.log(`✅ Found ${borrowers.length} borrowers`)
      
      if (borrowers.length > 0) {
        console.log("\n📋 Borrowers in database:")
        borrowers.forEach((borrower, index) => {
          console.log(`   ${index + 1}. ${borrower.full_name} (${borrower.email})`)
          console.log(`      ID: ${borrower.id}`)
          console.log(`      Phone: ${borrower.phone || 'N/A'}`)
          console.log(`      Created: ${borrower.created_at}`)
        })
      } else {
        console.log("📝 No borrowers found in database")
        console.log("💡 You need to create borrowers first using the admin panel")
      }
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  // 2. Test borrowers access with anon key (what the app uses)
  console.log("\n2️⃣ CHECKING BORROWERS ACCESS (Anon Key)")
  try {
    const { data: borrowersAnon, error: anonError } = await supabaseAnon
      .from('borrowers')
      .select('*')
      .limit(5)

    if (anonError) {
      console.log("❌ Anon access error:", anonError.message)
      console.log("   Code:", anonError.code)
      
      if (anonError.code === '42501') {
        console.log("🔒 RLS ISSUE: Anon key blocked by Row Level Security")
        console.log("💡 This might be why the app can't read borrowers")
      }
    } else {
      console.log(`✅ Anon access works: ${borrowersAnon.length} borrowers visible`)
    }
  } catch (error) {
    console.log("❌ Anon exception:", error.message)
  }

  // 3. Check auth.users table for borrower accounts
  console.log("\n3️⃣ CHECKING AUTH USERS")
  try {
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()

    if (authError) {
      console.log("❌ Error fetching auth users:", authError.message)
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`)
      
      const adminUsers = authUsers.users.filter(u => u.email?.includes('admin'))
      const borrowerUsers = authUsers.users.filter(u => !u.email?.includes('admin'))
      
      console.log(`   - Admin users: ${adminUsers.length}`)
      console.log(`   - Borrower users: ${borrowerUsers.length}`)
      
      if (borrowerUsers.length > 0) {
        console.log("\n📋 Borrower auth accounts:")
        borrowerUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`)
          console.log(`      Created: ${user.created_at}`)
          console.log(`      Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`)
        })
      }
    }
  } catch (error) {
    console.log("❌ Auth users exception:", error.message)
  }

  // 4. Test authenticated borrower access
  console.log("\n4️⃣ TESTING AUTHENTICATED BORROWER ACCESS")
  
  // First, let's see if there are any borrower auth users to test with
  try {
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers()
    const borrowerUser = authUsers.users.find(u => !u.email?.includes('admin'))
    
    if (borrowerUser) {
      console.log(`🧪 Testing with borrower: ${borrowerUser.email}`)
      
      // We can't easily test password login without knowing the password
      // But we can check if the borrower record exists
      const { data: borrowerRecord, error: recordError } = await supabaseAdmin
        .from('borrowers')
        .select('*')
        .eq('id', borrowerUser.id)
        .single()

      if (recordError) {
        console.log("❌ Borrower record missing:", recordError.message)
        console.log("💡 Auth user exists but no borrower record - data inconsistency!")
      } else {
        console.log("✅ Borrower record exists:", borrowerRecord.full_name)
      }
    } else {
      console.log("📝 No borrower auth users found to test with")
    }
  } catch (error) {
    console.log("❌ Authenticated test exception:", error.message)
  }

  // 5. Check what the admin borrowers page is trying to fetch
  console.log("\n5️⃣ SIMULATING ADMIN BORROWERS PAGE QUERY")
  try {
    // This simulates what the admin borrowers page does
    const { data: adminBorrowers, error: adminError } = await supabaseAnon
      .from("borrowers")
      .select(`
        *,
        loans (
          id,
          principal_amount,
          status
        )
      `)
      .order("created_at", { ascending: false })

    if (adminError) {
      console.log("❌ Admin page query failed:", adminError.message)
      console.log("   Code:", adminError.code)
      console.log("💡 This is likely why the admin borrowers page shows no data")
    } else {
      console.log(`✅ Admin page query works: ${adminBorrowers.length} borrowers with loan data`)
    }
  } catch (error) {
    console.log("❌ Admin page query exception:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 BORROWERS DATA DIAGNOSIS COMPLETE")
}

checkBorrowersData()