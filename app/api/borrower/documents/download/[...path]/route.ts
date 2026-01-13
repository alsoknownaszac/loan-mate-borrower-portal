import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Create client with service role key for storage access
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Reconstruct the file path
    const filePath = params.path.join('/')
    
    // TODO: Add authentication check here
    // For now, we'll allow access but in production you should verify:
    // 1. User is authenticated
    // 2. User owns the document or is an admin
    
    // Create a signed URL for the file
    const { data: urlData, error: urlError } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (urlError) {
      console.error("Failed to create signed URL:", urlError)
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 }
      )
    }

    // Redirect to the signed URL
    return NextResponse.redirect(urlData.signedUrl)

  } catch (error: any) {
    console.error("Download error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}