import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔍 DEBUGGING CHAT SESSIONS')
console.log('==================================================')

async function debugSessions() {
  try {
    console.log('1️⃣ Checking all chat sessions...')
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })

    if (sessionsError) {
      console.log('❌ Error fetching sessions:', sessionsError.message)
      return
    }

    console.log(`✅ Found ${sessions.length} sessions:`)
    sessions.forEach((session, index) => {
      console.log(`   ${index + 1}. ID: ${session.id}`)
      console.log(`      Borrower: ${session.borrower_id}`)
      console.log(`      Status: ${session.status}`)
      console.log(`      Subject: ${session.subject}`)
      console.log(`      Created: ${session.created_at}`)
      console.log('')
    })

    console.log('2️⃣ Checking borrower exists...')
    
    const testUserEmail = "mayo16collins@gmail.com"
    const { data: borrower, error: borrowerError } = await supabase
      .from("borrowers")
      .select("*")
      .eq("email", testUserEmail)
      .single()

    if (borrowerError) {
      console.log('❌ Borrower error:', borrowerError.message)
      return
    }

    console.log('✅ Borrower found:')
    console.log(`   ID: ${borrower.id}`)
    console.log(`   Email: ${borrower.email}`)
    console.log(`   Full data:`, borrower)

    console.log('\n3️⃣ Checking messages for sessions...')
    
    for (const session of sessions) {
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.log(`❌ Error fetching messages for session ${session.id}:`, messagesError.message)
      } else {
        console.log(`✅ Session ${session.id}: ${messages.length} messages`)
        messages.forEach((msg, index) => {
          console.log(`     ${index + 1}. ${msg.sender_type}: ${msg.message.substring(0, 50)}...`)
        })
      }
    }

    console.log('\n4️⃣ Testing session ownership...')
    
    if (sessions.length > 0) {
      const testSession = sessions[0]
      console.log(`Testing session: ${testSession.id}`)
      console.log(`Session borrower_id: ${testSession.borrower_id}`)
      console.log(`Current borrower_id: ${borrower.id}`)
      console.log(`Match: ${testSession.borrower_id === borrower.id}`)
    }

    console.log('\n==================================================')
    console.log('🎯 DEBUG COMPLETE')

  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugSessions()