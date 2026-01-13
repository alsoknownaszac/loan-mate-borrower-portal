"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Borrower {
  id: string
  email: string
  full_name: string
  phone: string
  created_at: string
  loans: { id: string; status: string; principal_amount: number }[]
}

export default function BorrowersPage() {
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        // Use API route instead of direct Supabase client
        const response = await fetch("/api/admin/borrowers/list")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch borrowers")
        }

        setBorrowers(result.borrowers || [])
      } catch (error) {
        console.error("Error fetching borrowers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowers()
  }, []) // Empty dependency array - runs once on mount

  const filteredBorrowers = borrowers.filter(borrower =>
    borrower.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    borrower.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBorrowerStats = (borrower: Borrower) => {
    const loans = borrower.loans || []
    const activeLoans = loans.filter(l => l.status === 'active').length
    const totalAmount = loans.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0)
    return { activeLoans, totalAmount, totalLoans: loans.length }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading borrowers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Borrowers</h1>
          <p className="text-muted-foreground">Manage all borrower accounts and information</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/borrowers/upload"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 font-medium transition-colors"
          >
            📤 Bulk Upload
          </Link>
          <Link
            href="/admin/borrowers/create"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
          >
            ➕ Add Borrower
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search borrowers by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredBorrowers.length} of {borrowers.length} borrowers
          </div>
        </div>
      </div>

      {/* Borrowers List */}
      {filteredBorrowers.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">👥</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {searchTerm ? "No borrowers found" : "No borrowers yet"}
          </h2>
          <p className="text-muted-foreground mb-4">
            {searchTerm 
              ? "Try adjusting your search terms" 
              : "Start by adding your first borrower to the system"
            }
          </p>
          {!searchTerm && (
            <Link
              href="/admin/borrowers/create"
              className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors"
            >
              Add First Borrower
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBorrowers.map((borrower) => {
            const stats = getBorrowerStats(borrower)
            return (
              <Link
                key={borrower.id}
                href={`/admin/borrowers/${borrower.id}`}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{borrower.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{borrower.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium text-foreground">{borrower.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Loans</p>
                        <p className="font-medium text-foreground">{stats.totalLoans}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Loans</p>
                        <p className="font-medium text-foreground">{stats.activeLoans}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium text-foreground">${stats.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:text-right">
                    <p className="text-sm text-muted-foreground mb-2">
                      Joined {new Date(borrower.created_at).toLocaleDateString()}
                    </p>
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
            )
          })}
        </div>
      )}
    </div>
  )
}