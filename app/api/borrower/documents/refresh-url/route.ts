import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json()

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      )
    }

    // Create client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the document record
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // Extract file path from existing URL or construct it
    let filePath = ''
    
    if (document.file_url) {
      // Try to extract path from existing URL
      const urlMatch = document.file_url.match(/documents\/(.+?)(?:\?|$)/)
      if (urlMatch) {
        filePath = urlMatch[1]
      }
    }

    // If we couldn't extract the path, construct it from document info
    if (!filePath) {
      const timestamp = new Date(document.created_at).getTime()
      const fileExtension = document.title?.split('.').pop() || 'pdf'
      const fileName = `${document.document_type}_${timestamp}.${fileExtension}`
      filePath = `${document.borrower_id}/${document.document_type}/${fileName}`
    }

    // Create a new signed URL
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year expiry

    if (urlError) {
      console.error("Failed to create signed URL:", urlError)
      return NextResponse.json(
        { error: "Failed to generate download URL" },
        { status: 500 }
      )
    }

    // Update the document record with the new signed URL
    const { error: updateError } = await supabaseAdmin
      .from('documents')
      .update({ file_url: urlData.signedUrl })
      .eq('id', documentId)

    if (updateError) {
      console.error("Failed to update document URL:", updateError)
      // Don't fail the request, just return the signed URL
    }

    return NextResponse.json({
      success: true,
      file_url: urlData.signedUrl
    })

  } catch (error: any) {
    console.error("Refresh URL error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}