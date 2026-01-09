"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"

interface Loan {
  id: string
  principal_amount: number
  interest_rate: number
  loan_term_months: number
  status: string
  start_date: string
  next_payment_date: string
}

export default function LoansPage() {
  const { user } = useUser()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("loans")
          .select("*")
          .eq("borrower_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setLoans(data || [])
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [user, supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-accent/20 text-accent-foreground"
      case "completed":
        return "bg-secondary/20 text-secondary-foreground"
      case "delinquent":
        return "bg-destructive/20 text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Loans</h1>
        <p className="text-muted-foreground">Manage and track all your active and past loans</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading loans...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="mb-4">
            <span className="text-4xl">💼</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Loans Yet</h2>
          <p className="text-muted-foreground">You don't have any loans. Contact us to apply for one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              href={`/protected/loans/${loan.id}`}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">Loan ID: {loan.id.substring(0, 12)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Loan Amount</p>
                      <p className="font-semibold text-foreground">${loan.principal_amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Interest Rate</p>
                      <p className="font-semibold text-foreground">{loan.interest_rate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Term</p>
                      <p className="font-semibold text-foreground">{loan.loan_term_months} months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Next Payment</p>
                      <p className="font-semibold text-foreground">
                        {new Date(loan.next_payment_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="md:text-right">
                  <p className="text-sm text-muted-foreground mb-2">Click to view details</p>
                  <svg
                    className="w-5 h-5 text-primary md:ml-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
