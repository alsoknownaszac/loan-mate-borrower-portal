"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAlertDialog } from "@/components/ui/alert-dialog"

interface LoanDetail {
  id: string
  principal_amount: number
  interest_rate: number
  loan_term_months: number
  status: string
  start_date: string
  end_date: string
  next_payment_date: string
  remaining_balance: number
  monthly_payment: number
  payment_instructions: string
  created_at: string
  borrowers: {
    id: string
    full_name: string
    email: string
    phone: string
  }
  payments: Array<{
    id: string
    amount: number
    due_date: string
    paid_date: string | null
    status: string
    payment_reference: string | null
  }>
  documents: Array<{
    id: string
    title: string
    document_type: string
    status: string
    upload_date: string
  }>
}

interface AdminNote {
  id: string
  note: string
  created_at: string
  created_by: string
}

export default function LoanDetailPage() {
  const { showAlert } = useAlertDialog()
  const params = useParams()
  const router = useRouter()
  const [loan, setLoan] = useState<LoanDetail | null>(null)
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "payments" | "documents" | "notes">("overview")
  const [editingPaymentDate, setEditingPaymentDate] = useState<string | null>(null)
  const [newPaymentDate, setNewPaymentDate] = useState("")
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => {
    const fetchLoanDetail = async () => {
      if (!params.id) return

      try {
        // Use API route instead of direct Supabase client
        const response = await fetch(`/api/admin/loans/${params.id}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch loan details")
        }

        setLoan(result.loan)

        // Fetch admin notes from API
        const notesResponse = await fetch(`/api/admin/loans/${params.id}/notes`)
        if (notesResponse.ok) {
          const notesResult = await notesResponse.json()
          if (notesResult.success) {
            setAdminNotes(notesResult.notes || [])
          }
        }
      } catch (error) {
        console.error("Error fetching loan detail:", error)
        router.push("/admin/loans")
      } finally {
        setLoading(false)
      }
    }

    fetchLoanDetail()
  }, [params.id, router])

  const handleUpdatePaymentDate = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ due_date: newPaymentDate }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update payment date")
      }

      // Update local state
      setLoan(prev => prev ? {
        ...prev,
        payments: prev.payments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, due_date: newPaymentDate }
            : payment
        )
      } : null)

      setEditingPaymentDate(null)
      setNewPaymentDate("")
      await showAlert("Payment date updated successfully!", "Success")
    } catch (error) {
      console.error("Error updating payment date:", error)
      await showAlert("Failed to update payment date", "Error")
    }
  }

  const handleSendLoginLink = async () => {
    try {
      const response = await fetch(`/api/admin/borrowers/${loan?.borrowers.id}/notify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          type: "loan_created",
          loanId: params.id
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to send login link")
      }

      await showAlert(
        `Login link sent to ${loan?.borrowers.full_name}! They can access their loan at: ${result.loginUrl}`,
        "Success"
      )
    } catch (error) {
      console.error("Error sending login link:", error)
      await showAlert("Failed to send login link", "Error")
    }
  }

  const handleCloseLoan = async () => {
    if (!confirm("Are you sure you want to close this loan? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/loans/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: "completed",
          remaining_balance: 0
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to close loan")
      }

      // Create notification for borrower (this would need its own API route)
      // For now, just update the local state
      setLoan(prev => prev ? { ...prev, status: "completed", remaining_balance: 0 } : null)
      await showAlert("Loan closed successfully!", "Success")
    } catch (error) {
      console.error("Error closing loan:", error)
      await showAlert("Failed to close loan", "Error")
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    setAddingNote(true)
    try {
      // In a real app, you'd save this to a loan_notes table
      const note: AdminNote = {
        id: Date.now().toString(),
        note: newNote,
        created_at: new Date().toISOString(),
        created_by: "Current Admin"
      }

      setAdminNotes(prev => [note, ...prev])
      setNewNote("")
      await showAlert("Note added successfully!", "Success")
    } catch (error) {
      console.error("Error adding note:", error)
      await showAlert("Failed to add note", "Error")
    } finally {
      setAddingNote(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading loan details...</p>
        </div>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-2">Loan not found</h2>
        <Link href="/admin/loans" className="text-primary hover:text-primary/80">
          ← Back to loans
        </Link>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "delinquent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const totalPaid = loan.payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalDue = loan.payments.reduce((sum, p) => sum + p.amount, 0)
  const paymentProgress = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/loans"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Loan Details - {loan.borrowers.full_name}
          </h1>
          <p className="text-muted-foreground">Loan ID: {loan.id.substring(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          {loan.status === "active" && (
            <button
              onClick={handleCloseLoan}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏁 Close Loan
            </button>
          )}
          <button
            onClick={handleSendLoginLink}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📧 Send Login Link
          </button>
          <Link
            href={`/admin/borrowers/${loan.borrowers.id}`}
            className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            👤 View Borrower
          </Link>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Principal Amount</p>
          <p className="text-2xl font-bold text-foreground">${loan.principal_amount.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Remaining Balance</p>
          <p className="text-2xl font-bold text-foreground">${loan.remaining_balance?.toLocaleString() || loan.principal_amount.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Monthly Payment</p>
          <p className="text-2xl font-bold text-foreground">${loan.monthly_payment?.toFixed(2) || "0.00"}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Status</p>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Loan Details */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Loan Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
            <p className="font-medium text-foreground">{loan.interest_rate}% per year</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Loan Term</p>
            <p className="font-medium text-foreground">{loan.loan_term_months} months</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Start Date</p>
            <p className="font-medium text-foreground">{new Date(loan.start_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">End Date</p>
            <p className="font-medium text-foreground">{new Date(loan.end_date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Next Payment Due</p>
            <p className="font-medium text-foreground">
              {loan.next_payment_date ? new Date(loan.next_payment_date).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Payment Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all" 
                  style={{ width: `${paymentProgress}%` }}
                />
              </div>
              <span className="text-sm font-medium">{paymentProgress.toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {loan.payment_instructions && (
          <div className="mt-6">
            <p className="text-sm text-muted-foreground mb-2">Payment Instructions</p>
            <div className="bg-muted rounded-lg p-3">
              <p className="text-sm text-foreground">{loan.payment_instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Overview" },
            { key: "payments", label: `Payments (${loan.payments.length})` },
            { key: "documents", label: `Documents (${loan.documents.length})` },
            { key: "notes", label: `Admin Notes (${adminNotes.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Borrower Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                  <p className="font-medium text-foreground">{loan.borrowers.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{loan.borrowers.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Phone</p>
                  <p className="font-medium text-foreground">{loan.borrowers.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Loan Created</p>
                  <p className="font-medium text-foreground">{new Date(loan.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Payment Schedule</h3>
              <p className="text-sm text-muted-foreground">
                {loan.payments.filter(p => p.status === 'paid').length} of {loan.payments.length} payments made
              </p>
            </div>

            {loan.payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payments scheduled</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Due Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Paid Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Reference</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loan.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-2">
                          {editingPaymentDate === payment.id ? (
                            <div className="flex gap-2">
                              <input
                                type="date"
                                value={newPaymentDate}
                                onChange={(e) => setNewPaymentDate(e.target.value)}
                                className="px-2 py-1 border border-border rounded text-sm"
                              />
                              <button
                                onClick={() => handleUpdatePaymentDate(payment.id)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => setEditingPaymentDate(null)}
                                className="px-2 py-1 bg-gray-600 text-white rounded text-xs"
                              >
                                ✗
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm">{new Date(payment.due_date).toLocaleDateString()}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : "-"}
                        </td>
                        <td className="px-4 py-2 text-sm">{payment.payment_reference || "-"}</td>
                        <td className="px-4 py-2">
                          {payment.status !== 'paid' && (
                            <button
                              onClick={() => {
                                setEditingPaymentDate(payment.id)
                                setNewPaymentDate(payment.due_date)
                              }}
                              className="text-primary hover:text-primary/80 text-sm"
                            >
                              📅 Edit Date
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Loan Documents</h3>
              <Link
                href={`/admin/documents/request?borrower=${loan.borrowers.id}`}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                📋 Request Document
              </Link>
            </div>

            {loan.documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No documents uploaded</p>
            ) : (
              <div className="space-y-3">
                {loan.documents.map((document) => (
                  <div key={document.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{document.title}</h4>
                        <p className="text-sm text-muted-foreground">{document.document_type}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          document.status === 'approved' ? 'bg-green-100 text-green-800' :
                          document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(document.upload_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Internal Admin Notes</h3>
              
              {/* Add Note Form */}
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note about this loan..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={addingNote || !newNote.trim()}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted transition-colors"
                  >
                    {addingNote ? "Adding..." : "Add Note"}
                  </button>
                </div>
              </div>

              {/* Notes List */}
              {adminNotes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No admin notes yet</p>
              ) : (
                <div className="space-y-3">
                  {adminNotes.map((note) => (
                    <div key={note.id} className="p-4 border border-border rounded-lg">
                      <p className="text-sm text-foreground mb-2">{note.note}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>By {note.created_by}</span>
                        <span>{new Date(note.created_at).toLocaleDateString()} at {new Date(note.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}