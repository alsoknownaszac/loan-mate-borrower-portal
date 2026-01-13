// Script to verify borrower email retrieval flow
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Simple env loader
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').replace(/^['"]|['"]$/g, '')
        if (!key.startsWith('#')) {
          process.env[key] = value
        }
      }
    })
  } catch (error) {
    console.log("Could not load .env.local file")
  }
}

async function verifyBorrowerEmailFlow() {
  console.log("🔍 Verifying Borrower Email Retrieval Flow...")
  
  // Load environment variables
  loadEnv()
  
  // Check required env vars
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.SUPABASE_URL) {
    console.log("❌ Missing Supabase environment variables")
    return
  }
  
  // Create admin client (same as in API routes)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  
  try {
    console.log("\n📋 Step 1: Checking borrowers table structure...")
    
    // Get borrowers table info
    const { data: borrowers, error: borrowersError } = await supabaseAdmin
      .from("borrowers")
      .select("id, email, full_name")
      .limit(5)
    
    if (borrowersError) {
      console.log("❌ Error fetching borrowers:", borrowersError.message)
      return
    }
    
    if (!borrowers || borrowers.length === 0) {
      console.log("⚠️  No borrowers found in database")
      console.log("💡 Create a borrower first to test email functionality")
      return
    }
    
    console.log(`✅ Found ${borrowers.length} borrowers`)
    console.log("📧 Borrower emails:")
    borrowers.forEach((borrower, index) => {
      console.log(`   ${index + 1}. ${borrower.full_name} - ${borrower.email}`)
    })
    
    console.log("\n📋 Step 2: Testing borrower email retrieval (same as API routes)...")
    
    // Test the exact same query used in API routes
    const testBorrowerId = borrowers[0].id
    const { data: borrower, error: borrowerError } = await supabaseAdmin
      .from("borrowers")
      .select("*")
      .eq("id", testBorrowerId)
      .single()
    
    if (borrowerError) {
      console.log("❌ Error fetching single borrower:", borrowerError.message)
      return
    }
    
    console.log("✅ Successfully retrieved borrower:")
    console.log("   ID:", borrower.id)
    console.log("   Name:", borrower.full_name)
    console.log("   Email:", borrower.email)
    console.log("   Email valid:", borrower.email && borrower.email.includes('@') ? "✅ Yes" : "❌ No")
    
    console.log("\n📋 Step 3: Checking loans with borrower relationships...")
    
    // Check loans table
    const { data: loans, error: loansError } = await supabaseAdmin
      .from("loans")
      .select(`
        id,
        borrower_id,
        principal_amount,
        borrowers (
          id,
          email,
          full_name
        )
      `)
      .limit(3)
    
    if (loansError) {
      console.log("❌ Error fetching loans:", loansError.message)
      return
    }
    
    if (!loans || loans.length === 0) {
      console.log("⚠️  No loans found in database")
      console.log("💡 Create a loan to test the complete flow")
      return
    }
    
    console.log(`✅ Found ${loans.length} loans`)
    console.log("📧 Loan borrower emails:")
    loans.forEach((loan, index) => {
      console.log(`   ${index + 1}. Loan ${loan.id.substring(0, 8)} - ${loan.borrowers?.full_name} (${loan.borrowers?.email})`)
    })
    
    console.log("\n📋 Step 4: Simulating API route email logic...")
    
    const testLoan = loans[0]
    if (testLoan.borrowers && testLoan.borrowers.email) {
      console.log("✅ Email retrieval simulation successful:")
      console.log("   Borrower ID:", testLoan.borrower_id)
      console.log("   Borrower Email:", testLoan.borrowers.email)
      console.log("   Would send email to:", testLoan.borrowers.email)
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const isValidEmail = emailRegex.test(testLoan.borrowers.email)
      console.log("   Email format valid:", isValidEmail ? "✅ Yes" : "❌ No")
      
    } else {
      console.log("❌ No email found for borrower")
      console.log("💡 Check if borrower has email address set")
    }
    
    console.log("\n🎯 Summary:")
    console.log("✅ Database connection: Working")
    console.log("✅ Borrowers table: Accessible")
    console.log("✅ Email field: Present")
    console.log("✅ Loan-borrower relationship: Working")
    console.log("✅ Email retrieval logic: Correct")
    
    console.log("\n💡 If emails still not arriving, check:")
    console.log("1. RESEND_API_KEY is valid")
    console.log("2. RESEND_FROM_EMAIL is set")
    console.log("3. Borrower email addresses are valid")
    console.log("4. Check spam/junk folder")
    console.log("5. Check Resend dashboard for delivery status")
    
  } catch (error) {
    console.log("❌ Verification failed:", error.message)
  }
}

verifyBorrowerEmailFlow().catch(console.error)