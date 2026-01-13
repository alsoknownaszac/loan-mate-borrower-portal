import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 CREATING CHAT TABLES')
console.log('==================================================')

async function createChatTables() {
  try {
    // First, let's check if tables already exist
    console.log('1️⃣ Checking existing tables...')
    
    const { data: existingTables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['chat_sessions', 'chat_messages', 'chat_participants'])
    
    console.log('Existing chat tables:', existingTables?.map(t => t.table_name) || [])

    // Create chat_sessions table
    console.log('\n2️⃣ Creating chat_sessions table...')
    
    // We'll use a different approach - create via SQL using a simple query
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

    // Since we can't execute raw SQL directly, let's create a simple test
    // and then manually create the tables in Supabase dashboard
    
    console.log('✅ Chat table schemas prepared')
    console.log('\n📋 MANUAL SETUP REQUIRED:')
    console.log('Please create these tables in your Supabase dashboard:')
    console.log('\n1. chat_sessions table:')
    console.log(createSessionsSQL)
    console.log('\n2. chat_messages table:')
    console.log(createMessagesSQL)
    console.log('\n3. chat_participants table:')
    console.log(createParticipantsSQL)

    // For now, let's proceed with the implementation assuming tables exist
    // We'll create API endpoints that will work once tables are created

    console.log('\n==================================================')
    console.log('🎯 PROCEEDING WITH API IMPLEMENTATION')
    console.log('Note: Tables need to be created manually in Supabase dashboard')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

createChatTables()