import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // TEMPORARY FIX: Hardcode environment variables since process.env is not working
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://twenkuyewmgwvqyxurpj.supabase.co"
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"
  
  console.log("🔧 Supabase Client Debug:")
  console.log("URL:", SUPABASE_URL)
  console.log("Key (first 50):", SUPABASE_ANON_KEY.substring(0, 50) + "...")
  
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
