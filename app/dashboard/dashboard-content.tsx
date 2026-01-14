"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/use-user"
import { ResponsiveCard, ResponsiveStatCard, ResponsiveActionCard } from "@/components/ui/responsive-card"

interface DashboardStats {
  totalLoans: number
  activeLoans: number
  totalBorrowed: number
  totalPaid: number
  nextPaymentAmount: number
  nextPaymentDate: string
  overduePayments: number
  pendingDocuments: number
}

interface RecentActivity {
  id: string
  type: 'payment' | 'loan' | 'document' | 'notification'
  title: string
  description: string
  date: string
  status?: string
}

export function DashboardContent() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const [stats, setStats] = useState<DashboardStats>({
    totalLoans: 0,
    activeLoans: 0,
    totalBorrowed: 0,
    totalPaid: 0,
    nextPaymentAmount: 0,
    nextPaymentDate: '',
    overduePayments: 0,
    pendingDocuments: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Check if user exists first
      if (!user) {
        console.log("No user session found")
        setLoading(false)
        return
      }

      try {
        // Fetch loans
        const loansResponse = await fetch("/api/borrower/loans")
        const loansResult = await loansResponse.json()
        
        // Check for auth errors
        if (!loansResponse.ok && loansResponse.status === 401) {
          router.push("/auth/login")
          return
        }
        
        // Fetch payments
        const paymentsResponse = await fetch("/api/borrower/payments")
        const paymentsResult = await paymentsResponse.json()
        
        if (!paymentsResponse.ok && paymentsResponse.status === 401) {
          router.push("/auth/login")
          return
        }
        
        // Fetch documents
        const documentsResponse = await fetch("/api/borrower/documents")
        const documentsResult = await documentsResponse.json()

        if (!documentsResponse.ok && documentsResponse.status === 401) {
          router.push("/auth/login")
          return
        }

        if (loansResponse.ok && paymentsResponse.ok && documentsResponse.ok) {
          const loans = loansResult.loans || []
          const payments = paymentsResult.payments || []
          const documents = documentsResult.documents || []

          // Calculate stats
          const activeLoans = loans.filter((loan: any) => loan.status === 'active')
          const totalBorrowed = loans.reduce((sum: number, loan: any) => sum + loan.principal_amount, 0)
          const paidPayments = payments.filter((p: any) => p.status === 'paid')
          const totalPaid = paidPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
          
          // Find next payment
          const upcomingPayments = payments
            .filter((p: any) => p.status === 'pending' && new Date(p.due_date) >= new Date())
            .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          
          const overduePayments = payments.filter((p: any) => 
            p.status === 'pending' && new Date(p.due_date) < new Date()
          ).length

          const pendingDocuments = documents.filter((d: any) => d.status === 'pending').length

          setStats({
            totalLoans: loans.length,
            activeLoans: activeLoans.length,
            totalBorrowed,
            totalPaid,
            nextPaymentAmount: upcomingPayments[0]?.amount || 0,
            nextPaymentDate: upcomingPayments[0]?.due_date || '',
            overduePayments,
            pendingDocuments
          })

          // Create recent activity
          const activities: RecentActivity[] = []
          
          // Add recent payments
          payments.slice(0, 3).forEach((payment: any) => {
            activities.push({
              id: payment.id,
              type: 'payment',
              title: `Payment ${payment.status === 'paid' ? 'Completed' : 'Due'}`,
              description: `$${payment.amount.toFixed(2)} - ${new Date(payment.due_date).toLocaleDateString()}`,
              date: payment.paid_date || payment.due_date,
              status: payment.status
            })
          })

          // Add recent loans
          loans.slice(0, 2).forEach((loan: any) => {
            activities.push({
              id: loan.id,
              type: 'loan',
              title: 'Loan Active',
              description: `$${loan.principal_amount.toLocaleString()} at ${loan.interest_rate}%`,
              date: loan.start_date,
              status: loan.status
            })
          })

          // Sort by date
          activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setRecentActivity(activities.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else if (!userLoading) {
      setLoading(false)
    }
  }, [user, userLoading])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        )
      case 'loan':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ResponsiveCard variant="elevated" className="text-center py-12">
        <span className="text-4xl mb-4 block">❌</span>
        <h2 className="text-lg font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
        <p className="text-slate-600">{error}</p>
      </ResponsiveCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your loan portfolio overview</p>
      </div>

      {/* Welcome Section - Mobile Only */}
      <div className="md:hidden">
        <ResponsiveCard variant="gradient" className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Welcome back!
          </h2>
          <p className="text-slate-600 text-xs">
            Here's your loan portfolio overview
          </p>
        </ResponsiveCard>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ResponsiveStatCard
          title="Total Borrowed"
          value={formatCurrency(stats.totalBorrowed)}
          subtitle={`${stats.activeLoans} active loans`}
          icon="💰"
          color="blue"
        />
        <ResponsiveStatCard
          title="Total Paid"
          value={formatCurrency(stats.totalPaid)}
          subtitle="All time payments"
          icon="✅"
          color="green"
        />
        <ResponsiveStatCard
          title="Next Payment"
          value={stats.nextPaymentAmount > 0 ? formatCurrency(stats.nextPaymentAmount) : "None"}
          subtitle={stats.nextPaymentDate ? new Date(stats.nextPaymentDate).toLocaleDateString() : "No upcoming payments"}
          icon="📅"
          color="yellow"
        />
        <ResponsiveStatCard
          title="Overdue"
          value={stats.overduePayments.toString()}
          subtitle="Payments overdue"
          icon="⚠️"
          color="red"
        />
      </div>

      {/* Alerts Section */}
      {(stats.overduePayments > 0 || stats.pendingDocuments > 0 || stats.nextPaymentAmount > 0) && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Attention Required</h2>
          
          {stats.overduePayments > 0 && (
            <ResponsiveActionCard
              title="Overdue Payments"
              description={`You have ${stats.overduePayments} overdue payment${stats.overduePayments > 1 ? 's' : ''}`}
              icon="⚠️"
              action="Pay Now"
              onClick={() => window.location.href = '/payments'}
              variant="danger"
            />
          )}

          {stats.nextPaymentAmount > 0 && (
            <ResponsiveActionCard
              title="Next Payment Due"
              description={`${formatCurrency(stats.nextPaymentAmount)} due ${new Date(stats.nextPaymentDate).toLocaleDateString()}`}
              icon="📅"
              action="View Details"
              onClick={() => window.location.href = '/payments'}
              variant="warning"
            />
          )}

          {stats.pendingDocuments > 0 && (
            <ResponsiveActionCard
              title="Documents Needed"
              description={`${stats.pendingDocuments} document${stats.pendingDocuments > 1 ? 's' : ''} require your attention`}
              icon="📄"
              action="Upload Now"
              onClick={() => window.location.href = '/documents'}
              variant="primary"
            />
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResponsiveActionCard
            title="Make a Payment"
            description="Pay your loan installments quickly and securely"
            icon="💳"
            action="Pay Now"
            onClick={() => window.location.href = '/payments'}
            variant="primary"
          />
          <ResponsiveActionCard
            title="View Loan Details"
            description="Check your loan balance, terms, and payment history"
            icon="📊"
            action="View Loans"
            onClick={() => window.location.href = '/loans'}
            variant="secondary"
          />
          <ResponsiveActionCard
            title="Upload Documents"
            description="Submit required documents for your loan application"
            icon="📤"
            action="Upload"
            onClick={() => window.location.href = '/documents'}
            variant="success"
          />
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">Recent Activity</h2>
          <ResponsiveCard variant="elevated">
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-b-0 last:pb-0">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground text-sm">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.status && (
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      activity.status === 'paid' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </ResponsiveCard>
        </div>
      )}

      {/* Support Section */}
      <ResponsiveCard variant="glass" className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="font-semibold text-slate-900 mb-1 text-sm">Need Help?</h3>
          <p className="text-xs text-slate-600 mb-3">
            Our support team is here to assist you with any questions
          </p>
          <button
            onClick={() => window.location.href = '/support'}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </ResponsiveCard>
    </div>
  )
}