import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function diagnoseStorage() {
  console.log("🔍 DIAGNOSING STORAGE ISSUES")
  console.log("=" .repeat(50))

  try {
    // 1. List all buckets
    console.log("\n1️⃣ LISTING ALL BUCKETS")
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.log("❌ Failed to list buckets:", listError.message)
      return
    }

    console.log(`✅ Found ${buckets.length} buckets:`)
    buckets.forEach((bucket, index) => {
      console.log(`   ${index + 1}. ${bucket.name} (${bucket.public ? 'public' : 'private'})`)
    })

    // 2. Check if documents bucket exists
    const documentsBucket = buckets.find(b => b.name === 'documents')
    if (!documentsBucket) {
      console.log("\n❌ DOCUMENTS BUCKET NOT FOUND")
      console.log("🔧 Attempting to create bucket...")
      
      const { data: newBucket, error: createError } = await supabaseAdmin.storage
        .createBucket('documents', {
          public: false,
          allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ],
          fileSizeLimit: 10485760 // 10MB
        })

      if (createError) {
        console.log("❌ Failed to create bucket:", createError.message)
        return
      } else {
        console.log("✅ Documents bucket created successfully")
      }
    } else {
      console.log("\n✅ Documents bucket found")
      console.log(`   - ID: ${documentsBucket.id}`)
      console.log(`   - Public: ${documentsBucket.public}`)
      console.log(`   - Created: ${documentsBucket.created_at}`)
    }

    // 3. Test upload with PDF content
    console.log("\n2️⃣ TESTING PDF UPLOAD")
    
    const testPdfContent = Buffer.from(`%PDF-1.4
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
%%EOF`)

    const testPath = `test/diagnostic_${Date.now()}.pdf`
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(testPath, testPdfContent, {
        contentType: 'application/pdf'
      })

    if (uploadError) {
      console.log("❌ PDF upload failed:", uploadError.message)
      console.log("   Error details:", JSON.stringify(uploadError, null, 2))
    } else {
      console.log("✅ PDF upload successful!")
      console.log(`   Path: ${uploadData.path}`)
      
      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('documents')
        .getPublicUrl(testPath)
      
      console.log(`   URL: ${urlData.publicUrl}`)
      
      // Clean up
      await supabaseAdmin.storage
        .from('documents')
        .remove([testPath])
      console.log("🧹 Test file cleaned up")
    }

    // 4. Test with different file types
    console.log("\n3️⃣ TESTING DIFFERENT FILE TYPES")
    
    const testFiles = [
      { name: 'test.jpg', content: 'fake-jpg-content', type: 'image/jpeg' },
      { name: 'test.png', content: 'fake-png-content', type: 'image/png' },
      { name: 'test.docx', content: 'fake-docx-content', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
    ]

    for (const testFile of testFiles) {
      const filePath = `test/${testFile.name}`
      
      const { error } = await supabaseAdmin.storage
        .from('documents')
        .upload(filePath, testFile.content, {
          contentType: testFile.type
        })

      if (error) {
        console.log(`❌ ${testFile.name} upload failed: ${error.message}`)
      } else {
        console.log(`✅ ${testFile.name} upload successful`)
        // Clean up
        await supabaseAdmin.storage
          .from('documents')
          .remove([filePath])
      }
    }

    // 5. Check bucket configuration
    console.log("\n4️⃣ CHECKING BUCKET CONFIGURATION")
    
    // Try to get bucket details (this might not be available via API)
    const { data: bucketInfo, error: bucketError } = await supabaseAdmin.storage
      .from('documents')
      .list('', { limit: 1 })

    if (bucketError) {
      console.log("❌ Cannot access bucket:", bucketError.message)
    } else {
      console.log("✅ Bucket is accessible")
    }

  } catch (error) {
    console.error("💥 Diagnosis failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 STORAGE DIAGNOSIS COMPLETE")
}

diagnoseStorage()