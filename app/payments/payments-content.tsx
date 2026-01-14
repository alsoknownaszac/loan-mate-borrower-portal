"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import { PaymentCard, PaymentSummaryCard } from "@/components/ui/mobile-payment-card"
import { MobileCard } from "@/components/ui/mobile-card"
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

export function PaymentsContent() {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading your payments...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <MobileCard variant="elevated" className="text-center py-12">
        <span className="text-4xl mb-4 block">❌</span>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Payments</h2>
        <p className="text-slate-600">{error}</p>
      </MobileCard>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-lg font-bold text-slate-900 mb-2">Payments</h1>
        <p className="text-slate-600 text-xs">Manage your loan payments and history</p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-2 gap-4">
        <PaymentSummaryCard
          title="Total Paid"
          amount={totalPaid}
          count={paidPayments.length}
          color="green"
          icon="✅"
        />
        <PaymentSummaryCard
          title="Submitted"
          amount={totalSubmitted}
          count={submittedPayments.length}
          color="blue"
          icon="📋"
        />
        <PaymentSummaryCard
          title="Upcoming"
          amount={totalUpcoming}
          count={upcomingPayments.length}
          color="yellow"
          icon="⏳"
        />
        <PaymentSummaryCard
          title="Overdue"
          amount={totalOverdue}
          count={overduePayments.length}
          color="red"
          icon="⚠️"
        />
      </div>

      {/* Overdue Payments Alert */}
      {overduePayments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-red-600 text-xl">⚠️</span>
            <h2 className="text-base font-semibold text-red-900">Overdue Payments</h2>
          </div>
          <div className="space-y-3">
            {overduePayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPayClick={() => handlePayment(payment)}
                showPayButton={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Submitted Payments */}
      {submittedPayments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-xl">📋</span>
            <h2 className="text-base font-semibold text-blue-900">Under Review</h2>
          </div>
          <div className="space-y-3">
            {submittedPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Payments */}
      {upcomingPayments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-yellow-600 text-xl">⏳</span>
            <h2 className="text-base font-semibold text-slate-900">Upcoming Payments</h2>
          </div>
          <div className="space-y-3">
            {upcomingPayments.slice(0, 5).map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPayClick={() => handlePayment(payment)}
                showPayButton={true}
              />
            ))}
            {upcomingPayments.length > 5 && (
              <MobileCard className="text-center py-4">
                <p className="text-slate-600 text-sm">
                  And {upcomingPayments.length - 5} more upcoming payments...
                </p>
              </MobileCard>
            )}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xl">📋</span>
          <h2 className="text-base font-semibold text-slate-900">Payment History</h2>
        </div>
        
        {payments.length === 0 ? (
          <MobileCard variant="elevated" className="text-center py-12">
            <span className="text-4xl mb-4 block">💳</span>
            <h3 className="text-base font-semibold text-slate-900 mb-2">No Payments Yet</h3>
            <p className="text-slate-600 text-xs">Your payment history will appear here once you make payments.</p>
          </MobileCard>
        ) : (
          <div className="space-y-3">
            {payments.slice(0, 10).map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
              />
            ))}
            {payments.length > 10 && (
              <MobileCard className="text-center py-4">
                <button className="text-blue-600 hover:text-blue-700 text-xs font-medium">
                  View All {payments.length} Payments
                </button>
              </MobileCard>
            )}
          </div>
        )}
      </div>

      {/* Payment Tips */}
      <MobileCard variant="glass" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <span className="text-blue-600 text-lg">💡</span>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Payment Options</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Bank Transfer: Direct transfer from your account</li>
              <li>• Online Payment: Secure payment portal</li>
              <li>• Early Payment: Pay ahead to reduce interest</li>
              <li>• Auto-Pay: Never miss a payment</li>
            </ul>
          </div>
        </div>
      </MobileCard>

      {/* Payment Modal */}
      {paymentModal.payment && (
        <PaymentModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ isOpen: false, payment: null })}
          payment={paymentModal.payment}
          onPaymentSubmit={handlePaymentSubmit}
        />
      )}
    </div>
  )
}