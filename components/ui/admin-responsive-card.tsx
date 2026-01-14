"use client"

import React from "react"

interface AdminResponsiveCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "gradient" | "glass" | "admin"
}

export function AdminResponsiveCard({ children, className = "", variant = "default" }: AdminResponsiveCardProps) {
  const baseClasses = "rounded-lg transition-all duration-200"
  
  const variantClasses = {
    default: "bg-card border border-border",
    elevated: "bg-card border border-border shadow-md hover:shadow-lg",
    gradient: "bg-gradient-to-br from-indigo-50 to-purple-100 border border-indigo-200",
    glass: "backdrop-blur-sm bg-white/75 border border-gray-200/50",
    admin: "bg-gradient-to-br from-slate-50 to-gray-100 border border-slate-200"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="p-3 md:p-6">
        {children}
      </div>
    </div>
  )
}

interface AdminStatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: string
  color?: "indigo" | "green" | "yellow" | "red" | "purple" | "blue"
  trend?: {
    value: string
    isPositive: boolean
  }
}

export function AdminStatCard({ title, value, subtitle, icon, color = "indigo", trend }: AdminStatCardProps) {
  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    yellow: "from-yellow-500 to-yellow-600 text-white",
    red: "from-red-500 to-red-600 text-white",
    purple: "from-purple-500 to-purple-600 text-white",
    blue: "from-blue-500 to-blue-600 text-white"
  }

  return (
    <AdminResponsiveCard variant="elevated" className={`bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm opacity-90 mb-1">{title}</p>
          <p className="text-lg md:text-2xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-75">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              <svg className={`w-3 h-3 ${trend.isPositive ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
              </svg>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-2xl md:text-3xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </AdminResponsiveCard>
  )
}

interface AdminActionCardProps {
  title: string
  description: string
  icon?: string
  action: string
  onClick: () => void
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "admin"
  badge?: number
}

export function AdminActionCard({ 
  title, 
  description, 
  icon, 
  action, 
  onClick, 
  variant = "admin",
  badge
}: AdminActionCardProps) {
  const variantClasses = {
    primary: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    secondary: "border-gray-200 bg-gray-50 hover:bg-gray-100",
    success: "border-green-200 bg-green-50 hover:bg-green-100",
    warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    danger: "border-red-200 bg-red-50 hover:bg-red-100",
    admin: "border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
  }

  const buttonClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    admin: "bg-indigo-600 hover:bg-indigo-700 text-white"
  }

  return (
    <div className={`border rounded-lg p-3 md:p-4 transition-colors cursor-pointer ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="text-lg md:text-2xl flex-shrink-0 relative">
              {icon}
              {badge && badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center font-medium shadow-lg">
                  {badge > 99 ? "99+" : badge}
                </span>
              )}
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm md:text-base mb-1">{title}</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-3">{description}</p>
          </div>
        </div>
        <button
          onClick={onClick}
          className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${buttonClasses[variant]}`}
        >
          {action}
        </button>
      </div>
    </div>
  )
}

interface AdminTableCardProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}

export function AdminTableCard({ title, children, actions }: AdminTableCardProps) {
  return (
    <AdminResponsiveCard variant="elevated">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold text-foreground">{title}</h2>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        {children}
      </div>
    </AdminResponsiveCard>
  )
}