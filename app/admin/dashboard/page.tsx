"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface DashboardStats {
  totalBorrowers: number
  activeLoans: number
  pendingPayments: number
  overduePayments: number
  pendingDocuments: number
  openSupportTickets: number
  totalLoanAmount: number
  collectedThisMonth: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBorrowers: 0,
    activeLoans: 0,
    pendingPayments: 0,
    overduePayments: 0,
    pendingDocuments: 0,
    openSupportTickets: 0,
    totalLoanAmount: 0,
    collectedThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Use API route instead of direct Supabase client
        const response = await fetch("/api/admin/dashboard/stats")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch dashboard data")
        }

        setStats(result.stats)
        setRecentActivity(result.recentActivity || [])

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your loan portfolio and operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Borrowers</p>
              <p className="text-3xl font-bold text-foreground">{stats.totalBorrowers}</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
              <p className="text-3xl font-bold text-foreground">{stats.activeLoans}</p>
            </div>
            <div className="bg-green-100 rounded-lg p-3">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
              <p className="text-3xl font-bold text-foreground">{stats.pendingPayments}</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Overdue Payments</p>
              <p className="text-3xl font-bold text-destructive">{stats.overduePayments}</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <span className="text-2xl">🚨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Portfolio</p>
          <p className="text-xl font-bold text-foreground">${stats.totalLoanAmount.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Collected This Month</p>
          <p className="text-xl font-bold text-green-600">${stats.collectedThisMonth.toLocaleString()}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending Documents</p>
          <p className="text-xl font-bold text-foreground">{stats.pendingDocuments}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Open Support Tickets</p>
          <p className="text-xl font-bold text-foreground">{stats.openSupportTickets}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/loans/create"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 rounded-lg p-3">
              <span className="text-2xl">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Create New Loan</h3>
              <p className="text-sm text-muted-foreground">Set up a loan for a borrower</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/loans"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-100 rounded-lg p-3">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View All Loans</h3>
              <p className="text-sm text-muted-foreground">Manage loan portfolio</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/borrowers/create"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 rounded-lg p-3">
              <span className="text-2xl">➕</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Add New Borrower</h3>
              <p className="text-sm text-muted-foreground">Create a new borrower account</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/borrowers/upload"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-100 rounded-lg p-3">
              <span className="text-2xl">📤</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Upload Loans (CSV)</h3>
              <p className="text-sm text-muted-foreground">Bulk upload borrowers</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/loans?status=overdue"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-red-100 rounded-lg p-3">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">View Overdue Loans</h3>
              <p className="text-sm text-muted-foreground">Review loans with overdue payments</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/payments"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-yellow-100 rounded-lg p-3">
              <span className="text-2xl">💳</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Review Payments</h3>
              <p className="text-sm text-muted-foreground">Confirm pending payments</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/documents"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-100 rounded-lg p-3">
              <span className="text-2xl">📄</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Review Documents</h3>
              <p className="text-sm text-muted-foreground">Approve pending documents</p>
            </div>
          </div>
        </Link>
        <Link
          href="/admin/messages"
          className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-indigo-100 rounded-lg p-3">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Support Messages</h3>
              <p className="text-sm text-muted-foreground">Respond to borrower inquiries</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Loans</h2>
          <Link href="/admin/loans" className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((loan: any) => (
              <div
                key={loan.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {loan.borrowers?.full_name || 'Unknown Borrower'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Loan Amount: ${loan.principal_amount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(loan.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}