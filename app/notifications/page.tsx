"use client"

import { useEffect, useState } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { BorrowerLayout } from "@/components/borrower-layout"
import { useUser } from "@/hooks/use-user"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const { user, loading: userLoading } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        const response = await fetch("/api/borrower/notifications")
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to fetch notifications")
        }

        setNotifications(result.notifications || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
        setError("Failed to load notifications")
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchNotifications()
    } else if (!userLoading) {
      // User is not loading and no user found
      setLoading(false)
    }
  }, [user, userLoading])

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/borrower/notifications/${notificationId}/read`, {
        method: "PATCH"
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✅"
      case "warning": return "⚠️"
      case "error": return "❌"
      case "info": return "ℹ️"
      default: return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success": return "border-green-200 bg-green-50"
      case "warning": return "border-yellow-200 bg-yellow-50"
      case "error": return "border-red-200 bg-red-50"
      case "info": return "border-blue-200 bg-blue-50"
      default: return "border-border bg-card"
    }
  }

  return (
    <ProtectedRoute>
      <BorrowerLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
            <p className="text-muted-foreground">Stay updated with important loan information</p>
          </div>

          {loading ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <span className="text-2xl mb-4 block">❌</span>
              <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Notifications</h2>
              <p className="text-red-700">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <div className="mb-4">
                <span className="text-4xl">🔔</span>
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No Notifications</h2>
              <p className="text-muted-foreground">You're all caught up! No new notifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    notification.is_read 
                      ? "border-border bg-card opacity-75" 
                      : getNotificationColor(notification.notification_type)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {notification.title}
                            {!notification.is_read && (
                              <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(notification.created_at).toLocaleDateString()} at{" "}
                            {new Date(notification.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                        {!notification.is_read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary hover:text-primary/80 font-medium whitespace-nowrap"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BorrowerLayout>
    </ProtectedRoute>
  )
}