"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { PaymentsContent } from "./payments-content"

export default function PaymentsPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <PaymentsContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}