"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import PermissionGuard from "./permission-guard"

interface AdminLayoutProps {
  children: React.ReactNode
  adminUser?: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

export default function AdminLayout({ children, adminUser }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin-auth/login")
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "📊" },
    { label: "Borrowers", href: "/admin/borrowers", icon: "👥" },
    { label: "Loans", href: "/admin/loans", icon: "💰" },
    { label: "Payments", href: "/admin/payments", icon: "💳" },
    { label: "Documents", href: "/admin/documents", icon: "📄" },
    { label: "Chat", href: "/admin/chat", icon: "💬" },
    { label: "Messages", href: "/admin/messages", icon: "✉️" },
    { label: "Notifications", href: "/admin/notifications", icon: "🔔" },
    { label: "Settings", href: "/admin/settings", icon: "⚙️" },
  ]

  const isActive = (href: string) => pathname === href

  const getRequiredPermission = (href: string): string => {
    const permissionMap: { [key: string]: string } = {
      '/admin/dashboard': 'view_borrowers', // Support users can see dashboard
      '/admin/borrowers': 'view_borrowers',
      '/admin/loans': 'view_loans', 
      '/admin/payments': 'view_payments',
      '/admin/documents': 'view_documents',
      '/admin/chat': 'respond_messages',
      '/admin/messages': 'respond_messages',
      '/admin/notifications': 'view_borrowers', // Support users can see notifications
      '/admin/settings': 'system_settings', // Only admin/manager can see settings
    }
    return permissionMap[href] || 'view_borrowers'
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:border-r md:border-border md:bg-card md:flex md:flex-col md:pt-6">
        {/* Logo */}
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-primary rounded-lg p-2">
              <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LoanMate</h1>
              <p className="text-xs text-muted-foreground">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <PermissionGuard
              key={item.href}
              userRole={adminUser?.role || 'support'}
              requiredPermission={getRequiredPermission(item.href)}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </PermissionGuard>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-4 space-y-3">
          <div className="px-2">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">
              {adminUser?.full_name || adminUser?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{adminUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 border-b border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <svg className="w-5 h-5 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">LoanMate Admin</h1>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 hover:bg-muted rounded-lg"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <nav className="border-t border-border bg-card p-4 space-y-2">
            {navItems.map((item) => (
              <PermissionGuard
                key={item.href}
                userRole={adminUser?.role || 'support'}
                requiredPermission={getRequiredPermission(item.href)}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </PermissionGuard>
            ))}
            <button
              onClick={() => {
                handleLogout()
                setIsMobileOpen(false)
              }}
              className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors text-sm font-medium mt-4"
            >
              Logout
            </button>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="md:ml-64">
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  )
}