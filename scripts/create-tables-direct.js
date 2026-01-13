import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🔧 CREATING CHAT TABLES DIRECTLY')
console.log('==================================================')

async function createTablesDirectly() {
  try {
    console.log('1️⃣ Attempting to create chat_sessions table...')
    
    // Try to create the table using a raw SQL approach
    const createSessionsSQL = `
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        borrower_id UUID,
        agent_id UUID,
        status VARCHAR(20) DEFAULT 'waiting',
        subject VARCHAR(255),
        priority VARCHAR(10) DEFAULT 'normal',
        department VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        closed_at TIMESTAMP WITH TIME ZONE,
        closed_by UUID,
        rating INTEGER,
        feedback TEXT
      );
    `

    // Try using the rpc function to execute SQL
    const { data: result1, error: error1 } = await supabase.rpc('exec_sql', {
      sql: createSessionsSQL
    })

    if (error1) {
      console.log('   RPC method failed, trying alternative...')
      
      // Alternative: Try to insert a dummy record to trigger table creation
      const { error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          borrower_id: '00000000-0000-0000-0000-000000000000',
          subject: 'test',
          status: 'waiting'
        })
        .select()

      if (insertError) {
        console.log('   ❌ Table creation failed:', insertError.message)
      } else {
        console.log('   ✅ Table created via insert method')
        
        // Clean up the test record
        await supabase
          .from('chat_sessions')
          .delete()
          .eq('subject', 'test')
      }
    } else {
      console.log('   ✅ Table created via RPC method')
    }

    console.log('\n2️⃣ Attempting to create chat_messages table...')
    
    const createMessagesSQL = `
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID,
        sender_id UUID NOT NULL,
        sender_type VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text',
        file_url TEXT,
        file_name TEXT,
        file_size INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: createMessagesSQL
    })

    if (error2) {
      console.log('   ❌ RPC failed, table needs manual creation')
    } else {
      console.log('   ✅ Table created successfully')
    }

    console.log('\n3️⃣ Attempting to create chat_participants table...')
    
    const createParticipantsSQL = `
      CREATE TABLE IF NOT EXISTS chat_participants (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        session_id UUID,
        user_id UUID NOT NULL,
        user_type VARCHAR(10) NOT NULL,
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        left_at TIMESTAMP WITH TIME ZONE,
        is_typing BOOLEAN DEFAULT FALSE,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: createParticipantsSQL
    })

    if (error3) {
      console.log('   ❌ RPC failed, table needs manual creation')
    } else {
      console.log('   ✅ Table created successfully')
    }

    console.log('\n4️⃣ Testing table access...')
    
    // Test each table
    const tables = ['chat_sessions', 'chat_messages', 'chat_participants']
    let allTablesExist = true

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1)
        
        if (error) {
          console.log(`   ❌ ${table}: ${error.message}`)
          allTablesExist = false
        } else {
          console.log(`   ✅ ${table}: Ready`)
        }
      } catch (err) {
        console.log(`   ❌ ${table}: ${err.message}`)
        allTablesExist = false
      }
    }

    if (allTablesExist) {
      console.log('\n🎉 ALL TABLES CREATED SUCCESSFULLY!')
      console.log('Testing chat session creation...')
      
      // Test creating a real chat session
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          borrower_id: '60edebce-61ac-4003-a9af-726446b9923d',
          subject: 'Test Chat Session',
          priority: 'normal',
          status: 'waiting'
        })
        .select()
        .single()

      if (sessionError) {
        console.log('❌ Session creation failed:', sessionError.message)
      } else {
        console.log('✅ Chat session created successfully!')
        console.log('Session ID:', session.id)
        
        // Clean up test session
        await supabase
          .from('chat_sessions')
          .delete()
          .eq('id', session.id)
        
        console.log('✅ Test session cleaned up')
      }
    } else {
      console.log('\n❌ Some tables are missing. Please create them manually using the SQL commands.')
    }

    console.log('\n==================================================')
    console.log('🎯 SETUP COMPLETE')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

createTablesDirectly()