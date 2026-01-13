import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract sessionId from params - handle both sync and async params
    let sessionId: string
    if (params && typeof params === 'object' && 'sessionId' in params) {
      sessionId = params.sessionId
    } else {
      // Fallback: extract from URL
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const sessionIndex = pathParts.findIndex(part => part === 'sessions') + 1
      sessionId = pathParts[sessionIndex] || ''
    }

    if (!sessionId || sessionId === 'undefined') {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

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

    // Verify session belongs to borrower
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, borrower_id")
      .eq("id", sessionId)
      .eq("borrower_id", borrower.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      )
    }

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
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Extract sessionId from params - handle both sync and async params
    let sessionId: string
    if (params && typeof params === 'object' && 'sessionId' in params) {
      sessionId = params.sessionId
    } else {
      // Fallback: extract from URL
      const url = new URL(request.url)
      const pathParts = url.pathname.split('/')
      const sessionIndex = pathParts.findIndex(part => part === 'sessions') + 1
      sessionId = pathParts[sessionIndex] || ''
    }

    if (!sessionId || sessionId === 'undefined') {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { message, messageType = 'text' } = body

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      )
    }

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

    // Verify session belongs to borrower and is active
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("chat_sessions")
      .select("id, borrower_id, status")
      .eq("id", sessionId)
      .eq("borrower_id", borrower.id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Chat session not found" },
        { status: 404 }
      )
    }

    if (session.status === 'closed') {
      return NextResponse.json(
        { error: "Cannot send message to closed chat session" },
        { status: 400 }
      )
    }

    // Insert the message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        sender_id: borrower.id,
        sender_type: 'borrower',
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

    // Update session status to active if it was waiting
    if (session.status === 'waiting') {
      await supabaseAdmin
        .from("chat_sessions")
        .update({ status: 'active' })
        .eq("id", sessionId)
    }

    // Update participant last_seen
    await supabaseAdmin
      .from("chat_participants")
      .update({ last_seen: new Date().toISOString() })
      .eq("session_id", sessionId)
      .eq("user_id", borrower.id)

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