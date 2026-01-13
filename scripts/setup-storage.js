import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function setupStorage() {
  console.log("🗄️ SETTING UP SUPABASE STORAGE")
  console.log("=" .repeat(50))

  try {
    // 1. Create the documents bucket
    console.log("\n1️⃣ CREATING DOCUMENTS BUCKET")
    
    const { data: bucket, error: bucketError } = await supabaseAdmin.storage
      .createBucket('documents', {
        public: false, // Private bucket - files require authentication
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

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log("✅ Documents bucket already exists")
      } else {
        console.log("❌ Failed to create bucket:", bucketError.message)
        return
      }
    } else {
      console.log("✅ Documents bucket created successfully")
    }

    // 2. Set up RLS policies for the bucket
    console.log("\n2️⃣ SETTING UP STORAGE POLICIES")
    
    // Note: Storage policies need to be set up in the Supabase dashboard
    // or via SQL commands. Here's what you need to do:
    console.log("📋 Manual steps required in Supabase Dashboard:")
    console.log("   1. Go to Storage > Policies")
    console.log("   2. Create policy for 'documents' bucket:")
    console.log("      - Name: 'Borrowers can upload their own documents'")
    console.log("      - Operation: INSERT")
    console.log("      - Target roles: authenticated")
    console.log("      - Policy: auth.uid()::text = (storage.foldername(name))[1]")
    console.log("   3. Create policy for viewing:")
    console.log("      - Name: 'Borrowers can view their own documents'") 
    console.log("      - Operation: SELECT")
    console.log("      - Target roles: authenticated")
    console.log("      - Policy: auth.uid()::text = (storage.foldername(name))[1]")

    // 3. Test bucket access
    console.log("\n3️⃣ TESTING BUCKET ACCESS")
    
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.log("❌ Failed to list buckets:", listError.message)
    } else {
      const documentsBucket = buckets.find(b => b.name === 'documents')
      if (documentsBucket) {
        console.log("✅ Documents bucket is accessible")
        console.log(`   - ID: ${documentsBucket.id}`)
        console.log(`   - Public: ${documentsBucket.public}`)
        console.log(`   - Created: ${documentsBucket.created_at}`)
      } else {
        console.log("❌ Documents bucket not found")
      }
    }

    // 4. Test upload (create a small test file)
    console.log("\n4️⃣ TESTING FILE UPLOAD")
    
    const testContent = "This is a test document upload"
    const testPath = "test/test-upload.txt"
    
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(testPath, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.log("❌ Test upload failed:", uploadError.message)
    } else {
      console.log("✅ Test upload successful")
      console.log(`   - Path: ${uploadData.path}`)
      
      // Clean up test file
      await supabaseAdmin.storage
        .from('documents')
        .remove([testPath])
      console.log("🧹 Test file cleaned up")
    }

  } catch (error) {
    console.error("💥 Setup failed:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 STORAGE SETUP COMPLETE")
}

setupStorage()