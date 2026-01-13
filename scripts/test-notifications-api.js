import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testNotificationsAPI() {
  console.log("🧪 TESTING NOTIFICATIONS API")
  console.log("=" .repeat(50))

  try {
    // First, let's try to sign in as a borrower
    console.log("\n1️⃣ ATTEMPTING TO SIGN IN AS BORROWER")
    
    // Try to sign in with one of the known borrower accounts
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: "test@loanmate.com",
      password: "password123" // This might not be the right password
    })

    if (signInError) {
      console.log("❌ Sign in failed:", signInError.message)
      console.log("💡 Let's try to check what borrowers exist and their auth status")
      
      // Let's check what borrowers exist
      const { data: borrowers, error: borrowersError } = await supabase
        .from("borrowers")
        .select("id, email, full_name")
        .limit(5)

      if (borrowersError) {
        console.log("❌ Can't fetch borrowers:", borrowersError.message)
      } else {
        console.log("📋 Available borrowers:")
        borrowers.forEach((b, i) => {
          console.log(`   ${i + 1}. ${b.full_name} (${b.email}) - ID: ${b.id}`)
        })
      }
      return
    }

    console.log("✅ Successfully signed in as:", authData.user.email)

    // Now test the notifications API directly
    console.log("\n2️⃣ TESTING NOTIFICATIONS QUERY DIRECTLY")
    
    const { data: notifications, error: notifError } = await supabase
      .from("notifications")
      .select("*")
      .eq("borrower_id", authData.user.id)
      .order("created_at", { ascending: false })

    if (notifError) {
      console.log("❌ Direct query failed:", notifError.message)
      console.log("   Code:", notifError.code)
    } else {
      console.log(`✅ Direct query success: ${notifications.length} notifications found`)
      notifications.forEach((n, i) => {
        console.log(`   ${i + 1}. ${n.title} - ${n.notification_type} - Read: ${n.is_read}`)
      })
    }

    // Test the API endpoint
    console.log("\n3️⃣ TESTING API ENDPOINT")
    
    const response = await fetch("http://localhost:3000/api/borrower/notifications", {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
        'Content-Type': 'application/json'
      }
    })

    const result = await response.json()
    
    if (!response.ok) {
      console.log("❌ API call failed:", result.error)
      console.log("   Status:", response.status)
    } else {
      console.log("✅ API call success:", result.notifications?.length, "notifications")
    }

  } catch (error) {
    console.error("💥 Test failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 NOTIFICATIONS API TEST COMPLETE")
}

testNotificationsAPI()