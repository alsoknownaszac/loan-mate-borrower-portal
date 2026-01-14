"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import PermissionGuard from "./permission-guard"

interface AdminMobileLayoutProps {
  children: React.ReactNode
  adminUser?: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

export function AdminMobileLayout({ children, adminUser }: AdminMobileLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [showProfileSheet, setShowProfileSheet] = useState(false)
  const [showMoreSheet, setShowMoreSheet] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/admin-auth/login")
  }

  const getRequiredPermission = (href: string): string => {
    const permissionMap: { [key: string]: string } = {
      '/admin/dashboard': 'view_borrowers',
      '/admin/borrowers': 'view_borrowers',
      '/admin/loans': 'view_loans', 
      '/admin/payments': 'view_payments',
      '/admin/documents': 'view_documents',
      '/admin/chat': 'respond_messages',
      '/admin/messages': 'respond_messages',
      '/admin/notifications': 'view_borrowers',
      '/admin/settings': 'system_settings',
    }
    return permissionMap[href] || 'view_borrowers'
  }

  const tabItems = [
    { 
      label: "Dashboard", 
      href: "/admin/dashboard", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      ),
      permission: 'view_borrowers'
    },
    { 
      label: "Borrowers", 
      href: "/admin/borrowers", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v4h2v-7.5c0-.83.67-1.5 1.5-1.5S12 9.67 12 10.5V18h2v-4h3v4h2V8.5c0-1.1-.9-2-2-2h-3c-.55 0-1.05.22-1.41.59L9.5 10.17c-.19.19-.19.49 0 .68s.49.19.68 0L13 8h1v10H4z"/>
        </svg>
      ),
      permission: 'view_borrowers'
    },
    { 
      label: "Loans", 
      href: "/admin/loans", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      permission: 'view_loans'
    },
    { 
      label: "Payments", 
      href: "/admin/payments", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
        </svg>
      ),
      permission: 'view_payments'
    },
    { 
      label: "More", 
      href: "#more", 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      ),
      activeIcon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6,10C4.9,10 4,10.9 4,12A2,2 0 0,0 6,14C7.1,14 8,13.1 8,12A2,2 0 0,0 6,10M12,10C10.9,10 10,10.9 10,12A2,2 0 0,0 12,14C13.1,14 14,13.1 14,12A2,2 0 0,0 12,10M18,10C16.9,10 16,10.9 16,12A2,2 0 0,0 18,14C19.1,14 20,13.1 20,12A2,2 0 0,0 18,10Z"/>
        </svg>
      ),
      permission: 'view_borrowers'
    },
  ]

  const isActive = (href: string) => {
    if (href === "#more") {
      return showMoreSheet
    }
    return pathname === href
  }

  const visibleTabs = tabItems.filter(item => {
    // Check if user has permission for this tab
    const hasPermission = adminUser?.role === 'admin' || 
                         adminUser?.role === 'manager' || 
                         item.permission === 'view_borrowers' ||
                         (adminUser?.role === 'support' && item.permission !== 'system_settings')
    return hasPermission
  })

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
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LoanMate Admin</h1>
            </div>
          </div>

          {/* Profile Avatar */}
          <button
            onClick={() => setShowProfileSheet(true)}
            className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md"
          >
            <span className="text-white text-sm font-semibold">
              {adminUser?.full_name?.charAt(0).toUpperCase() || adminUser?.email?.charAt(0).toUpperCase()}
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
          {visibleTabs.map((item) => {
            const active = isActive(item.href)
            return (
              <PermissionGuard
                key={item.href}
                userRole={adminUser?.role || 'support'}
                requiredPermission={item.permission}
              >
                {item.href === "#more" ? (
                  <button
                    onClick={() => setShowMoreSheet(true)}
                    className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] relative ${
                      active 
                        ? "text-indigo-600" 
                        : "text-gray-500"
                    }`}
                  >
                    <div className="relative mb-1">
                      {active ? item.activeIcon : item.icon}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    {active && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                    )}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] relative ${
                      active 
                        ? "text-indigo-600" 
                        : "text-gray-500"
                    }`}
                  >
                    <div className="relative mb-1">
                      {active ? item.activeIcon : item.icon}
                    </div>
                    <span className={`text-xs font-medium ${active ? 'text-indigo-600' : 'text-gray-500'}`}>
                      {item.label}
                    </span>
                    {active && (
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"></div>
                    )}
                  </Link>
                )}
              </PermissionGuard>
            )
          })}
        </div>
      </nav>

      {/* More Bottom Sheet */}
      {showMoreSheet && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            onClick={() => setShowMoreSheet(false)}
          />
          
          {/* Bottom Sheet */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up safe-area-bottom">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            {/* More Content */}
            <div className="px-6 pb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">More Options</h3>

              {/* Navigation Items */}
              <div className="space-y-3">
                <PermissionGuard
                  userRole={adminUser?.role || 'support'}
                  requiredPermission="view_documents"
                >
                  <Link
                    href="/admin/documents"
                    onClick={() => setShowMoreSheet(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Documents</p>
                      <p className="text-sm text-gray-600">Manage document requests</p>
                    </div>
                  </Link>
                </PermissionGuard>

                <PermissionGuard
                  userRole={adminUser?.role || 'support'}
                  requiredPermission="respond_messages"
                >
                  <Link
                    href="/admin/messages"
                    onClick={() => setShowMoreSheet(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Messages</p>
                      <p className="text-sm text-gray-600">Support messages</p>
                    </div>
                  </Link>
                </PermissionGuard>

                <Link
                  href="/admin/notifications"
                  onClick={() => setShowMoreSheet(false)}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-600">Send notifications</p>
                  </div>
                </Link>

                <PermissionGuard
                  userRole={adminUser?.role || 'support'}
                  requiredPermission="respond_messages"
                >
                  <Link
                    href="/admin/chat"
                    onClick={() => setShowMoreSheet(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Live Chat</p>
                      <p className="text-sm text-gray-600">Chat with borrowers</p>
                    </div>
                  </Link>
                </PermissionGuard>

                <PermissionGuard
                  userRole={adminUser?.role || 'support'}
                  requiredPermission="system_settings"
                >
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowMoreSheet(false)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Settings</p>
                      <p className="text-sm text-gray-600">System settings</p>
                    </div>
                  </Link>
                </PermissionGuard>
              </div>
            </div>
          </div>
        </>
      )}

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
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-2xl font-bold">
                    {adminUser?.full_name?.charAt(0).toUpperCase() || adminUser?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {adminUser?.full_name || 'Admin User'}
                  </h3>
                  <p className="text-sm text-gray-600">{adminUser?.email}</p>
                  <p className="text-xs text-indigo-600 font-medium capitalize">{adminUser?.role}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setShowProfileSheet(false)
                    setShowMoreSheet(true)
                  }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl w-full"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">More Options</p>
                    <p className="text-sm text-gray-600">Access all admin features</p>
                  </div>
                </button>
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
    </div>
  )
}