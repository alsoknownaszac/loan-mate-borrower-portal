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
  agent_id?: string
  status: 'waiting' | 'active' | 'closed' | 'transferred'
  subject?: string
  priority: string
  department: string
  created_at: string
  updated_at: string
}

interface TypingUser {
  user_id: string
  user_type: string
  is_typing: boolean
}

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [session, setSession] = useState<ChatSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  
  const supabase = createClient()
  const channelRef = useRef<RealtimeChannel | null>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch messages for a session
  const fetchMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch messages')
      }

      setMessages(result.messages || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching messages:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(async (message: string, messageType: string = 'text') => {
    if (!sessionId || !message.trim()) return

    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message.trim(),
          messageType
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
  }, [sessionId])

  // Create a new chat session
  const createSession = useCallback(async (subject: string, priority: string = 'normal') => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject,
          priority
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // Check if this is a setup error
        if (result.setupRequired) {
          throw new Error(`Setup Required: ${result.message}`)
        }
        throw new Error(result.error || 'Failed to create chat session')
      }

      return result.session
    } catch (err: any) {
      setError(err.message)
      console.error('Error creating session:', err)
      throw err
    }
  }, [])

  // Update typing status
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!sessionId) return

    try {
      await fetch(`/api/chat/sessions/${sessionId}/typing`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isTyping })
      })
    } catch (err) {
      console.error('Error updating typing status:', err)
    }
  }, [sessionId])

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    updateTypingStatus(true)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Set new timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false)
    }, 3000)
  }, [updateTypingStatus])

  // Set up real-time subscriptions
  useEffect(() => {
    if (!sessionId) return

    // Fetch initial messages
    fetchMessages(sessionId)

    // Set up real-time channel
    const channel = supabase
      .channel(`chat-session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev
            }
            return [...prev, newMessage]
          })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          const updatedMessage = payload.new as ChatMessage
          setMessages(prev => 
            prev.map(msg => 
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          )
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          // Handle typing status updates
          if (payload.eventType === 'UPDATE') {
            const participant = payload.new as any
            setTypingUsers(prev => {
              const filtered = prev.filter(u => u.user_id !== participant.user_id)
              if (participant.is_typing) {
                return [...filtered, {
                  user_id: participant.user_id,
                  user_type: participant.user_type,
                  is_typing: true
                }]
              }
              return filtered
            })
          }
        }
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') {
          console.log('Connected to chat channel')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to connect to chat channel')
          setError('Failed to connect to real-time chat')
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [sessionId, fetchMessages, supabase])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      // Stop typing when component unmounts
      if (sessionId) {
        updateTypingStatus(false)
      }
    }
  }, [sessionId, updateTypingStatus])

  return {
    messages,
    session,
    loading,
    error,
    connected,
    typingUsers: typingUsers.filter(u => u.user_type !== 'borrower'), // Don't show own typing
    sendMessage,
    createSession,
    handleTyping,
    fetchMessages
  }
}