export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Login page doesn't need admin authentication
  return <>{children}</>
}