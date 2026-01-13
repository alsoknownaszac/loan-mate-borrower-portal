"use client"

import { hasPermission } from "@/lib/auth/admin"

interface PermissionGuardProps {
  userRole: string
  requiredPermission: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PermissionGuard({ 
  userRole, 
  requiredPermission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  if (!hasPermission(userRole, requiredPermission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}