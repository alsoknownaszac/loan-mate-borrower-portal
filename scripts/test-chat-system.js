import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧪 TESTING CHAT SYSTEM')
console.log('==================================================')

async function testChatSystem() {
  try {
    console.log('1️⃣ Testing API endpoints...')
    
    // Test session creation API
    const sessionResponse = await fetch('http://localhost:3000/api/chat/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subject: 'Test Chat Session',
        priority: 'normal'
      })
    })

    const sessionResult = await sessionResponse.json()
    console.log('Session creation response:', sessionResult)

    if (sessionResult.error) {
      console.log('❌ Expected error (tables not created yet):', sessionResult.error)
    } else {
      console.log('✅ Session created successfully!')
    }

    console.log('\n2️⃣ Testing database connection...')
    
    // Test if we can connect to Supabase
    const { data, error } = await supabase
      .from('borrowers')
      .select('id')
      .limit(1)

    if (error) {
      console.log('❌ Database connection error:', error.message)
    } else {
      console.log('✅ Database connection successful')
    }

    console.log('\n3️⃣ Checking for chat tables...')
    
    const tables = ['chat_sessions', 'chat_messages', 'chat_participants']
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`❌ Table ${table}: Not found (${error.message})`)
        } else {
          console.log(`✅ Table ${table}: Ready`)
        }
      } catch (err) {
        console.log(`❌ Table ${table}: Error - ${err.message}`)
      }
    }

    console.log('\n==================================================')
    console.log('🎯 CHAT SYSTEM TEST COMPLETE')
    console.log('')
    console.log('📋 NEXT STEPS:')
    console.log('1. Create the chat tables in Supabase dashboard')
    console.log('2. Run the SQL commands from SETUP_REALTIME_CHAT.md')
    console.log('3. Enable realtime for the chat tables')
    console.log('4. Test the chat functionality in the browser')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testChatSystem()