"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { SupportContent } from "./support-content"

export default function SupportPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <SupportContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}