import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkRLSPolicies() {
  console.log("🔍 CHECKING RLS POLICIES AND PERMISSIONS")
  console.log("=" .repeat(60))

  // Test tables that might have RLS issues
  const tables = ['admin_users', 'borrowers', 'loans', 'payments', 'documents', 'messages', 'notifications']

  for (const table of tables) {
    console.log(`\n📋 Testing table: ${table}`)
    
    // Test with anon key (what client uses)
    try {
      const { data: anonData, error: anonError } = await supabaseAnon
        .from(table)
        .select('count')
        .limit(1)

      if (anonError) {
        console.log(`  ❌ ANON access: ${anonError.message}`)
        console.log(`     Code: ${anonError.code}`)
        
        if (anonError.code === '42501') {
          console.log(`     🔒 RLS BLOCKING: Insufficient privileges`)
        }
      } else {
        console.log(`  ✅ ANON access: OK`)
      }
    } catch (error) {
      console.log(`  ❌ ANON exception: ${error.message}`)
    }

    // Test with service role key (what API routes use)
    try {
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from(table)
        .select('count')
        .limit(1)

      if (adminError) {
        console.log(`  ❌ SERVICE access: ${adminError.message}`)
      } else {
        console.log(`  ✅ SERVICE access: OK`)
      }
    } catch (error) {
      console.log(`  ❌ SERVICE exception: ${error.message}`)
    }
  }

  // Test authentication specifically
  console.log(`\n🔐 TESTING AUTHENTICATION OPERATIONS`)
  
  // Test sign in with anon key
  try {
    const { data, error } = await supabaseAnon.auth.signInWithPassword({
      email: "admin@loanmate.com",
      password: "AdminPassword123!"
    })

    if (error) {
      console.log(`❌ ANON auth sign in: ${error.message}`)
      console.log(`   Status: ${error.status}`)
      
      if (error.status === 400) {
        console.log(`   🔍 Possible causes:`)
        console.log(`   - Invalid credentials`)
        console.log(`   - User doesn't exist`)
        console.log(`   - Email not confirmed`)
      }
      
      if (error.status === 401) {
        console.log(`   🔍 Possible causes:`)
        console.log(`   - Invalid API key`)
        console.log(`   - API key disabled`)
        console.log(`   - Project paused`)
      }
    } else {
      console.log(`✅ ANON auth sign in: SUCCESS`)
      console.log(`   User: ${data.user?.email}`)
      
      // Test admin_users access while authenticated
      const { data: adminCheck, error: adminCheckError } = await supabaseAnon
        .from('admin_users')
        .select('*')
        .eq('email', 'admin@loanmate.com')
        .single()

      if (adminCheckError) {
        console.log(`❌ AUTHENTICATED admin check: ${adminCheckError.message}`)
        console.log(`   Code: ${adminCheckError.code}`)
      } else {
        console.log(`✅ AUTHENTICATED admin check: SUCCESS`)
        console.log(`   Admin: ${adminCheck.full_name}`)
      }
      
      // Sign out
      await supabaseAnon.auth.signOut()
    }
  } catch (error) {
    console.log(`❌ ANON auth exception: ${error.message}`)
  }

  // Check RLS policies on admin_users specifically
  console.log(`\n🔒 CHECKING ADMIN_USERS RLS POLICIES`)
  
  try {
    // This should work with service role
    const { data: policies, error: policyError } = await supabaseAdmin
      .rpc('get_policies', { table_name: 'admin_users' })
      .catch(() => {
        // If RPC doesn't exist, try direct query
        return supabaseAdmin
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'admin_users')
      })

    if (policyError) {
      console.log(`❌ Cannot fetch RLS policies: ${policyError.message}`)
    } else {
      console.log(`✅ RLS policies found: ${policies?.length || 0}`)
      if (policies && policies.length > 0) {
        policies.forEach(policy => {
          console.log(`   - ${policy.policyname}: ${policy.cmd} for ${policy.roles}`)
        })
      }
    }
  } catch (error) {
    console.log(`❌ RLS policy check failed: ${error.message}`)
  }

  console.log("\n" + "=" .repeat(60))
  console.log("🎯 RLS DIAGNOSIS COMPLETE")
}

checkRLSPolicies()