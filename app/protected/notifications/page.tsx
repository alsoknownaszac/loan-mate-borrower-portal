"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface Notification {
  id: string
  title: string
  message: string
  is_read: boolean
  notification_type: string
  created_at: string
}

export default function NotificationsPage() {
  const { user } = useUser()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("borrower_id", user.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setNotifications(data || [])
      } catch (error) {
        console.error("Error fetching notifications:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user, supabase])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error updating notification:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("borrower_id", user?.id)

      if (error) throw error

      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    } catch (error) {
      console.error("Error updating notifications:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return "💳"
      case "alert":
        return "⚠️"
      case "success":
        return "✅"
      case "info":
        return "ℹ️"
      default:
        return "🔔"
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 border border-primary rounded-lg transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">🔔</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Notifications</h2>
          <p className="text-muted-foreground">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg p-4 border transition-colors cursor-pointer ${
                notification.is_read
                  ? "bg-card border-border hover:border-primary"
                  : "bg-muted border-primary/30 hover:border-primary"
              }`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="flex items-start gap-4">
                <div className="text-2xl pt-1">{getNotificationIcon(notification.notification_type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(notification.created_at).toLocaleDateString()} at{" "}
                    {new Date(notification.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
