"use client"

import { useEffect, useState } from "react"
import { BorrowerLayout } from "./borrower-layout"
import { MobileLayout } from "./mobile-layout"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
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
      <BorrowerLayout>
        {children}
      </BorrowerLayout>
    )
  }

  // Use MobileLayout for mobile screens, BorrowerLayout for tablet/desktop
  if (isMobile) {
    return (
      <MobileLayout>
        {children}
      </MobileLayout>
    )
  }

  return (
    <BorrowerLayout>
      {children}
    </BorrowerLayout>
  )
}