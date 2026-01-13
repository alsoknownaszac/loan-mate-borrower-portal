import fs from 'fs'
import FormData from 'form-data'
import fetch from 'node-fetch'

async function testUploadAPI() {
  console.log("🧪 TESTING UPLOAD API")
  console.log("=" .repeat(50))

  try {
    // Create a simple test PDF file
    const testPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj
xref
0 4
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer<</Size 4/Root 1 0 R>>
startxref
200
%%EOF`

    // Write to temporary file
    const tempFile = '/tmp/test-document.pdf'
    fs.writeFileSync(tempFile, testPdfContent)

    console.log("\n1️⃣ CREATING FORM DATA")
    
    // Create form data
    const formData = new FormData()
    formData.append('file', fs.createReadStream(tempFile), {
      filename: 'test-document.pdf',
      contentType: 'application/pdf'
    })
    formData.append('borrowerId', '60edebce-61ac-4003-a9af-726446b9923d')
    formData.append('documentType', 'identification')
    formData.append('documentRequestId', 'cd38bba3-03b0-4629-8a5d-5668279fe1e3')

    console.log("✅ Form data created")

    console.log("\n2️⃣ SENDING UPLOAD REQUEST")
    
    // Send request to upload API
    const response = await fetch('http://localhost:3000/api/borrower/documents/upload', {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders()
    })

    const result = await response.text()
    
    console.log(`📊 Response status: ${response.status}`)
    console.log(`📋 Response headers:`, Object.fromEntries(response.headers.entries()))
    console.log(`📄 Response body:`, result)

    if (response.ok) {
      console.log("✅ Upload API test successful!")
      try {
        const jsonResult = JSON.parse(result)
        console.log("📄 Document created:", jsonResult.document?.id)
      } catch (e) {
        console.log("⚠️ Response is not JSON")
      }
    } else {
      console.log("❌ Upload API test failed")
    }

    // Clean up temp file
    fs.unlinkSync(tempFile)
    console.log("🧹 Temp file cleaned up")

  } catch (error) {
    console.error("💥 Test failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 UPLOAD API TEST COMPLETE")
}

testUploadAPI()