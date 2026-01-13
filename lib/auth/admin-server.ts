import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { AdminUser } from "./admin"

export async function getAdminUser(): Promise<AdminUser | null> {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log("Supabase not configured - no admin access allowed")
    return null
  }

  try {
    console.log("Creating Supabase client...")
    const supabase = await createClient()
    console.log("Getting user...")
    const { data: { user }, error } = await supabase.auth.getUser()
    
    console.log("User result:", { user: user?.email, error: error?.message })
    
    if (error || !user) {
      return null
    }

    // Check if user is an admin
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (adminError || !adminUser) {
      console.log("User is not an admin:", { email: user.email, error: adminError?.message })
      return null
    }

    return adminUser
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}

export async function requireAdminAuth(): Promise<AdminUser> {
  const adminUser = await getAdminUser()
  
  if (!adminUser) {
    throw new Error('Admin authentication required')
  }
  
  return adminUser
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('admin-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })
}

export async function clearAdminCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('admin-session')
}