"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface Message {
  id: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export default function SupportPage() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ subject: "", message: "" })
  const supabase = createClient()

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("borrower_id", user.id)
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
  }, [user, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.subject.trim() || !formData.message.trim()) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            borrower_id: user.id,
            subject: formData.subject,
            message: formData.message,
            status: "open",
          },
        ])
        .select()

      if (error) throw error

      setMessages([data[0], ...messages])
      setFormData({ subject: "", message: "" })
      alert("Message sent successfully! We'll get back to you soon.")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-secondary/20 text-secondary-foreground"
      case "in_progress":
        return "bg-accent/20 text-accent-foreground"
      case "resolved":
        return "bg-primary/20 text-primary-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Customer Support</h1>
        <p className="text-muted-foreground">Get help with your loans and account</p>
      </div>

      {/* New Message Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Send us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Questions about payment schedule"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Tell us how we can help..."
              rows={5}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted font-medium transition-colors"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>

      {/* Messages History */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Your Messages</h2>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <span className="text-4xl mb-4 inline-block">💬</span>
            <h3 className="text-lg font-semibold text-foreground mb-2">No Messages Yet</h3>
            <p className="text-muted-foreground">Send your first message above to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-semibold text-foreground">{msg.subject}</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${getStatusColor(msg.status)}`}
                  >
                    {msg.status === "in_progress"
                      ? "In Progress"
                      : msg.status.charAt(0).toUpperCase() + msg.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{msg.message}</p>
                <p className="text-xs text-muted-foreground">Sent on {new Date(msg.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-1">How do I make a payment?</h4>
            <p className="text-sm text-muted-foreground">
              You can make payments through the Payments section. You'll see all your upcoming payments and can pay
              online.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">What documents do I need to provide?</h4>
            <p className="text-sm text-muted-foreground">
              Required documents vary based on your loan type. Check the Documents section for a list of required and
              optional files.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-foreground mb-1">How long does it take to get a response?</h4>
            <p className="text-sm text-muted-foreground">
              We typically respond to support messages within 24 business hours. You can track your message status here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
