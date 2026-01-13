// Debug environment variables
console.log("Environment Variables Debug:")
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY (first 50 chars):", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50))
console.log("SUPABASE_SERVICE_ROLE_KEY (first 50 chars):", process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 50))

// Check if keys are valid JWT format
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (anonKey) {
  const anonParts = anonKey.split('.')
  console.log("Anon key JWT parts:", anonParts.length, anonParts.length === 3 ? "✅ Valid" : "❌ Invalid")
}

if (serviceKey) {
  const serviceParts = serviceKey.split('.')
  console.log("Service key JWT parts:", serviceParts.length, serviceParts.length === 3 ? "✅ Valid" : "❌ Invalid")
}