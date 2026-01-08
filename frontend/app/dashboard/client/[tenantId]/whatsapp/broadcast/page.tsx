"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Send,
  Search,
  MoreVertical,
  Plus,
  Eye,
  Copy,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react"
import { useParams } from "next/navigation"

interface Broadcast {
  _id: string
  name: string
  template?: string
  message?: string
  recipients?: number
  sentCount: number
  deliveredCount: number
  readCount: number
  failedCount: number
  status: "draft" | "scheduled" | "in_progress" | "completed" | "failed"
  scheduledFor?: string
  startedAt?: string
  completedAt?: string
  createdAt: string
}

export default function BroadcastPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    message: "",
    templateId: "",
    recipientType: "all", // all | contacts | segment
  })

  // Fetch broadcasts
  const fetchBroadcasts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/whatsapp/broadcasts?tenantId=${tenantId}`)
      if (response.ok) {
        const data = await response.json()
        setBroadcasts(data.broadcasts || [])
      }
    } catch (error) {
      console.error("Error fetching broadcasts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    fetchBroadcasts()
  }, [fetchBroadcasts])

  const getStatusColor = (status: Broadcast["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-300"
      case "failed":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusIcon = (status: Broadcast["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "in_progress":
        return <Loader className="h-4 w-4 animate-spin" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "draft":
        return <AlertCircle className="h-4 w-4" />
      case "failed":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleCreateBroadcast = async () => {
    if (!formData.name || !formData.message) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch(`/api/whatsapp/broadcasts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          ...formData,
        }),
      })

      if (response.ok) {
        setShowCreateModal(false)
        setFormData({ name: "", message: "", templateId: "", recipientType: "all" })
        fetchBroadcasts()
      } else {
        alert("Failed to create broadcast")
      }
    } catch (error) {
      console.error("Error creating broadcast:", error)
      alert("Failed to create broadcast")
    }
  }

  const handleDeleteBroadcast = async (broadcastId: string) => {
    if (!confirm("Are you sure you want to delete this broadcast?")) return

    try {
      const response = await fetch(`/api/whatsapp/broadcasts/${broadcastId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      })

      if (response.ok) {
        fetchBroadcasts()
      } else {
        alert("Failed to delete broadcast")
      }
    } catch (error) {
      console.error("Error deleting broadcast:", error)
      alert("Failed to delete broadcast")
    }
  }

  const calculatePercentage = (count: number, total: number): string => {
    if (total === 0) return "0"
    return Math.round((count / total) * 100).toString()
  }

  const filteredBroadcasts = broadcasts.filter((broadcast) => {
    const matchesSearch = broadcast.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || broadcast.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#111b21]">Broadcasts</h1>
            <p className="text-sm text-[#667781] mt-1">
              Send messages to multiple contacts and track delivery metrics
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
          >
            <Plus className="h-4 w-4" />
            New Broadcast
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search broadcasts..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Broadcasts Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading broadcasts...</p>
          </div>
        ) : filteredBroadcasts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-4">
                <Send className="h-12 w-12 text-gray-300 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-[#111b21] mb-2">No broadcasts yet</h3>
              <p className="text-sm text-[#667781] mb-4">
                Create your first broadcast to send messages to multiple contacts
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
              >
                <Plus className="h-4 w-4" />
                Create Broadcast
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#f0f2f5] border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#111b21]">Sent</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#111b21]">Delivered</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#111b21]">Read</th>
                  <th className="px-6 py-3 text-center font-semibold text-[#111b21]">Failed</th>
                  <th className="px-6 py-3 text-left font-semibold text-[#111b21]">Created</th>
                  <th className="px-6 py-3 text-right font-semibold text-[#111b21]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBroadcasts.map((broadcast) => {
                  const totalSent = broadcast.sentCount + broadcast.deliveredCount + broadcast.readCount + broadcast.failedCount
                  return (
                    <tr
                      key={broadcast._id}
                      className="border-b border-gray-200 hover:bg-[#f5f6f6] transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-[#111b21]">{broadcast.name}</p>
                          {broadcast.message && (
                            <p className="text-xs text-[#667781] truncate max-w-xs mt-1">
                              {broadcast.message.substring(0, 50)}...
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(broadcast.status)}`}>
                          {getStatusIcon(broadcast.status)}
                          <span className="capitalize text-xs font-medium">{broadcast.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-semibold text-[#111b21]">{broadcast.sentCount}</p>
                          <p className="text-xs text-[#667781]">
                            {totalSent > 0 ? calculatePercentage(broadcast.sentCount, totalSent) : 0}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-semibold text-[#111b21]">{broadcast.deliveredCount}</p>
                          <p className="text-xs text-[#667781]">
                            {totalSent > 0 ? calculatePercentage(broadcast.deliveredCount, totalSent) : 0}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-semibold text-blue-600">{broadcast.readCount}</p>
                          <p className="text-xs text-[#667781]">
                            {totalSent > 0 ? calculatePercentage(broadcast.readCount, totalSent) : 0}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div>
                          <p className="font-semibold text-red-600">{broadcast.failedCount}</p>
                          <p className="text-xs text-[#667781]">
                            {totalSent > 0 ? calculatePercentage(broadcast.failedCount, totalSent) : 0}%
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#667781] text-xs">
                        {new Date(broadcast.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedBroadcast(broadcast)}
                            className="p-2 hover:bg-[#e9edef] rounded-full transition"
                            title="View"
                          >
                            <Eye className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteBroadcast(broadcast._id)}
                            className="p-2 hover:bg-red-50 rounded-full transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-[#111b21] mb-4">Create New Broadcast</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#111b21] mb-1">
                  Broadcast Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Special Offer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111b21] mb-1">
                  Send To
                </label>
                <select
                  value={formData.recipientType}
                  onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Contacts</option>
                  <option value="contacts">Specific Contacts</option>
                  <option value="segment">Segment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111b21] mb-1">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-800">
                  💡 Messages are limited to 1024 characters. Personalize with {{variable}} placeholders.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setFormData({ name: "", message: "", templateId: "", recipientType: "all" })
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-[#111b21] rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBroadcast}
                className="flex-1 px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-lg transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Details Modal */}
      {selectedBroadcast && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#111b21]">{selectedBroadcast.name}</h2>
              <button
                onClick={() => setSelectedBroadcast(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-sm text-[#667781]">Status:</span>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusColor(selectedBroadcast.status)}`}>
                  {getStatusIcon(selectedBroadcast.status)}
                  <span className="capitalize text-xs font-medium">{selectedBroadcast.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#111b21]">{selectedBroadcast.sentCount}</p>
                  <p className="text-xs text-[#667781] mt-1">Sent</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#111b21]">{selectedBroadcast.deliveredCount}</p>
                  <p className="text-xs text-[#667781] mt-1">Delivered</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{selectedBroadcast.readCount}</p>
                  <p className="text-xs text-[#667781] mt-1">Read</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{selectedBroadcast.failedCount}</p>
                  <p className="text-xs text-[#667781] mt-1">Failed</p>
                </div>
              </div>

              {selectedBroadcast.message && (
                <div>
                  <p className="text-sm text-[#667781] mb-2">Message:</p>
                  <div className="p-3 bg-[#f0f2f5] rounded-lg">
                    <p className="text-sm text-[#111b21] whitespace-pre-wrap">
                      {selectedBroadcast.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBroadcast(null)}
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
