import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function recreateBucket() {
  console.log("🔄 RECREATING DOCUMENTS BUCKET")
  console.log("=" .repeat(50))

  try {
    // 1. Delete existing bucket (if it exists)
    console.log("\n1️⃣ DELETING EXISTING BUCKET")
    
    const { error: deleteError } = await supabaseAdmin.storage.deleteBucket('documents')
    
    if (deleteError) {
      if (deleteError.message.includes('not found')) {
        console.log("ℹ️ Bucket doesn't exist, skipping deletion")
      } else {
        console.log("⚠️ Delete error (continuing anyway):", deleteError.message)
      }
    } else {
      console.log("✅ Existing bucket deleted")
    }

    // Wait a moment for deletion to complete
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. Create new bucket with proper configuration
    console.log("\n2️⃣ CREATING NEW BUCKET")
    
    const { data: bucket, error: createError } = await supabaseAdmin.storage
      .createBucket('documents', {
        public: false, // Private bucket
        allowedMimeTypes: [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        fileSizeLimit: 10485760 // 10MB
      })

    if (createError) {
      console.log("❌ Failed to create bucket:", createError.message)
      return
    }

    console.log("✅ New bucket created successfully")

    // 3. Test the new bucket
    console.log("\n3️⃣ TESTING NEW BUCKET")
    
    const testContent = Buffer.from("Test file content")
    const testPath = `test/bucket_test_${Date.now()}.txt`
    
    // Try to upload a test file
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(testPath, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.log("❌ Test upload failed:", uploadError.message)
    } else {
      console.log("✅ Test upload successful!")
      console.log(`   Path: ${uploadData.path}`)
      
      // Clean up test file
      await supabaseAdmin.storage
        .from('documents')
        .remove([testPath])
      console.log("🧹 Test file cleaned up")
    }

    // 4. List buckets to confirm
    console.log("\n4️⃣ CONFIRMING BUCKET EXISTS")
    
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.log("❌ Failed to list buckets:", listError.message)
    } else {
      const documentsBucket = buckets.find(b => b.name === 'documents')
      if (documentsBucket) {
        console.log("✅ Documents bucket confirmed")
        console.log(`   - ID: ${documentsBucket.id}`)
        console.log(`   - Public: ${documentsBucket.public}`)
        console.log(`   - Created: ${documentsBucket.created_at}`)
      } else {
        console.log("❌ Documents bucket not found in list")
      }
    }

  } catch (error) {
    console.error("💥 Recreation failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 BUCKET RECREATION COMPLETE")
}

recreateBucket()