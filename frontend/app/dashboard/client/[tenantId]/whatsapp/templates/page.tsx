"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import useAuth from "@/hooks/useAuth"
import UpgradeRequired from "@/components/UpgradeRequired"

interface Template {
  _id: string
  tenantId: string
  templateId: string
  templateName: string
  templateBody: string
  category: string
  language: string
  createdAt: string
  status: "approved" | "pending" | "rejected"
  variables?: string[]
}

export default function TemplatesPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const tenantId = params.tenantId as string

  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [showNewTemplate, setShowNewTemplate] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    templateName: "",
    templateBody: "",
    category: "MARKETING",
    language: "en",
  })

  // Fetch all templates
  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await fetch(`/api/whatsapp/templates?tenantId=${tenantId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data.templates || [])
      console.log(`📋 Loaded ${data.templates?.length || 0} templates for tenant: ${tenantId}`)
    } catch (error) {
      console.error("Error fetching templates:", error)
      setErrorMessage("Failed to load templates")
    } finally {
      setIsLoading(false)
    }
  }

  // Sync templates from WhatsApp platform
  const handleSyncTemplates = async () => {
    try {
      setIsSyncing(true)
      setErrorMessage("")
      setSuccessMessage("")

      const response = await fetch(`/api/whatsapp/templates/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to sync templates")
      }

      setSuccessMessage(`✅ Synced ${data.syncedCount || 0} templates from WhatsApp Platform`)
      await fetchTemplates()
    } catch (error) {
      console.error("Error syncing templates:", error)
      setErrorMessage((error as Error).message || "Failed to sync templates")
    } finally {
      setIsSyncing(false)
    }
  }

  // Create new template
  const handleCreateTemplate = async () => {
    if (!newTemplate.templateName.trim() || !newTemplate.templateBody.trim()) {
      setErrorMessage("Template name and body are required")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await fetch(`/api/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          ...newTemplate,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create template")
      }

      setSuccessMessage("✅ Template created successfully!")
      setNewTemplate({
        templateName: "",
        templateBody: "",
        category: "MARKETING",
        language: "en",
      })
      setShowNewTemplate(false)
      await fetchTemplates()
    } catch (error) {
      console.error("Error creating template:", error)
      setErrorMessage((error as Error).message || "Failed to create template")
    } finally {
      setIsLoading(false)
    }
  }

  // Delete template
  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${templateName}"?`)) {
      return
    }

    try {
      setIsDeleting(true)
      setErrorMessage("")

      const response = await fetch(`/api/whatsapp/templates/${templateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to delete template")
      }

      setSuccessMessage(`✅ Template "${templateName}" deleted`)
      await fetchTemplates()
    } catch (error) {
      console.error("Error deleting template:", error)
      setErrorMessage((error as Error).message || "Failed to delete template")
    } finally {
      setIsDeleting(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchTemplates()
    }
  }, [tenantId])

  // Check if user has access to WhatsApp module (Pro or Enterprise only)
  const isTrialOrBasic = user?.plan === 'trial' || user?.plan === 'basic'
  
  if (isTrialOrBasic) {
    return (
      <UpgradeRequired 
        featureName="WhatsApp Business Automation (WABA)"
        description="Automated messages, templates, and two-way conversations with parents"
        requiredPlan="Pro or Enterprise (Annual)"
      />
    )
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Templates</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage message templates for broadcasts and bulk messaging
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSyncTemplates}
              disabled={isSyncing}
              variant="outline"
              className="border-blue-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync from Platform"}
            </Button>
            <Button
              onClick={() => setShowNewTemplate(!showNewTemplate)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {successMessage}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* New Template Form */}
        {showNewTemplate && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.templateName}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, templateName: e.target.value })
                  }
                  placeholder="e.g., Welcome Message, Order Confirmation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Body
                </label>
                <textarea
                  value={newTemplate.templateBody}
                  onChange={(e) =>
                    setNewTemplate({ ...newTemplate, templateBody: e.target.value })
                  }
                  placeholder="Enter your message template. Use {{variable}} for dynamic content"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Use {{studentName}}, {{className}}, {{date}} etc for dynamic content
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTemplate.category}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select
                    value={newTemplate.language}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, language: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateTemplate}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Create Template
                </Button>
                <Button
                  onClick={() => setShowNewTemplate(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-600 font-medium">No templates found</p>
              <p className="text-sm text-gray-500 mt-1">
                Click "New Template" to create one or "Sync from Platform" to fetch existing templates
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Template Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{template.templateName}</p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {template.templateBody}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {template.language.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            template.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : template.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(template.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteTemplate(template.templateId, template.templateName)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 transition"
                          title="Delete template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
