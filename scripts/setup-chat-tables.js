import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🚀 SETTING UP CHAT TABLES')
console.log('==================================================')

async function setupChatTables() {
  try {
    console.log('1️⃣ Creating chat_sessions table...')
    
    // Create chat_sessions table using INSERT to trigger table creation
    try {
      // First try to insert a test record to see if table exists
      const { error: testError } = await supabase
        .from('chat_sessions')
        .select('id')
        .limit(1)
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('   Table does not exist, needs to be created manually')
      } else {
        console.log('   ✅ Table chat_sessions already exists')
      }
    } catch (err) {
      console.log('   Table needs to be created')
    }

    console.log('\n2️⃣ Creating chat_messages table...')
    
    try {
      const { error: testError } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1)
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('   Table does not exist, needs to be created manually')
      } else {
        console.log('   ✅ Table chat_messages already exists')
      }
    } catch (err) {
      console.log('   Table needs to be created')
    }

    console.log('\n3️⃣ Creating chat_participants table...')
    
    try {
      const { error: testError } = await supabase
        .from('chat_participants')
        .select('id')
        .limit(1)
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('   Table does not exist, needs to be created manually')
      } else {
        console.log('   ✅ Table chat_participants already exists')
      }
    } catch (err) {
      console.log('   Table needs to be created')
    }

    console.log('\n==================================================')
    console.log('📋 MANUAL SETUP REQUIRED')
    console.log('')
    console.log('Since we cannot create tables directly via the API, please:')
    console.log('')
    console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run these SQL commands one by one:')
    console.log('')
    
    console.log('-- Create chat_sessions table')
    console.log(`CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID,
  agent_id UUID,
  status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'closed', 'transferred')),
  subject VARCHAR(255),
  priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  department VARCHAR(50) DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  closed_by UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT
);`)

    console.log('')
    console.log('-- Create chat_messages table')
    console.log(`CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID,
  sender_id UUID NOT NULL,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('borrower', 'agent', 'system')),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)

    console.log('')
    console.log('-- Create chat_participants table')
    console.log(`CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID,
  user_id UUID NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('borrower', 'agent')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_typing BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`)

    console.log('')
    console.log('-- Add indexes for performance')
    console.log(`CREATE INDEX IF NOT EXISTS idx_chat_sessions_borrower_id ON chat_sessions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_session_id ON chat_participants(session_id);`)

    console.log('')
    console.log('-- Enable realtime (IMPORTANT for live chat)')
    console.log(`ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;`)

    console.log('')
    console.log('4. After running the SQL commands, test the chat system:')
    console.log('   node scripts/test-chat-system.js')
    console.log('')
    console.log('🎯 Once tables are created, the chat system will work immediately!')

  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setupChatTables()