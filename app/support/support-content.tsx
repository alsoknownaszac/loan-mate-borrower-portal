"use client"

import { useState, useEffect } from "react"

interface FAQItem {
  question: string
  answer: string
  category: string
}

export function SupportContent() {
  const [activeTab, setActiveTab] = useState("help")
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "",
    message: "",
    priority: "normal"
  })
  const [submitting, setSubmitting] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)

  // Fetch borrower's messages
  const fetchMessages = async () => {
    setLoadingMessages(true)
    try {
      const response = await fetch('/api/borrower/messages')
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMessages(result.messages || [])
          
          // Trigger a refresh of the navigation badge by dispatching a custom event
          // This is a simple way to communicate between components
          window.dispatchEvent(new CustomEvent('messagesViewed'))
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Fetch messages when component mounts or when switching to messages tab
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages()
    }
  }, [activeTab])

  const faqItems: FAQItem[] = [
    {
      question: "How do I make a payment?",
      answer: "You can make payments through the Payments page. Click 'Pay Now' for overdue payments or 'Pay Early' for upcoming payments. Choose your payment method, provide a reference number, and upload proof of payment. Our team will review and confirm your payment.",
      category: "payments"
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept bank transfers, online payments, checks, and cash payments. When submitting a payment, please select the appropriate method and provide a reference number (like a transaction ID or check number).",
      category: "payments"
    },
    {
      question: "How long does it take for payments to be confirmed?",
      answer: "Payment confirmations typically take 1-2 business days. You'll receive a notification once your payment has been reviewed and confirmed by our team.",
      category: "payments"
    },
    {
      question: "How do I upload documents?",
      answer: "Go to the Documents page where you'll see any document requests from our team. Click 'Upload File' next to the requested document, select your file (PDF, JPG, PNG, DOC, or DOCX), and submit. Maximum file size is 10MB.",
      category: "documents"
    },
    {
      question: "What document formats are accepted?",
      answer: "We accept PDF, JPG, PNG, DOC, and DOCX files. Please ensure your documents are clear and readable. The maximum file size is 10MB per document.",
      category: "documents"
    },
    {
      question: "How can I view my loan details?",
      answer: "Visit the Loans page to see all your loans. Click on any loan to view detailed information including payment schedule, interest rate, loan term, and payment progress.",
      category: "loans"
    },
    {
      question: "Can I pay off my loan early?",
      answer: "Yes, you can make early payments at any time. Use the 'Pay Early' button on upcoming payments in the Payments page. Early payments can help reduce the total interest paid over the life of your loan.",
      category: "loans"
    },
    {
      question: "How do I update my contact information?",
      answer: "Currently, contact information updates need to be requested through our support team. Please use the contact form below or call our support line to update your details.",
      category: "account"
    },
    {
      question: "What should I do if I can't make a payment on time?",
      answer: "Contact our support team as soon as possible if you're having difficulty making a payment. We may be able to work out a payment arrangement or provide guidance on your options.",
      category: "account"
    },
    {
      question: "How do I reset my password?",
      answer: "Use the 'Forgot Password' link on the login page to reset your password. You'll receive an email with instructions to create a new password.",
      category: "account"
    }
  ]

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contactForm.subject || !contactForm.category || !contactForm.message) {
      alert("Please fill in all required fields")
      return
    }

    setSubmitting(true)
    
    try {
      const response = await fetch('/api/borrower/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: contactForm.subject,
          message: contactForm.message,
          category: contactForm.category,
          priority: contactForm.priority
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit message')
      }
      
      alert("Support request submitted successfully! We'll get back to you within 24 hours.")
      
      // Reset form
      setContactForm({
        subject: "",
        category: "",
        message: "",
        priority: "normal"
      })

      // Refresh messages list
      fetchMessages()
    } catch (error) {
      console.error("Error submitting support request:", error)
      alert("Failed to submit support request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFAQs = (category: string) => {
    return faqItems.filter(item => item.category === category)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
        <p className="text-muted-foreground">Get help with your loans, payments, and account</p>
      </div>

      {/* Support Tabs */}
      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {[
              { id: "help", label: "Help & FAQ", icon: "❓" },
              { id: "contact", label: "Contact Us", icon: "📞" },
              { id: "messages", label: "My Messages", icon: "💬" },
              { id: "resources", label: "Resources", icon: "📚" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Help & FAQ Tab */}
          {activeTab === "help" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
                
                {/* FAQ Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Payments FAQ */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span>💳</span>
                      Payments
                    </h3>
                    {filteredFAQs("payments").map((faq, index) => (
                      <div key={`payments-${index}`} className="border border-border rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === `payments-${index}` ? null : `payments-${index}`)}
                          className="w-full text-left p-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{faq.question}</span>
                            <span className="text-xs">
                              {expandedFAQ === `payments-${index}` ? "−" : "+"}
                            </span>
                          </div>
                        </button>
                        {expandedFAQ === `payments-${index}` && (
                          <div className="px-3 pb-3">
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Documents FAQ */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span>📄</span>
                      Documents
                    </h3>
                    {filteredFAQs("documents").map((faq, index) => (
                      <div key={`documents-${index}`} className="border border-border rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === `documents-${index}` ? null : `documents-${index}`)}
                          className="w-full text-left p-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{faq.question}</span>
                            <span className="text-xs">
                              {expandedFAQ === `documents-${index}` ? "−" : "+"}
                            </span>
                          </div>
                        </button>
                        {expandedFAQ === `documents-${index}` && (
                          <div className="px-3 pb-3">
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Loans & Account FAQ */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span>🏦</span>
                      Loans & Account
                    </h3>
                    {[...filteredFAQs("loans"), ...filteredFAQs("account")].map((faq, index) => (
                      <div key={`loans-account-${index}`} className="border border-border rounded-lg">
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === `loans-account-${index}` ? null : `loans-account-${index}`)}
                          className="w-full text-left p-3 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{faq.question}</span>
                            <span className="text-xs">
                              {expandedFAQ === `loans-account-${index}` ? "−" : "+"}
                            </span>
                          </div>
                        </button>
                        {expandedFAQ === `loans-account-${index}` && (
                          <div className="px-3 pb-3">
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Us Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Contact Our Support Team</h2>
                
                {/* Contact Methods */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📞</span>
                      <h3 className="font-semibold text-blue-900">Phone Support</h3>
                    </div>
                    <p className="text-sm text-blue-800 mb-1">1-800-LOANMATE</p>
                    <p className="text-xs text-blue-600">Mon-Fri: 8AM-6PM EST</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">📧</span>
                      <h3 className="font-semibold text-green-900">Email Support</h3>
                    </div>
                    <p className="text-sm text-green-800 mb-1">support@loanmate.com</p>
                    <p className="text-xs text-green-600">Response within 24 hours</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💬</span>
                      <h3 className="font-semibold text-purple-900">Live Chat</h3>
                    </div>
                    <p className="text-sm text-purple-800 mb-1">Available on website</p>
                    <p className="text-xs text-purple-600 mb-3">Mon-Fri: 9AM-5PM EST</p>
                    <button
                      onClick={() => {
                        // Check if chat button exists and trigger it
                        const chatButton = document.querySelector('[title*="Start live chat"]') as HTMLButtonElement
                        if (chatButton && !chatButton.disabled) {
                          chatButton.click()
                        } else {
                          alert('Live chat is currently unavailable. Please try during business hours (Mon-Fri 9AM-5PM EST) or use our contact form.')
                        }
                      }}
                      className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Start Live Chat
                    </button>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-foreground mb-4">Send us a message</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subject *
                        </label>
                        <input
                          type="text"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of your issue"
                          required
                          disabled={submitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          value={contactForm.category}
                          onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                          disabled={submitting}
                        >
                          <option value="">Select a category</option>
                          <option value="payments">Payment Issues</option>
                          <option value="documents">Document Upload</option>
                          <option value="loans">Loan Questions</option>
                          <option value="account">Account Access</option>
                          <option value="technical">Technical Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={contactForm.priority}
                        onChange={(e) => setContactForm({...contactForm, priority: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={submitting}
                      >
                        <option value="low">Low - General inquiry</option>
                        <option value="normal">Normal - Standard support</option>
                        <option value="high">High - Urgent issue</option>
                        <option value="urgent">Urgent - Critical account/payment issue</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message *
                      </label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        rows={5}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Please provide details about your issue or question..."
                        required
                        disabled={submitting}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Submitting...
                        </div>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* My Messages Tab */}
          {activeTab === "messages" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">My Support Messages</h2>
                <button
                  onClick={fetchMessages}
                  disabled={loadingMessages}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {loadingMessages ? "Refreshing..." : "🔄 Refresh"}
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                    <p className="text-muted-foreground">Loading your messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center">
                  <span className="text-4xl mb-4 inline-block">📭</span>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No messages yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't sent any support messages yet. Use the "Contact Us" tab to send your first message.
                  </p>
                  <button
                    onClick={() => setActiveTab("contact")}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Send a Message
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`bg-card border rounded-lg p-6 ${
                        message.response 
                          ? 'border-green-200 bg-green-50/30' 
                          : 'border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{message.subject}</h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>📅 {new Date(message.created_at).toLocaleDateString()}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.status === 'open' ? 'bg-red-100 text-red-800' :
                              message.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              message.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {message.status.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              message.priority === 'urgent' ? 'bg-red-500 text-white' :
                              message.priority === 'high' ? 'bg-orange-500 text-white' :
                              message.priority === 'normal' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {message.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Original Message */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Message:</h4>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <p className="text-sm text-blue-900">{message.message}</p>
                        </div>
                      </div>

                      {/* Admin Response */}
                      {message.response ? (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-muted-foreground">
                              Support Response:
                            </h4>
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              ✓ Responded
                            </span>
                            {message.responded_at && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(message.responded_at).toLocaleDateString()} at{" "}
                                {new Date(message.responded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            )}
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-900">{message.response}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-600">⏳</span>
                            <p className="text-sm text-yellow-800 font-medium">
                              Waiting for support response
                            </p>
                          </div>
                          <p className="text-xs text-yellow-700 mt-1">
                            We typically respond within 24 hours during business days.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground mb-4">Helpful Resources</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Quick Actions</h3>
                    <div className="space-y-2">
                      <a href="/payments" className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                        <span>💳</span>
                        <div>
                          <p className="font-medium">Make a Payment</p>
                          <p className="text-sm text-muted-foreground">Pay your loan installments</p>
                        </div>
                      </a>
                      <a href="/documents" className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                        <span>📄</span>
                        <div>
                          <p className="font-medium">Upload Documents</p>
                          <p className="text-sm text-muted-foreground">Submit required documents</p>
                        </div>
                      </a>
                      <a href="/loans" className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                        <span>🏦</span>
                        <div>
                          <p className="font-medium">View Loan Details</p>
                          <p className="text-sm text-muted-foreground">Check your loan information</p>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Guides & Tips */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">Guides & Tips</h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Payment Tips</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Set up automatic payments to avoid late fees</li>
                          <li>• Pay early to reduce total interest</li>
                          <li>• Keep payment receipts for your records</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">📋 Document Guidelines</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Ensure documents are clear and readable</li>
                          <li>• Use PDF format when possible</li>
                          <li>• Maximum file size is 10MB</li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">🔒 Account Security</h4>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Use a strong, unique password</li>
                          <li>• Log out when using shared computers</li>
                          <li>• Contact us if you notice suspicious activity</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                    <span>🚨</span>
                    Emergency Contact
                  </h3>
                  <p className="text-sm text-red-800">
                    If you're experiencing a critical issue that affects your ability to make payments or access your account, 
                    please call our emergency line at <strong>1-800-EMERGENCY</strong> (available 24/7) or email 
                    <strong> emergency@loanmate.com</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}