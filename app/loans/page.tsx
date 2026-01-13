"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { BorrowerLayout } from "@/components/borrower-layout"
import { LoansContent } from "./loans-content"

export default function LoansPage() {
  return (
    <ProtectedRoute>
      <BorrowerLayout>
        <LoansContent />
      </BorrowerLayout>
    </ProtectedRoute>
  )
}