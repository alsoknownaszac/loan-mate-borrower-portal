"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { RealtimeChannel } from "@supabase/supabase-js"

interface ChatMessage {
  id: string
  session_id: string
  sender_id: string
  sender_type: 'borrower' | 'agent' | 'system'
  message: string
  message_type: string
  created_at: string
  is_read: boolean
}

interface ChatSession {
  id: string
  borrower_id: string
  status: 'waiting' | 'active' | 'closed' | 'transferred'
  subject: string
  priority: string
  department: string
  created_at: string
  updated_at: string
  borrower?: {
    id: string
    full_name: string
    email: string
  }
  unread_count?: number
}

export function useAdminChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  // Fetch all chat sessions
  const fetchSessions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/chat/sessions')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch sessions')
      }

      setSessions(result.sessions || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch messages for a specific session
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return

    try {
      const response = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch messages')
      }

      setMessages(result.messages || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching messages:', err)
    }
  }, [])

  // Send message as admin/agent
  const sendMessage = useCallback(async (sessionId: string, message: string) => {
    if (!sessionId || !message.trim()) return

    try {
      const response = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          messageType: 'text'
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message')
      }

      // Message will be added via real-time subscription
      return result.message
    } catch (err: any) {
      setError(err.message)
      console.error('Error sending message:', err)
      throw err
    }
  }, [])

  // Select a session and load its messages
  const selectSession = useCallback((session: ChatSession) => {
    setSelectedSession(session)
    fetchMessages(session.id)
  }, [fetchMessages])

  // Set up real-time subscriptions for all sessions
  useEffect(() => {
    // Set up global real-time channel for new sessions and messages
    const channel = supabase
      .channel('admin-chat-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          // Refresh sessions when new session is created
          fetchSessions()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_sessions'
        },
        (payload) => {
          // Update session in list
          const updatedSession = payload.new as any
          setSessions(prev => 
            prev.map(session => 
              session.id === updatedSession.id 
                ? { ...session, ...updatedSession }
                : session
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          
          // If this message is for the currently selected session, add it
          if (selectedSession && newMessage.session_id === selectedSession.id) {
            setMessages(prev => {
              // Avoid duplicates
              if (prev.some(msg => msg.id === newMessage.id)) {
                return prev
              }
              return [...prev, newMessage]
            })
          }

          // Update unread count for the session
          if (newMessage.sender_type === 'borrower') {
            setSessions(prev => 
              prev.map(session => 
                session.id === newMessage.session_id
                  ? { 
                      ...session, 
                      unread_count: (session.unread_count || 0) + 1,
                      updated_at: newMessage.created_at
                    }
                  : session
              )
            )
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log('Admin connected to chat channel')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Admin failed to connect to chat channel')
          setError('Failed to connect to real-time chat')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [selectedSession, fetchSessions, supabase])

  // Initial load
  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  return {
    sessions,
    selectedSession,
    messages,
    loading,
    error,
    connected,
    fetchSessions,
    selectSession,
    sendMessage,
    fetchMessages
  }
}