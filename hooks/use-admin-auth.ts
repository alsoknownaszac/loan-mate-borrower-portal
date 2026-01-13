"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AdminUser {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
}

export function useAdminAuth() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push("/admin-auth/login")
          return
        }

        // Check if user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', user.email)
          .eq('is_active', true)
          .single()

        if (adminError || !adminUser) {
          await supabase.auth.signOut()
          router.push("/admin-auth/login")
          return
        }

        setAdminUser(adminUser)
      } catch (error) {
        console.error("Admin auth check failed:", error)
        router.push("/admin-auth/login")
      } finally {
        setLoading(false)
      }
    }

    checkAdminAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setAdminUser(null)
          router.push("/admin-auth/login")
        } else if (event === 'SIGNED_IN' && session) {
          // Re-check admin status
          checkAdminAuth()
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
    setAdminUser(null)
    router.push("/admin-auth/login")
  }

  return {
    adminUser,
    loading,
    signOut
  }
}