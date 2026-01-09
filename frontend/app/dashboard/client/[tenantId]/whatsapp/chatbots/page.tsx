"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import {
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  Bot,
  Settings,
  Key,
  ToggleLeft,
  ToggleRight,
  Edit2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Keyword {
  _id: string
  keyword: string
  templateId?: string
  customResponse?: string
  isActive: boolean
}

interface Chatbot {
  _id: string
  tenantId: string
  botName: string
  description: string
  isEnabled: boolean
  welcomeTemplateId?: string
  keywords: Keyword[]
  settings: {
    sendWelcomeMessage: boolean
    showTypingIndicator: boolean
    responseDelay: number
  }
  stats: {
    totalConversations: number
    totalResponses: number
    lastActive?: string
  }
  createdAt: string
}

interface Template {
  _id: string
  templateName: string
  templateBody: string
}

export default function ChatbotsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [showNewBot, setShowNewBot] = useState(false)
  const [showKeywordForm, setShowKeywordForm] = useState(false)
  const [newBot, setNewBot] = useState({
    botName: "",
    description: "",
  })
  const [newKeyword, setNewKeyword] = useState({
    keyword: "",
    templateId: "",
    customResponse: "",
  })

  // Fetch all chatbots
  const fetchChatbots = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")
      const response = await fetch(`/api/whatsapp/chatbots?tenantId=${tenantId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch chatbots")
      }

      const data = await response.json()
      setChatbots(data.chatbots || [])
      console.log(`🤖 Loaded ${data.chatbots?.length || 0} chatbots`)
    } catch (error) {
      console.error("Error fetching chatbots:", error)
      setErrorMessage("Failed to load chatbots")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch templates for selected chatbot
  const fetchTemplates = async (botId: string) => {
    try {
      const response = await fetch(
        `/api/whatsapp/chatbots/${botId}/templates?tenantId=${tenantId}`
      )

      if (!response.ok) {
        throw new Error("Failed to fetch templates")
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (error) {
      console.error("Error fetching templates:", error)
    }
  }

  // Create new chatbot
  const handleCreateBot = async () => {
    if (!newBot.botName.trim()) {
      setErrorMessage("Bot name is required")
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage("")

      const response = await fetch(`/api/whatsapp/chatbots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          ...newBot,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create chatbot")
      }

      setSuccessMessage("✅ Chatbot created successfully!")
      setNewBot({ botName: "", description: "" })
      setShowNewBot(false)
      await fetchChatbots()
    } catch (error) {
      console.error("Error creating chatbot:", error)
      setErrorMessage((error as Error).message || "Failed to create chatbot")
    } finally {
      setIsSaving(false)
    }
  }

  // Toggle chatbot enabled/disabled
  const handleToggleChatbot = async (bot: Chatbot) => {
    try {
      setIsSaving(true)
      const response = await fetch(`/api/whatsapp/chatbots/${bot._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          isEnabled: !bot.isEnabled,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle chatbot")
      }

      await fetchChatbots()
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to toggle chatbot")
    } finally {
      setIsSaving(false)
    }
  }

  // Delete chatbot
  const handleDeleteChatbot = async (botId: string, botName: string) => {
    if (!window.confirm(`Delete chatbot "${botName}"?`)) return

    try {
      setIsSaving(true)
      const response = await fetch(`/api/whatsapp/chatbots/${botId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      if (!response.ok) {
        throw new Error("Failed to delete chatbot")
      }

      setSuccessMessage(`✅ Chatbot "${botName}" deleted`)
      setSelectedChatbot(null)
      await fetchChatbots()
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to delete chatbot")
    } finally {
      setIsSaving(false)
    }
  }

  // Add keyword to chatbot
  const handleAddKeyword = async () => {
    if (!selectedChatbot || !newKeyword.keyword.trim()) {
      setErrorMessage("Keyword is required")
      return
    }

    if (!newKeyword.templateId && !newKeyword.customResponse.trim()) {
      setErrorMessage("Select a template or enter custom response")
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(
        `/api/whatsapp/chatbots/${selectedChatbot._id}/keywords`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenantId,
            ...newKeyword,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add keyword")
      }

      setSuccessMessage("✅ Keyword added!")
      setNewKeyword({ keyword: "", templateId: "", customResponse: "" })
      setShowKeywordForm(false)
      await fetchChatbots()
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to add keyword")
    } finally {
      setIsSaving(false)
    }
  }

  // Delete keyword
  const handleDeleteKeyword = async (keywordId: string, keyword: string) => {
    if (!selectedChatbot) return

    try {
      setIsSaving(true)
      const response = await fetch(
        `/api/whatsapp/chatbots/${selectedChatbot._id}/keywords/${keywordId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tenantId }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete keyword")
      }

      setSuccessMessage(`✅ Keyword "${keyword}" removed`)
      await fetchChatbots()
    } catch (error) {
      setErrorMessage((error as Error).message || "Failed to delete keyword")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (tenantId) {
      fetchChatbots()
    }
  }, [tenantId])

  useEffect(() => {
    if (selectedChatbot) {
      fetchTemplates(selectedChatbot._id)
    }
  }, [selectedChatbot])

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="h-6 w-6" />
              WhatsApp Chatbots
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Create and manage automatic chatbots for customer conversations
            </p>
          </div>
          <Button
            onClick={() => setShowNewBot(!showNewBot)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Chatbot
          </Button>
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
        {/* New Bot Form */}
        {showNewBot && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Chatbot</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bot Name
                </label>
                <input
                  type="text"
                  value={newBot.botName}
                  onChange={(e) => setNewBot({ ...newBot, botName: e.target.value })}
                  placeholder="e.g., Student Inquiry Bot"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newBot.description}
                  onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                  placeholder="What will this bot do?"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateBot}
                  disabled={isSaving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Create Chatbot
                </Button>
                <Button
                  onClick={() => setShowNewBot(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Chatbots Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin">
              <Bot className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ) : chatbots.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Bot className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No chatbots found</p>
            <p className="text-sm text-gray-500 mt-2">Create your first chatbot to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chatbots List */}
            <div className="lg:col-span-1 space-y-3">
              {chatbots.map((bot) => (
                <div
                  key={bot._id}
                  onClick={() => setSelectedChatbot(bot)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedChatbot?._id === bot._id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{bot.botName}</p>
                        <p className="text-xs text-gray-500">
                          {bot.keywords.length} keywords
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleChatbot(bot)
                      }}
                      disabled={isSaving}
                    >
                      {bot.isEnabled ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Chatbot Details */}
            {selectedChatbot && (
              <div className="lg:col-span-2 space-y-6">
                {/* Bot Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Bot Settings
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Bot Name</p>
                      <p className="font-medium text-gray-900">{selectedChatbot.botName}</p>
                    </div>
                    {selectedChatbot.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-gray-900">{selectedChatbot.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          selectedChatbot.isEnabled
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {selectedChatbot.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteChatbot(selectedChatbot._id, selectedChatbot.botName)}
                    className="mt-6 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete Chatbot
                  </button>
                </div>

                {/* Keywords */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      Keywords ({selectedChatbot.keywords.length})
                    </h2>
                    <Button
                      onClick={() => setShowKeywordForm(!showKeywordForm)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Keyword
                    </Button>
                  </div>

                  {showKeywordForm && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-3">
                      <input
                        type="text"
                        value={newKeyword.keyword}
                        onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                        placeholder="e.g., fees, schedule, contact"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <select
                        value={newKeyword.templateId}
                        onChange={(e) =>
                          setNewKeyword({ ...newKeyword, templateId: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select template...</option>
                        {templates.map((template) => (
                          <option key={template._id} value={template._id}>
                            {template.templateName}
                          </option>
                        ))}
                      </select>

                      <textarea
                        value={newKeyword.customResponse}
                        onChange={(e) =>
                          setNewKeyword({ ...newKeyword, customResponse: e.target.value })
                        }
                        placeholder="Or enter custom response..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <div className="flex gap-2">
                        <Button
                          onClick={handleAddKeyword}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Add
                        </Button>
                        <Button
                          onClick={() => setShowKeywordForm(false)}
                          size="sm"
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {selectedChatbot.keywords.length === 0 ? (
                    <p className="text-sm text-gray-500">No keywords added yet</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedChatbot.keywords.map((kw) => (
                        <div key={kw._id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{kw.keyword}</p>
                            <p className="text-xs text-gray-600">
                              {kw.customResponse
                                ? "Custom response"
                                : "Template response"}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteKeyword(kw._id, kw.keyword)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
