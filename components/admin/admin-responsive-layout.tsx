"use client"

import { useEffect, useState } from "react"
import AdminLayout from "./admin-layout"
import { AdminMobileLayout } from "./admin-mobile-layout"

interface AdminResponsiveLayoutProps {
  children: React.ReactNode
  adminUser?: {
    id: string
    email: string
    full_name: string
    role: string
  }
}

export function AdminResponsiveLayout({ children, adminUser }: AdminResponsiveLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkScreenSize = () => {
      // Use 768px as the breakpoint (md in Tailwind)
      setIsMobile(window.innerWidth < 768)
    }

    // Check initial screen size
    checkScreenSize()

    // Listen for window resize
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <AdminLayout adminUser={adminUser}>
        {children}
      </AdminLayout>
    )
  }

  // Use AdminMobileLayout for mobile screens, AdminLayout for tablet/desktop
  if (isMobile) {
    return (
      <AdminMobileLayout adminUser={adminUser}>
        {children}
      </AdminMobileLayout>
    )
  }

  return (
    <AdminLayout adminUser={adminUser}>
      {children}
    </AdminLayout>
  )
}