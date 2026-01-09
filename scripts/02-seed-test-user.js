import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("[v0] Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const TEST_USER = {
  email: "test@loanmate.com",
  password: "TestPassword123!",
  fullName: "Test Borrower",
}

async function seedTestUser() {
  try {
    console.log("[v0] Checking if test user already exists...")

    // Check if user exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()
    const userExists = existingUser?.users?.some((u) => u.email === TEST_USER.email)

    if (userExists) {
      console.log("[v0] Test user already exists, skipping creation")
      return
    }

    // Create auth user
    console.log("[v0] Creating test auth user...")
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: TEST_USER.email,
      password: TEST_USER.password,
      email_confirm: true,
    })

    if (authError) {
      console.error("[v0] Failed to create auth user:", authError.message)
      return
    }

    console.log("[v0] Auth user created:", authUser.user.id)

    // Create borrower profile
    console.log("[v0] Creating borrower profile...")
    const { data: borrower, error: borrowerError } = await supabase
      .from("borrowers")
      .insert({
        id: authUser.user.id,
        email: TEST_USER.email,
        full_name: TEST_USER.fullName,
        phone: "+1-555-0123",
      })
      .select()

    if (borrowerError) {
      console.error("[v0] Failed to create borrower:", borrowerError.message)
      return
    }

    console.log("[v0] Borrower profile created")

    // Create sample loans
    console.log("[v0] Creating sample loans...")
    const { data: loans, error: loansError } = await supabase
      .from("loans")
      .insert([
        {
          borrower_id: authUser.user.id,
          amount: 50000,
          interest_rate: 5.5,
          start_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() + 1080 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "active",
        },
        {
          borrower_id: authUser.user.id,
          amount: 25000,
          interest_rate: 4.2,
          start_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          end_date: new Date(Date.now() + 1440 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "active",
        },
      ])
      .select()

    if (loansError) {
      console.error("[v0] Failed to create loans:", loansError.message)
      return
    }

    console.log("[v0] Created", loans.length, "sample loans")

    // Create sample payments
    if (loans && loans.length > 0) {
      console.log("[v0] Creating sample payments...")
      const payments = []

      // Create 12 payments for first loan
      for (let i = 0; i < 12; i++) {
        const dueDate = new Date()
        dueDate.setMonth(dueDate.getMonth() - (12 - i))
        const isPaid = i < 8 // First 8 are paid

        payments.push({
          loan_id: loans[0].id,
          amount: loans[0].amount / 60,
          due_date: dueDate.toISOString().split("T")[0],
          paid_date: isPaid
            ? new Date(dueDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
            : null,
          status: isPaid ? "paid" : i === 8 ? "overdue" : "pending",
        })
      }

      const { error: paymentsError } = await supabase.from("payments").insert(payments)

      if (paymentsError) {
        console.error("[v0] Failed to create payments:", paymentsError.message)
        return
      }

      console.log("[v0] Created", payments.length, "sample payments")
    }

    // Create sample notifications
    console.log("[v0] Creating sample notifications...")
    const { error: notificationsError } = await supabase.from("notifications").insert([
      {
        borrower_id: authUser.user.id,
        title: "Loan Approved",
        message: "Your loan application has been approved.",
        read: true,
      },
      {
        borrower_id: authUser.user.id,
        title: "Payment Due",
        message: "Your next payment of $833.33 is due on January 15, 2026.",
        read: false,
      },
      {
        borrower_id: authUser.user.id,
        title: "Document Uploaded",
        message: "Your loan agreement has been uploaded successfully.",
        read: true,
      },
    ])

    if (notificationsError) {
      console.error("[v0] Failed to create notifications:", notificationsError.message)
      return
    }

    console.log("[v0] Test data seeded successfully!")
    console.log(`[v0] Login with: ${TEST_USER.email} / ${TEST_USER.password}`)
  } catch (error) {
    console.error("[v0] Error seeding test user:", error)
  }
}

seedTestUser()
