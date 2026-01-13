import { redirect } from "next/navigation"
import { getAdminUser } from "@/lib/auth/admin-server"
import AdminLayout from "@/components/admin/admin-layout"

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
      <AdminLayout adminUser={adminUser}>
        {children}
      </AdminLayout>
    )
  } catch (error) {
    console.error("Admin authentication error:", error)
    // Always redirect to login on any authentication error
    redirect("/admin-auth/login")
  }
}