import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()

    // Get all documents with related data
    const { data: documents, error: documentsError } = await supabaseAdmin
      .from("documents")
      .select(`
        *,
        borrowers (
          full_name,
          email
        )
      `)
      .order("upload_date", { ascending: false })

    if (documentsError) {
      console.error("Documents fetch error:", documentsError)
      return NextResponse.json(
        { error: documentsError.message },
        { status: 400 }
      )
    }

    // Get all document requests with related data
    const { data: documentRequests, error: requestsError } = await supabaseAdmin
      .from("document_requests")
      .select(`
        *,
        borrowers (
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (requestsError) {
      console.error("Document requests fetch error:", requestsError)
      return NextResponse.json(
        { error: requestsError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      documents: documents || [],
      documentRequests: documentRequests || []
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