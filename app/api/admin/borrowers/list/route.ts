import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()

    // Fetch borrowers with loan data using service role key
    const { data: borrowers, error } = await supabaseAdmin
      .from("borrowers")
      .select(`
        *,
        loans (
          id,
          status,
          principal_amount,
          remaining_balance,
          created_at
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching borrowers:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      borrowers: borrowers || []
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