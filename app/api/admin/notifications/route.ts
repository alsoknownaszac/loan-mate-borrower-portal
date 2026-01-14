import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()

    // Get all notifications with related data
    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select(`
        *,
        borrowers (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Notifications fetch error:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || []
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

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const { borrower_ids, title, message, notification_type } = body

    // Validate required fields
    if (!borrower_ids || !Array.isArray(borrower_ids) || borrower_ids.length === 0) {
      return NextResponse.json(
        { error: "At least one borrower ID is required" },
        { status: 400 }
      )
    }

    if (!title || !message || !notification_type) {
      return NextResponse.json(
        { error: "Missing required fields: title, message, notification_type" },
        { status: 400 }
      )
    }

    // Create notifications for all selected borrowers
    const notificationsToInsert = borrower_ids.map(borrowerId => ({
      borrower_id: borrowerId,
      title,
      message,
      notification_type,
      is_read: false
    }))

    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .insert(notificationsToInsert)
      .select()

    if (error) {
      console.error("Error creating notifications:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      notifications,
      count: notifications.length
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