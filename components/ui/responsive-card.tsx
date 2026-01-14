"use client"

import React from "react"

interface ResponsiveCardProps {
  children: React.ReactNode
  className?: string
  variant?: "default" | "elevated" | "gradient" | "glass"
}

export function ResponsiveCard({ children, className = "", variant = "default" }: ResponsiveCardProps) {
  const baseClasses = "rounded-lg transition-all duration-200"
  
  const variantClasses = {
    default: "bg-card border border-border",
    elevated: "bg-card border border-border shadow-md hover:shadow-lg",
    gradient: "bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200",
    glass: "backdrop-blur-sm bg-white/75 border border-gray-200/50"
  }

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  )
}

interface ResponsiveStatCardProps {
  title: string
  value: string
  subtitle?: string
  icon?: string
  color?: "blue" | "green" | "yellow" | "red" | "purple"
}

export function ResponsiveStatCard({ title, value, subtitle, icon, color = "blue" }: ResponsiveStatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600 text-white",
    green: "from-green-500 to-green-600 text-white",
    yellow: "from-yellow-500 to-yellow-600 text-white",
    red: "from-red-500 to-red-600 text-white",
    purple: "from-purple-500 to-purple-600 text-white"
  }

  return (
    <ResponsiveCard variant="elevated" className={`bg-gradient-to-br ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm opacity-90 mb-1">{title}</p>
          <p className="text-lg md:text-2xl font-bold mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs opacity-75">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="text-2xl md:text-3xl opacity-80">
            {icon}
          </div>
        )}
      </div>
    </ResponsiveCard>
  )
}

interface ResponsiveActionCardProps {
  title: string
  description: string
  icon?: string
  action: string
  onClick: () => void
  variant?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export function ResponsiveActionCard({ 
  title, 
  description, 
  icon, 
  action, 
  onClick, 
  variant = "primary" 
}: ResponsiveActionCardProps) {
  const variantClasses = {
    primary: "border-blue-200 bg-blue-50 hover:bg-blue-100",
    secondary: "border-gray-200 bg-gray-50 hover:bg-gray-100",
    success: "border-green-200 bg-green-50 hover:bg-green-100",
    warning: "border-yellow-200 bg-yellow-50 hover:bg-yellow-100",
    danger: "border-red-200 bg-red-50 hover:bg-red-100"
  }

  const buttonClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-yellow-600 hover:bg-yellow-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  }

  return (
    <div className={`border rounded-lg p-4 transition-colors cursor-pointer ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {icon && (
            <div className="text-xl md:text-2xl flex-shrink-0">
              {icon}
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