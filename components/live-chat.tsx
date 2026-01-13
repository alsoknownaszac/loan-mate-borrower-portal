"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@/hooks/use-chat"

interface ChatMessage {
  id: string
  sender: "user" | "agent" | "system"
  message: string
  timestamp: Date
  agentName?: string
}

interface LiveChatProps {
  isOpen: boolean
  onClose: () => void
}

export function LiveChat({ isOpen, onClose }: LiveChatProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [agentName, setAgentName] = useState("")
  const [displayMessages, setDisplayMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    loading,
    error,
    connected,
    typingUsers,
    sendMessage,
    createSession,
    handleTyping
  } = useChat(sessionId || undefined)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayMessages])

  // Convert API messages to display format
  useEffect(() => {
    const convertedMessages: ChatMessage[] = messages.map(msg => ({
      id: msg.id,
      sender: msg.sender_type === 'borrower' ? 'user' : 
              msg.sender_type === 'agent' ? 'agent' : 'system',
      message: msg.message,
      timestamp: new Date(msg.created_at),
      agentName: msg.sender_type === 'agent' ? agentName : undefined
    }))
    setDisplayMessages(convertedMessages)
  }, [messages, agentName])

  // Initialize chat session when opened
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeChat()
    }
  }, [isOpen])

  const initializeChat = async () => {
    try {
      const session = await createSession("General Support", "normal")
      setSessionId(session.id)
      
      // Set a random agent name for demo
      const agents = ["Sarah", "Mike", "Jessica", "David", "Emma"]
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]
      setAgentName(randomAgent)

      // Add welcome message after a delay
      setTimeout(() => {
        setDisplayMessages(prev => [...prev, {
          id: 'welcome',
          sender: 'agent',
          message: `Hi! I'm ${randomAgent} from LoanMate support. How can I help you today?`,
          timestamp: new Date(),
          agentName: randomAgent
        }])
      }, 2000)
    } catch (error: any) {
      console.error('Failed to initialize chat:', error)
      
      // Check if this is a setup error
      if (error.message.includes('Setup Required')) {
        setDisplayMessages([{
          id: 'setup-error',
          sender: 'system',
          message: 'Chat system setup required. Please create the database tables first. See SETUP_REALTIME_CHAT.md for instructions.',
          timestamp: new Date()
        }])
      } else {
        setDisplayMessages([{
          id: 'error',
          sender: 'system',
          message: 'Failed to connect to chat system. Please try again later.',
          timestamp: new Date()
        }])
      }
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !sessionId) return

    try {
      await sendMessage(newMessage)
      setNewMessage("")
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    } else {
      // Handle typing indicator
      handleTyping()
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
          <div>
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-xs opacity-90">
              {connected ? 
                (agentName ? `Connected with ${agentName}` : "Connected") : 
                "Connecting..."
              }
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading && displayMessages.length === 0 && (
          <div className="text-center text-gray-500 text-sm">
            <div className="animate-pulse">Connecting to support agent...</div>
          </div>
        )}

        {error && (
          <div className="text-center text-red-500 text-sm">
            <div className="bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          </div>
        )}
        
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === "user"
                  ? "bg-blue-600 text-white"
                  : message.sender === "system"
                  ? "bg-gray-100 text-gray-600 italic"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {message.sender === "agent" && message.agentName && (
                <div className="text-xs opacity-75 mb-1">{message.agentName}</div>
              )}
              <div>{message.message}</div>
              <div className={`text-xs mt-1 opacity-75`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-1">
                <span>{agentName || 'Agent'} is typing</span>
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connected ? "Type your message..." : "Please wait..."}
            disabled={!connected || !sessionId}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !connected || !sessionId}
            className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        
        {connected && (
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </div>
        )}
      </div>
    </div>
  )
}