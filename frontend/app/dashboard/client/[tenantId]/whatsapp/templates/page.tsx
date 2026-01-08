"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Loader, AlertCircle, CheckCircle, Plus, Send, RefreshCw } from "lucide-react"
import { useParams } from "next/navigation"

interface Template {
  id: string
  name: string
  category: string
  status: "APPROVED" | "REJECTED" | "PENDING_REVIEW" | "DISABLED"
  language: string
  content?: string
  headerText?: string
  bodyText?: string
  footerText?: string
}

export default function TemplatesPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [syncingTemplates, setSyncingTemplates] = useState(false)

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [tenantId])

  // Fetch templates from platform
  const fetchTemplates = async () => {
    try {
      setIsLoading(true)
      console.log(`📋 Fetching templates for tenant: ${tenantId}`)

      const response = await fetch(
        `/api/whatsapp/templates?tenantId=${tenantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Templates fetched:", data)
        setTemplates(data.data?.templates || data.templates || [])
        setError("")
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch templates:", response.status, errorData)
        setError(`Failed to load templates: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      setError(`Error loading templates: ${String(error)}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Sync templates from Meta
  const syncTemplatesFromMeta = async () => {
    try {
      setSyncingTemplates(true)
      console.log("🔄 Syncing templates from Meta...")

      const response = await fetch(
        `/api/whatsapp/templates/sync?tenantId=${tenantId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Templates synced:", data)
        setSuccessMessage(`✅ Synced ${data.data?.count || 0} templates from Meta`)
        await fetchTemplates()
        setTimeout(() => setSuccessMessage(""), 3000)
      } else {
        const errorData = await response.json()
        setError(`Sync failed: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error syncing templates:", error)
      setError(`Error syncing templates: ${String(error)}`)
    } finally {
      setSyncingTemplates(false)
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "PENDING_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "DISABLED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
              <p className="text-sm text-gray-600">Manage WhatsApp message templates from Meta</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={syncTemplatesFromMeta}
              disabled={syncingTemplates}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncingTemplates ? "animate-spin" : ""}`} />
              {syncingTemplates ? "Syncing..." : "Sync from Meta"}
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Template
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-700 flex-shrink-0">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700 flex-shrink-0">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 text-lg">No templates found</p>
              <p className="text-gray-500 text-sm mt-2">Sync templates from Meta or create a new one</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{template.category}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                    {template.status.replace("_", " ")}
                  </span>
                </div>

                {template.headerText && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Header</p>
                    <p className="text-sm text-gray-900">{template.headerText}</p>
                  </div>
                )}

                {template.bodyText && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Body</p>
                    <p className="text-sm text-gray-900">{template.bodyText}</p>
                  </div>
                )}

                {template.footerText && (
                  <div className="mb-3 p-3 bg-gray-50 rounded border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium mb-1">Footer</p>
                    <p className="text-sm text-gray-900">{template.footerText}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-500">{template.language}</span>
                  {template.status === "APPROVED" && (
                    <button className="ml-auto px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Use Template
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
