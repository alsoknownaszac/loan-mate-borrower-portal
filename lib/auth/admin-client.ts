"use client"

import { createClient } from "@/lib/supabase/client"
import type { AdminUser } from "./admin"

export async function getAdminUserClient(): Promise<AdminUser | null> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
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
      return null
    }

    return adminUser
  } catch (error) {
    console.error('Error getting admin user:', error)
    return null
  }
}