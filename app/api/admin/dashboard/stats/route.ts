import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAdminAuth } from "@/lib/auth/admin-server"

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await requireAdminAuth()

    const supabaseAdmin = createAdminClient()

    // Fetch all stats in parallel
    const [
      borrowersResult,
      loansResult,
      paymentsResult,
      documentsResult,
      messagesResult,
    ] = await Promise.all([
      supabaseAdmin.from("borrowers").select("id", { count: "exact" }),
      supabaseAdmin.from("loans").select("id, principal_amount, status", { count: "exact" }),
      supabaseAdmin.from("payments").select("id, status, amount, due_date"),
      supabaseAdmin.from("documents").select("id, status"),
      supabaseAdmin.from("messages").select("id, status"),
    ])

    // Calculate stats
    const totalBorrowers = borrowersResult.count || 0
    const activeLoans = loansResult.data?.filter(l => l.status === 'active').length || 0
    const totalLoanAmount = loansResult.data?.reduce((sum, loan) => sum + (loan.principal_amount || 0), 0) || 0
    
    const payments = paymentsResult.data || []
    const pendingPayments = payments.filter(p => p.status === 'pending').length
    const overduePayments = payments.filter(p => p.status === 'overdue').length
    
    // Calculate collected this month
    const thisMonth = new Date()
    thisMonth.setDate(1)
    const collectedThisMonth = payments
      .filter(p => p.status === 'paid' && new Date(p.due_date) >= thisMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    const documents = documentsResult.data || []
    const pendingDocuments = documents.filter(d => d.status === 'pending' || d.status === 'requested').length

    const messages = messagesResult.data || []
    const openSupportTickets = messages.filter(m => m.status === 'open').length

    // Fetch recent loans
    const { data: recentLoans } = await supabaseAdmin
      .from("loans")
      .select("id, principal_amount, created_at, borrowers(full_name)")
      .order("created_at", { ascending: false })
      .limit(5)

    const stats = {
      totalBorrowers,
      activeLoans,
      pendingPayments,
      overduePayments,
      pendingDocuments,
      openSupportTickets,
      totalLoanAmount,
      collectedThisMonth,
    }

    return NextResponse.json({
      success: true,
      stats,
      recentActivity: recentLoans || []
    })

  } catch (error: any) {
    console.error("API error:", error)
    
    if (error.message === "Admin authentication required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}