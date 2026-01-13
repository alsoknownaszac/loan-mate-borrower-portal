"use client"

import { useState, useEffect } from "react"

export default function SetupChatPage() {
  const [setupInfo, setSetupInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)

  useEffect(() => {
    fetchSetupInfo()
  }, [])

  const fetchSetupInfo = async () => {
    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Setup Test',
          priority: 'normal'
        })
      })

      const result = await response.json()
      
      if (result.setupRequired) {
        setSetupInfo(result)
      } else {
        // Tables already exist
        setSetupInfo({ tablesExist: true })
      }
    } catch (error) {
      console.error('Error fetching setup info:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const allSQL = setupInfo?.sqlCommands ? 
    Object.values(setupInfo.sqlCommands).join('\n\n') : ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Chat System Setup</h1>
        <p className="text-muted-foreground">Set up the real-time chat database tables</p>
      </div>

      {loading ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Checking chat system status...</p>
        </div>
      ) : setupInfo?.tablesExist ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-green-900">Chat System Ready!</h2>
              <p className="text-green-700">All database tables are created and the chat system is operational.</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800">Chat sessions table</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800">Chat messages table</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-green-800">Chat participants table</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Next Steps:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Navigate to <a href="/admin/chat" className="underline hover:text-green-600">/admin/chat</a> to manage customer conversations</li>
              <li>• Test the live chat by opening the customer portal and clicking the chat button</li>
              <li>• Configure business hours and agent settings as needed</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-yellow-900">Setup Required</h2>
                <p className="text-yellow-700">The chat system database tables need to be created.</p>
              </div>
            </div>
            
            <p className="text-yellow-800 mb-4">
              Follow these steps to set up the real-time chat system:
            </p>
            
            <ol className="list-decimal list-inside text-yellow-800 space-y-2 mb-4">
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-600">Supabase Dashboard</a></li>
              <li>Navigate to the <strong>SQL Editor</strong></li>
              <li>Copy and run the SQL commands below (one section at a time)</li>
              <li>Refresh this page to verify the setup</li>
            </ol>
          </div>

          {setupInfo?.sqlCommands && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">SQL Commands</h3>
                <button
                  onClick={() => copyToClipboard(allSQL, 'all')}
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm"
                >
                  {copied === 'all' ? 'Copied!' : 'Copy All SQL'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {Object.entries(setupInfo.sqlCommands).map(([key, sql]: [string, any]) => (
                  <div key={key} className="bg-card border border-border rounded-lg">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h4 className="font-medium text-foreground capitalize">
                        {key.replace('_', ' ')}
                      </h4>
                      <button
                        onClick={() => copyToClipboard(sql, key)}
                        className="text-primary hover:text-primary/80 text-sm font-medium"
                      >
                        {copied === key ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-4">
                      <pre className="text-sm text-muted-foreground bg-muted p-3 rounded overflow-x-auto">
                        <code>{sql}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Run each SQL section separately to avoid errors</li>
              <li>• The "realtime" commands are crucial for live chat functionality</li>
              <li>• You can run all commands at once by copying "All SQL"</li>
              <li>• If you get permission errors, ensure you are using the service role key</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}