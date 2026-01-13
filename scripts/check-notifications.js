import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkNotifications() {
  console.log("🔍 CHECKING NOTIFICATIONS DATA")
  console.log("=" .repeat(50))

  // 1. Check if notifications table exists and has data
  console.log("\n1️⃣ CHECKING NOTIFICATIONS TABLE")
  try {
    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log("❌ Error fetching notifications:", error.message)
      console.log("   Code:", error.code)
      
      if (error.code === '42P01') {
        console.log("💡 Table 'notifications' does not exist!")
        console.log("   You need to run the database schema setup first")
      }
    } else {
      console.log(`✅ Found ${notifications.length} notifications`)
      
      if (notifications.length > 0) {
        console.log("\n📋 Notifications in database:")
        notifications.forEach((notification, index) => {
          console.log(`   ${index + 1}. ${notification.title}`)
          console.log(`      Borrower ID: ${notification.borrower_id}`)
          console.log(`      Type: ${notification.notification_type}`)
          console.log(`      Read: ${notification.is_read}`)
          console.log(`      Created: ${notification.created_at}`)
          console.log(`      Message: ${notification.message.substring(0, 100)}...`)
        })
      } else {
        console.log("📝 No notifications found in database")
        console.log("💡 Try creating a document request from admin panel to generate notifications")
      }
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  // 2. Check document_requests table
  console.log("\n2️⃣ CHECKING DOCUMENT REQUESTS TABLE")
  try {
    const { data: requests, error } = await supabaseAdmin
      .from('document_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log("❌ Error fetching document requests:", error.message)
      console.log("   Code:", error.code)
    } else {
      console.log(`✅ Found ${requests.length} document requests`)
      
      if (requests.length > 0) {
        console.log("\n📋 Document requests in database:")
        requests.forEach((request, index) => {
          console.log(`   ${index + 1}. ${request.title}`)
          console.log(`      Borrower ID: ${request.borrower_id}`)
          console.log(`      Type: ${request.document_type}`)
          console.log(`      Status: ${request.status}`)
          console.log(`      Created: ${request.created_at}`)
        })
      }
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  // 3. Test creating a notification manually
  console.log("\n3️⃣ TESTING NOTIFICATION CREATION")
  try {
    const testBorrowerId = "5ec3f714-fc8d-4f2b-9925-e6732fd16495" // test@loanmate.com
    
    const { data: newNotification, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        borrower_id: testBorrowerId,
        title: "Test Notification",
        message: "This is a test notification created by the check script",
        notification_type: "info",
        is_read: false
      })
      .select()
      .single()

    if (error) {
      console.log("❌ Failed to create test notification:", error.message)
      console.log("   Code:", error.code)
    } else {
      console.log("✅ Successfully created test notification:", newNotification.id)
    }
  } catch (error) {
    console.log("❌ Exception creating notification:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 NOTIFICATIONS CHECK COMPLETE")
}

checkNotifications()