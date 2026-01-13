export interface AdminUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'support'
  is_active: boolean
}

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const permissions = {
    admin: [
      'create_borrowers', 'manage_loans', 'confirm_payments', 
      'review_documents', 'respond_messages', 'system_settings',
      'view_all', 'edit_all', 'delete_all'
    ],
    manager: [
      'create_borrowers', 'manage_loans', 'confirm_payments', 
      'review_documents', 'respond_messages',
      'view_all', 'edit_all'
    ],
    support: [
      'view_borrowers', 'view_loans', 'view_payments', 
      'view_documents', 'respond_messages'
    ]
  }

  const userPermissions = permissions[userRole as keyof typeof permissions] || []
  return userPermissions.includes(requiredPermission)
}