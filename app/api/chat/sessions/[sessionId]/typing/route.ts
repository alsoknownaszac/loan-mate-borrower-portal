import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

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
    const { isTyping } = body

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

    // Update typing status
    const { error: typingError } = await supabaseAdmin
      .from("chat_participants")
      .update({ 
        is_typing: isTyping,
        last_seen: new Date().toISOString()
      })
      .eq("session_id", sessionId)
      .eq("user_id", borrower.id)

    if (typingError) {
      console.error("Typing update error:", typingError)
      return NextResponse.json(
        { error: "Failed to update typing status" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}