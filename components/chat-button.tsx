"use client"

import { useState } from "react"
import { LiveChat } from "./live-chat"

export function ChatButton() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  // Check if chat is available (business hours simulation)
  const isChatAvailable = () => {
    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    // Available Mon-Fri (1-5), 9AM-5PM EST
    const isWeekday = day >= 1 && day <= 5
    const isBusinessHours = hour >= 9 && hour < 17
    
    return isWeekday && isBusinessHours
  }

  const available = isChatAvailable()

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-40 ${
          available 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
        }`}
        disabled={!available}
        title={available ? "Start live chat" : "Chat unavailable (Mon-Fri 9AM-5PM EST)"}
      >
        <div className="flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        
        {/* Online indicator */}
        {available && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        )}
      </button>

      {/* Live Chat Component */}
      <LiveChat 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />
    </>
  )
}