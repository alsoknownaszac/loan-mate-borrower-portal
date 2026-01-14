import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/auth/admin-server"
import { AdminResponsiveLayout } from "@/components/admin/admin-responsive-layout"

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current pathname to check if we're on the login page
  // Note: This is a server component, so we need to handle this differently
  
  try {
    const adminUser = await getAdminUser()

    // If no admin user, redirect to login
    if (!adminUser) {
      redirect("/admin-auth/login")
    }

    return (
      <AdminResponsiveLayout adminUser={adminUser}>
        {children}
      </AdminResponsiveLayout>
    )
  } catch (error) {
    console.error("Admin authentication error:", error)
    // Always redirect to login on any authentication error
    redirect("/admin-auth/login")
  }
}