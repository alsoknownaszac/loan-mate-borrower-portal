import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://twenkuyewmgwvqyxurpj.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3ZW5rdXlld21nd3ZxeXh1cnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NzkxNTUsImV4cCI6MjA4MzU1NTE1NX0.4VZgPIuymcFSz-HYV8LHg-IyHnNvsS46_qKb-YomC0M"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testConnection() {
  console.log("[v0] Testing Supabase connection...")

  try {
    // Test basic connection
    const { data, error } = await supabase.from('borrowers').select('count').limit(1)
    
    if (error) {
      console.log("[v0] Error:", error.message)
      if (error.code === '42P01') {
        console.log("[v0] Tables don't exist - need to set up schema")
      }
    } else {
      console.log("[v0] Connection successful! Tables exist.")
    }

    // Test auth
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log("[v0] Auth test:", authError ? authError.message : "Auth working")

  } catch (error) {
    console.error("[v0] Connection error:", error)
  }
}

testConnection()