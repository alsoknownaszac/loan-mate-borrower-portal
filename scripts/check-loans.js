import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzk3OTE1NSwiZXhwIjoyMDgzNTU1MTU1fQ.EL8pcRfzzMdSU08rCaBlaRgsOvycOcUxtr6xMW1ZVnI"

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function checkLoans() {
  console.log("🔍 CHECKING LOANS DATA")
  console.log("=" .repeat(50))

  // 1. Check if loans table exists and has data
  console.log("\n1️⃣ CHECKING LOANS TABLE")
  try {
    const { data: loans, error } = await supabaseAdmin
      .from('loans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.log("❌ Error fetching loans:", error.message)
      console.log("   Code:", error.code)
      
      if (error.code === '42P01') {
        console.log("💡 Table 'loans' does not exist!")
        console.log("   You need to run the database schema setup first")
      }
    } else {
      console.log(`✅ Found ${loans.length} loans`)
      
      if (loans.length > 0) {
        console.log("\n📋 Loans in database:")
        loans.forEach((loan, index) => {
          console.log(`   ${index + 1}. Loan ID: ${loan.id.substring(0, 8)}`)
          console.log(`      Borrower ID: ${loan.borrower_id}`)
          console.log(`      Amount: $${loan.principal_amount}`)
          console.log(`      Status: ${loan.status}`)
          console.log(`      Interest Rate: ${loan.interest_rate}%`)
          console.log(`      Created: ${loan.created_at}`)
        })
      } else {
        console.log("📝 No loans found in database")
        console.log("💡 Try creating a loan from admin panel to generate loans")
      }
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  // 2. Check borrower-loan relationships
  console.log("\n2️⃣ CHECKING BORROWER-LOAN RELATIONSHIPS")
  try {
    const { data: borrowersWithLoans, error } = await supabaseAdmin
      .from('borrowers')
      .select(`
        id,
        full_name,
        email,
        loans (
          id,
          principal_amount,
          status,
          interest_rate
        )
      `)

    if (error) {
      console.log("❌ Error fetching borrower-loan relationships:", error.message)
    } else {
      console.log(`✅ Found ${borrowersWithLoans.length} borrowers`)
      
      borrowersWithLoans.forEach((borrower, index) => {
        console.log(`   ${index + 1}. ${borrower.full_name} (${borrower.email})`)
        console.log(`      Loans: ${borrower.loans?.length || 0}`)
        if (borrower.loans && borrower.loans.length > 0) {
          borrower.loans.forEach((loan, loanIndex) => {
            console.log(`         ${loanIndex + 1}. $${loan.principal_amount} - ${loan.status}`)
          })
        }
      })
    }
  } catch (error) {
    console.log("❌ Exception:", error.message)
  }

  console.log("\n" + "=" .repeat(50))
  console.log("🎯 LOANS CHECK COMPLETE")
}

checkLoans()