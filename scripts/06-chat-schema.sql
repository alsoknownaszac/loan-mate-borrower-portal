-- Chat System Schema
-- This creates the database tables for real-time chat functionality

-- Chat Sessions Table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  borrower_id UUID REFERENCES borrowers(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES admins(id) ON DELETE SET NULL,
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
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL, -- Can be borrower_id or agent_id
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('borrower', 'agent', 'system')),
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Participants Table (for tracking who's in the chat)
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('borrower', 'agent')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_typing BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id, user_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_borrower_id ON chat_sessions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_agent_id ON chat_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at ON chat_sessions(created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_read ON chat_messages(is_read);

CREATE INDEX IF NOT EXISTS idx_chat_participants_session_id ON chat_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);

-- RLS Policies for Chat Sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Borrowers can see their own chat sessions
CREATE POLICY "Borrowers can view own chat sessions" ON chat_sessions
  FOR SELECT USING (
    borrower_id = (
      SELECT id FROM borrowers 
      WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Borrowers can create their own chat sessions
CREATE POLICY "Borrowers can create chat sessions" ON chat_sessions
  FOR INSERT WITH CHECK (
    borrower_id = (
      SELECT id FROM borrowers 
      WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Borrowers can update their own chat sessions (for rating/feedback)
CREATE POLICY "Borrowers can update own chat sessions" ON chat_sessions
  FOR UPDATE USING (
    borrower_id = (
      SELECT id FROM borrowers 
      WHERE email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- RLS Policies for Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can see messages from their chat sessions
CREATE POLICY "Users can view messages from their sessions" ON chat_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- Users can insert messages to their chat sessions
CREATE POLICY "Users can send messages to their sessions" ON chat_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- Users can update read status of messages
CREATE POLICY "Users can mark messages as read" ON chat_messages
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- RLS Policies for Chat Participants
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

-- Users can see participants from their chat sessions
CREATE POLICY "Users can view participants from their sessions" ON chat_participants
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- Users can insert themselves as participants
CREATE POLICY "Users can join their sessions" ON chat_participants
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- Users can update their participant status (typing, last_seen)
CREATE POLICY "Users can update their participant status" ON chat_participants
  FOR UPDATE USING (
    session_id IN (
      SELECT id FROM chat_sessions 
      WHERE borrower_id = (
        SELECT id FROM borrowers 
        WHERE email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_chat_sessions_updated_at 
  BEFORE UPDATE ON chat_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_updated_at 
  BEFORE UPDATE ON chat_messages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically close inactive sessions
CREATE OR REPLACE FUNCTION close_inactive_sessions()
RETURNS void AS $$
BEGIN
  UPDATE chat_sessions 
  SET status = 'closed', 
      closed_at = NOW(),
      updated_at = NOW()
  WHERE status IN ('waiting', 'active') 
    AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Enable realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;

COMMENT ON TABLE chat_sessions IS 'Chat sessions between borrowers and support agents';
COMMENT ON TABLE chat_messages IS 'Individual messages within chat sessions';
COMMENT ON TABLE chat_participants IS 'Tracks participants in chat sessions and their status';