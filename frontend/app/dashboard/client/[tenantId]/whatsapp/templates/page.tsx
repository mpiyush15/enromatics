"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Template {
  _id: string
  name: string
  language: string
  category: string
  status: "draft" | "pending" | "approved" | "rejected"
  content: string
  variables?: string[]
  usageCount?: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

export default function TemplatesPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [templates, setTemplates] = useState<Template[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    language: "en",
    category: "MARKETING",
    content: "",
  })

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/templates?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  const getStatusColor = (status: Template["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: Template["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "pending":
        return <Clock className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "draft":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleCreateTemplate = async () => {
    if (!formData.name || !formData.content) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`/api/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          ...formData,
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: "", language: "en", category: "MARKETING", content: "" })
        fetchTemplates()
      } else {
        alert("Failed to create template")
      }
    } catch (error) {
      console.error("Error creating template:", error)
      alert("Failed to create template")
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return

    try {
      const response = await fetch(`/api/whatsapp/templates/${templateId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      if (response.ok) {
        fetchTemplates()
      } else {
        alert("Failed to delete template")
      }
    } catch (error) {
      console.error("Error deleting template:", error)
      alert("Failed to delete template")
    }
  }

  const handleSyncTemplates = async () => {
    try {
      const response = await fetch(`/api/whatsapp/templates/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      if (response.ok) {
        fetchTemplates()
        alert("Templates synced successfully")
      } else {
        alert("Failed to sync templates")
      }
    } catch (error) {
      console.error("Error syncing templates:", error)
      alert("Failed to sync templates")
    }
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || template.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111b21]">Message Templates</h1>
            <p className="text-sm text-[#667781] mt-1">
              Create and manage WhatsApp message templates for your campaigns
            </p>
          </div>
          <button
            onClick={handleSyncTemplates}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            <RefreshCw className="h-4 w-4" />
            Sync from Meta
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition ml-2"
          >
            <Plus className="h-4 w-4" />
            New Template
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-[#f0f2f5] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Templates Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4">
                <Eye className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-[#111b21] mb-2">No templates found</h3>
              <p className="text-sm text-[#667781] mb-4">
                Create your first message template or sync from Meta
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
              >
                <Plus className="h-4 w-4" />
                Create Template
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f0f2f5] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Category</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Language</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Usage</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Last Used</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#111b21]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr
                    key={template._id}
                    className="border-b border-gray-200 hover:bg-[#f5f6f6] transition"
                  >
                    <td className="px-6 py-4 font-medium text-[#111b21]">{template.name}</td>
                    <td className="px-6 py-4 text-[#667781]">{template.category}</td>
                    <td className="px-6 py-4 text-[#667781] uppercase">{template.language}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(template.status)}`}>
                        {getStatusIcon(template.status)}
                        <span className="capitalize text-xs font-medium">{template.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#667781]">
                      {template.usageCount || 0}
                    </td>
                    <td className="px-6 py-4 text-[#667781]">
                      {template.lastUsedAt
                        ? new Date(template.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="p-2 hover:bg-[#e9edef] rounded-full transition"
                          title="View"
                        >
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                        {template.status === "draft" && (
                          <button
                            onClick={() => {
                              setSelectedTemplate(template)
                              setFormData({
                                name: template.name,
                                language: template.language,
                                category: template.category,
                                content: template.content,
                              })
                              setShowCreateModal(true)
                            }}
                            className="p-2 hover:bg-[#e9edef] rounded-full transition"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4 text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTemplate(template._id)}
                          className="p-2 hover:bg-red-50 rounded-full transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#111b21] mb-4">
              {selectedTemplate ? "Edit Template" : "Create New Template"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111b21] mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Order Confirmation"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#111b21] mb-1">
                    Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="hi">Hindi</option>
                    <option value="pt">Portuguese</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#111b21] mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="TRANSACTIONAL">Transactional</option>
                    <option value="OTP">OTP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111b21] mb-1">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter your template content..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-[#667781] mt-1">Use {{variable}} for dynamic content</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setSelectedTemplate(null)
                  setFormData({ name: "", language: "en", category: "MARKETING", content: "" })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-[#111b21] rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                className="flex-1 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
              >
                {selectedTemplate ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && !showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#111b21]">{selectedTemplate.name}</h2>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-[#667781]">Language:</span>
                <span className="text-sm font-medium text-[#111b21] uppercase">
                  {selectedTemplate.language}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#667781]">Category:</span>
                <span className="text-sm font-medium text-[#111b21]">
                  {selectedTemplate.category}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#667781]">Status:</span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(selectedTemplate.status)}`}>
                  {getStatusIcon(selectedTemplate.status)}
                  <span className="capitalize text-xs font-medium">{selectedTemplate.status}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#667781]">Usage:</span>
                <span className="text-sm font-medium text-[#111b21]">
                  {selectedTemplate.usageCount || 0}
                </span>
              </div>
            </div>

            <div className="bg-[#f0f2f5] rounded-lg p-4 mb-6">
              <p className="text-sm text-[#111b21] whitespace-pre-wrap">
                {selectedTemplate.content}
              </p>
            </div>

            <button
              onClick={() => setSelectedTemplate(null)}
              className="w-full px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
