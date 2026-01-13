"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface BorrowerProfile {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
  loans: Array<{
    id: string
    principal_amount: number
    interest_rate: number
    status: string
    start_date: string
    remaining_balance: number
  }>
  documents: Array<{
    id: string
    title: string
    document_type: string
    status: string
    upload_date: string
  }>
  payments: Array<{
    id: string
    amount: number
    due_date: string
    status: string
    paid_date: string | null
  }>
  notifications: Array<{
    id: string
    title: string
    message: string
    created_at: string
    is_read: boolean
  }>
}

export default function BorrowerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [borrower, setBorrower] = useState<BorrowerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "loans" | "payments" | "documents" | "notifications">("overview")
  const supabase = createClient()

  useEffect(() => {
    const fetchBorrowerProfile = async () => {
      if (!params.id) return

      try {
        const { data, error } = await supabase
          .from("borrowers")
          .select(`
            *,
            loans (*),
            documents (*),
            payments (*),
            notifications (*)
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error
        setBorrower(data)
      } catch (error) {
        console.error("Error fetching borrower profile:", error)
        router.push("/admin/borrowers")
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowerProfile()
  }, [params.id, supabase, router])

  const handleSendNotification = async () => {
    const title = prompt("Notification title:")
    if (!title) return

    const message = prompt("Notification message:")
    if (!message) return

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          borrower_id: borrower?.id,
          title,
          message,
          notification_type: "info"
        })

      if (error) throw error
      alert("Notification sent successfully!")
      
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Failed to send notification")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading borrower profile...</p>
        </div>
      </div>
    )
  }

  if (!borrower) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-foreground mb-2">Borrower not found</h2>
        <Link href="/admin/borrowers" className="text-primary hover:text-primary/80">
          ← Back to borrowers
        </Link>
      </div>
    )
  }

  const totalLoanAmount = borrower.loans.reduce((sum, loan) => sum + loan.principal_amount, 0)
  const activeLoans = borrower.loans.filter(loan => loan.status === 'active').length
  const totalPayments = borrower.payments.length
  const paidPayments = borrower.payments.filter(payment => payment.status === 'paid').length

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
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">{borrower.full_name}</h1>
          <p className="text-muted-foreground">{borrower.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSendNotification}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📧 Send Notification
          </button>
          <Link
            href={`/admin/loans/create?borrower=${borrower.id}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            ➕ Create Loan
          </Link>
        </div>
      </div>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
          <p className="text-2xl font-bold text-foreground">{borrower.loans.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
          <p className="text-2xl font-bold text-green-600">{activeLoans}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-foreground">${totalLoanAmount.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Payment Rate</p>
          <p className="text-2xl font-bold text-foreground">
            {totalPayments > 0 ? Math.round((paidPayments / totalPayments) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Full Name</p>
            <p className="font-medium text-foreground">{borrower.full_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Email</p>
            <p className="font-medium text-foreground">{borrower.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Phone</p>
            <p className="font-medium text-foreground">{borrower.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Member Since</p>
            <p className="font-medium text-foreground">
              {new Date(borrower.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: "overview", label: "Overview" },
            { key: "loans", label: `Loans (${borrower.loans.length})` },
            { key: "payments", label: `Payments (${borrower.payments.length})` },
            { key: "documents", label: `Documents (${borrower.documents.length})` },
            { key: "notifications", label: `Notifications (${borrower.notifications.length})` },
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
              <h3 className="text-lg font-semibold text-foreground mb-3">Recent Activity</h3>
              <div className="space-y-3">
                {borrower.notifications.slice(0, 5).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                    <span className="text-lg">🔔</span>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "loans" && (
          <div className="space-y-4">
            {borrower.loans.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No loans found</p>
            ) : (
              borrower.loans.map((loan) => (
                <div key={loan.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      Loan ID: {loan.id.substring(0, 8)}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium">${loan.principal_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-medium">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Start Date</p>
                      <p className="font-medium">{new Date(loan.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="font-medium">${(loan.remaining_balance || loan.principal_amount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4">
            {borrower.payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No payments found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Amount</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Due Date</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {borrower.payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-4 py-2 font-medium">${payment.amount.toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(payment.due_date).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                            payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : "-"}
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
            {borrower.documents.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No documents found</p>
            ) : (
              borrower.documents.map((document) => (
                <div key={document.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{document.title}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      document.status === 'approved' ? 'bg-green-100 text-green-800' :
                      document.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium">{document.document_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uploaded</p>
                      <p className="font-medium">{new Date(document.upload_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            {borrower.notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No notifications found</p>
            ) : (
              borrower.notifications.map((notification) => (
                <div key={notification.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🔔</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-foreground">{notification.title}</h4>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}