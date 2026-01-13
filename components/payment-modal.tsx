"use client"

import { useState } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  payment: {
    id: string
    amount: number
    due_date: string
  }
  onPaymentSubmit: (paymentData: {
    paymentId: string
    paymentMethod: string
    paymentReference?: string
    proofOfPaymentUrl?: string
  }) => Promise<void>
}

export function PaymentModal({ isOpen, onClose, payment, onPaymentSubmit }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentMethod) {
      alert("Please select a payment method")
      return
    }

    setSubmitting(true)
    
    try {
      await onPaymentSubmit({
        paymentId: payment.id,
        paymentMethod,
        paymentReference: paymentReference || undefined,
        proofOfPaymentUrl: proofOfPaymentUrl || undefined
      })
      
      // Reset form
      setPaymentMethod("")
      setPaymentReference("")
      setProofOfPaymentUrl("")
      onClose()
    } catch (error) {
      console.error("Payment submission failed:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Submit Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={submitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Due Date</span>
            <span className="text-sm text-gray-900">{formatDate(payment.due_date)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={submitting}
            >
              <option value="">Select payment method</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online_payment">Online Payment</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Reference (Optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="Transaction ID, check number, etc."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
          </div>

          {/* Proof of Payment URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proof of Payment URL (Optional)
            </label>
            <input
              type="url"
              value={proofOfPaymentUrl}
              onChange={(e) => setProofOfPaymentUrl(e.target.value)}
              placeholder="https://example.com/receipt.jpg"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload your receipt or screenshot to a file sharing service and paste the link here
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Payment Instructions</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Make your payment using your preferred method</li>
              <li>• Keep your receipt or confirmation</li>
              <li>• Submit this form with payment details</li>
              <li>• Our team will review and confirm your payment</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </div>
              ) : (
                "Submit Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}