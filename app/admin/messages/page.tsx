"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface Message {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  response: string | null
  responded_at: string | null
  borrower_id: string
  borrowers: {
    full_name: string
    email: string
  }
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [responseText, setResponseText] = useState("")
  const [responding, setResponding] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select(`
            *,
            borrowers (
              full_name,
              email
            )
          `)
          .order("created_at", { ascending: false })

        if (error) throw error
        setMessages(data || [])
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [supabase])

  const handleRespond = async () => {
    if (!selectedMessage || !responseText.trim()) return

    setResponding(true)
    try {
      const { error } = await supabase
        .from("messages")
        .update({
          response: responseText,
          responded_at: new Date().toISOString(),
          status: "resolved"
        })
        .eq("id", selectedMessage.id)

      if (error) throw error

      // Create notification for borrower
      await supabase
        .from("notifications")
        .insert({
          borrower_id: selectedMessage.borrower_id,
          title: "Support Response",
          message: `We've responded to your message: "${selectedMessage.subject}". Please check your support messages.`,
          notification_type: "info"
        })

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === selectedMessage.id 
          ? { 
              ...msg, 
              response: responseText, 
              responded_at: new Date().toISOString(),
              status: "resolved"
            }
          : msg
      ))

      setSelectedMessage(null)
      setResponseText("")
      alert("Response sent successfully!")
    } catch (error) {
      console.error("Error sending response:", error)
      alert("Failed to send response")
    } finally {
      setResponding(false)
    }
  }

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.borrowers?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.borrowers?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "normal":
        return "bg-blue-500 text-white"
      case "low":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Messages & Support</h1>
        <p className="text-muted-foreground">Manage borrower communications and support requests</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Messages</p>
          <p className="text-2xl font-bold text-foreground">{messages.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Open</p>
          <p className="text-2xl font-bold text-red-600">
            {messages.filter(m => m.status === 'open').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">In Progress</p>
          <p className="text-2xl font-bold text-yellow-600">
            {messages.filter(m => m.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-600">
            {messages.filter(m => m.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by borrower name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
          <div className="text-sm text-muted-foreground flex items-center">
            {filteredMessages.length} of {messages.length} messages
          </div>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">💬</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">No messages found</h2>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "No support messages have been received yet"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{message.borrowers?.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{message.borrowers?.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(message.priority)}`}>
                        {message.priority.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        {message.status.replace('_', ' ').charAt(0).toUpperCase() + message.status.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="font-medium text-foreground mb-1">{message.subject}</h4>
                    <p className="text-sm text-muted-foreground">{message.message}</p>
                  </div>

                  {message.response && (
                    <div className="bg-muted rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-foreground mb-1">Admin Response:</p>
                      <p className="text-sm text-muted-foreground">{message.response}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Responded on {new Date(message.responded_at!).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Received on {new Date(message.created_at).toLocaleDateString()} at{" "}
                    {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {message.status !== "resolved" && (
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      💬 Respond
                    </button>
                  )}
                  <Link
                    href={`/admin/borrowers/${message.borrower_id}`}
                    className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
                  >
                    👤 View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Respond to: {selectedMessage.subject}
            </h3>
            
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground mb-1">Original Message:</p>
              <p className="text-sm text-muted-foreground">{selectedMessage.message}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows={5}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleRespond}
                disabled={responding || !responseText.trim()}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted transition-colors"
              >
                {responding ? "Sending..." : "Send Response"}
              </button>
              <button
                onClick={() => {
                  setSelectedMessage(null)
                  setResponseText("")
                }}
                className="px-6 py-2 border border-border text-foreground rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}