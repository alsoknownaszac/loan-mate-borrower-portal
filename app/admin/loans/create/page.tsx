"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAlertDialog } from "@/components/ui/alert-dialog"

interface Borrower {
  id: string
  full_name: string
  email: string
}

interface LoanFormData {
  borrower_id: string
  principal_amount: number
  interest_rate: number
  loan_term_months: number
  start_date: string
  payment_instructions: string
}

export default function CreateLoanPage() {
  const { showAlert } = useAlertDialog()
  const [borrowers, setBorrowers] = useState<Borrower[]>([])
  const [formData, setFormData] = useState<LoanFormData>({
    borrower_id: "",
    principal_amount: 0,
    interest_rate: 0,
    loan_term_months: 12,
    start_date: new Date().toISOString().split('T')[0],
    payment_instructions: ""
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchBorrowers = async () => {
      try {
        // Use API route instead of direct Supabase client
        const response = await fetch("/api/admin/borrowers/list")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch borrowers")
        }

        // Extract just the fields we need for the dropdown
        const borrowerOptions = (result.borrowers || []).map((borrower: any) => ({
          id: borrower.id,
          full_name: borrower.full_name,
          email: borrower.email
        }))

        setBorrowers(borrowerOptions)

        // Pre-select borrower if provided in URL
        const borrowerId = searchParams.get('borrower')
        if (borrowerId) {
          setFormData(prev => ({ ...prev, borrower_id: borrowerId }))
        }
      } catch (error) {
        console.error("Error fetching borrowers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBorrowers()
  }, [searchParams]) // Keep searchParams for URL parameter handling

  const calculateMonthlyPayment = () => {
    const { principal_amount, interest_rate, loan_term_months } = formData
    if (!principal_amount || !interest_rate || !loan_term_months) return 0
    
    const monthlyRate = interest_rate / 100 / 12
    const payment = (principal_amount * monthlyRate * Math.pow(1 + monthlyRate, loan_term_months)) / 
                   (Math.pow(1 + monthlyRate, loan_term_months) - 1)
    return payment
  }

  const calculateEndDate = () => {
    if (!formData.start_date || !formData.loan_term_months) return ""
    
    const startDate = new Date(formData.start_date)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + formData.loan_term_months)
    return endDate.toISOString().split('T')[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      // Validate form
      if (!formData.borrower_id || !formData.principal_amount || !formData.interest_rate) {
        setError("Please fill in all required fields")
        return
      }

      // Call API route to create loan
      const response = await fetch("/api/admin/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          borrower_id: formData.borrower_id,
          principal_amount: formData.principal_amount,
          interest_rate: formData.interest_rate,
          loan_term_months: formData.loan_term_months,
          start_date: formData.start_date,
          payment_instructions: formData.payment_instructions,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create loan")
        return
      }

      // Show success message with login URL and email status
      const loginUrl = result.loginUrl || `${window.location.origin}/auth/login`
      const emailStatus = result.emailSent ? "✅ Email sent successfully!" : "⚠️ Email failed to send"
      const borrowerEmail = result.borrowerEmail ? ` to ${result.borrowerEmail}` : ""
      
      await showAlert(
        `Loan created successfully! ${emailStatus}${borrowerEmail}\n\nBorrower can login at: ${loginUrl}`,
        "Success"
      )
      router.push(`/admin/loans/${result.loan.id}`)

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/loans"
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Loan</h1>
          <p className="text-muted-foreground">Set up a new loan for a borrower</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Borrower Selection */}
              <div>
                <label htmlFor="borrower_id" className="block text-sm font-medium text-foreground mb-2">
                  Borrower *
                </label>
                <select
                  id="borrower_id"
                  value={formData.borrower_id}
                  onChange={(e) => setFormData({ ...formData, borrower_id: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a borrower</option>
                  {borrowers.map((borrower) => (
                    <option key={borrower.id} value={borrower.id}>
                      {borrower.full_name} ({borrower.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label htmlFor="principal_amount" className="block text-sm font-medium text-foreground mb-2">
                  Loan Amount ($) *
                </label>
                <input
                  id="principal_amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.principal_amount || ""}
                  onChange={(e) => setFormData({ ...formData, principal_amount: parseFloat(e.target.value) || 0 })}
                  placeholder="50000"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Interest Rate */}
              <div>
                <label htmlFor="interest_rate" className="block text-sm font-medium text-foreground mb-2">
                  Annual Interest Rate (%) *
                </label>
                <input
                  id="interest_rate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.interest_rate || ""}
                  onChange={(e) => setFormData({ ...formData, interest_rate: parseFloat(e.target.value) || 0 })}
                  placeholder="5.5"
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Loan Term */}
              <div>
                <label htmlFor="loan_term_months" className="block text-sm font-medium text-foreground mb-2">
                  Loan Term (Months) *
                </label>
                <select
                  id="loan_term_months"
                  value={formData.loan_term_months}
                  onChange={(e) => setFormData({ ...formData, loan_term_months: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value={6}>6 months</option>
                  <option value={12}>12 months</option>
                  <option value={18}>18 months</option>
                  <option value={24}>24 months</option>
                  <option value={36}>36 months</option>
                  <option value={48}>48 months</option>
                  <option value={60}>60 months</option>
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-foreground mb-2">
                  Start Date *
                </label>
                <input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              {/* Payment Instructions */}
              <div>
                <label htmlFor="payment_instructions" className="block text-sm font-medium text-foreground mb-2">
                  Payment Instructions
                </label>
                <textarea
                  id="payment_instructions"
                  value={formData.payment_instructions}
                  onChange={(e) => setFormData({ ...formData, payment_instructions: e.target.value })}
                  placeholder="Bank transfer details, mobile money instructions, etc."
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted font-medium transition-colors"
                >
                  {submitting ? "Creating..." : "Create Loan"}
                </button>
                <Link
                  href="/admin/loans"
                  className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Loan Summary */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Loan Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal Amount:</span>
                <span className="font-medium">${formData.principal_amount.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate:</span>
                <span className="font-medium">{formData.interest_rate}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Term:</span>
                <span className="font-medium">{formData.loan_term_months} months</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date:</span>
                <span className="font-medium">
                  {formData.start_date ? new Date(formData.start_date).toLocaleDateString() : "Not set"}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date:</span>
                <span className="font-medium">
                  {calculateEndDate() ? new Date(calculateEndDate()).toLocaleDateString() : "Not calculated"}
                </span>
              </div>
              
              <hr className="border-border" />
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-semibold text-lg">${calculateMonthlyPayment().toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interest:</span>
                <span className="font-medium">
                  ${((calculateMonthlyPayment() * formData.loan_term_months) - formData.principal_amount).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Repayment:</span>
                <span className="font-semibold">
                  ${(calculateMonthlyPayment() * formData.loan_term_months).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">ℹ️</span>
              <div>
                <h4 className="font-medium text-blue-900 mb-1">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Payment schedule will be automatically generated</li>
                  <li>• Borrower will receive a notification about the new loan</li>
                  <li>• First payment will be due one month from start date</li>
                  <li>• Borrower can view loan details in their dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}