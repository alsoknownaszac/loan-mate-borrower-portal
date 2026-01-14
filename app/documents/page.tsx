"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { ResponsiveLayout } from "@/components/responsive-layout"
import { DocumentsContent } from "./documents-content"

export default function DocumentsPage() {
  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <DocumentsContent />
      </ResponsiveLayout>
    </ProtectedRoute>
  )
}