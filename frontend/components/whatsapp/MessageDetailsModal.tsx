'use client'

import { useState, useEffect } from 'react'
import { API_BASE_URL } from '@/lib/apiConfig'

interface MessageDetail {
  _id: string
  recipientPhone: string
  recipientName?: string
  messageType: string
  content: {
    text?: string
    templateName?: string
    templateParams?: string[]
  }
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed'
  waMessageId?: string
  errorCode?: string
  errorMessage?: string
  sentAt?: string
  deliveredAt?: string
  readAt?: string
  failedAt?: string
  statusUpdates: Array<{
    status: string
    timestamp: string
    errorCode?: string
    errorMessage?: string
  }>
  createdAt: string
}

interface MessageDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  status: string
  tenantId: string
}

export default function MessageDetailsModal({ isOpen, onClose, status, tenantId }: MessageDetailsModalProps) {
  const [messages, setMessages] = useState<MessageDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen && status) {
      fetchMessages()
    }
  }, [isOpen, status])

  const fetchMessages = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/whatsapp/messages?status=${status}&limit=50&tenantId=${tenantId}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      console.error('Failed to fetch messages:', err)
      setError(err.message || 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>
      case 'delivered':
        return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
      case 'read':
        return <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
      case 'failed':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>
      case 'queued':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
    }
  }

  const getErrorCodeDescription = (code: string) => {
    const errorCodes: { [key: string]: string } = {
      '131026': 'Phone number not registered on WhatsApp',
      '131047': 'Re-engagement message required (24-hour rule violation)',
      '131051': 'Unsupported message type',
      '131056': 'Account quality restriction',
      '133016': 'Messaging limit reached',
      '80007': 'Recipient phone number not supported',
      '100': 'Invalid phone number format',
      '2': 'Temporary blocking of a user'
    }
    
    return errorCodes[code] || `Meta API Error Code: ${code}`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-50 border-green-200'
      case 'delivered': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'read': return 'text-teal-600 bg-teal-50 border-teal-200'
      case 'failed': return 'text-red-600 bg-red-50 border-red-200'
      case 'queued': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(status)}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {status} Messages
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed tracking and error analysis
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
              <span className="ml-4 text-gray-600">Loading messages...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-lg font-semibold mb-2">Error Loading Messages</div>
              <div className="text-gray-600">{error}</div>
              <button
                onClick={fetchMessages}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <div className="text-gray-500 text-lg">No {status} messages found</div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Message Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(message.status)}`}>
                        {message.status.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {message.recipientName || 'Unknown'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                          +{message.recipientPhone}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>ID: {message.waMessageId || 'N/A'}</div>
                      <div>{formatTimestamp(message.createdAt)}</div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Message Content:</div>
                    {message.messageType === 'template' ? (
                      <div>
                        <div className="font-medium">Template: {message.content.templateName}</div>
                        {message.content.templateParams && message.content.templateParams.length > 0 && (
                          <div className="text-sm text-gray-600 mt-1">
                            Params: {message.content.templateParams.join(', ')}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="break-words">{message.content.text}</div>
                    )}
                  </div>

                  {/* Error Details (for failed messages) */}
                  {message.status === 'failed' && (message.errorCode || message.errorMessage) && (
                    <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="text-red-700 dark:text-red-400 font-semibold mb-2 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Error Details
                      </div>
                      {message.errorCode && (
                        <div className="mb-2">
                          <span className="font-medium">Error Code:</span> {message.errorCode}
                        </div>
                      )}
                      {message.errorCode && (
                        <div className="mb-2 text-sm">
                          <span className="font-medium">Description:</span> {getErrorCodeDescription(message.errorCode)}
                        </div>
                      )}
                      {message.errorMessage && (
                        <div>
                          <span className="font-medium">Message:</span> {message.errorMessage}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Status Timeline:</div>
                    <div className="space-y-2">
                      {message.statusUpdates.map((update, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          {getStatusIcon(update.status)}
                          <span className="font-medium capitalize">{update.status}</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {formatTimestamp(update.timestamp)}
                          </span>
                          {update.errorCode && (
                            <>
                              <span className="text-gray-500">•</span>
                              <span className="text-red-600 text-xs">
                                Error {update.errorCode}
                              </span>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                    {message.sentAt && (
                      <div>
                        <div className="font-medium">Sent</div>
                        <div>{formatTimestamp(message.sentAt)}</div>
                      </div>
                    )}
                    {message.deliveredAt && (
                      <div>
                        <div className="font-medium">Delivered</div>
                        <div>{formatTimestamp(message.deliveredAt)}</div>
                      </div>
                    )}
                    {message.readAt && (
                      <div>
                        <div className="font-medium">Read</div>
                        <div>{formatTimestamp(message.readAt)}</div>
                      </div>
                    )}
                    {message.failedAt && (
                      <div>
                        <div className="font-medium">Failed</div>
                        <div>{formatTimestamp(message.failedAt)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {messages.length} {status} messages
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}