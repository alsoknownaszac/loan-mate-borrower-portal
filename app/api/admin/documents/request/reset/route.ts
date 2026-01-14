import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    const supabaseAdmin = createAdminClient()

    // Update document request status back to pending and clear fulfilled_by where it matches the document ID
    const { data: updatedRequest, error } = await supabaseAdmin
      .from("document_requests")
      .update({ 
        status: "pending",
        fulfilled_by: null,
        updated_at: new Date().toISOString()
      })
      .eq("fulfilled_by", documentId)
      .select()

    if (error) {
      console.error("Error resetting document request:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      updatedRequest
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