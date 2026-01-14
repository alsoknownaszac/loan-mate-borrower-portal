"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  title: string
  message: string
  notification_type: string
  is_read: boolean
  created_at: string
  borrowers: {
    full_name: string
    email: string
  }
}

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  notification_type: string
  is_active: boolean
}

interface SendNotificationForm {
  borrower_ids: string[]
  title: string
  message: string
  notification_type: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [borrowers, setBorrowers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"sent" | "templates" | "send">("sent")
  const [sendForm, setSendForm] = useState<SendNotificationForm>({
    borrower_ids: [],
    title: "",
    message: "",
    notification_type: "info"
  })
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sent notifications using API
        const notificationsResponse = await fetch('/api/admin/notifications')
        if (notificationsResponse.ok) {
          const notificationsResult = await notificationsResponse.json()
          if (notificationsResult.success) {
            setNotifications(notificationsResult.notifications || [])
          }
        }

        // Fetch notification templates using API
        const templatesResponse = await fetch('/api/admin/notification-templates')
        if (templatesResponse.ok) {
          const templatesResult = await templatesResponse.json()
          if (templatesResult.success) {
            setTemplates(templatesResult.templates || [])
          }
        }

        // Fetch borrowers using admin API
        const borrowersResponse = await fetch('/api/admin/borrowers/list')
        if (borrowersResponse.ok) {
          const borrowersResult = await borrowersResponse.json()
          if (borrowersResult.success) {
            setBorrowers(borrowersResult.borrowers || [])
          }
        }
      } catch (error) {
        console.error("Error fetching notifications data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSendNotification = async () => {
    if (!sendForm.title.trim() || !sendForm.message.trim() || sendForm.borrower_ids.length === 0) {
      alert("Please fill in all required fields and select at least one borrower")
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          borrower_ids: sendForm.borrower_ids,
          title: sendForm.title,
          message: sendForm.message,
          notification_type: sendForm.notification_type
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send notifications')
      }

      alert(`Notification sent to ${result.count} borrower(s) successfully!`)
      
      // Reset form
      setSendForm({
        borrower_ids: [],
        title: "",
        message: "",
        notification_type: "info"
      })

      // Refresh notifications
      window.location.reload()
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  const handleUseTemplate = (template: NotificationTemplate) => {
    setSendForm({
      ...sendForm,
      title: template.title,
      message: template.message,
      notification_type: template.notification_type
    })
    setActiveTab("send")
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✅"
      case "alert":
        return "⚠️"
      case "info":
        return "ℹ️"
      case "payment":
        return "💳"
      default:
        return "🔔"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "alert":
        return "bg-red-100 text-red-800"
      case "info":
        return "bg-blue-100 text-blue-800"
      case "payment":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Notification Management</h1>
        <p className="text-muted-foreground">Manage system notifications and send messages to borrowers</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Sent</p>
          <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-blue-600">
            {notifications.filter(n => 
              new Date(n.created_at).toDateString() === new Date().toDateString()
            ).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Templates</p>
          <p className="text-2xl font-bold text-green-600">{templates.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Templates</p>
          <p className="text-2xl font-bold text-foreground">
            {templates.filter(t => t.is_active).length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: "sent", label: `Sent Notifications (${notifications.length})` },
            { key: "templates", label: `Templates (${templates.length})` },
            { key: "send", label: "Send New" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {activeTab === "sent" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Sent Notifications</h2>
            
            {notifications.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No notifications sent yet</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border border-border rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{getNotificationIcon(notification.notification_type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground">{notification.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(notification.notification_type)}`}>
                              {notification.notification_type.charAt(0).toUpperCase() + notification.notification_type.slice(1)}
                            </span>
                            {!notification.is_read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            Sent to: {notification.borrowers?.full_name} ({notification.borrowers?.email})
                          </span>
                          <span>
                            {new Date(notification.created_at).toLocaleDateString()} at{" "}
                            {new Date(notification.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Notification Templates</h2>
            
            {templates.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No templates available</p>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{template.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.name.replace(/_/g, ' ')} • {template.notification_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-foreground">{template.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "send" && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Send New Notification</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Borrower Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Select Borrowers *
                  </label>
                  <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sendForm.borrower_ids.length === borrowers.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSendForm({ ...sendForm, borrower_ids: borrowers.map(b => b.id) })
                            } else {
                              setSendForm({ ...sendForm, borrower_ids: [] })
                            }
                          }}
                          className="rounded"
                        />
                        <span className="font-medium text-sm">Select All ({borrowers.length})</span>
                      </label>
                      <hr className="border-border" />
                      {borrowers.map((borrower) => (
                        <label key={borrower.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={sendForm.borrower_ids.includes(borrower.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSendForm({ 
                                  ...sendForm, 
                                  borrower_ids: [...sendForm.borrower_ids, borrower.id] 
                                })
                              } else {
                                setSendForm({ 
                                  ...sendForm, 
                                  borrower_ids: sendForm.borrower_ids.filter(id => id !== borrower.id) 
                                })
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{borrower.full_name} ({borrower.email})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sendForm.borrower_ids.length} borrower(s) selected
                  </p>
                </div>

                {/* Notification Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notification Type *
                  </label>
                  <select
                    value={sendForm.notification_type}
                    onChange={(e) => setSendForm({ ...sendForm, notification_type: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="alert">Alert</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={sendForm.title}
                    onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                    placeholder="Important Update"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <textarea
                    value={sendForm.message}
                    onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                    placeholder="Your message content here..."
                    rows={5}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                <button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted font-medium transition-colors"
                >
                  {sending ? "Sending..." : `Send to ${sendForm.borrower_ids.length} Borrower(s)`}
                </button>
              </div>

              {/* Preview */}
              <div className="bg-muted rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Preview</h3>
                <div className="bg-white border border-border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(sendForm.notification_type)}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">
                          {sendForm.title || "Notification Title"}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationColor(sendForm.notification_type)}`}>
                          {sendForm.notification_type.charAt(0).toUpperCase() + sendForm.notification_type.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {sendForm.message || "Your notification message will appear here..."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Just now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}