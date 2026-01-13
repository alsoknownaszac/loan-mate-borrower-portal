import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testBorrowersTable() {
  console.log("🔍 Testing borrowers table...")
  
  try {
    // Test if borrowers table exists
    const { data, error } = await supabase
      .from("borrowers")
      .select("count")
      .limit(1)

    if (error) {
      console.log("❌ Borrowers table error:", error.message)
      
      if (error.code === '42P01') {
        console.log("📋 borrowers table doesn't exist!")
        console.log("🔧 You need to create the base schema first")
        console.log("💡 The admin schema only creates admin-specific tables")
        return false
      }
    } else {
      console.log("✅ borrowers table exists!")
      return true
    }
  } catch (error) {
    console.error("💥 Error:", error.message)
    return false
  }
}

async function testOtherTables() {
  console.log("\n🔍 Testing other required tables...")
  
  const tables = ['loans', 'payments', 'documents', 'messages', 'notifications']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1)

      if (error && error.code === '42P01') {
        console.log(`❌ ${table} table missing`)
      } else {
        console.log(`✅ ${table} table exists`)
      }
    } catch (error) {
      console.log(`❌ ${table} table error:`, error.message)
    }
  }
}

async function testAuthAdmin() {
  console.log("\n🔍 Testing auth.admin access...")
  
  try {
    // This should fail with anon key but work with service role key
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.log("❌ Auth admin error:", error.message)
      console.log("💡 This might be why borrower creation is failing")
    } else {
      console.log("✅ Auth admin access works!")
    }
  } catch (error) {
    console.log("❌ Auth admin failed:", error.message)
  }
}

async function main() {
  const borrowersExists = await testBorrowersTable()
  await testOtherTables()
  await testAuthAdmin()
  
  if (!borrowersExists) {
    console.log("\n🚨 ISSUE FOUND: Missing base tables!")
    console.log("📋 You need to create the base schema first:")
    console.log("1. Look for scripts/01-init-schema.sql or similar")
    console.log("2. Or create the borrowers table manually")
    console.log("3. The admin schema (03-admin-schema.sql) only adds admin features")
  }
}

main()