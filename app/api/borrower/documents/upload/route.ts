import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // Create client with service role key for storage and database access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentRequestId = formData.get('documentRequestId') as string
    const borrowerId = formData.get('borrowerId') as string
    const documentType = formData.get('documentType') as string

    if (!file || !documentRequestId || !borrowerId || !documentType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files." },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()
    const fileName = `${documentType}_${timestamp}.${fileExtension}`
    const filePath = `${borrowerId}/${documentType}/${fileName}`

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error("Storage upload error:", uploadError)
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      )
    }

    // Get signed URL for the uploaded file (since bucket is private)
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365) // 1 year expiry

    if (urlError) {
      console.error("Failed to create signed URL:", urlError)
      // Fallback to a placeholder URL that will be handled by a download endpoint
      const fallbackUrl = `/api/borrower/documents/download/${encodeURIComponent(filePath)}`
      var finalUrl = fallbackUrl
    } else {
      var finalUrl = urlData.signedUrl
    }

    // Create document record in database
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        borrower_id: borrowerId,
        title: file.name,
        document_type: documentType,
        file_url: finalUrl,
        status: 'pending' // Will be reviewed by admin
      })
      .select()
      .single()

    if (dbError) {
      console.error("Database insert error:", dbError)
      
      // Clean up uploaded file if database insert fails
      await supabaseAdmin.storage
        .from('documents')
        .remove([filePath])

      return NextResponse.json(
        { error: "Failed to save document record" },
        { status: 500 }
      )
    }

    // Update document request status to submitted
    const { error: updateError } = await supabaseAdmin
      .from('document_requests')
      .update({ 
        status: 'submitted',
        fulfilled_by: borrowerId,
        updated_at: new Date().toISOString()
      })
      .eq('id', documentRequestId)

    if (updateError) {
      console.error("Failed to update document request:", updateError)
      // Don't fail the request, just log the error
    }

    // Create notification for admin
    await supabaseAdmin
      .from('notifications')
      .insert({
        borrower_id: borrowerId,
        title: "Document Uploaded",
        message: `Document "${file.name}" has been uploaded and is ready for review.`,
        notification_type: "info",
        is_read: false
      })

    return NextResponse.json({
      success: true,
      document,
      message: "Document uploaded successfully"
    })

  } catch (error: any) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}