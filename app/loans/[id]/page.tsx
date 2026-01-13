"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BorrowerLayout } from "@/components/borrower-layout"
import { LoanDetailContent } from "./loan-detail-content"

export default function LoanDetailPage() {
  return (
    <ProtectedRoute>
      <BorrowerLayout>
        <LoanDetailContent />
      </BorrowerLayout>
    </ProtectedRoute>
  )
}