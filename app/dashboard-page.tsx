"use client"

import { useEffect, useState } from "react"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"

interface Loan {
  id: string
  principal_amount: number
  interest_rate: number
  status: string
  next_payment_date: string
}

export default function DashboardPage() {
  const { user } = useUser()
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLoans = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/borrower/loans")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch loans")
        }

        setLoans(result.loans || [])
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [user])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's an overview of your loans and accounts.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
              <p className="text-3xl font-bold text-foreground">{loans.length}</p>
            </div>
            <div className="bg-primary/10 rounded-lg p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-foreground">{loans.filter((l) => l.status === "active").length}</p>
            </div>
            <div className="bg-secondary/10 rounded-lg p-3">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Next Payment Due</p>
              <p className="text-lg font-bold text-foreground">
                {loans.length > 0 && loans[0].next_payment_date
                  ? new Date(loans[0].next_payment_date).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div className="bg-accent/10 rounded-lg p-3">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Your Loans</h2>
          <Link href="/dashboard/loans" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No loans found</p>
            <p className="text-sm text-muted-foreground">Contact support to apply for a loan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                href={`/dashboard/loans/${loan.id}`}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">Loan ID: {loan.id.substring(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">Amount: ${loan.principal_amount.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      loan.status === "active"
                        ? "bg-accent/20 text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
