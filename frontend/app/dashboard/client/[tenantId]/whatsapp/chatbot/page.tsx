"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  ToggleRight,
  ToggleLeft,
  MessageCircle,
  Tag,
  Calendar,
  Eye,
  MoreVertical,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Chatbot {
  _id: string
  chatbotId: string
  name: string
  description?: string
  status: "active" | "inactive"
  triggers: string[]
  responses: number
  createdAt: string
  conversationsCount?: number
  successRate?: number
}

export default function ChatbotPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingChatbot, setEditingChatbot] = useState<Chatbot | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    triggers: [] as string[],
  })

  // Fetch chatbots
  const fetchChatbots = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/chatbots?accountId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setChatbots(data.chatbots || [])
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchChatbots()
  }, [tenantId])

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) return

    try {
      const url = editingChatbot
        ? `/api/whatsapp/chatbots/${editingChatbot._id}`
        : `/api/whatsapp/chatbots`

      const method = editingChatbot ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          name: formData.name,
          description: formData.description,
          triggers: formData.triggers,
        }),
      })

      if (response.ok) {
        setFormData({ name: "", description: "", triggers: [] })
        setEditingChatbot(null)
        setShowNewDialog(false)
        fetchChatbots()
      }
    } catch (error) {
      console.error("Error creating/updating chatbot:", error)
    }
  }

  const handleToggleStatus = async (chatbot: Chatbot) => {
    try {
      const response = await fetch(
        `/api/whatsapp/chatbots/${chatbot._id}/toggle`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
          body: JSON.stringify({
            accountId: tenantId,
            status: chatbot.status === "active" ? "inactive" : "active",
          }),
        }
      )

      if (response.ok) {
        fetchChatbots()
      }
    } catch (error) {
      console.error("Error toggling chatbot status:", error)
    }
  }

  const handleDelete = async (chatbotId: string) => {
    if (!window.confirm("Are you sure you want to delete this chatbot?")) return

    try {
      const response = await fetch(
        `/api/whatsapp/chatbots/${chatbotId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )

      if (response.ok) {
        fetchChatbots()
      }
    } catch (error) {
      console.error("Error deleting chatbot:", error)
    }
  }

  const handleEdit = (chatbot: Chatbot) => {
    setEditingChatbot(chatbot)
    setFormData({
      name: chatbot.name,
      description: chatbot.description || "",
      triggers: chatbot.triggers || [],
    })
    setShowNewDialog(true)
  }

  const handleCloseDialog = () => {
    setShowNewDialog(false)
    setEditingChatbot(null)
    setFormData({ name: "", description: "", triggers: [] })
  }

  const filteredChatbots = chatbots.filter(
    (bot) =>
      bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chatbots</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage automated responses for customer inquiries
            </p>
          </div>
          <Button
            onClick={() => setShowNewDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chatbot
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search chatbots..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Chatbots List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ) : filteredChatbots.length === 0 ? (
          <div className="p-12 text-center">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No chatbots yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first chatbot to start automating customer responses
            </p>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Chatbot
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {filteredChatbots.map((chatbot) => (
                <div
                  key={chatbot._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {chatbot.name}
                        </h3>
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            chatbot.status === "active"
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {chatbot.status === "active" ? "Active" : "Inactive"}
                        </div>
                      </div>
                      {chatbot.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {chatbot.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {chatbot.triggers && chatbot.triggers.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="h-4 w-4" />
                            <span>{chatbot.triggers.length} triggers</span>
                          </div>
                        )}
                        {chatbot.conversationsCount !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <MessageCircle className="h-4 w-4" />
                            <span>
                              {chatbot.conversationsCount} conversations
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(chatbot.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(chatbot)
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        {chatbot.status === "active" ? (
                          <ToggleRight className="h-5 w-5 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                        )}
                      </button>

                      <button
                        onClick={() => handleEdit(chatbot)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                      >
                        <Edit className="h-5 w-5 text-gray-600" />
                      </button>

                      <button
                        onClick={() => handleDelete(chatbot._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingChatbot ? "Edit Chatbot" : "Create New Chatbot"}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Support Bot"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe what this chatbot does..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Triggers (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., help, hours, shipping"
                  defaultValue={formData.triggers.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggers: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseDialog}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreateOrUpdate}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {editingChatbot ? "Update" : "Create"} Chatbot
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
