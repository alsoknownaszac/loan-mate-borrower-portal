"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { validateFile, formatFileSize, getFileIcon } from "@/lib/storage/documents"

interface DocumentRequest {
  id: string
  document_type: string
  title: string
  description: string
  deadline: string
  status: string
  created_at: string
}

interface Document {
  id: string
  document_type: string
  file_name?: string
  file_url?: string
  status: string
  created_at: string
}

export function DocumentsContent() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState<string | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      // Check if user exists first
      if (!user) {
        console.log("No user session found")
        setLoading(false)
        return
      }

      try {
        const response = await fetch("/api/borrower/documents")
        const result = await response.json()

        if (!response.ok) {
          // If unauthorized, redirect to login
          if (response.status === 401) {
            router.push("/auth/login")
            return
          }
          throw new Error(result.error || "Failed to fetch documents")
        }

        setDocumentRequests(result.documentRequests || [])
        setDocuments(result.documents || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
        setError("Failed to load documents")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDocuments()
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [user, userLoading])

  const handleViewDocument = async (document: Document) => {
    if (!document.file_url) {
      alert('Document file not available')
      return
    }

    // Check if the URL is a broken public URL
    if (document.file_url.includes('/storage/v1/object/public/')) {
      try {
        // Try to refresh the URL to get a signed URL
        const response = await fetch('/api/borrower/documents/refresh-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ documentId: document.id })
        })

        if (response.ok) {
          const result = await response.json()
          // Open the refreshed URL
          window.open(result.file_url, '_blank')
          
          // Refresh the documents list to update the URL
          const refreshResponse = await fetch("/api/borrower/documents")
          const refreshResult = await refreshResponse.json()
          if (refreshResponse.ok) {
            setDocuments(refreshResult.documents || [])
          }
          return
        }
      } catch (error) {
        console.error('Failed to refresh URL:', error)
      }
    }

    // Open document in new tab
    window.open(document.file_url, '_blank')
  }

  const handleFileUpload = async (requestId: string, file: File) => {
    // Validate file first
    const validation = validateFile(file)
    if (!validation.valid) {
      alert(validation.error)
      return
    }

    setUploading(requestId)
    
    try {
      // Create form data for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentRequestId', requestId)
      formData.append('borrowerId', user?.id || '') // Get from authenticated user
      
      // Get document type from the request
      const request = documentRequests.find(r => r.id === requestId)
      if (request) {
        formData.append('documentType', request.document_type)
      }

      // Upload file
      const response = await fetch('/api/borrower/documents/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      alert(`File "${file.name}" uploaded successfully!`)
      
      // Refresh the data
      const refreshResponse = await fetch("/api/borrower/documents")
      const refreshResult = await refreshResponse.json()
      if (refreshResponse.ok) {
        setDocumentRequests(refreshResult.documentRequests || [])
        setDocuments(refreshResult.documents || [])
      }
    } catch (error: any) {
      console.error("Upload error:", error)
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "uploaded": return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      "identification": "Identification Document",
      "income_proof": "Proof of Income",
      "bank_statement": "Bank Statement",
      "employment_letter": "Employment Letter",
      "tax_return": "Tax Return",
      "utility_bill": "Utility Bill",
      "insurance_policy": "Insurance Policy",
      "other": "Other Document"
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <span className="text-2xl mb-4 block">❌</span>
        <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Documents</h2>
        <p className="text-red-700">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your loan documents</p>
      </div>

      {/* Document Requests */}
      {documentRequests.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">📋 Document Requests</h2>
          <div className="space-y-4">
            {documentRequests.map((request) => (
              <div key={request.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{request.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Type: {getDocumentTypeLabel(request.document_type)}
                    </p>
                    {request.description && (
                      <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                    )}
                    {request.deadline && (
                      <p className="text-sm text-muted-foreground">
                        Deadline: {new Date(request.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {request.status === "pending" && (
                    <div className="flex-shrink-0">
                      <input
                        type="file"
                        id={`file-${request.id}`}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(request.id, file)
                          }
                        }}
                      />
                      <label
                        htmlFor={`file-${request.id}`}
                        className={`inline-flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer ${
                          uploading === request.id ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading === request.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">📤</span>
                            Upload File
                          </>
                        )}
                      </label>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">📄 Uploaded Documents</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(doc.file_name || '')}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{doc.file_name || 'Unknown file'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Type: {getDocumentTypeLabel(doc.document_type)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded: {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                    {doc.file_url?.includes('/storage/v1/object/public/') && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border-orange-200">
                        URL Refresh Needed
                      </span>
                    )}
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documentRequests.length === 0 && documents.length === 0 && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="mb-4">
            <span className="text-4xl">📄</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Documents</h2>
          <p className="text-muted-foreground">No document requests or uploads at this time.</p>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">💡</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Document Upload Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Accepted formats: PDF, JPG, PNG, DOC, DOCX</li>
              <li>• Maximum file size: 10MB</li>
              <li>• Ensure documents are clear and readable</li>
              <li>• Upload documents promptly to avoid delays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}