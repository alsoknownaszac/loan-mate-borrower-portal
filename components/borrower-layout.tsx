"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/hooks/use-user"
import { ChatButton } from "./chat-button"

interface BorrowerLayoutProps {
  children: React.ReactNode
}

export function BorrowerLayout({ children }: BorrowerLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadResponseCount, setUnreadResponseCount] = useState(0)
  const supabase = createClient()

  // Fetch unread notification count and message responses
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/borrower/notifications")
        const result = await response.json()

        if (response.ok && result.notifications) {
          const unread = result.notifications.filter((n: any) => !n.is_read).length
          setUnreadCount(unread)
        }
      } catch (error) {
        console.error("Error fetching notification count:", error)
      }
    }

    const fetchUnreadResponses = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/borrower/messages")
        const result = await response.json()

        if (response.ok && result.messages) {
          // Count messages that have responses but haven't been marked as read
          // For now, we'll consider any message with a response as having an unread response
          // In a more sophisticated system, we'd track when the borrower last viewed their messages
          const responsesCount = result.messages.filter((m: any) => 
            m.response && m.status === 'resolved'
          ).length
          setUnreadResponseCount(responsesCount)
        }
      } catch (error) {
        console.error("Error fetching message responses:", error)
      }
    }

    fetchUnreadCount()
    fetchUnreadResponses()
    
    // Listen for messages viewed event
    const handleMessagesViewed = () => {
      setUnreadResponseCount(0)
    }
    
    window.addEventListener('messagesViewed', handleMessagesViewed)
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
      fetchUnreadResponses()
    }, 30000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('messagesViewed', handleMessagesViewed)
    }
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: "🏠" },
    { label: "Loans", href: "/loans", icon: "💰" },
    { label: "Payments", href: "/payments", icon: "💳" },
    { label: "Documents", href: "/documents", icon: "📄" },
    { label: "Notifications", href: "/notifications", icon: "🔔", badge: unreadCount },
    { label: "Support", href: "/support", icon: "💬", badge: unreadResponseCount },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:w-64 md:h-screen md:border-r md:border-border md:bg-sidebar md:flex md:flex-col md:pt-6">
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
            <h1 className="text-xl font-bold text-sidebar-foreground">LoanMate</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors relative ${
                isActive(item.href)
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          <div className="px-2">
            <p className="text-xs text-sidebar-foreground/60">Logged in as</p>
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
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
            <h1 className="text-lg font-bold text-foreground">LoanMate</h1>
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
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors relative ${
                  isActive(item.href) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
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

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 px-2 transition-colors relative ${
                isActive(item.href) ? "text-primary border-t-2 border-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium truncate">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Live Chat Button */}
      <ChatButton />
    </div>
  )
}