"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface BorrowerRow {
  full_name: string
  email: string
  phone?: string
  password: string
}

export default function BulkUploadBorrowersPage() {
  const [csvData, setCsvData] = useState("")
  const [parsedData, setParsedData] = useState<BorrowerRow[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const sampleCsv = `full_name,email,phone,password
John Doe,john@example.com,+1-555-0123,TempPass123!
Jane Smith,jane@example.com,+1-555-0124,TempPass456!
Bob Johnson,bob@example.com,+1-555-0125,TempPass789!`

  const parseCsv = (csv: string): BorrowerRow[] => {
    const lines = csv.trim().split('\n')
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map(h => h.trim())
    const requiredHeaders = ['full_name', 'email', 'password']
    
    // Validate headers
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`)
    }

    const data: BorrowerRow[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      if (values.length !== headers.length) continue

      const row: any = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })

      // Validate required fields
      if (!row.full_name || !row.email || !row.password) {
        throw new Error(`Row ${i + 1}: Missing required fields`)
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(row.email)) {
        throw new Error(`Row ${i + 1}: Invalid email format`)
      }

      data.push(row as BorrowerRow)
    }

    return data
  }

  const handleParseCsv = () => {
    setError("")
    setParsedData([])
    
    try {
      const data = parseCsv(csvData)
      setParsedData(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%"
    let password = ""
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleUpload = async () => {
    if (parsedData.length === 0) return

    setUploading(true)
    setError("")

    try {
      // Call API route to create borrowers in bulk
      const response = await fetch("/api/admin/borrowers/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrowers: parsedData
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to upload borrowers")
        return
      }

      // Show results
      const successCount = result.created
      const failedCount = result.failed
      const errors = result.errors

      let message = `Upload completed!\n\nSuccessfully created: ${successCount} borrowers`
      
      if (failedCount > 0) {
        message += `\nFailed: ${failedCount} borrowers`
        
        if (errors.length > 0) {
          message += "\n\nErrors:"
          errors.slice(0, 5).forEach((error: any) => {
            message += `\nRow ${error.row}: ${error.error}`
          })
          
          if (errors.length > 5) {
            message += `\n... and ${errors.length - 5} more errors`
          }
        }
      }

      if (result.results.length > 0) {
        message += "\n\nGenerated credentials:"
        result.results.slice(0, 3).forEach((item: any) => {
          message += `\n${item.credentials.email}: ${item.credentials.password}`
        })
        
        if (result.results.length > 3) {
          message += `\n... and ${result.results.length - 3} more accounts`
        }
      }

      alert(message)

      if (successCount > 0) {
        router.push("/admin/borrowers")
      }

    } catch (err) {
      setError("An unexpected error occurred during upload")
    } finally {
      setUploading(false)
    }
  }

  const downloadSample = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'borrowers_sample.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/borrowers"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Bulk Upload Borrowers</h1>
          <p className="text-muted-foreground">Upload multiple borrowers using CSV format</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Upload Instructions</h3>
            <ol className="text-sm text-blue-800 space-y-2">
              <li>1. Download the sample CSV template below</li>
              <li>2. Fill in your borrower data following the format</li>
              <li>3. Required columns: full_name, email, password</li>
              <li>4. Optional columns: phone</li>
              <li>5. Paste your CSV data in the text area and click "Parse CSV"</li>
              <li>6. Review the parsed data and click "Upload Borrowers"</li>
            </ol>
            
            <button
              onClick={downloadSample}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📥 Download Sample CSV
            </button>
          </div>

          {/* CSV Input */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">CSV Data</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Paste CSV Data
                </label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder={sampleCsv}
                  rows={10}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleParseCsv}
                  disabled={!csvData.trim()}
                  className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 disabled:bg-muted transition-colors"
                >
                  🔍 Parse CSV
                </button>
                
                {parsedData.length > 0 && (
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted transition-colors"
                  >
                    {uploading ? "Uploading..." : `📤 Upload ${parsedData.length} Borrowers`}
                  </button>
                )}
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Parsed Data Preview */}
          {parsedData.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Parsed Data Preview ({parsedData.length} borrowers)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left font-semibold">Full Name</th>
                      <th className="px-4 py-2 text-left font-semibold">Email</th>
                      <th className="px-4 py-2 text-left font-semibold">Phone</th>
                      <th className="px-4 py-2 text-left font-semibold">Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {parsedData.slice(0, 10).map((borrower, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{borrower.full_name}</td>
                        <td className="px-4 py-2">{borrower.email}</td>
                        <td className="px-4 py-2">{borrower.phone || "N/A"}</td>
                        <td className="px-4 py-2 font-mono">{"*".repeat(borrower.password.length)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {parsedData.length > 10 && (
                  <p className="text-muted-foreground text-center py-2">
                    ... and {parsedData.length - 10} more borrowers
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Results */}
          {results && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Upload Results</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{results.success}</p>
                  <p className="text-sm text-green-800">Successful</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">{results.failed}</p>
                  <p className="text-sm text-red-800">Failed</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-foreground mb-2">Errors:</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {results.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-800">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              {results.success > 0 && (
                <div className="mt-4">
                  <Link
                    href="/admin/borrowers"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    View All Borrowers
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">CSV Format Requirements</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-foreground">Required Columns:</h4>
                <ul className="text-muted-foreground ml-4 space-y-1">
                  <li>• full_name</li>
                  <li>• email</li>
                  <li>• password</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground">Optional Columns:</h4>
                <ul className="text-muted-foreground ml-4 space-y-1">
                  <li>• phone</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground">Notes:</h4>
                <ul className="text-muted-foreground ml-4 space-y-1">
                  <li>• Email addresses must be unique</li>
                  <li>• Passwords should be at least 8 characters</li>
                  <li>• Phone numbers are optional</li>
                  <li>• First row must contain column headers</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div>
                <h4 className="font-medium text-yellow-900 mb-1">Security Notice</h4>
                <p className="text-sm text-yellow-800">
                  Passwords will be stored securely. Share login credentials with borrowers through secure channels only.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}