import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBorrowerAuth } from "@/lib/auth/borrower-server"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const { subject, message, category, priority = 'normal' } = body

    // Validate required fields
    if (!subject || !message || !category) {
      return NextResponse.json(
        { error: "Missing required fields: subject, message, category" },
        { status: 400 }
      )
    }

    // Create message using service role key (bypasses RLS)
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from("messages")
      .insert({
        borrower_id: borrower.id,
        subject,
        message,
        priority,
        status: 'open'
      })
      .select()
      .single()

    if (messageError) {
      console.error("Error creating message:", messageError)
      return NextResponse.json(
        { error: messageError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: newMessage
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Authentication required" || error.message === "Borrower not found") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()

    // Get borrower's messages using service role key (bypasses RLS)
    const { data: messages, error } = await supabaseAdmin
      .from("messages")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching messages:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      messages: messages || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Authentication required" || error.message === "Borrower not found") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}