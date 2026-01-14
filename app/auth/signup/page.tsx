"use client"

import { useState } from "react"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-primary rounded-lg p-3">
              <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground">LoanMate</h1>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Borrower Account</h2>
          <p className="text-muted-foreground">Access your loan dashboard</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Account Created by Your Loan Provider</h3>
            <p className="text-muted-foreground mb-6">
              Borrower accounts are created by your loan provider. If you've been approved for a loan, you should have received an email with your login credentials.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">📧 Check Your Email</h4>
            <p className="text-sm text-blue-800">
              Your loan provider will send you a welcome email containing:
            </p>
            <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
              <li>Your login email address</li>
              <li>Your temporary password</li>
              <li>Instructions to access your portal</li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/login"
              className="block w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition-colors text-center"
            >
              Go to Login
            </Link>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Haven't received your credentials?
              </p>
              <p className="text-sm text-muted-foreground">
                Please contact your loan provider for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}