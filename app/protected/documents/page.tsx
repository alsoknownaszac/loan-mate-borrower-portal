"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface Document {
  id: string
  title: string
  document_type: string
  upload_date: string
  file_url?: string
}

export default function DocumentsPage() {
  const { user } = useUser()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .eq("borrower_id", user.id)
          .order("upload_date", { ascending: false })

        if (error) throw error
        setDocuments(data || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [user, supabase])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setUploading(true)
    try {
      // Create a new document record (in a real app, you'd upload the file to Supabase Storage)
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            borrower_id: user.id,
            title: file.name,
            document_type: file.type || "application/octet-stream",
            upload_date: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      setDocuments([...documents, data[0]])
      alert("Document uploaded successfully!")
    } catch (error) {
      console.error("Error uploading document:", error)
      alert("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const getDocumentIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("image")) return "🖼️"
    if (type.includes("word") || type.includes("document")) return "📝"
    if (type.includes("sheet") || type.includes("spreadsheet")) return "📊"
    return "📎"
  }

  const docTypes = [
    { value: "id", label: "Identification" },
    { value: "income", label: "Income Proof" },
    { value: "bank_statement", label: "Bank Statement" },
    { value: "contract", label: "Loan Agreement" },
    { value: "other", label: "Other" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Documents</h1>
        <p className="text-muted-foreground">Upload and manage your loan documents</p>
      </div>

      {/* Upload Section */}
      <div className="bg-card border-2 border-dashed border-border rounded-lg p-8">
        <div className="text-center">
          <svg
            className="w-12 h-12 text-muted-foreground mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">Drag and drop your files or click to browse</p>
          <label className="inline-block">
            <input
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.png,.gif"
            />
            <span className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted cursor-pointer font-medium inline-block transition-colors">
              {uploading ? "Uploading..." : "Choose File"}
            </span>
          </label>
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">📁</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Documents Yet</h2>
          <p className="text-muted-foreground">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getDocumentIcon(doc.document_type)}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{doc.document_type}</p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded on {new Date(doc.upload_date).toLocaleDateString()}
                  </p>
                </div>
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
