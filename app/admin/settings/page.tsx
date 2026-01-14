"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useAlertDialog } from "@/components/ui/alert-dialog"

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
  city: string
  state: string
  postal_code: string
  country: string
  logo_url: string
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"organization" | "notifications" | "users">("organization")
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [orgSettings, setOrgSettings] = useState<OrganizationSettings>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    logo_url: ""
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const { showAlert } = useAlertDialog()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get current admin user
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Fetch admin user's organization
          const { data: adminUser, error: adminError } = await supabase
            .from("admin_users")
            .select("organization_id, organizations(*)")
            .eq("id", user.id)
            .single()

          if (adminError) throw adminError

          // Set organization settings from database
          if (adminUser?.organizations) {
            const org = adminUser.organizations as any
            setOrgSettings({
              name: org.name || "",
              email: org.email || "",
              phone: org.phone || "",
              address: org.address || "",
              city: org.city || "",
              state: org.state || "",
              postal_code: org.postal_code || "",
              country: org.country || "",
              logo_url: org.logo_url || ""
            })
          }

          // Fetch notification templates for this organization
          // First try to get organization-specific templates
          const { data: orgTemplates, error: orgTemplatesError } = await supabase
            .from("notification_templates")
            .select("*")
            .eq("organization_id", adminUser?.organization_id)
            .order("name")

          if (orgTemplatesError) throw orgTemplatesError

          // If no organization-specific templates, get global templates (null organization_id)
          if (!orgTemplates || orgTemplates.length === 0) {
            const { data: globalTemplates, error: globalTemplatesError } = await supabase
              .from("notification_templates")
              .select("*")
              .is("organization_id", null)
              .order("name")

            if (globalTemplatesError) throw globalTemplatesError
            setTemplates(globalTemplates || [])
          } else {
            setTemplates(orgTemplates)
          }
        }

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
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error("User not authenticated")
      }

      // Get admin user's organization ID
      const { data: adminUser, error: adminError } = await supabase
        .from("admin_users")
        .select("organization_id")
        .eq("id", user.id)
        .single()

      if (adminError) throw adminError

      if (!adminUser?.organization_id) {
        throw new Error("Organization not found")
      }

      // Update organization
      const { error: updateError } = await supabase
        .from("organizations")
        .update({
          name: orgSettings.name,
          email: orgSettings.email,
          phone: orgSettings.phone,
          address: orgSettings.address || null,
          city: orgSettings.city || null,
          state: orgSettings.state || null,
          postal_code: orgSettings.postal_code || null,
          country: orgSettings.country || null,
          logo_url: orgSettings.logo_url || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", adminUser.organization_id)

      if (updateError) throw updateError

      await showAlert("Organization settings saved successfully!", "Success")
    } catch (error: any) {
      console.error("Error saving organization settings:", error)
      await showAlert(`Failed to save organization settings: ${error.message}`, "Error")
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
      await showAlert("Failed to update template", "Error")
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
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={orgSettings.address}
                    onChange={(e) => setOrgSettings({ ...orgSettings, address: e.target.value })}
                    placeholder="123 Main Street"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={orgSettings.city}
                    onChange={(e) => setOrgSettings({ ...orgSettings, city: e.target.value })}
                    placeholder="New York"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={orgSettings.state}
                    onChange={(e) => setOrgSettings({ ...orgSettings, state: e.target.value })}
                    placeholder="NY"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={orgSettings.postal_code}
                    onChange={(e) => setOrgSettings({ ...orgSettings, postal_code: e.target.value })}
                    placeholder="10001"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={orgSettings.country}
                    onChange={(e) => setOrgSettings({ ...orgSettings, country: e.target.value })}
                    placeholder="USA"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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

              {templates.length === 0 ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">No Notification Templates</h3>
                  <p className="text-sm text-blue-800 mb-4">
                    No notification templates have been created yet. Default templates will be created automatically when you perform actions like creating loans or requesting documents.
                  </p>
                  <p className="text-xs text-blue-700">
                    Templates allow you to customize automated notifications sent to borrowers for events like payment reminders, document requests, and loan updates.
                  </p>
                </div>
              ) : (
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
              )}
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
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <span className="text-blue-600 text-lg">ℹ️</span>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">Role Management</h4>
                    <p className="text-sm text-blue-800">
                      All admin users in your organization have full access to manage borrowers, loans, payments, and system settings. Contact your system administrator to create new admin accounts.
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