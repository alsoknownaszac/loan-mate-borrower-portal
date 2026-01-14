"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { LoansContent } from "./loans-content"

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <LoansContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}