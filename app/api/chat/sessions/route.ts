import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get borrower information using hardcoded email for now
    const testUserEmail = "mayo16collins@gmail.com"

    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("id")
      .eq("email", testUserEmail)
      .single()

    if (borrowerError || !borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      )
    }

    // Get chat sessions for this borrower
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("updated_at", { ascending: false })

    if (sessionsError) {
      // If tables don't exist, return helpful error message
      if (sessionsError.message.includes('does not exist') || sessionsError.message.includes('schema cache')) {
        return NextResponse.json({
          error: "Chat tables not found",
          message: "Please create the chat tables in Supabase dashboard first. See SETUP_REALTIME_CHAT.md for instructions.",
          setupRequired: true
        }, { status: 400 })
      }
      
      console.error("Sessions fetch error:", sessionsError)
      return NextResponse.json(
        { error: "Failed to fetch chat sessions" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      sessions: sessions || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const body = await request.json()
    const { subject, priority = 'normal', department = 'general' } = body

    // Get borrower information
    const testUserEmail = "mayo16collins@gmail.com"

    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("id")
      .eq("email", testUserEmail)
      .single()

    if (borrowerError || !borrower) {
      return NextResponse.json(
        { error: "Borrower not found" },
        { status: 404 }
      )
    }

    // Create new chat session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("chat_sessions")
      .insert({
        borrower_id: borrower.id,
        subject,
        priority,
        department,
        status: 'waiting'
      })
      .select()
      .single()

    if (sessionError) {
      // If tables don't exist, return helpful error message
      if (sessionError.message.includes('does not exist') || sessionError.message.includes('schema cache')) {
        return NextResponse.json({
          error: "Chat tables not found",
          message: "Please create the chat tables in Supabase dashboard first. See SETUP_REALTIME_CHAT.md for instructions.",
          setupRequired: true,
          sqlCommands: {
            chat_sessions: `CREATE TABLE IF NOT EXISTS chat_sessions (
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
);`,
            chat_messages: `CREATE TABLE IF NOT EXISTS chat_messages (
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
);`,
            chat_participants: `CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID,
  user_id UUID NOT NULL,
  user_type VARCHAR(10) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_typing BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`,
            indexes: `CREATE INDEX IF NOT EXISTS idx_chat_sessions_borrower_id ON chat_sessions(borrower_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_session_id ON chat_participants(session_id);`,
            realtime: `ALTER PUBLICATION supabase_realtime ADD TABLE chat_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_participants;`
          }
        }, { status: 400 })
      }
      
      console.error("Session creation error:", sessionError)
      return NextResponse.json(
        { error: "Failed to create chat session" },
        { status: 400 }
      )
    }

    // Add borrower as participant
    await supabaseAdmin
      .from("chat_participants")
      .insert({
        session_id: session.id,
        user_id: borrower.id,
        user_type: 'borrower'
      })

    // Send initial system message
    await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: session.id,
        sender_id: borrower.id,
        sender_type: 'system',
        message: 'Chat session started. A support agent will be with you shortly.',
        message_type: 'system'
      })

    return NextResponse.json({
      success: true,
      session
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}