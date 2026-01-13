"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BorrowerLayout } from "@/components/borrower-layout"
import { DashboardContent } from "./dashboard-content"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <BorrowerLayout>
        <DashboardContent />
      </BorrowerLayout>
    </ProtectedRoute>
  )
}