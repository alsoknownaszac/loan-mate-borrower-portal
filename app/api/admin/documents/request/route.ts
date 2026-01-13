import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"
import { emailService } from "@/lib/resend/email-service"

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()
    const body = await request.json()
    const { borrower_id, document_type, title, description, deadline } = body

    // Validate required fields
    if (!borrower_id || !document_type || !title) {
      return NextResponse.json(
        { error: "Missing required fields: borrower_id, document_type, title" },
        { status: 400 }
      )
    }

    // Create document request
    const { data: documentRequest, error: requestError } = await supabaseAdmin
      .from("document_requests")
      .insert({
        borrower_id,
        document_type,
        title,
        description: description || null,
        deadline: deadline || null,
        status: "pending"
      })
      .select()
      .single()

    if (requestError) {
      console.error("Error creating document request:", requestError)
      return NextResponse.json(
        { error: requestError.message },
        { status: 400 }
      )
    }

    // Get borrower info for notification and email
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("full_name, email")
      .eq("id", borrower_id)
      .single()

    if (borrowerError) {
      console.error("Error fetching borrower:", borrowerError)
      return NextResponse.json(
        { error: "Failed to fetch borrower information" },
        { status: 400 }
      )
    }

    // Create notification for borrower
    const notificationMessage = `Please upload the following document: ${title}. ${description ? description : ""}${deadline ? ` Deadline: ${new Date(deadline).toLocaleDateString()}` : ""}`

    const { error: notificationError } = await supabaseAdmin
      .from("notifications")
      .insert({
        borrower_id,
        title: "Document Required",
        message: notificationMessage,
        notification_type: "info",
        is_read: false
      })

    if (notificationError) {
      console.error("Error creating notification:", notificationError)
      // Don't fail the request if notification fails
    }

    // Send email notification
    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/documents`
      
      const emailResult = await emailService.sendDocumentRequestEmail({
        to: borrower.email,
        borrowerName: borrower.full_name,
        documentType: title,
        description: description || undefined,
        deadline: deadline || undefined,
        loginUrl
      })

      if (!emailResult.success) {
        console.error("Failed to send document request email:", emailResult.error)
        // Don't fail the request if email fails, but log it
      } else {
        console.log("Document request email sent successfully to:", borrower.email)
      }
    } catch (emailError) {
      console.error("Email service error:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      documentRequest,
      borrowerName: borrower?.full_name || "Unknown"
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