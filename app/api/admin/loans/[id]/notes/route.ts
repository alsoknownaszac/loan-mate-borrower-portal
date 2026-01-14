import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const { id } = await params
    const supabaseAdmin = createAdminClient()

    // Get admin notes for this loan
    const { data: notes, error } = await supabaseAdmin
      .from("admin_notes")
      .select(`
        *,
        admin_users (
          full_name,
          email
        )
      `)
      .eq("loan_id", id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Notes fetch error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      notes: notes || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Admin authentication required") {
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const { id } = await params
    const body = await request.json()
    const { note, note_type = 'general', is_internal = false } = body

    if (!note || !note.trim()) {
      return NextResponse.json(
        { error: "Note content is required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Create new admin note
    const { data: newNote, error } = await supabaseAdmin
      .from("admin_notes")
      .insert({
        loan_id: id,
        note: note.trim(),
        note_type,
        is_internal
      })
      .select(`
        *,
        admin_users (
          full_name,
          email
        )
      `)
      .single()

    if (error) {
      console.error("Note creation error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      note: newNote
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Admin authentication required") {
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