import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBorrowerAuth } from "@/lib/auth/borrower-server"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()

    // Fetch notifications using service role key (bypasses RLS)
    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching notifications:", error)
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