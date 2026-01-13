import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all chat sessions with borrower information
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .order("updated_at", { ascending: false })

    if (sessionsError) {
      console.error("Sessions fetch error:", sessionsError)
      return NextResponse.json(
        { error: "Failed to fetch chat sessions" },
        { status: 400 }
      )
    }

    // Get borrower information for each session
    const sessionsWithBorrowers = await Promise.all(
      (sessions || []).map(async (session) => {
        // Get borrower info
        const { data: borrower } = await supabaseAdmin
          .from("borrowers")
          .select("id, full_name, email")
          .eq("id", session.borrower_id)
          .single()

        // Get unread message count
        const { count } = await supabaseAdmin
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("session_id", session.id)
          .eq("sender_type", "borrower")
          .eq("is_read", false)

        return {
          ...session,
          borrower: borrower || null,
          unread_count: count || 0
        }
      })
    )

    return NextResponse.json({
      success: true,
      sessions: sessionsWithBorrowers
    })

  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}