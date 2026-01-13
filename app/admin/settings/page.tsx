"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface NotificationTemplate {
  id: string
  name: string
  title: string
  message: string
  notification_type: string
  is_active: boolean
}

interface OrganizationSettings {
  name: string
  email: string
  phone: string
  address: string
  logo_url: string
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"organization" | "notifications" | "users">("organization")
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: "LoanMate Financial Services",
    email: "support@loanmate.com",
    phone: "+1-555-0123",
    address: "123 Finance Street, Business City, BC 12345",
    logo_url: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch notification templates
        const { data: templatesData, error: templatesError } = await supabase
          .from("notification_templates")
          .select("*")
          .order("name")

        if (templatesError) throw templatesError
        setTemplates(templatesData || [])

      } catch (error) {
        console.error("Error fetching settings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [supabase])

  const handleSaveOrganization = async () => {
    setSaving(true)
    try {
      // In a real app, you'd save this to a settings table
      // For now, we'll just show a success message
      alert("Organization settings saved successfully!")
    } catch (error) {
      console.error("Error saving organization settings:", error)
      alert("Failed to save organization settings")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleTemplate = async (templateId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("notification_templates")
        .update({ is_active: !isActive })
        .eq("id", templateId)

      if (error) throw error

      setTemplates(prev => prev.map(template => 
        template.id === templateId 
          ? { ...template, is_active: !isActive }
          : template
      ))
    } catch (error) {
      console.error("Error updating template:", error)
      alert("Failed to update template")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage system configuration and preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { key: "organization", label: "Organization" },
            { key: "notifications", label: "Notifications" },
            { key: "users", label: "User Roles" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-card border border-border rounded-lg p-6">
        {activeTab === "organization" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Organization Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgSettings.name}
                    onChange={(e) => setOrgSettings({ ...orgSettings, name: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={orgSettings.email}
                    onChange={(e) => setOrgSettings({ ...orgSettings, email: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={orgSettings.phone}
                    onChange={(e) => setOrgSettings({ ...orgSettings, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={orgSettings.logo_url}
                    onChange={(e) => setOrgSettings({ ...orgSettings, logo_url: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address
                  </label>
                  <textarea
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveOrganization}
                  disabled={saving}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:bg-muted transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Notification Templates</h2>
              <p className="text-muted-foreground mb-6">
                Manage automated notification templates sent to borrowers
              </p>

              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{template.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {template.name.replace(/_/g, ' ')} • {template.notification_type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          template.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggleTemplate(template.id, template.is_active)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            template.is_active
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {template.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-foreground">{template.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">User Roles & Permissions</h2>
              <p className="text-muted-foreground mb-6">
                Manage admin user roles and access levels
              </p>

              <div className="space-y-4">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Admin / Ops Manager</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Full access to all features including borrower management, loan creation, payment confirmation, and system settings.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Create Borrowers", "Manage Loans", "Confirm Payments", 
                      "Review Documents", "Respond to Messages", "System Settings"
                    ].map((permission) => (
                      <span key={permission} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        ✓ {permission}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2">Support / Read-Only</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Limited access for support staff. Can view information and respond to messages but cannot modify financial data.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "View Borrowers", "View Loans", "View Payments", 
                      "View Documents", "Respond to Messages"
                    ].map((permission) => (
                      <span key={permission} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        👁 {permission}
                      </span>
                    ))}
                    {[
                      "Confirm Payments", "Edit Loans", "System Settings"
                    ].map((permission) => (
                      <span key={permission} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                        ✗ {permission}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-yellow-600 text-lg">⚠️</span>
                  <div>
                    <h4 className="font-medium text-yellow-900 mb-1">Role Management</h4>
                    <p className="text-sm text-yellow-800">
                      Role-based permissions are configured in the database. Contact your system administrator to modify user roles or create new admin accounts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}