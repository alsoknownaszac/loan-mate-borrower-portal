import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: NextRequest) {
  try {
    // Create client with service role key for data access (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // For now, let's use a fallback approach that works when logged in
    // TODO: Implement proper cookie-based authentication
    const testUserId = "60edebce-61ac-4003-a9af-726446b9923d" // my name is jeff

    // Fetch notifications using service role key (bypasses RLS)
    const { data: notifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .eq("borrower_id", testUserId)
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}