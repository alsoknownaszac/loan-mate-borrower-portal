"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useAlertDialog } from "@/components/ui/alert-dialog"

interface Payment {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: string
  payment_reference: string | null
  proof_of_payment_url: string | null
  payment_method: string | null
  confirmed_at: string | null
  created_at: string
  loans: {
    id: string
    principal_amount: number
    borrower_id: string
    borrowers: {
      full_name: string
      email: string
    }
  }
}

export default function AdminPaymentsPage() {
  const { showAlert } = useAlertDialog()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [confirmingPayment, setConfirmingPayment] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/admin/payments')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        if (result.success) {
          setPayments(result.payments || [])
        } else {
          throw new Error(result.error || 'Failed to fetch payments')
        }
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  const handleConfirmPayment = async (paymentId: string) => {
    setConfirmingPayment(paymentId)
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "paid",
          paid_date: new Date().toISOString().split('T')[0],
          confirmed_at: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to confirm payment')
      }

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status: "paid", 
              paid_date: new Date().toISOString().split('T')[0],
              confirmed_at: new Date().toISOString()
            }
          : payment
      ))

      // Create notification for borrower
      const payment = payments.find(p => p.id === paymentId)
      if (payment?.loans?.borrower_id) {
        await supabase
          .from("notifications")
          .insert({
            borrower_id: payment.loans.borrower_id,
            title: "Payment Confirmed",
            message: `Your payment of $${payment.amount.toFixed(2)} has been confirmed. Thank you!`,
            notification_type: "success"
          })
      }

      await showAlert("Payment confirmed successfully!", "Success")
    } catch (error) {
      console.error("Error confirming payment:", error)
      await showAlert("Failed to confirm payment", "Error")
    } finally {
      setConfirmingPayment(null)
    }
  }

  const handleRejectPayment = async (paymentId: string) => {
    const reason = prompt("Please provide a reason for rejecting this payment:")
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "pending"
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject payment')
      }

      // Update local state
      setPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, status: "pending" }
          : payment
      ))

      // Create notification for borrower
      const payment = payments.find(p => p.id === paymentId)
      if (payment?.loans?.borrower_id) {
        await supabase
          .from("notifications")
          .insert({
            borrower_id: payment.loans.borrower_id,
            title: "Payment Rejected",
            message: `Your payment submission has been rejected. Reason: ${reason}. Please resubmit your payment.`,
            notification_type: "alert"
          })
      }

      await showAlert("Payment rejected and borrower notified", "Success")
    } catch (error) {
      console.error("Error rejecting payment:", error)
      await showAlert("Failed to reject payment", "Error")
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.loans?.borrowers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.loans?.borrowers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.payment_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "✅"
      case "pending":
        return "⏳"
      case "overdue":
        return "🚨"
      case "submitted":
        return "📋"
      default:
        return "❓"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment Management</h1>
        <p className="text-muted-foreground">Review and confirm borrower payments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Awaiting Confirmation</p>
          <p className="text-2xl font-bold text-blue-600">
            {payments.filter(p => p.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            {payments.filter(p => p.status === 'overdue').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">This Month Collected</p>
          <p className="text-2xl font-bold text-green-600">
            ${payments
              .filter(p => p.status === 'paid' && new Date(p.paid_date || '').getMonth() === new Date().getMonth())
              .reduce((sum, p) => sum + p.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by borrower name, email, or payment reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="submitted">Awaiting Confirmation</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
          <div className="text-sm text-muted-foreground flex items-center">
            {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments List */}
      {filteredPayments.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">💳</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">No payments found</h2>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No payments have been scheduled yet"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{getStatusIcon(payment.status)}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {payment.loans?.borrowers?.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {payment.loans?.borrowers?.email}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status.replace('_', ' ').charAt(0).toUpperCase() + payment.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">${payment.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium text-foreground">
                        {new Date(payment.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Payment Method</p>
                      <p className="font-medium text-foreground">
                        {payment.payment_method || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Reference</p>
                      <p className="font-medium text-foreground">
                        {payment.payment_reference || "N/A"}
                      </p>
                    </div>
                  </div>

                  {payment.proof_of_payment_url && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">Proof of Payment:</p>
                      <a
                        href={payment.proof_of_payment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        📎 View Attachment
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {payment.status === "submitted" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConfirmPayment(payment.id)}
                      disabled={confirmingPayment === payment.id}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                    >
                      {confirmingPayment === payment.id ? "Confirming..." : "✅ Confirm"}
                    </button>
                    <button
                      onClick={() => handleRejectPayment(payment.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {payment.status === "paid" && payment.confirmed_at && (
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Confirmed on</p>
                    <p>{new Date(payment.confirmed_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}