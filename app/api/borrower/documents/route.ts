import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireBorrowerAuth } from "@/lib/auth/borrower-server"

export async function GET(request: NextRequest) {
  try {
    // Get authenticated borrower
    const { borrower } = await requireBorrowerAuth()

    const supabaseAdmin = createAdminClient()

    // Fetch document requests using service role key (bypasses RLS)
    const { data: documentRequests, error } = await supabaseAdmin
      .from("document_requests")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching document requests:", error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Also fetch uploaded documents
    const { data: documents, error: documentsError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("borrower_id", borrower.id)
      .order("created_at", { ascending: false })

    if (documentsError) {
      console.error("Error fetching documents:", documentsError)
      return NextResponse.json(
        { error: documentsError.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      documentRequests: documentRequests || [],
      documents: documents || []
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