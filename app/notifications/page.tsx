"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { NotificationsContent } from "./notifications-content"

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <NotificationsContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}