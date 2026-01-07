"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Calendar,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Broadcast {
  _id: string
  broadcastId: string
  name: string
  message: string
  recipientCount: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  status: "draft" | "scheduled" | "sending" | "sent" | "failed"
  scheduledAt?: string
  sentAt?: string
  createdAt: string
}

export default function BroadcastsPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [editingBroadcast, setEditingBroadcast] = useState<Broadcast | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    recipients: [] as string[],
    scheduledAt: "",
  })

  // Fetch broadcasts
  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/whatsapp/messages?type=broadcast&accountId=${tenantId}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setBroadcasts(data.broadcasts || [])
      }
    } catch (error) {
      console.error("Error fetching broadcasts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBroadcasts()
  }, [tenantId])

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim() || !formData.message.trim()) return

    try {
      const response = await fetch(`/api/whatsapp/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          type: "broadcast",
          name: formData.name,
          message: formData.message,
          recipients: formData.recipients,
          scheduledAt: formData.scheduledAt || undefined,
        }),
      })

      if (response.ok) {
        setFormData({ name: "", message: "", recipients: [], scheduledAt: "" })
        setEditingBroadcast(null)
        setShowNewDialog(false)
        fetchBroadcasts()
      }
    } catch (error) {
      console.error("Error creating broadcast:", error)
    }
  }

  const handleSendNow = async (broadcastId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to send this broadcast immediately?"
      )
    )
      return

    try {
      const response = await fetch(
        `/api/whatsapp/messages/${broadcastId}/send`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )

      if (response.ok) {
        fetchBroadcasts()
      }
    } catch (error) {
      console.error("Error sending broadcast:", error)
    }
  }

  const handleDelete = async (broadcastId: string) => {
    if (!window.confirm("Are you sure you want to delete this broadcast?"))
      return

    try {
      const response = await fetch(
        `/api/whatsapp/messages/${broadcastId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )

      if (response.ok) {
        fetchBroadcasts()
      }
    } catch (error) {
      console.error("Error deleting broadcast:", error)
    }
  }

  const handleEdit = (broadcast: Broadcast) => {
    setEditingBroadcast(broadcast)
    setFormData({
      name: broadcast.name,
      message: broadcast.message,
      recipients: [],
      scheduledAt: broadcast.scheduledAt || "",
    })
    setShowNewDialog(true)
  }

  const handleCloseDialog = () => {
    setShowNewDialog(false)
    setEditingBroadcast(null)
    setFormData({ name: "", message: "", recipients: [], scheduledAt: "" })
  }

  const filteredBroadcasts = broadcasts.filter(
    (broadcast) =>
      broadcast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      broadcast.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "sending":
        return <Clock className="h-4 w-4 text-blue-600" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-purple-600" />
      case "draft":
        return <AlertCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-50 text-green-700"
      case "sending":
        return "bg-blue-50 text-blue-700"
      case "scheduled":
        return "bg-purple-50 text-purple-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-red-50 text-red-700"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getDeliveryRate = (broadcast: Broadcast) => {
    if (broadcast.sentCount === 0) return 0
    return Math.round(
      ((broadcast.deliveredCount + broadcast.readCount) /
        broadcast.sentCount) *
        100
    )
  }

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Broadcasts</h1>
            <p className="text-sm text-gray-600 mt-1">
              Send messages to multiple contacts at once
            </p>
          </div>
          <Button
            onClick={() => setShowNewDialog(true)}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search broadcasts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>
      </div>

      {/* Broadcasts List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin">
              <Send className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="p-12 text-center">
            <Send className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No broadcasts yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create and schedule messages to reach your entire audience
            </p>
            <Button
              onClick={() => setShowNewDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Broadcast
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4">
              {filteredBroadcasts.map((broadcast) => (
                <div
                  key={broadcast._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition bg-white"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {broadcast.name}
                        </h3>
                        <div
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(
                            broadcast.status
                          )}`}
                        >
                          {getStatusIcon(broadcast.status)}
                          <span className="capitalize">{broadcast.status}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {broadcast.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {broadcast.status === "draft" && (
                        <>
                          <button
                            onClick={() =>
                              handleSendNow(broadcast._id)
                            }
                            className="p-2 hover:bg-green-50 rounded-lg transition"
                          >
                            <Send className="h-5 w-5 text-green-600" />
                          </button>
                          <button
                            onClick={() => handleEdit(broadcast)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit className="h-5 w-5 text-gray-600" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(broadcast._id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                    <div className="text-sm">
                      <p className="text-gray-600 text-xs">Recipients</p>
                      <p className="font-semibold text-gray-900">
                        {broadcast.recipientCount}
                      </p>
                    </div>
                    {broadcast.sentCount > 0 && (
                      <>
                        <div className="text-sm">
                          <p className="text-gray-600 text-xs">Sent</p>
                          <p className="font-semibold text-gray-900">
                            {broadcast.sentCount}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 text-xs">Delivered</p>
                          <p className="font-semibold text-gray-900">
                            {broadcast.deliveredCount}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 text-xs">Read</p>
                          <p className="font-semibold text-gray-900">
                            {broadcast.readCount}
                          </p>
                        </div>
                        <div className="text-sm ml-auto">
                          <p className="text-gray-600 text-xs">Delivery Rate</p>
                          <p className="font-semibold text-green-600">
                            {getDeliveryRate(broadcast)}%
                          </p>
                        </div>
                      </>
                    )}
                    {broadcast.sentAt && (
                      <div className="text-sm ml-auto">
                        <p className="text-gray-600 text-xs">Sent</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(broadcast.sentAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
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
                {editingBroadcast ? "Edit Broadcast" : "Create New Broadcast"}
              </h2>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Broadcast Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., New Year Sale"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Type your broadcast message..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Schedule (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledAt}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledAt: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
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
                {editingBroadcast ? "Update" : "Create"} Broadcast
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
