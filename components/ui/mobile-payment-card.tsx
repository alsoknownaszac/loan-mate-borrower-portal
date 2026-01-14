"use client"

import React from "react"
import { MobileCard } from "./mobile-card"

interface PaymentCardProps {
  payment: {
    id: string
    amount: number
    due_date: string
    paid_date?: string
    status: string
    payment_method?: string
    loan_id: string
  }
  onPayClick?: () => void
  showPayButton?: boolean
}

export function PaymentCard({ payment, onPayClick, showPayButton = false }: PaymentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-200"
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "overdue": return "bg-red-100 text-red-800 border-red-200"
      case "submitted": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-slate-100 text-slate-800 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case "pending":
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case "overdue":
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        )
      case "submitted":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
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

  const isOverdue = new Date(payment.due_date) < new Date() && payment.status === 'pending'
  const daysDiff = Math.ceil((new Date(payment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <MobileCard 
      variant="elevated" 
      className={`${isOverdue ? 'border-red-200 bg-red-50' : ''} hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
            {getStatusIcon(payment.status)}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900 text-sm">{formatCurrency(payment.amount)}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-medium border ${getStatusColor(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-slate-600">
                <span className="font-medium">Due:</span> {formatDate(payment.due_date)}
                {daysDiff > 0 && payment.status === 'pending' && (
                  <span className="text-green-600 ml-2">({daysDiff} days left)</span>
                )}
                {isOverdue && (
                  <span className="text-red-600 ml-2">({Math.abs(daysDiff)} days overdue)</span>
                )}
              </p>
              
              {payment.paid_date && (
                <p className="text-xs text-slate-600">
                  <span className="font-medium">Paid:</span> {formatDate(payment.paid_date)}
                </p>
              )}
              
              <p className="text-xs text-slate-500">
                Loan: {payment.loan_id.substring(0, 8)}...
              </p>
              
              {payment.payment_method && (
                <p className="text-xs text-slate-500">
                  Method: {payment.payment_method.replace('_', ' ')}
                </p>
              )}
            </div>

            {showPayButton && (payment.status === 'pending' || isOverdue) && (
              <button
                onClick={onPayClick}
                className={`mt-3 w-full py-2 px-4 rounded-xl text-xs font-medium transition-colors ${
                  isOverdue 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isOverdue ? 'Pay Overdue' : 'Pay Now'}
              </button>
            )}

            {payment.status === 'submitted' && (
              <div className="mt-3 p-2 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-800 font-medium">
                  ✓ Payment submitted - Under review by our team
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileCard>
  )
}

interface PaymentSummaryCardProps {
  title: string
  amount: number
  count: number
  color: "green" | "blue" | "yellow" | "red"
  icon: React.ReactNode
}

export function PaymentSummaryCard({ title, amount, count, color, icon }: PaymentSummaryCardProps) {
  const colorClasses = {
    green: "from-green-500 to-green-600",
    blue: "from-blue-500 to-blue-600", 
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} text-white rounded-2xl p-4 shadow-lg`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-xs font-medium mb-1">{title}</p>
          <p className="text-xl font-bold text-white mb-1">{formatCurrency(amount)}</p>
          <p className="text-white/70 text-xs">{count} payment{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="text-white/80 text-xl">
          {icon}
        </div>
      </div>
    </div>
  )
}