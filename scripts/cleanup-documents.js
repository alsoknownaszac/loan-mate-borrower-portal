import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

console.log('🧹 CLEANING UP DOCUMENTS AND DOCUMENT REQUESTS')
console.log('==================================================')

async function cleanupDocuments() {
  try {
    // 1. List current documents
    console.log('\n1️⃣ CHECKING CURRENT DOCUMENTS')
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')

    if (docsError) {
      console.error('❌ Error fetching documents:', docsError)
      return
    }

    console.log(`📄 Found ${documents.length} documents:`)
    documents.forEach(doc => {
      console.log(`   - ${doc.id}: ${doc.title} (${doc.document_type}) - ${doc.status}`)
    })

    // 2. List current document requests
    console.log('\n2️⃣ CHECKING CURRENT DOCUMENT REQUESTS')
    const { data: requests, error: reqError } = await supabase
      .from('document_requests')
      .select('*')

    if (reqError) {
      console.error('❌ Error fetching document requests:', reqError)
      return
    }

    console.log(`📋 Found ${requests.length} document requests:`)
    requests.forEach(req => {
      console.log(`   - ${req.id}: ${req.title} (${req.document_type}) - ${req.status}`)
    })

    // 3. List storage files
    console.log('\n3️⃣ CHECKING STORAGE FILES')
    const { data: files, error: storageError } = await supabase.storage
      .from('documents')
      .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

    if (storageError) {
      console.error('❌ Error listing storage files:', storageError)
      return
    }

    console.log(`💾 Found ${files.length} storage files:`)
    files.forEach(file => {
      console.log(`   - ${file.name} (${file.metadata?.size || 'unknown size'})`)
    })

    // 4. Delete all documents
    if (documents.length > 0) {
      console.log('\n4️⃣ DELETING ALL DOCUMENTS')
      const { error: deleteDocsError } = await supabase
        .from('documents')
        .delete()
        .neq('id', 'never-match') // Delete all

      if (deleteDocsError) {
        console.error('❌ Error deleting documents:', deleteDocsError)
      } else {
        console.log(`✅ Deleted ${documents.length} documents`)
      }
    }

    // 5. Delete all document requests
    if (requests.length > 0) {
      console.log('\n5️⃣ DELETING ALL DOCUMENT REQUESTS')
      const { error: deleteReqError } = await supabase
        .from('document_requests')
        .delete()
        .neq('id', 'never-match') // Delete all

      if (deleteReqError) {
        console.error('❌ Error deleting document requests:', deleteReqError)
      } else {
        console.log(`✅ Deleted ${requests.length} document requests`)
      }
    }

    // 6. Delete all storage files
    if (files.length > 0) {
      console.log('\n6️⃣ DELETING ALL STORAGE FILES')
      
      // Delete files recursively
      const deleteFiles = async (path = '') => {
        const { data: folderFiles, error } = await supabase.storage
          .from('documents')
          .list(path)

        if (error) {
          console.error(`❌ Error listing files in ${path}:`, error)
          return
        }

        for (const file of folderFiles) {
          const filePath = path ? `${path}/${file.name}` : file.name
          
          if (file.id === null) {
            // It's a folder, recurse into it
            await deleteFiles(filePath)
          } else {
            // It's a file, delete it
            const { error: deleteError } = await supabase.storage
              .from('documents')
              .remove([filePath])

            if (deleteError) {
              console.error(`❌ Error deleting file ${filePath}:`, deleteError)
            } else {
              console.log(`   ✅ Deleted file: ${filePath}`)
            }
          }
        }
      }

      await deleteFiles()
      console.log(`✅ Storage cleanup completed`)
    }

    console.log('\n==================================================')
    console.log('🎯 CLEANUP COMPLETE')
    console.log('✅ All documents, document requests, and storage files have been removed')

  } catch (error) {
    console.error('❌ Cleanup failed:', error)
  }
}

cleanupDocuments()