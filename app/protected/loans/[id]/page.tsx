"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

interface Loan {
  id: string
  principal_amount: number
  interest_rate: number
  loan_term_months: number
  status: string
  start_date: string
  end_date: string
  next_payment_date: string
}

interface Payment {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: string
}

export default function LoanDetailsPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const loanId = params.id as string
  const [loan, setLoan] = useState<Loan | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !loanId) return

      try {
        const { data: loanData, error: loanError } = await supabase
          .from("loans")
          .select("*")
          .eq("id", loanId)
          .eq("borrower_id", user.id)
          .single()

        if (loanError) throw loanError
        setLoan(loanData)

        const { data: paymentData, error: paymentError } = await supabase
          .from("payments")
          .select("*")
          .eq("loan_id", loanId)
          .order("due_date", { ascending: true })

        if (paymentError) throw paymentError
        setPayments(paymentData || [])
      } catch (error) {
        console.error("Error fetching loan details:", error)
        router.push("/protected/loans")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, loanId, supabase, router])

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading loan details...</p>
      </div>
    )
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Loan not found</p>
      </div>
    )
  }

  const calculateProgress = () => {
    const paidCount = payments.filter((p) => p.status === "paid").length
    return payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 0
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-accent/20 text-accent-foreground"
      case "pending":
        return "bg-secondary/20 text-secondary-foreground"
      case "overdue":
        return "bg-destructive/20 text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/protected/loans"
        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Loans
      </Link>

      {/* Loan Header */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-6 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm opacity-90 mb-2">Loan ID: {loan.id.substring(0, 12)}</p>
            <h1 className="text-3xl font-bold mb-2">Loan Details</h1>
            <p className="text-sm opacity-90">Started on {new Date(loan.start_date).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90 mb-1">Status</p>
            <p className="text-2xl font-bold">{loan.status.toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Loan Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Loan Amount</p>
          <p className="text-2xl font-bold text-foreground">${loan.principal_amount.toFixed(2)}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Interest Rate</p>
          <p className="text-2xl font-bold text-foreground">{loan.interest_rate}%</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Term</p>
          <p className="text-2xl font-bold text-foreground">{loan.loan_term_months} months</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Progress</p>
          <p className="text-2xl font-bold text-foreground">{calculateProgress()}%</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-sm text-muted-foreground mb-4">Payment Progress</p>
        <div className="w-full bg-muted rounded-full h-2">
          <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${calculateProgress()}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {payments.filter((p) => p.status === "paid").length} of {payments.length} payments completed
        </p>
      </div>

      {/* Payment Schedule */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Payment Schedule</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground">No payments scheduled</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-foreground">Due: {new Date(payment.due_date).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">Amount: ${payment.amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  {payment.status === "paid" && payment.paid_date && (
                    <p className="text-xs text-muted-foreground mb-1">
                      Paid on {new Date(payment.paid_date).toLocaleDateString()}
                    </p>
                  )}
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}
                  >
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
