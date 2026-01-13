"use client"

import { useEffect, useState } from "react"
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
  remaining_balance: number
  created_at: string
  borrowers: {
    id: string
    full_name: string
    email: string
  }
}

export default function AdminLoansPage() {
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        // Use API route instead of direct Supabase client
        const response = await fetch("/api/admin/loans/list")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch loans")
        }

        setLoans(result.loans || [])

        // Check for status filter in URL
        const urlParams = new URLSearchParams(window.location.search)
        const statusParam = urlParams.get('status')
        if (statusParam && statusParam !== 'all') {
          setStatusFilter(statusParam)
        }
      } catch (error) {
        console.error("Error fetching loans:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLoans()
  }, [])

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.borrowers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || loan.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "delinquent":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100 / 12
    const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                   (Math.pow(1 + monthlyRate, months) - 1)
    return payment
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading loans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Loan Management</h1>
          <p className="text-muted-foreground">Manage all loans and their details</p>
        </div>
        <Link
          href="/admin/loans/create"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
        >
          ➕ Create Loan
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by borrower name, email, or loan ID..."
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
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="delinquent">Delinquent</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
          </select>
          <div className="text-sm text-muted-foreground flex items-center">
            {filteredLoans.length} of {loans.length} loans
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Loans</p>
          <p className="text-2xl font-bold text-foreground">{loans.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Loans</p>
          <p className="text-2xl font-bold text-green-600">
            {loans.filter(l => l.status === 'active').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Portfolio</p>
          <p className="text-2xl font-bold text-foreground">
            ${loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Delinquent</p>
          <p className="text-2xl font-bold text-red-600">
            {loans.filter(l => l.status === 'delinquent').length}
          </p>
        </div>
      </div>

      {/* Loans List */}
      {filteredLoans.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">💰</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm || statusFilter !== "all" ? "No loans found" : "No loans yet"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "Start by creating your first loan"
            }
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link
              href="/admin/loans/create"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              Create First Loan
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Borrower</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Loan Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Interest Rate</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Term</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Monthly Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Next Payment</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLoans.map((loan) => {
                  const monthlyPayment = calculateMonthlyPayment(
                    loan.principal_amount,
                    loan.interest_rate,
                    loan.loan_term_months
                  )
                  
                  return (
                    <tr key={loan.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">{loan.borrowers?.full_name}</p>
                          <p className="text-sm text-muted-foreground">{loan.borrowers?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-foreground">
                        ${loan.principal_amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {loan.interest_rate}%
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {loan.loan_term_months} months
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        ${monthlyPayment.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(loan.status)}`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {loan.next_payment_date ? new Date(loan.next_payment_date).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/loans/${loan.id}`}
                          className="text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}