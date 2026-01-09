"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/use-user"

interface Payment {
  id: string
  amount: number
  due_date: string
  paid_date: string | null
  status: string
  loans: { id: string; principal_amount: number }
}

export default function PaymentsPage() {
  const { user } = useUser()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPayments = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("payments")
          .select("id, amount, due_date, paid_date, status, loans(id, principal_amount)")
          .order("due_date", { ascending: false })

        if (error) throw error
        setPayments(data || [])
      } catch (error) {
        console.error("Error fetching payments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [user, supabase])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-accent/20 text-accent-foreground"
      case "pending":
        return "bg-secondary/20 text-secondary-foreground"
      case "overdue":
        return "bg-destructive/20 text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const overdueCount = payments.filter((p) => p.status === "overdue").length
  const pendingCount = payments.filter((p) => p.status === "pending").length
  const paidCount = payments.filter((p) => p.status === "paid").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Payment History</h1>
        <p className="text-muted-foreground">View and manage all your loan payments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Paid</p>
          <p className="text-2xl font-bold text-accent-foreground">{paidCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl font-bold text-secondary-foreground">{pendingCount}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-destructive-foreground">{overdueCount}</p>
        </div>
      </div>

      {/* Payments List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading payments...</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <span className="text-4xl mb-4 inline-block">💳</span>
          <h2 className="text-xl font-semibold text-foreground mb-2">No Payments</h2>
          <p className="text-muted-foreground">You don't have any payments scheduled yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Due Date</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">${payment.amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
