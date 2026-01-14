"use client"

import React from "react"

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "gradient" | "glass" | "elevated"
  padding?: "sm" | "md" | "lg"
}

export function MobileCard({ 
  children, 
  className = "", 
  variant = "default",
  padding = "md"
}: MobileCardProps) {
  const baseClasses = "rounded-2xl transition-all duration-200"
  
  const variantClasses = {
    default: "bg-white border border-slate-200 shadow-sm",
    gradient: "bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-md",
    glass: "bg-white/80 backdrop-blur-md border border-white/20 shadow-lg",
    elevated: "bg-white border border-slate-200 shadow-lg hover:shadow-xl"
  }
  
  const paddingClasses = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo"
  onClick?: () => void
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  color = "blue",
  onClick 
}: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    yellow: "from-yellow-500 to-yellow-600 text-white",
    red: "from-red-500 to-red-600 text-white",
    purple: "from-purple-500 to-purple-600 text-white",
    indigo: "from-indigo-500 to-indigo-600 text-white"
  }

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-white/80 text-xs font-medium mb-1">{title}</p>
          <p className="text-xl font-bold text-white mb-1">{value}</p>
          {subtitle && (
            <p className="text-white/70 text-xs">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <svg 
                className={`w-3 h-3 ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={trend.isPositive ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"} 
                />
              </svg>
              <span className="text-white/80 text-xs font-medium">
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-white/80 text-xl">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

interface ActionCardProps {
  title: string
  description: string
  icon: React.ReactNode
  action: string
  onClick: () => void
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
  disabled?: boolean
}

export function ActionCard({ 
  title, 
  description, 
  icon, 
  action, 
  onClick, 
  variant = "primary",
  disabled = false 
}: ActionCardProps) {
  const variantClasses = {
    primary: "border-blue-200 hover:border-blue-300 hover:bg-blue-50",
    secondary: "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    success: "border-green-200 hover:border-green-300 hover:bg-green-50",
    warning: "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50",
    danger: "border-red-200 hover:border-red-300 hover:bg-red-50"
  }

  const iconColors = {
    primary: "text-blue-600",
    secondary: "text-slate-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600"
  }

  const buttonColors = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  }

  return (
    <MobileCard 
      variant="elevated" 
      className={`${variantClasses[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-4">
        <div className={`text-2xl ${iconColors[variant]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1 text-sm">{title}</h3>
          <p className="text-xs text-slate-600 mb-3">{description}</p>
          <button
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${buttonColors[variant]} ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            {action}
          </button>
        </div>
      </div>
    </MobileCard>
  )
}