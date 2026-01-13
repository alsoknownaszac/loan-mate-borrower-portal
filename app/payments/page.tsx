"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { BorrowerLayout } from "@/components/borrower-layout"
import { useUser } from "@/hooks/use-user"
import { PaymentModal } from "@/components/payment-modal"

interface Payment {
  id: string
  loan_id: string
  amount: number
  due_date: string
  paid_date?: string
  status: string
  payment_method?: string
  loans: {
    id: string
    principal_amount: number
    interest_rate: number
  }
}

export default function PaymentsPage() {
  const { user, loading: userLoading } = useUser()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    payment: Payment | null
  }>({
    isOpen: false,
    payment: null
  })

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/borrower/payments")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch payments")
        }

        setPayments(result.payments || [])
      } catch (error) {
        console.error("Error fetching payments:", error)
        setError("Failed to load payments")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPayments()
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [user, userLoading])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue": return "bg-red-100 text-red-800 border-red-200"
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case "paid": return "✅"
      case "pending": return "⏳"
      case "overdue": return "⚠️"
      case "processing": return "🔄"
      default: return "💳"
    }
  }

  const handlePayment = (payment: Payment) => {
    setPaymentModal({
      isOpen: true,
      payment
    })
  }

  const handlePaymentSubmit = async (paymentData: {
    paymentId: string
    paymentMethod: string
    paymentReference?: string
    proofOfPaymentUrl?: string
  }) => {
    try {
      const response = await fetch('/api/borrower/payments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Payment submission failed')
      }

      alert(`Payment submitted successfully! ${result.message}`)
      
      // Refresh payments data
      const refreshResponse = await fetch("/api/borrower/payments")
      const refreshResult = await refreshResponse.json()
      if (refreshResponse.ok) {
        setPayments(refreshResult.payments || [])
      }
    } catch (error: any) {
      alert(`Payment submission failed: ${error.message}`)
      throw error
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false
    return new Date(dueDate) < new Date()
  }

  // Separate payments by status
  const paidPayments = payments.filter(p => p.status === 'paid')
  const upcomingPayments = payments.filter(p => p.status === 'pending' && !isOverdue(p.due_date, p.status))
  const overduePayments = payments.filter(p => p.status === 'pending' && isOverdue(p.due_date, p.status))
  const submittedPayments = payments.filter(p => p.status === 'submitted')

  // Calculate totals
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0)
  const totalSubmitted = submittedPayments.reduce((sum, p) => sum + p.amount, 0)

  return (
    <ProtectedRoute>
      <BorrowerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">View and manage your payment history</p>
          </div>

          {loading ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading payments...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <span className="text-2xl mb-4 block">❌</span>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Payments</h2>
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="text-sm text-green-600 font-medium">Total Paid</p>
                      <p className="text-xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
                      <p className="text-xs text-green-600">{paidPayments.length} payments</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📋</span>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Submitted</p>
                      <p className="text-xl font-bold text-blue-900">{formatCurrency(totalSubmitted)}</p>
                      <p className="text-xs text-blue-600">{submittedPayments.length} payments</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Upcoming</p>
                      <p className="text-xl font-bold text-yellow-900">{formatCurrency(totalUpcoming)}</p>
                      <p className="text-xs text-yellow-600">{upcomingPayments.length} payments</p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <p className="text-sm text-red-600 font-medium">Overdue</p>
                      <p className="text-xl font-bold text-red-900">{formatCurrency(totalOverdue)}</p>
                      <p className="text-xs text-red-600">{overduePayments.length} payments</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overdue Payments (if any) */}
              {overduePayments.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                    <span>⚠️</span>
                    Overdue Payments
                  </h2>
                  <div className="space-y-3">
                    {overduePayments.map((payment) => (
                      <div key={payment.id} className="bg-white border border-red-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-red-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-red-700">Due: {formatDate(payment.due_date)}</p>
                            <p className="text-xs text-red-600">Loan: {payment.loan_id.substring(0, 8)}...</p>
                          </div>
                          <button 
                            onClick={() => handlePayment(payment)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Payments (awaiting confirmation) */}
              {submittedPayments.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span>📋</span>
                    Submitted Payments (Awaiting Confirmation)
                  </h2>
                  <div className="space-y-3">
                    {submittedPayments.map((payment) => (
                      <div key={payment.id} className="bg-white border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-blue-900">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-blue-700">Due: {formatDate(payment.due_date)}</p>
                            <p className="text-xs text-blue-600">
                              Method: {payment.payment_method?.replace('_', ' ') || 'Not specified'}
                            </p>
                            {payment.payment_reference && (
                              <p className="text-xs text-blue-600">Ref: {payment.payment_reference}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                              Under Review
                            </span>
                            <p className="text-xs text-blue-600 mt-1">
                              Our team is reviewing your payment
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Upcoming Payments */}
              {upcomingPayments.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <span>⏳</span>
                    Upcoming Payments
                  </h2>
                  <div className="space-y-3">
                    {upcomingPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-muted-foreground">Due: {formatDate(payment.due_date)}</p>
                            <p className="text-xs text-muted-foreground">Loan: {payment.loan_id.substring(0, 8)}...</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                            <button 
                              onClick={() => handlePayment(payment)}
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                            >
                              Pay Early
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {upcomingPayments.length > 5 && (
                      <p className="text-sm text-muted-foreground text-center">
                        And {upcomingPayments.length - 5} more upcoming payments...
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment History */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <span>📋</span>
                  Payment History
                </h2>
                
                {payments.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-4xl mb-4 block">💳</span>
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Yet</h3>
                    <p className="text-muted-foreground">Your payment history will appear here once you make payments.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.slice(0, 10).map((payment) => (
                      <div key={payment.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getPaymentIcon(payment.status)}</span>
                            <div>
                              <p className="font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                              <p className="text-sm text-muted-foreground">
                                Due: {formatDate(payment.due_date)}
                                {payment.paid_date && (
                                  <span> • Paid: {formatDate(payment.paid_date)}</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Loan: {payment.loan_id.substring(0, 8)}...
                                {payment.payment_method && (
                                  <span> • {payment.payment_method.replace('_', ' ')}</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                            {isOverdue(payment.due_date, payment.status) && (
                              <p className="text-xs text-red-600 mt-1">
                                {Math.ceil((new Date().getTime() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24))} days overdue
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {payments.length > 10 && (
                      <div className="text-center pt-4">
                        <button className="text-primary hover:text-primary/80 text-sm font-medium">
                          View All {payments.length} Payments
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Methods */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">💡</span>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Payment Options</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Bank Transfer: Direct transfer from your bank account</li>
                      <li>• Online Payment: Pay securely through our payment portal</li>
                      <li>• Auto-Pay: Set up automatic payments to never miss a due date</li>
                      <li>• Early Payment: Pay ahead of schedule to reduce interest</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {paymentModal.payment && (
          <PaymentModal
            isOpen={paymentModal.isOpen}
            onClose={() => setPaymentModal({ isOpen: false, payment: null })}
            payment={paymentModal.payment}
            onPaymentSubmit={handlePaymentSubmit}
          />
        )}
      </BorrowerLayout>
    </ProtectedRoute>
  )
}