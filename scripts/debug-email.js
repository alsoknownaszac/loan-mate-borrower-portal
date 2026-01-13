// Debug script to test email functionality
const { Resend } = require('resend')
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

async function debugEmail() {
  console.log("🔍 Debugging Email Configuration...")
  
  // Load environment variables
  loadEnv()
  
  // Check environment variables
  console.log("\n📋 Environment Variables:")
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing")
  console.log("RESEND_FROM_EMAIL:", process.env.RESEND_FROM_EMAIL || "❌ Not set (will use default)")
  
  if (!process.env.RESEND_API_KEY) {
    console.log("❌ RESEND_API_KEY is missing! Add it to .env.local")
    return
  }
  
  // Test Resend client
  try {
    console.log("\n🧪 Testing Resend Client...")
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // Test email send
    console.log("📧 Sending test email...")
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: ['your-email@gmail.com'], // ⚠️ REPLACE WITH YOUR ACTUAL EMAIL
      subject: 'Test Email from LoanMate',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
      text: 'Test Email - If you receive this, email is working!'
    })
    
    console.log("✅ Email sent successfully!")
    console.log("📧 Email ID:", result.data?.id)
    console.log("📧 From:", process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev')
    
  } catch (error) {
    console.log("❌ Email sending failed:")
    console.log("Error:", error.message)
    
    if (error.message.includes('API key')) {
      console.log("💡 Solution: Check your RESEND_API_KEY in .env.local")
    }
    if (error.message.includes('domain')) {
      console.log("💡 Solution: Use 'onboarding@resend.dev' for testing")
    }
  }
  
  console.log("\n📋 Troubleshooting Steps:")
  console.log("1. Make sure RESEND_API_KEY is set in .env.local")
  console.log("2. Use RESEND_FROM_EMAIL=onboarding@resend.dev for testing")
  console.log("3. Replace test@example.com with your actual email")
  console.log("4. Check spam/junk folder")
  console.log("5. Check Resend dashboard for delivery status")
}

debugEmail().catch(console.error)