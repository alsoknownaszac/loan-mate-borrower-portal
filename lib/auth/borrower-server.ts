import { createClient } from "@/lib/supabase/server"

export async function getBorrowerFromSession() {
  try {
    const supabase = await createClient()
    
    // Get the current user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error("Authentication required")
    }

    // Get borrower information
    const { data: borrower, error: borrowerError } = await supabase
      .from("borrowers")
      .select("*")
      .eq("id", user.id)
      .single()

    if (borrowerError || !borrower) {
      throw new Error("Borrower not found")
    }

    return { user, borrower }
  } catch (error) {
    throw error
  }
}

export async function requireBorrowerAuth() {
  const { user, borrower } = await getBorrowerFromSession()
  return { user, borrower }
}