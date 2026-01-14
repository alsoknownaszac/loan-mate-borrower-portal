"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { NotificationModal } from "@/components/notification-modal"
import { DeleteConfirmationModal } from "@/components/delete-confirmation-modal"

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
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [notificationSuccess, setNotificationSuccess] = useState(false)

  useEffect(() => {
    const fetchBorrowerProfile = async () => {
      if (!params.id) return

      try {
        const response = await fetch(`/api/admin/borrowers/${params.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        
        if (!result.success) {
          throw new Error(result.error || "Failed to fetch borrower")
        }

        setBorrower(result.borrower)
      } catch (error) {
        console.error("Error fetching borrower profile:", error)
        router.push("/admin/borrowers")
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowerProfile()
  }, [params.id, router])

  const handleSendNotification = async (title: string, message: string) => {
    try {
      const response = await fetch(`/api/admin/borrowers/${borrower?.id}/notify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'custom',
          title,
          message
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to send notification")
      }

      // Show success message
      setNotificationSuccess(true)
      setTimeout(() => setNotificationSuccess(false), 3000)
      
      // Refresh data
      const refreshResponse = await fetch(`/api/admin/borrowers/${params.id}`)
      if (refreshResponse.ok) {
        const refreshResult = await refreshResponse.json()
        if (refreshResult.success) {
          setBorrower(refreshResult.borrower)
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      throw error
    }
  }

  const handleDeleteBorrower = async () => {
    try {
      const response = await fetch(`/api/admin/borrowers/${borrower?.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || "Failed to delete borrower")
      }

      // Redirect to borrowers list
      router.push("/admin/borrowers")
    } catch (error) {
      console.error("Error deleting borrower:", error)
      throw error
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
      {/* Success Message */}
      {notificationSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Notification sent successfully!
        </div>
      )}

      {/* Notification Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        onSend={handleSendNotification}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteBorrower}
        title="Delete Borrower"
        message="Are you sure you want to delete this borrower? This action cannot be undone."
        itemName={borrower?.full_name}
        warningMessage="⚠️ This will permanently delete the borrower and all associated loans, payments, documents, and notifications."
      />

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
            onClick={() => setIsNotificationModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Send Notification
          </button>
          <Link
            href={`/admin/loans/create?borrower=${borrower.id}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Loan
          </Link>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
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