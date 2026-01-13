# Real-time Chat Setup Guide

This guide explains how to set up the Supabase Realtime chat system for the LoanMate application.

## Overview

The chat system uses:
- **Supabase Database** for storing chat sessions, messages, and participants
- **Supabase Realtime** for live message updates and typing indicators
- **Custom React hooks** for managing chat state and real-time subscriptions
- **Admin interface** for agents to manage customer conversations

## Database Schema

### Required Tables

The chat system requires three main tables:

1. **chat_sessions** - Stores chat session information
2. **chat_messages** - Stores individual messages
3. **chat_participants** - Tracks participants and their status

### Setup Instructions

#### Option 1: Manual Setup (Recommended)

1. **Open Supabase Dashboard**
   - Go to your project dashboard at https://supabase.com
   - Navigate to the SQL Editor

2. **Create Tables**
   
   Execute the following SQL commands one by one:

   ```sql
   -- Chat Sessions Table
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
   ```

   ```sql
   -- Chat Messages Table
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
   ```

   ```sql
   -- Chat Participants Table
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
   ```

3. **Add Indexes for Performance**

   ```sql
   CREATE INDEX IF NOT EXISTS idx_chat_sessions_borrower_id ON chat_sessions(borrower_id);
   CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
   CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
   CREATE INDEX IF NOT EXISTS idx_chat_participants_session_id ON chat_participants(session_id);
   ```

4. **Enable Realtime**

   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
   ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
   ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;
   ```

5. **Set Up Row Level Security (Optional)**

   ```sql
   ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
   ```

#### Option 2: Script-based Setup

Run the provided setup script:

```bash
node scripts/create-chat-tables.js
```

Note: This will show you the SQL commands to run manually, as direct SQL execution requires additional setup.

## API Endpoints

The following API endpoints are created:

### Chat Sessions
- `GET /api/chat/sessions` - List user's chat sessions
- `POST /api/chat/sessions` - Create new chat session

### Messages
- `GET /api/chat/sessions/[sessionId]/messages` - Get messages for a session
- `POST /api/chat/sessions/[sessionId]/messages` - Send a message

### Typing Indicators
- `POST /api/chat/sessions/[sessionId]/typing` - Update typing status

## Frontend Components

### Customer Side

1. **ChatButton** (`components/chat-button.tsx`)
   - Floating chat button with business hours logic
   - Shows online/offline status

2. **LiveChat** (`components/live-chat.tsx`)
   - Real-time chat interface
   - Message history and typing indicators
   - Auto-scroll and connection status

3. **useChat Hook** (`hooks/use-chat.ts`)
   - Manages chat state and real-time subscriptions
   - Handles message sending and typing indicators
   - Provides connection status and error handling

### Admin Side

1. **Admin Chat Page** (`app/admin/chat/page.tsx`)
   - Chat session management
   - Agent interface for responding to customers
   - Chat statistics and metrics

## Configuration

### Environment Variables

Ensure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Realtime Configuration

The chat system automatically subscribes to:
- New messages in active sessions
- Typing status updates
- Session status changes

## Usage

### For Customers

1. Click the chat button (available during business hours)
2. Chat opens and creates a new session automatically
3. Messages are sent in real-time
4. Typing indicators show when agents are responding

### For Agents (Admin)

1. Navigate to `/admin/chat`
2. View list of active chat sessions
3. Click on a session to start responding
4. Messages update in real-time
5. See customer typing indicators

## Business Hours

The chat button respects business hours:
- **Available**: Monday-Friday, 9 AM - 5 PM EST
- **Unavailable**: Weekends and outside business hours

You can modify this in `components/chat-button.tsx`.

## Features

### Real-time Features
- ✅ Live message delivery
- ✅ Typing indicators
- ✅ Connection status
- ✅ Auto-reconnection
- ✅ Message persistence

### Chat Management
- ✅ Session creation and management
- ✅ Message history
- ✅ Priority levels (low, normal, high, urgent)
- ✅ Department routing
- ✅ Session status tracking

### Admin Features
- ✅ Chat session list
- ✅ Real-time message interface
- ✅ Customer information display
- ✅ Chat statistics
- 🔄 Agent assignment (coming soon)
- 🔄 Canned responses (coming soon)

## Troubleshooting

### Common Issues

1. **Tables not found**
   - Ensure you've created the database tables
   - Check table names match exactly

2. **Realtime not working**
   - Verify tables are added to realtime publication
   - Check network connectivity
   - Ensure Supabase project has realtime enabled

3. **Authentication errors**
   - Verify environment variables are set
   - Check RLS policies if enabled
   - Ensure service role key has proper permissions

4. **Messages not appearing**
   - Check browser console for errors
   - Verify API endpoints are working
   - Test database connectivity

### Testing

Test the chat system:

1. **API Testing**
   ```bash
   # Test session creation
   curl -X POST http://localhost:3000/api/chat/sessions \
     -H "Content-Type: application/json" \
     -d '{"subject": "Test Chat", "priority": "normal"}'
   ```

2. **Real-time Testing**
   - Open chat in two browser windows
   - Send messages and verify they appear in both
   - Test typing indicators

## Next Steps

### Enhancements to Consider

1. **File Sharing**
   - Add file upload to chat messages
   - Support images, documents, screenshots

2. **Agent Features**
   - Agent assignment and routing
   - Canned responses and templates
   - Internal notes and collaboration

3. **Analytics**
   - Response time tracking
   - Customer satisfaction ratings
   - Chat volume metrics

4. **Mobile Optimization**
   - Responsive chat interface
   - Push notifications for agents
   - Mobile app integration

5. **AI Integration**
   - Chatbot for common questions
   - Sentiment analysis
   - Auto-categorization

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify database tables exist and have correct structure
3. Test API endpoints directly
4. Check Supabase dashboard for realtime connection status

The chat system is designed to gracefully handle connection issues and will attempt to reconnect automatically.