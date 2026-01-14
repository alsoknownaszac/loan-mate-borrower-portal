"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminResponsiveCard, AdminStatCard, AdminActionCard, AdminTableCard } from "@/components/ui/admin-responsive-card"

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

export function AdminDashboardContent() {
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-muted-foreground text-sm md:text-base">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm md:text-base">Overview of your loan portfolio and operations</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <AdminStatCard
          title="Total Borrowers"
          value={stats.totalBorrowers.toString()}
          icon="👥"
          color="indigo"
        />
        <AdminStatCard
          title="Active Loans"
          value={stats.activeLoans.toString()}
          icon="💰"
          color="green"
        />
        <AdminStatCard
          title="Pending Payments"
          value={stats.pendingPayments.toString()}
          icon="⏳"
          color="yellow"
        />
        <AdminStatCard
          title="Overdue Payments"
          value={stats.overduePayments.toString()}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <AdminResponsiveCard variant="elevated">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Total Portfolio</p>
            <p className="text-lg md:text-xl font-bold text-foreground">${stats.totalLoanAmount.toLocaleString()}</p>
          </div>
        </AdminResponsiveCard>

        <AdminResponsiveCard variant="elevated">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Collected This Month</p>
            <p className="text-lg md:text-xl font-bold text-green-600">${stats.collectedThisMonth.toLocaleString()}</p>
          </div>
        </AdminResponsiveCard>

        <AdminResponsiveCard variant="elevated">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Pending Documents</p>
            <p className="text-lg md:text-xl font-bold text-foreground">{stats.pendingDocuments}</p>
          </div>
        </AdminResponsiveCard>

        <AdminResponsiveCard variant="elevated">
          <div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">Open Support Tickets</p>
            <p className="text-lg md:text-xl font-bold text-foreground">{stats.openSupportTickets}</p>
          </div>
        </AdminResponsiveCard>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-3 md:mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <AdminActionCard
            title="Create New Loan"
            description="Set up a loan for a borrower"
            icon="💰"
            action="Create"
            onClick={() => window.location.href = '/admin/loans/create'}
            variant="admin"
          />

          <AdminActionCard
            title="View All Loans"
            description="Manage loan portfolio"
            icon="📊"
            action="View"
            onClick={() => window.location.href = '/admin/loans'}
            variant="success"
          />

          <AdminActionCard
            title="Add New Borrower"
            description="Create a new borrower account"
            icon="➕"
            action="Add"
            onClick={() => window.location.href = '/admin/borrowers/create'}
            variant="primary"
          />

          <AdminActionCard
            title="Upload Loans (CSV)"
            description="Bulk upload borrowers"
            icon="📤"
            action="Upload"
            onClick={() => window.location.href = '/admin/borrowers/upload'}
            variant="secondary"
          />

          <AdminActionCard
            title="Review Payments"
            description="Confirm pending payments"
            icon="💳"
            action="Review"
            onClick={() => window.location.href = '/admin/payments'}
            variant="warning"
            badge={stats.pendingPayments}
          />

          <AdminActionCard
            title="Review Documents"
            description="Approve pending documents"
            icon="📄"
            action="Review"
            onClick={() => window.location.href = '/admin/documents'}
            variant="warning"
            badge={stats.pendingDocuments}
          />

          <AdminActionCard
            title="Support Messages"
            description="Respond to borrower inquiries"
            icon="💬"
            action="Respond"
            onClick={() => window.location.href = '/admin/messages'}
            variant="admin"
            badge={stats.openSupportTickets}
          />

          <AdminActionCard
            title="View Overdue Loans"
            description="Review loans with overdue payments"
            icon="🚨"
            action="Review"
            onClick={() => window.location.href = '/admin/loans?status=overdue'}
            variant="danger"
            badge={stats.overduePayments}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <AdminTableCard
        title="Recent Loans"
        actions={
          <Link href="/admin/loans" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All
          </Link>
        }
      >
        {recentActivity.length === 0 ? (
          <p className="text-muted-foreground text-center py-8 text-sm md:text-base">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((loan: any) => (
              <div
                key={loan.id}
                className="flex items-center justify-between p-3 md:p-4 border border-border rounded-lg"
              >
                <div>
                  <p className="font-medium text-foreground text-sm md:text-base">
                    {loan.borrowers?.full_name || 'Unknown Borrower'}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Loan Amount: ${loan.principal_amount?.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {new Date(loan.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminTableCard>
    </div>
  )
}