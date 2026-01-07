"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  MessageSquare,
  Search,
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Image as ImageIcon,
  FileText,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

interface Contact {
  id: string
  phone: string
  phoneNumberId: string
  name?: string
  lastMessage?: string
  lastMessageTime?: string
  unreadCount?: number
  profilePic?: string
}

interface Message {
  _id: string
  waMessageId?: string
  recipientPhone?: string
  senderPhone?: string
  messageType: string
  content: any
  status: string
  direction: "inbound" | "outbound"
  createdAt: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
}

export default function InboxPage() {
  const params = useParams()
  const tenantId = params.tenantId as string

  const [conversations, setConversations] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const selectedContactIdRef = useRef<string | null>(null)
  const isFetchingRef = useRef(false)
  const shouldScrollRef = useRef(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch(`/api/whatsapp/conversations?accountId=${tenantId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const transformed = (data.conversations || []).map((conv: any) => ({
          id: conv.conversationId || conv._id,
          phone: conv.userPhone,
          phoneNumberId: conv.phoneNumberId,
          name: conv.userName,
          lastMessage: conv.lastMessagePreview,
          lastMessageTime: conv.lastMessageAt,
          unreadCount: conv.unreadCount,
        }))
        setConversations(transformed)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    }
  }, [tenantId])

  // Fetch messages for selected contact
  const fetchMessages = useCallback(async (contactId: string) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    try {
      setIsLoading(true)
      const response = await fetch(
        `/api/whatsapp/conversations/${encodeURIComponent(contactId)}/messages`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
          },
        }
      )
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
        shouldScrollRef.current = true
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 5000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  useEffect(() => {
    if (selectedContact) {
      selectedContactIdRef.current = selectedContact.id
      fetchMessages(selectedContact.id)
    } else {
      selectedContactIdRef.current = null
    }
  }, [selectedContact?.id, fetchMessages])

  // Poll for new messages
  useEffect(() => {
    if (!selectedContact) return

    const pollInterval = setInterval(async () => {
      const currentId = selectedContactIdRef.current
      if (!currentId) return

      try {
        const response = await fetch(
          `/api/whatsapp/conversations/${encodeURIComponent(currentId)}/messages`,
          {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
            },
          }
        )
        if (response.ok) {
          const data = await response.json()
          const newMessages = data.messages || []

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m._id))
            const incomingIds = new Set(newMessages.map((m: any) => m._id))

            const onlyNew = newMessages.filter(
              (m: any) => !existingIds.has(m._id)
            )

            if (onlyNew.length > 0) {
              shouldScrollRef.current = true
              return [...prev, ...onlyNew]
            }
            return prev
          })
        }
      } catch (error) {
        console.error("Error polling messages:", error)
      }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [selectedContact])

  // Auto scroll to bottom
  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      shouldScrollRef.current = false
    }
  }, [messages])

  const filteredConversations = conversations.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery)
  )

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedContact) return

    try {
      setIsSending(true)
      const response = await fetch(`/api/whatsapp/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('whatsapp_api_key') || ''}`,
        },
        body: JSON.stringify({
          accountId: tenantId,
          type: "text",
          phoneNumberId: selectedContact.phoneNumberId,
          recipientPhone: selectedContact.phone,
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()

        const currentTime = new Date().toISOString()
        const newMsg: Message = {
          _id: data.data?.messageId || Date.now().toString(),
          messageType: "text",
          content: { text: newMessage.trim() },
          direction: "outbound",
          status: "sent",
          createdAt: currentTime,
        }

        setMessages((prev) => [...prev, newMsg])
        setNewMessage("")
        shouldScrollRef.current = true

        setConversations((prev) => {
          const updated = prev.map((conv) =>
            conv.id === selectedContact.id
              ? {
                  ...conv,
                  lastMessage: newMessage.trim().substring(0, 50),
                  lastMessageTime: new Date().toISOString(),
                }
              : conv
          )
          return updated.sort((a, b) => {
            if (a.id === selectedContact.id) return -1
            if (b.id === selectedContact.id) return 1
            return (
              new Date(b.lastMessageTime || 0).getTime() -
              new Date(a.lastMessageTime || 0).getTime()
            )
          })
        })
      } else {
        const error = await response.json()
        console.error("❌ Send failed:", error)
        alert("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }, [newMessage, selectedContact, tenantId])

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusIcon = (message: Message) => {
    if (message.direction === "inbound") return null
    if (message.status === "read") return <CheckCheck className="h-4 w-4 text-blue-600" />
    if (message.status === "delivered") return <CheckCheck className="h-4 w-4 text-gray-600" />
    if (message.status === "sent") return <Check className="h-4 w-4 text-gray-600" />
    return <Clock className="h-4 w-4 text-gray-400" />
  }

  return (
    <div className="h-full flex bg-white">
      {/* Conversations List */}
      <div className="w-[400px] bg-white border-r border-gray-200 flex flex-col">
        {/* Search */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f0f2f5] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No conversations yet</p>
              <p className="text-sm mt-1">Start by sending a message</p>
            </div>
          ) : (
            filteredConversations.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-[#f5f6f6] transition border-b border-gray-100 ${
                  selectedContact?.id === contact.id ? "bg-[#f0f2f5]" : "bg-white"
                }`}
              >
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-700 font-medium">
                    {contact.name?.[0]?.toUpperCase() || contact.phone[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-[#111b21] truncate text-[17px]">
                      {contact.name || contact.phone}
                    </p>
                    {contact.lastMessageTime && (
                      <span className="text-xs text-[#667781] ml-2 flex-shrink-0">
                        {formatTime(contact.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#667781] truncate max-w-[200px]">
                      {contact.lastMessage || "No messages yet"}
                    </p>
                    {(contact.unreadCount ?? 0) > 0 && (
                      <div className="h-5 min-w-[20px] bg-[#25d366] rounded-full flex items-center justify-center px-1.5 ml-2">
                        <span className="text-xs font-semibold text-white">
                          {(contact.unreadCount ?? 0) > 99 ? "99+" : contact.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-700 font-medium text-sm">
                    {selectedContact.name?.[0]?.toUpperCase() || selectedContact.phone[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedContact.name || selectedContact.phone}
                  </p>
                  <p className="text-xs text-gray-600">Active now</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                  <Phone className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                  <Video className="h-5 w-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition">
                  <MoreVertical className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-white">
              {isLoading && messages.length === 0 && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin">
                    <MessageSquare className="h-8 w-8 text-gray-400" />
                  </div>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.direction === "outbound"
                        ? "bg-[#dcf8c6] text-[#111b21]"
                        : "bg-white text-[#111b21] border border-gray-200"
                    }`}
                  >
                    <p className="text-sm">{message.content?.text || ""}</p>
                    <div
                      className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                        message.direction === "outbound"
                          ? "text-[#667781]"
                          : "text-[#667781]"
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {message.direction === "outbound" && getStatusIcon(message)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-[#f0f2f5] border-t border-gray-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#e9edef] rounded-full transition flex-shrink-0">
                  <Smile className="h-6 w-6 text-[#54656f]" />
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  className="hidden"
                />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-[#e9edef] rounded-full transition flex-shrink-0"
                >
                  <Paperclip className="h-6 w-6 text-[#54656f]" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
                  rows={1}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="p-2 hover:bg-[#e9edef] rounded-full transition flex-shrink-0 disabled:opacity-50"
                >
                  <Send className="h-6 w-6 text-green-600" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="mb-4">
                <svg
                  className="mx-auto"
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                >
                  <circle cx="30" cy="30" r="30" fill="#f5f5f5" />
                  <path
                    d="M30 15c-8.28 0-15 6.72-15 15s6.72 15 15 15 15-6.72 15-15-6.72-15-15-15z"
                    fill="#ddd"
                  />
                </svg>
              </div>
              <h3 className="text-[32px] font-light text-[#41525d] mb-5">
                WhatsApp Business
              </h3>
              <p className="text-[14px] text-[#667781] leading-relaxed max-w-md mx-auto">
                Send and receive messages from your customers. Select a chat from the left to start messaging.
              </p>
              <div className="mt-8 pt-8 border-t border-[#00000014]">
                <p className="text-[14px] text-[#667781] flex items-center justify-center gap-1">
                  <span className="inline-block w-3 h-3">🔒</span>
                  End-to-end encrypted
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
