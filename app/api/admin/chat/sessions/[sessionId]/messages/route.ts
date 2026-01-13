import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get messages for this session
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (messagesError) {
      console.error("Messages fetch error:", messagesError)
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params
    const body = await request.json()
    const { message, messageType = 'text' } = body

    if (!message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For now, use a hardcoded agent UUID (in production, get from auth)
    const agentId = "00000000-0000-0000-0000-000000000001" // Admin agent UUID

    // Send message as agent
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: agentId,
        sender_type: 'agent',
        message: message.trim(),
        message_type: messageType
      })
      .select()
      .single()

    if (messageError) {
      console.error("Message creation error:", messageError)
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 400 }
      )
    }

    // Update session status to active and timestamp
    await supabaseAdmin
      .from("chat_sessions")
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq("id", sessionId)

    return NextResponse.json({
      success: true,
      message: newMessage
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}