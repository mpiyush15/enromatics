"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface InboxMessage {
  _id: string;
  waMessageId: string;
  senderPhone: string;
  senderName?: string;
  senderProfileName?: string;
  displayName: string;
  messageType: string;
  content: {
    text?: string;
    mediaUrl?: string;
    mediaType?: string;
    caption?: string;
    buttonText?: string;
    listTitle?: string;
    reactionEmoji?: string;
    contacts?: Array<{
      name: string;
      phone: string;
    }>;
  };
  timestamp: string;
  isRead: boolean;
  replied: boolean;
  conversationId: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  senderPhone: string;
  senderName?: string;
  senderProfileName?: string;
  lastMessageType: string;
  lastMessageContent: any;
  lastMessageTime: string;
  unreadCount: number;
  totalMessages: number;
}

interface InboxStats {
  totalMessages: number;
  unreadMessages: number;
  repliedMessages: number;
  todayMessages: number;
  uniqueConversations: number;
  responseRate: string;
}

export default function WhatsAppInboxPage() {
  const { tenantId } = useParams();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [stats, setStats] = useState<InboxStats | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchInboxData(true); // Initial load
  }, []);

  useEffect(() => {
    // When filter changes, only update conversations without full page reload
    if (conversations.length > 0) {
      fetchInboxData(false); // Filter change - no loading screen
    }
  }, [filter]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      fetchConversationMessages(selectedConversation);
    }
  }, [selectedConversation]);

  const fetchInboxData = async (isInitialLoad: boolean = false) => {
    try {
      // Only show full loading for initial page load
      if (isInitialLoad) {
        setLoading(true);
      }
      
      // Fetch conversations and stats in parallel
      const [conversationsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/whatsapp/inbox/conversations?unreadOnly=${filter === 'unread'}`, {
          credentials: 'include'
        }),
        fetch(`${API_BASE_URL}/api/whatsapp/inbox/stats`, {
          credentials: 'include'
        })
      ]);

      const conversationsData = await conversationsRes.json();
      const statsData = await statsRes.json();

      // Batch state updates to prevent multiple re-renders
      if (conversationsData.success && statsData.success) {
        // Use functional updates to prevent race conditions
        setConversations(conversationsData.conversations);
        setStats(statsData.stats);
      } else {
        if (conversationsData.success) {
          setConversations(conversationsData.conversations);
        }
        if (statsData.success) {
          setStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch inbox data:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  const fetchConversationMessages = async (conversationId: string, silent: boolean = false) => {
    try {
      // Use separate loading state for messages to avoid full page reload
      if (!silent) setMessagesLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/whatsapp/inbox/conversation/${conversationId}?limit=100`,
        { credentials: 'include' }
      );
      
      const data = await response.json();
      if (data.success) {
        // Batch all state updates to minimize re-renders
        const conversation = conversations.find(c => c.conversationId === conversationId);
        const unreadCount = conversation?.unreadCount || 0;
        
        // Update all related states in one batch
        setMessages(data.messages);
        setConversations(prev => prev.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        ));
        
        // Update stats only if there were unread messages
        if (stats && unreadCount > 0) {
          setStats(prev => prev ? {
            ...prev,
            unreadMessages: Math.max(0, prev.unreadMessages - unreadCount)
          } : null);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  const sendReply = async (messageType: string = 'text', templateName: string | null = null) => {
    if (!selectedConversation || (!replyText.trim() && !templateName)) return;

    try {
      setSending(true);
      const requestBody = templateName ? {
        messageType: 'template',
        templateName: templateName,
        templateParams: [] // Add parameters if needed
      } : {
        message: replyText,
        messageType: 'text'
      };

      const response = await fetch(
        `${API_BASE_URL}/api/whatsapp/inbox/conversation/${selectedConversation}/reply`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        }
      );

      const data = await response.json();
      if (data.success) {
        setReplyText('');
        
        // Add the sent message to local state immediately for better UX
        const newMessage: InboxMessage = {
          _id: `temp_${Date.now()}`,
          waMessageId: data.waMessageId || `temp_${Date.now()}`,
          senderPhone: 'You',
          senderName: 'You',
          displayName: 'You',
          messageType: messageType,
          content: templateName ? { text: `Template: ${templateName}` } : { text: replyText },
          timestamp: new Date().toISOString(),
          isRead: true,
          replied: false,
          conversationId: selectedConversation,
          createdAt: new Date().toISOString()
        };
        
        // Batch state updates to minimize re-renders
        setMessages(prev => [...prev, newMessage]);
        setConversations(prev => prev.map(conv => 
          conv.conversationId === selectedConversation 
            ? { ...conv, unreadCount: 0, lastMessageTime: new Date().toISOString() }
            : conv
        ));
        
        // Only refresh conversation messages in background to get the real message ID
        // Use shorter timeout for better perceived performance
        setTimeout(() => {
          fetchConversationMessages(selectedConversation, true); // Silent refresh
        }, 500);
        
      } else {
        // Show user-friendly error message
        let errorMessage = data.message || 'Failed to send reply';
        
        // Handle specific error cases
        if (errorMessage.includes('24 hour')) {
          errorMessage = 'Cannot send message: 24-hour messaging window expired. The customer needs to send a message first, or you need to use an approved template message.';
        } else if (errorMessage.includes('template')) {
          errorMessage = 'Message failed: You need approved template messages to send to this number. Create templates in WhatsApp settings.';
        } else if (errorMessage.includes('campaign')) {
          errorMessage = 'System error: Invalid message type. Please try again.';
        }
        
        // Use a more professional alert or notification
        if (confirm(`❌ ${errorMessage}\n\nWould you like to try sending a template message instead?`)) {
          // TODO: Open template selector
          console.log('User wants to send template message');
        }
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      const errorMessage = 'Network error: Could not send reply. Please check your internet connection and try again.';
      if (confirm(`❌ ${errorMessage}\n\nWould you like to retry?`)) {
        // Retry sending
        setTimeout(() => sendReply(messageType, templateName), 1000);
      }
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDisplayName = (conversation: Conversation) => {
    return conversation.senderName || 
           conversation.senderProfileName || 
           `+${conversation.senderPhone}`;
  };

  const renderMessageContent = (message: any) => {
    const { content, messageType } = message;
    
    switch (messageType) {
      case 'text':
        return <p className="text-gray-800 dark:text-gray-200">{content.text}</p>;
      
      case 'template':
        return (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium">Template: {content.templateName}</p>
            {content.templateParams && content.templateParams.length > 0 && (
              <p className="text-xs text-green-600 mt-1">
                Params: {content.templateParams.join(', ')}
              </p>
            )}
          </div>
        );
      
      case 'image':
        return (
          <div>
            {content.mediaUrl && (
              <img src={content.mediaUrl} alt="Image" className="max-w-xs rounded-lg mb-2" />
            )}
            {content.caption && <p className="text-sm text-gray-600">{content.caption}</p>}
          </div>
        );
      
      case 'document':
        return (
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Document</span>
          </div>
        );
      
      case 'audio':
        return (
          <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-sm">Voice Message</span>
          </div>
        );
      
      case 'interactive':
        return (
          <div className="p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: {content.buttonText || content.listTitle}
            </p>
          </div>
        );
      
      case 'reaction':
        return (
          <div className="text-2xl">
            {content.reactionEmoji} <span className="text-sm text-gray-600">reacted</span>
          </div>
        );
      
      default:
        return <p className="text-gray-500 italic">Unsupported message type: {messageType}</p>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">WhatsApp Inbox</h1>
                <p className="text-green-100">Manage incoming messages</p>
              </div>
            </div>
            
            {stats && (
              <div className="flex gap-4 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.unreadMessages}</div>
                  <div className="text-sm text-green-100">Unread</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.uniqueConversations}</div>
                  <div className="text-sm text-green-100">Conversations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.responseRate}</div>
                  <div className="text-sm text-green-100">Response Rate</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            {/* Conversations Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Conversations
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilter('all')}
                    className={`px-3 py-1 text-sm rounded-lg font-medium ${
                      filter === 'all'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilter('unread')}
                    className={`px-3 py-1 text-sm rounded-lg font-medium ${
                      filter === 'unread'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Unread
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Conversations List */}
            <div className="overflow-y-auto h-full">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💬</div>
                  <p className="text-gray-500">No conversations found</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Messages will appear here when customers contact you
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {conversations
                    .filter(conv => 
                      !searchQuery || 
                      getDisplayName(conv).toLowerCase().includes(searchQuery.toLowerCase()) ||
                      conv.senderPhone.includes(searchQuery)
                    )
                    .map((conversation) => (
                      <button
                        key={conversation.conversationId}
                        onClick={() => {
                          // Only change if different conversation is selected
                          if (selectedConversation !== conversation.conversationId) {
                            setSelectedConversation(conversation.conversationId);
                          }
                        }}
                        className={`w-full p-3 text-left rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          selectedConversation === conversation.conversationId
                            ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-600'
                            : 'border-l-4 border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 dark:text-white truncate">
                                {getDisplayName(conversation)}
                              </p>
                              {conversation.unreadCount > 0 && (
                                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              +{conversation.senderPhone}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
                              {conversation.lastMessageType === 'text' 
                                ? conversation.lastMessageContent?.text || 'Message'
                                : `[${conversation.lastMessageType.toUpperCase()}]`
                              }
                            </p>
                          </div>
                          <div className="text-xs text-gray-400 ml-2">
                            {formatTime(conversation.lastMessageTime)}
                          </div>
                        </div>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {messages.length > 0 && getDisplayName({
                          senderName: messages[0].senderName,
                          senderProfileName: messages[0].senderProfileName,
                          senderPhone: messages[0].senderPhone
                        } as Conversation)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        +{messages.length > 0 && messages[0].senderPhone}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {messages.length} messages
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Loading messages...</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message: any) => {
                    const isOutgoing = message.direction === 'outbound' || message.senderPhone === 'You';
                    
                    return (
                      <div key={message._id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md rounded-lg p-3 ${
                          isOutgoing 
                            ? 'bg-green-500 text-white ml-12' 
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mr-12'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className={`text-xs font-medium ${
                              isOutgoing 
                                ? 'text-green-100' 
                                : 'text-blue-600 dark:text-blue-400'
                            }`}>
                              {isOutgoing ? 'You' : (message.displayName || `+${message.senderPhone}`)}
                            </span>
                            <span className={`text-xs ml-2 ${
                              isOutgoing 
                                ? 'text-green-200' 
                                : 'text-gray-500'
                            }`}>
                              {formatTime(message.timestamp || message.createdAt)}
                            </span>
                          </div>
                          
                          <div className={isOutgoing ? 'text-white' : ''}>
                            {renderMessageContent(message)}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            {isOutgoing && message.status && (
                              <span className={`text-xs ${
                                message.status === 'sent' ? 'text-green-200' :
                                message.status === 'delivered' ? 'text-green-100' :
                                message.status === 'read' ? 'text-green-100' :
                                message.status === 'failed' ? 'text-red-200' :
                                'text-green-200'
                              }`}>
                                {message.status === 'sent' && '✓'}
                                {message.status === 'delivered' && '✓✓'}
                                {message.status === 'read' && '✓✓'}
                                {message.status === 'failed' && '✗'}
                                {' '}{message.status}
                              </span>
                            )}
                            {!isOutgoing && message.isRead && (
                              <span className="text-xs text-green-600">✓ Read</span>
                            )}
                            {!isOutgoing && message.replied && (
                              <span className="text-xs text-blue-600">↩ Replied</span>
                            )}
                          </div>
                        </div>
                      </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>                {/* Reply Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onKeyPress={(e) => e.key === 'Enter' && !sending && sendReply()}
                      disabled={sending}
                    />
                    <button
                      onClick={() => sendReply('template', 'hello_world')}
                      disabled={sending}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      title="Send template message (works anytime)"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Template
                    </button>
                    <button
                      onClick={() => sendReply()}
                      disabled={!replyText.trim() || sending}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Send
                        </>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    💡 Use "Template" button if regular messages fail due to 24-hour rule
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a conversation from the list to view messages and reply
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}