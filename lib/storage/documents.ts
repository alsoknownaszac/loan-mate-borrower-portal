import { createClient } from "@supabase/supabase-js"

// Create client for storage operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface DocumentUpload {
  file: File
  borrowerId: string
  documentType: string
  documentRequestId?: string
}

export interface DocumentMetadata {
  id: string
  borrower_id: string
  title: string
  document_type: string
  file_url: string
  status: string
  created_at: string
}

/**
 * Upload a document to Supabase Storage
 */
export async function uploadDocument({
  file,
  borrowerId,
  documentType,
  documentRequestId
}: DocumentUpload): Promise<{ success: boolean; document?: DocumentMetadata; error?: string }> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('borrowerId', borrowerId)
    formData.append('documentType', documentType)
    
    if (documentRequestId) {
      formData.append('documentRequestId', documentRequestId)
    }

    const response = await fetch('/api/borrower/documents/upload', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error }
    }

    return { success: true, document: result.document }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * Get a signed URL for downloading a document
 */
export async function getDocumentDownloadUrl(filePath: string): Promise<string | null> {
  try {
    // Use service role key for creating signed URLs
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await supabaseAdmin.storage
      .from('documents')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.error('Error creating signed URL:', error)
      return null
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error getting download URL:', error)
    return null
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload PDF, JPG, PNG, DOC, or DOCX files.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.'
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string | undefined | null): string {
  if (!filename || typeof filename !== 'string') {
    return ''
  }
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get file icon based on file type
 */
export function getFileIcon(filename: string | undefined | null): string {
  if (!filename || typeof filename !== 'string') {
    return '📎'
  }
  
  const extension = getFileExtension(filename)
  
  switch (extension) {
    case 'pdf':
      return '📄'
    case 'jpg':
    case 'jpeg':
    case 'png':
      return '🖼️'
    case 'doc':
    case 'docx':
      return '📝'
    default:
      return '📎'
  }
}