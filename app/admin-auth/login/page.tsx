"use client"

import React, { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Debug: Check environment variables
  React.useEffect(() => {
    console.log("🔍 Environment Debug:")
    console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("ANON_KEY (first 50):", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50))
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        // Check if user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single()

        if (adminError || !adminUser) {
          setError("Access denied. Admin privileges required.")
          await supabase.auth.signOut()
          return
        }

        // Successful admin login - redirect to dashboard
        router.push("/admin/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-primary/10 rounded-lg p-3 mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">LoanMate Admin</h1>
            <p className="text-slate-600">Sign in to admin portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@loanmate.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
              <div className="text-right mt-2">
                <Link href="/auth/forgot-password" className="text-sm text-primary hover:text-primary/80">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-primary hover:bg-primary/90 disabled:bg-slate-400 text-primary-foreground font-medium rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign In to Admin Portal"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 text-sm">
              Need access?{" "}
              <Link href="/admin/request-access" className="text-primary hover:text-primary/80 font-medium">
                Request admin access
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">
                ← Back to main site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}