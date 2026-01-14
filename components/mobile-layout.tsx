"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { useUser } from "@/hooks/use-user"
import { ChatButton } from "./chat-button"

interface MobileAppLayoutProps {
  children: React.ReactNode
}

export function MobileLayout({ children }: MobileAppLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadResponseCount, setUnreadResponseCount] = useState(0)
  const [showProfileSheet, setShowProfileSheet] = useState(false)
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
    
    const handleMessagesViewed = () => {
      setUnreadResponseCount(0)
    }
    
    window.addEventListener('messagesViewed', handleMessagesViewed)
    
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

  const tabItems = [
    { 
      label: "Home", 
      href: "/dashboard", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      )
    },
    { 
      label: "Loans", 
      href: "/loans", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      )
    },
    { 
      label: "Payments", 
      href: "/payments", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      )
    },
    { 
      label: "Documents", 
      href: "/documents", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      )
    },
    { 
      label: "More", 
      href: "/support", 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6,10C4.9,10 4,10.9 4,12A2,2 0 0,0 6,14C7.1,14 8,13.1 8,12A2,2 0 0,0 6,10M12,10C10.9,10 10,10.9 10,12A2,2 0 0,0 12,14C13.1,14 14,13.1 14,12A2,2 0 0,0 12,10M18,10C16.9,10 16,10.9 16,12A2,2 0 0,0 18,14C19.1,14 20,13.1 20,12A2,2 0 0,0 18,10Z"/>
        </svg>
      ),
      badge: unreadResponseCount + unreadCount
    },
  ]

  const isActive = (href: string) => {
    if (href === "/support") {
      return pathname === "/support" || pathname === "/notifications"
    }
    return pathname === href
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-area-top safe-area-bottom">
      {/* Status Bar Simulation */}
      <div className="h-6 bg-black flex items-center justify-between px-4 text-white text-xs font-medium">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
          <svg className="w-4 h-4 ml-1" fill="white" viewBox="0 0 24 24">
            <path d="M2 17h20v2H2zm1.15-4.05L4 11.47l.85 1.48L3 12.95zM6.5 13l1.5-2.6L9.5 13H11l-2.5-4.33L11 4H9.5L8 6.6 6.5 4H5l2.5 4.33L5 13h1.5zm8.5 0c.83 0 1.5-.67 1.5-1.5S15.83 10 15 10s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm4 0c.83 0 1.5-.67 1.5-1.5S19.83 10 19 10s-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
          </svg>
          <div className="w-6 h-3 border border-white rounded-sm">
            <div className="w-4 h-1.5 bg-white rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* App Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LoanMate</h1>
            </div>
          </div>

          {/* Profile Avatar */}
          <button
            onClick={() => setShowProfileSheet(true)}
            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md"
          >
            <span className="text-white text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>
      </header>

      {/* Main Content with Safe Area */}
      <main className="pb-20 min-h-screen">
        <div className="px-4 py-4">{children}</div>
      </main>

      {/* Bottom Tab Bar - Native App Style */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center py-2">
          {tabItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] relative ${
                  active 
                    ? "text-blue-600" 
                    : "text-gray-500"
                }`}
              >
                <div className="relative mb-1">
                  {active ? item.activeIcon : item.icon}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-medium shadow-lg">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
                {active && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Profile Bottom Sheet */}
      {showProfileSheet && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setShowProfileSheet(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up safe-area-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* Profile Content */}
            <div className="px-6 pb-6">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Welcome back!</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <Link
                  href="/notifications"
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-600">View all notifications</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link
                  href="/support"
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Support</p>
                    <p className="text-sm text-gray-600">Get help and support</p>
                  </div>
                  {unreadResponseCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {unreadResponseCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout()
                  setShowProfileSheet(false)
                }}
                className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Live Chat Button - Positioned for mobile */}
      <div className="fixed bottom-24 right-4 z-30">
        <ChatButton />
      </div>
    </div>
  )
}