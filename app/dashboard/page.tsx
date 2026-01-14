"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { DashboardContent } from "./dashboard-content"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <DashboardContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}