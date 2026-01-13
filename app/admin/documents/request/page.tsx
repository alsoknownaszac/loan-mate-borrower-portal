"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

interface Borrower {
  id: string
  full_name: string
  email: string
}

interface DocumentRequestForm {
  borrower_id: string
  document_type: string
  title: string
  description: string
  deadline: string
}

export default function RequestDocumentPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [formData, setFormData] = useState<DocumentRequestForm>({
    borrower_id: "",
    document_type: "",
    title: "",
    description: "",
    deadline: ""
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  const documentTypes = [
    { value: "identification", label: "Identification Document" },
    { value: "income_proof", label: "Proof of Income" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "employment_letter", label: "Employment Letter" },
    { value: "tax_return", label: "Tax Return" },
    { value: "utility_bill", label: "Utility Bill" },
    { value: "insurance_policy", label: "Insurance Policy" },
    { value: "other", label: "Other Document" },
  ]

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        const response = await fetch('/api/admin/borrowers/list')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch borrowers')
        }

        // Extract just the basic info we need for the dropdown
        const borrowersList = result.borrowers.map((borrower: any) => ({
          id: borrower.id,
          full_name: borrower.full_name,
          email: borrower.email
        }))

        setBorrowers(borrowersList)

        // Pre-select borrower if provided in URL
        const borrowerId = searchParams.get('borrower')
        if (borrowerId) {
          setFormData(prev => ({ ...prev, borrower_id: borrowerId }))
        }
      } catch (error) {
        console.error("Error fetching borrowers:", error)
        setError("Failed to load borrowers. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowers()
  }, [searchParams])

  const handleDocumentTypeChange = (type: string) => {
    const selectedType = documentTypes.find(dt => dt.value === type)
    setFormData({
      ...formData,
      document_type: type,
      title: selectedType ? `Please upload your ${selectedType.label}` : ""
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // Validate form
      if (!formData.borrower_id || !formData.document_type || !formData.title) {
        setError("Please fill in all required fields")
        return
      }

      // Create document request via API
      const response = await fetch('/api/admin/documents/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          borrower_id: formData.borrower_id,
          document_type: formData.document_type,
          title: formData.title,
          description: formData.description,
          deadline: formData.deadline || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create document request')
      }

      const borrower = borrowers.find(b => b.id === formData.borrower_id)
      alert(`Document request sent to ${borrower?.full_name} successfully!`)
      router.push("/admin/documents")

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/documents"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Request Document</h1>
          <p className="text-muted-foreground">Request a specific document from a borrower</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Borrower Selection */}
              <div>
                <label htmlFor="borrower_id" className="block text-sm font-medium text-foreground mb-2">
                  Borrower *
                </label>
                <select
                  id="borrower_id"
                  value={formData.borrower_id}
                  onChange={(e) => setFormData({ ...formData, borrower_id: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a borrower</option>
                  {borrowers.map((borrower) => (
                    <option key={borrower.id} value={borrower.id}>
                      {borrower.full_name} ({borrower.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Type */}
              <div>
                <label htmlFor="document_type" className="block text-sm font-medium text-foreground mb-2">
                  Document Type *
                </label>
                <select
                  id="document_type"
                  value={formData.document_type}
                  onChange={(e) => handleDocumentTypeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Request Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Please upload your identification document"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Additional Instructions
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please ensure the document is clear and all information is visible. Accepted formats: PDF, JPG, PNG."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-foreground mb-2">
                  Deadline (Optional)
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted font-medium transition-colors"
                >
                  {submitting ? "Sending Request..." : "Send Document Request"}
                </button>
                <Link
                  href="/admin/documents"
                  className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Request Preview</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Borrower:</span>
                <p className="font-medium">
                  {formData.borrower_id 
                    ? borrowers.find(b => b.id === formData.borrower_id)?.full_name || "Unknown"
                    : "Not selected"
                  }
                </p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Document Type:</span>
                <p className="font-medium">
                  {formData.document_type 
                    ? documentTypes.find(dt => dt.value === formData.document_type)?.label || "Unknown"
                    : "Not selected"
                  }
                </p>
              </div>
              
              <div>
                <span className="text-muted-foreground">Request Title:</span>
                <p className="font-medium">{formData.title || "Not specified"}</p>
              </div>
              
              {formData.description && (
                <div>
                  <span className="text-muted-foreground">Instructions:</span>
                  <p className="font-medium">{formData.description}</p>
                </div>
              )}
              
              {formData.deadline && (
                <div>
                  <span className="text-muted-foreground">Deadline:</span>
                  <p className="font-medium">{new Date(formData.deadline).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Borrower will receive a notification about the document request</li>
                  <li>• Request will appear in their dashboard with upload option</li>
                  <li>• You'll be notified when the document is uploaded</li>
                  <li>• You can then review and approve/reject the document</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-lg">💡</span>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Best Practices</h4>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Be specific about document requirements</li>
                  <li>• Include accepted file formats</li>
                  <li>• Set reasonable deadlines</li>
                  <li>• Provide clear instructions for quality</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}