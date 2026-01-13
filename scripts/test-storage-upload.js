import { createClient } from "@supabase/supabase-js"
import fs from 'fs'

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function testStorageUpload() {
  console.log("🧪 TESTING STORAGE UPLOAD")
  console.log("=" .repeat(50))

  try {
    // Create a test PDF content
    const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Test Document) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`

    const borrowerId = "60edebce-61ac-4003-a9af-726446b9923d"
    const documentType = "identification"
    const fileName = `test_document_${Date.now()}.pdf`
    const filePath = `${borrowerId}/${documentType}/${fileName}`

    console.log("\n1️⃣ UPLOADING TEST DOCUMENT")
    console.log(`   Path: ${filePath}`)

    // Upload the test PDF
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(filePath, testPdfContent, {
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.log("❌ Upload failed:", uploadError.message)
      return
    }

    console.log("✅ Upload successful!")
    console.log(`   Path: ${uploadData.path}`)

    // Get public URL
    console.log("\n2️⃣ GETTING PUBLIC URL")
    const { data: urlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(filePath)

    console.log("✅ Public URL generated:")
    console.log(`   URL: ${urlData.publicUrl}`)

    // Test database insertion
    console.log("\n3️⃣ CREATING DATABASE RECORD")
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        borrower_id: borrowerId,
        title: fileName,
        document_type: documentType,
        file_url: urlData.publicUrl,
        status: 'pending'
      })
      .select()
      .single()

    if (dbError) {
      console.log("❌ Database insert failed:", dbError.message)
    } else {
      console.log("✅ Database record created:")
      console.log(`   ID: ${document.id}`)
      console.log(`   Status: ${document.status}`)
    }

    // List files in bucket
    console.log("\n4️⃣ LISTING FILES IN BUCKET")
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from('documents')
      .list(borrowerId, {
        limit: 10
      })

    if (listError) {
      console.log("❌ Failed to list files:", listError.message)
    } else {
      console.log(`✅ Found ${files.length} files for borrower`)
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.metadata?.size} bytes)`)
      })
    }

    // Clean up test file
    console.log("\n5️⃣ CLEANING UP")
    await supabaseAdmin.storage
      .from('documents')
      .remove([filePath])
    
    if (document) {
      await supabaseAdmin
        .from('documents')
        .delete()
        .eq('id', document.id)
    }
    
    console.log("🧹 Test files cleaned up")

  } catch (error) {
    console.error("💥 Test failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 STORAGE UPLOAD TEST COMPLETE")
}

testStorageUpload()