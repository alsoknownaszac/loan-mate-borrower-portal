// This script tests if Next.js is properly loading environment variables
console.log("🔍 TESTING NEXT.JS ENVIRONMENT VARIABLE LOADING")
console.log("=" .repeat(50))

// Check if we're in Node.js or browser environment
const isNode = typeof window === 'undefined'
console.log("Environment:", isNode ? "Node.js" : "Browser")

// In Node.js, env vars won't be available unless loaded
if (isNode) {
  console.log("⚠️  This is Node.js - env vars won't show NEXT_PUBLIC_ variables")
  console.log("   Run this in browser console instead")
} else {
  console.log("✅ Browser environment - checking NEXT_PUBLIC_ variables")
  console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50) + "...")
}

// Test the actual values that should be there
const expectedUrl = "https://twenkuyewmgwvqyxurpj.supabase.co"
const expectedKeyStart = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

console.log("\n🎯 Expected values:")
console.log("URL should be:", expectedUrl)
console.log("Key should start with:", expectedKeyStart)

if (!isNode) {
  const actualUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const actualKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log("\n🔍 Comparison:")
  console.log("URL matches:", actualUrl === expectedUrl ? "✅ YES" : "❌ NO")
  console.log("Key starts correctly:", actualKey?.startsWith(expectedKeyStart) ? "✅ YES" : "❌ NO")
  
  if (!actualUrl || !actualKey) {
    console.log("\n❌ PROBLEM FOUND: Environment variables are undefined in browser!")
    console.log("🔧 Solutions:")
    console.log("1. Restart Next.js dev server")
    console.log("2. Clear browser cache")
    console.log("3. Check .env.local file exists and has correct variables")
  }
}