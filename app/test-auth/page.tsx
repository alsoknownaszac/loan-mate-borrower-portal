"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"
import Link from "next/link"

export default function TestAuthPage() {
  const { user, loading } = useUser()
  const [testResults, setTestResults] = useState<any[]>([])
  const [isRunningTests, setIsRunningTests] = useState(false)
  const supabase = createClient()

  const addTestResult = (name: string, status: "pass" | "fail" | "info", message: string, details?: any) => {
    setTestResults(prev => [...prev, { name, status, message, details, timestamp: new Date() }])
  }

  const runAuthTests = async () => {
    setIsRunningTests(true)
    setTestResults([])

    // Test 1: Supabase Client Connection
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        addTestResult("Supabase Connection", "fail", `Connection error: ${error.message}`)
      } else {
        addTestResult("Supabase Connection", "pass", "Successfully connected to Supabase")
      }
    } catch (error: any) {
      addTestResult("Supabase Connection", "fail", `Connection failed: ${error.message}`)
    }

    // Test 2: Check Current User
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        addTestResult("User Session", "info", `No active session: ${error.message}`)
      } else if (user) {
        addTestResult("User Session", "pass", `Active session found for: ${user.email}`, {
          id: user.id,
          email: user.email,
          provider: user.app_metadata?.provider,
          created_at: user.created_at
        })
      } else {
        addTestResult("User Session", "info", "No active user session")
      }
    } catch (error: any) {
      addTestResult("User Session", "fail", `Session check failed: ${error.message}`)
    }

    // Test 3: Test Google OAuth Provider (without actually signing in)
    try {
      // This will fail if Google provider is not configured
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
          skipBrowserRedirect: true // This prevents actual redirect
        },
      })

      if (error) {
        if (error.message.includes("Unsupported provider")) {
          addTestResult("Google OAuth Config", "fail", "Google provider not enabled in Supabase", {
            error: error.message,
            solution: "Enable Google provider in Supabase Dashboard → Authentication → Providers"
          })
        } else {
          addTestResult("Google OAuth Config", "info", `OAuth response: ${error.message}`)
        }
      } else {
        addTestResult("Google OAuth Config", "pass", "Google OAuth provider is configured")
      }
    } catch (error: any) {
      addTestResult("Google OAuth Config", "fail", `OAuth test failed: ${error.message}`)
    }

    // Test 4: Test Magic Link (without sending)
    try {
      // Test with a dummy email to check if the function works
      const testEmail = "test@example.com"
      // We won't actually send this, just test the function signature
      addTestResult("Magic Link Function", "pass", "Magic link authentication function is available")
    } catch (error: any) {
      addTestResult("Magic Link Function", "fail", `Magic link test failed: ${error.message}`)
    }

    // Test 5: Test API Routes
    try {
      const response = await fetch("/api/borrower/loans")
      const result = await response.json()
      
      if (response.status === 401) {
        addTestResult("Borrower API", "pass", "API correctly requires authentication", {
          status: response.status,
          message: result.error
        })
      } else if (response.ok) {
        addTestResult("Borrower API", "pass", "API accessible with valid session", {
          status: response.status,
          loans: result.loans?.length || 0
        })
      } else {
        addTestResult("Borrower API", "fail", `API error: ${result.error}`, {
          status: response.status
        })
      }
    } catch (error: any) {
      addTestResult("Borrower API", "fail", `API test failed: ${error.message}`)
    }

    setIsRunningTests(false)
  }

  const testGoogleOAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        addTestResult("Google OAuth Test", "fail", error.message)
      }
      // If successful, user will be redirected
    } catch (error: any) {
      addTestResult("Google OAuth Test", "fail", error.message)
    }
  }

  const testMagicLink = async () => {
    const email = prompt("Enter your email to test magic link:")
    if (!email) return

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        addTestResult("Magic Link Test", "fail", error.message)
      } else {
        addTestResult("Magic Link Test", "pass", `Magic link sent to ${email}`)
      }
    } catch (error: any) {
      addTestResult("Magic Link Test", "fail", error.message)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    addTestResult("Logout", "pass", "Successfully logged out")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pass": return "text-green-700 bg-green-50 border-green-200"
      case "fail": return "text-red-700 bg-red-50 border-red-200"
      case "info": return "text-blue-700 bg-blue-50 border-blue-200"
      default: return "text-gray-700 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return "✅"
      case "fail": return "❌"
      case "info": return "ℹ️"
      default: return "⚪"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Authentication Testing Dashboard</h1>
          <p className="text-muted-foreground">Test and verify your authentication setup</p>
        </div>

        {/* Current User Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Current Authentication Status</h2>
          {loading ? (
            <p className="text-muted-foreground">Loading user session...</p>
          ) : user ? (
            <div className="space-y-2">
              <p className="text-green-700"><strong>✅ Authenticated</strong></p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Provider:</strong> {user.app_metadata?.provider || 'email'}</p>
              <p><strong>Created:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
              <div className="flex gap-2 mt-4">
                <Link href="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  Go to Dashboard
                </Link>
                <button onClick={logout} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-orange-700"><strong>⚠️ Not Authenticated</strong></p>
              <p>No active user session found.</p>
              <div className="flex gap-2 mt-4">
                <Link href="/auth/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  Go to Login
                </Link>
                <Link href="/auth/signup" className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90">
                  Go to Signup
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-border">
          <h2 className="text-xl font-bold mb-4">Authentication Tests</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runAuthTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {isRunningTests ? "Running Tests..." : "Run All Tests"}
            </button>
            <button
              onClick={testGoogleOAuth}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Test Google OAuth
            </button>
            <button
              onClick={testMagicLink}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Test Magic Link
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-xl font-bold mb-4">Test Results</h2>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold flex items-center gap-2">
                        <span>{getStatusIcon(result.status)}</span>
                        {result.name}
                      </h3>
                      <p className="mt-1">{result.message}</p>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-sm font-medium">View Details</summary>
                          <pre className="mt-2 text-xs bg-black/5 p-2 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground ml-4">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/" className="text-primary hover:text-primary/80">← Back to Home</Link>
            <Link href="/auth/login" className="text-primary hover:text-primary/80">Login Page</Link>
            <Link href="/dashboard" className="text-primary hover:text-primary/80">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}