"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Document {
  id: string
  title: string
  document_type: string
  status: string
  upload_date: string
  file_url: string | null
  approved_at: string | null
  rejection_reason: string | null
  borrower_id: string
  borrowers: {
    full_name: string
    email: string
  }
}

interface DocumentRequest {
  id: string
  document_type: string
  title: string
  description: string | null
  deadline: string | null
  status: string
  created_at: string
  borrowers: {
    full_name: string
    email: string
  }
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"pending" | "requests">("pending")
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/documents')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setDocuments(result.documents || [])
          setDocumentRequests(result.documentRequests || [])
        } else {
          throw new Error(result.error || 'Failed to fetch documents')
        }
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleApproveDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "approved",
          approved_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve document')
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: "approved", approved_at: new Date().toISOString() }
          : doc
      ))

      // Update any related document request to completed
      const document = documents.find(d => d.id === documentId)
      if (document) {
        // Update document request status to completed
        await fetch('/api/admin/documents/request/complete', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: documentId
          })
        })

        // Update local document requests state
        setDocumentRequests(prev => prev.map(req => 
          req.borrowers?.email === document.borrowers?.email && 
          req.document_type === document.document_type
            ? { ...req, status: "completed" }
            : req
        ))

        // Create notification for borrower
        await supabase
          .from("notifications")
          .insert({
            borrower_id: document.borrower_id,
            title: "Document Approved",
            message: `Your ${document.document_type} has been approved. Thank you for your submission.`,
            notification_type: "success"
          })
      }

      alert("Document approved successfully!")
    } catch (error) {
      console.error("Error approving document:", error)
      alert("Failed to approve document")
    }
  }

  const handleRejectDocument = async (documentId: string) => {
    const reason = prompt("Please provide a reason for rejecting this document:")
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "rejected",
          rejection_reason: reason
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject document')
      }

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: "rejected", rejection_reason: reason }
          : doc
      ))

      // Update any related document request back to pending for resubmission
      const document = documents.find(d => d.id === documentId)
      if (document) {
        // Update document request status back to pending
        await fetch('/api/admin/documents/request/reset', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: documentId
          })
        })

        // Update local document requests state
        setDocumentRequests(prev => prev.map(req => 
          req.borrowers?.email === document.borrowers?.email && 
          req.document_type === document.document_type
            ? { ...req, status: "pending" }
            : req
        ))

        // Create notification for borrower
        await supabase
          .from("notifications")
          .insert({
            borrower_id: document.borrower_id,
            title: "Document Rejected",
            message: `Your ${document.document_type} has been rejected. Reason: ${reason}. Please resubmit with the required corrections.`,
            notification_type: "alert"
          })
      }

      alert("Document rejected and borrower notified")
    } catch (error) {
      console.error("Error rejecting document:", error)
      alert("Failed to reject document")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "completed":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "requested":
        return "bg-purple-100 text-purple-800"
      case "overdue":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDocumentIcon = (type: string) => {
    if (type.includes("id") || type.includes("identification")) return "🆔"
    if (type.includes("income") || type.includes("salary")) return "💰"
    if (type.includes("bank") || type.includes("statement")) return "🏦"
    if (type.includes("contract") || type.includes("agreement")) return "📋"
    return "📄"
  }

  const filteredDocuments = documents.filter(doc =>
    doc.borrowers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.borrowers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRequests = documentRequests.filter(req =>
    req.borrowers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.borrowers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Document Management</h1>
          <p className="text-muted-foreground">Review and manage borrower documents</p>
        </div>
        <Link
          href="/admin/documents/request"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          📋 Request Documents
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-foreground">{documents.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">
            {documents.filter(d => d.status === 'pending').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">
            {documents.filter(d => d.status === 'approved').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Document Requests</p>
          <p className="text-2xl font-bold text-blue-600">
            {documentRequests.length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("pending")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Documents ({documents.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "requests"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Document Requests ({documentRequests.length})
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <input
          type="text"
          placeholder="Search by borrower name, email, or document type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Content */}
      {activeTab === "pending" ? (
        <div className="space-y-4">
          {filteredDocuments.filter(d => d.status === 'pending').length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <span className="text-4xl mb-4 inline-block">📄</span>
              <h2 className="text-xl font-semibold text-foreground mb-2">No pending documents</h2>
              <p className="text-muted-foreground">All documents have been reviewed</p>
            </div>
          ) : (
            filteredDocuments
              .filter(doc => doc.status === 'pending')
              .map((document) => (
                <div
                  key={document.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{getDocumentIcon(document.document_type)}</span>
                        <div>
                          <h3 className="font-semibold text-foreground">{document.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {document.borrowers?.full_name} • {document.borrowers?.email}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Document Type</p>
                          <p className="font-medium text-foreground">{document.document_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Uploaded</p>
                          <p className="font-medium text-foreground">
                            {new Date(document.upload_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">File</p>
                          {document.file_url ? (
                            <a
                              href={document.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 font-medium"
                            >
                              📎 View File
                            </a>
                          ) : (
                            <p className="text-muted-foreground">No file</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveDocument(document.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectDocument(document.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <span className="text-4xl mb-4 inline-block">📋</span>
              <h2 className="text-xl font-semibold text-foreground mb-2">No document requests</h2>
              <p className="text-muted-foreground">Create your first document request</p>
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-card border border-border rounded-lg p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{getDocumentIcon(request.document_type)}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{request.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {request.borrowers?.full_name} • {request.borrowers?.email}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Document Type</p>
                    <p className="font-medium text-foreground">{request.document_type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Requested</p>
                    <p className="font-medium text-foreground">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Deadline</p>
                    <p className="font-medium text-foreground">
                      {request.deadline ? new Date(request.deadline).toLocaleDateString() : "No deadline"}
                    </p>
                  </div>
                </div>

                {request.description && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground mb-1">Description:</p>
                    <p className="text-sm text-foreground">{request.description}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}