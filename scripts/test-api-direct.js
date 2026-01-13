import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testAPIDirectly() {
  console.log("🧪 TESTING API FUNCTIONALITY DIRECTLY")
  console.log("=" .repeat(50))

  // Test the exact same query that the API should be doing
  const testBorrowerId = "60edebce-61ac-4003-a9af-726446b9923d" // my name is jeff

  console.log("\n1️⃣ TESTING NOTIFICATIONS QUERY")
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("borrower_id", testBorrowerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("❌ Query failed:", error.message)
    } else {
      console.log(`✅ Query success: ${notifications.length} notifications found`)
      notifications.slice(0, 3).forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.title} - ${n.notification_type} - Read: ${n.is_read}`)
      })
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  console.log("\n2️⃣ TESTING LOANS QUERY")
  try {
    const { data: loans, error } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("borrower_id", testBorrowerId)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("❌ Query failed:", error.message)
    } else {
      console.log(`✅ Query success: ${loans.length} loans found`)
      loans.forEach((loan, i) => {
        console.log(`   ${i + 1}. $${loan.principal_amount} - ${loan.status}`)
      })
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  console.log("\n3️⃣ TESTING BORROWER LOOKUP")
  try {
    const { data: borrower, error } = await supabaseAdmin
      .from("borrowers")
      .select("id")
      .eq("email", "mayo16collins@gmail.com")
      .single()

    if (error) {
      console.log("❌ Query failed:", error.message)
    } else {
      console.log(`✅ Query success: Found borrower ${borrower.id}`)
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 DIRECT API TEST COMPLETE")
}

testAPIDirectly()