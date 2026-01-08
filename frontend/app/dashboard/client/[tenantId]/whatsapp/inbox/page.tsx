"use client"

import { useState, useEffect, useRef } from "react"
import {
  Send,
  MessageCircle,
  Phone,
  Settings,
  Search,
  Loader,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreVertical,
  RefreshCw,
} from "lucide-react"
import { useParams } from "next/navigation"

interface Message {
  _id: string
  messageId: string
  senderPhone: string
  recipientPhone: string
  messageType: "text" | "image" | "document" | "audio" | "video" | "template"
  content: {
    text?: string
    url?: string
    mediaType?: string
    caption?: string
    templateName?: string
  }
  status: "sent" | "delivered" | "read" | "failed" | "pending"
  direction: "inbound" | "outbound"
  timestamp: string
  createdAt: string
}

interface Conversation {
  _id: string
  conversationId: string
  phoneNumberId: string
  userPhone: string
  userName: string
  lastMessagePreview: string
  lastMessageAt: string
  lastMessageType: string
  unreadCount: number
  status: "open" | "closed"
  priority: "normal" | "high" | "low"
  userProfileName: string
  lastReadAt: string
}

export default function InboxPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  // State Management
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState("")
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [pollingActive, setPollingActive] = useState(true)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch conversations
  const fetchConversations = async (silent = false) => {
    try {
      if (!silent) setIsLoadingConversations(true)
      console.log(`📱 Fetching conversations for tenant: ${tenantId}`)
      
      const response = await fetch(
        `/api/whatsapp/conversations?tenantId=${tenantId}&limit=50&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('📥 Conversations response:', data)
        
        // Handle both response formats
        const convList = data.data?.conversations || data.conversations || []
        console.log(`✅ Loaded ${convList.length} conversations`)
        setConversations(convList)
        setError("")
      } else {
        const errorData = await response.json()
        console.error("Failed to fetch conversations:", response.status, errorData)
        if (!silent) setError(`Failed to load conversations: ${errorData.error || response.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      if (!silent) setError(`Error loading conversations: ${String(error)}`)
    } finally {
      if (!silent) setIsLoadingConversations(false)
    }
  }

  // Fetch messages for selected conversation
  const fetchMessages = async (conversationPlatformId: string, silent = false) => {
    try {
      if (!silent) setIsLoadingMessages(true)
      console.log(`📬 Fetching messages for conversation: ${conversationPlatformId}`)
      
      const response = await fetch(
        `/api/whatsapp/messages?conversationId=${conversationPlatformId}&tenantId=${tenantId}&limit=50&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        console.log('📥 Messages response:', data)
        
        // Handle both response formats
        const messagesList = data.data?.messages || data.messages || []
        console.log(`✅ Loaded ${messagesList.length} messages`)
        setMessages(messagesList)
        setError("")
      } else {
        try {
          const errorData = await response.json()
          console.error("Failed to fetch messages:", response.status, errorData)
          if (!silent) setError(`Failed to load messages: ${errorData.error || response.statusText}`)
        } catch (parseError) {
          console.error("Failed to fetch messages (response parse error):", response.status, response.statusText)
          if (!silent) setError(`Failed to load messages: ${response.statusText}`)
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
      if (!silent) setError(`Error loading messages: ${String(error)}`)
    } finally {
      if (!silent) setIsLoadingMessages(false)
    }
  }

  // Send message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return

    try {
      setIsSendingMessage(true)
      setError("")

      console.log(`📤 Sending message to conversation: ${selectedConversation.conversationId}`)

      const response = await fetch(`/api/whatsapp/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          tenantId,
          conversationId: selectedConversation.conversationId,
          messageText: messageText.trim(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Message sent:', result)
        setMessageText("")
        setSuccessMessage("Message sent!")
        setTimeout(() => setSuccessMessage(""), 3000)
        // Refresh messages after short delay to allow server to process
        setTimeout(() => {
          fetchMessages(selectedConversation.conversationId, true)
        }, 500)
      } else {
        const error = await response.json()
        console.error("Failed to send message:", error)
        setError(error.error || "Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      setError(`Error sending message: ${String(error)}`)
    } finally {
      setIsSendingMessage(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchConversations()
  }, [tenantId])

  // Auto-refresh conversations (smart polling with reduced frequency)
  useEffect(() => {
    if (!pollingActive) return

    // Poll conversations every 5 seconds to sync new messages/updates
    const conversationInterval = setInterval(async () => {
      await fetchConversations(true)
    }, 5000) // Poll conversations every 5 seconds (reduced from 2 seconds)

    // Only poll messages every 10 seconds if a conversation is selected (reduced frequency)
    let messageInterval: NodeJS.Timeout | null = null
    if (selectedConversation) {
      messageInterval = setInterval(async () => {
        await fetchMessages(selectedConversation.conversationId, true)
      }, 10000) // Poll messages every 10 seconds (not every 2 seconds)
    }

    pollingIntervalRef.current = conversationInterval
    return () => {
      clearInterval(conversationInterval)
      if (messageInterval) clearInterval(messageInterval)
    }
  }, [pollingActive, selectedConversation, tenantId])

  // Handle conversation selection
  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConversation(conv)
    await fetchMessages(conv.conversationId)
    
    // Mark conversation as read
    await markConversationAsRead(conv.conversationId)
  }

  // Mark conversation as read
  const markConversationAsRead = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/whatsapp/conversation/${conversationId}/read?tenantId=${tenantId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      )

      if (response.ok) {
        // Update the conversation's unread count in state
        setConversations(prev =>
          prev.map(conv =>
            conv.conversationId === conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        )
        console.log('✅ Conversation marked as read')
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error)
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) =>
    (conv.name || conv.userName || conv.userProfileName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (conv.phone || conv.userPhone || '').includes(searchQuery)
  )

  // Get total unread count
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-green-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Inbox</h1>
              <p className="text-sm text-gray-600">
                {totalUnread > 0 ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {totalUnread} unread message{totalUnread !== 1 ? "s" : ""}
                  </>
                ) : (
                  "All caught up!"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPollingActive(!pollingActive)
              }}
              className={`p-2 rounded-lg transition ${
                pollingActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <RefreshCw className={`h-5 w-5 ${pollingActive ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => fetchConversations()}
              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border-b border-green-200 px-6 py-3 flex items-center gap-2 text-green-700">
          <CheckCircle className="h-5 w-5" />
          {successMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingConversations && filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="h-6 w-6 text-gray-400 animate-spin" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No conversations</p>
                </div>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <button
                  key={conv.id || conv._id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full px-4 py-3 border-b border-gray-100 text-left transition ${
                    selectedConversation?.id === conv.id || selectedConversation?._id === conv._id
                      ? "bg-green-50 border-l-4 border-l-green-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.name || conv.userName || conv.userProfileName || conv.phone || conv.userPhone || 'Unknown'}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="inline-block w-5 h-5 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {conv.phone || conv.userPhone || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600 mt-1 truncate">
                        {conv.lastMessagePreview || '[No messages]'}
                      </p>
                    </div>
                    <div className="ml-2 text-xs text-gray-500 flex-shrink-0">
                      {new Date(conv.lastMessageAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm">
                        {selectedConversation.userName || selectedConversation.userProfileName || selectedConversation.userPhone || 'Unknown'}
                      </h2>
                      <p className="text-xs text-gray-600">
                        {selectedConversation.userPhone || 'No phone'}
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader className="h-6 w-6 text-gray-400 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-1.5 rounded-lg text-sm ${
                          msg.direction === "outbound"
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="break-words">
                          {msg.content?.text ||
                            `[${(msg.messageType || 'unknown').toUpperCase()}] ${msg.content?.caption || msg.content?.url || ''}`}
                        </p>
                        <div className="flex items-center justify-between gap-1.5 mt-0.5">
                          <p className={`text-xs ${msg.direction === "outbound" ? "text-green-100" : "text-gray-600"}`}>
                            {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {msg.direction === "outbound" && (
                            <span className={`text-xs font-bold ${
                              msg.status === "read" ? "text-blue-300" : "text-green-100"
                            }`}>
                              {msg.status === "read" && "✓✓"}
                              {msg.status === "delivered" && "✓✓"}
                              {msg.status === "sent" && "✓"}
                              {msg.status === "pending" && "⏱"}
                              {msg.status === "failed" && "✗"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 px-4 py-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={isSendingMessage}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || isSendingMessage}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1.5 text-sm"
                  >
                    <Send className="h-4 w-4" />
                    {isSendingMessage ? "Sending..." : "Send"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
