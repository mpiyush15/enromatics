"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import useAuth from "@/hooks/useAuth";
import UpgradeRequired from "@/components/UpgradeRequired";

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

// Memoized Messages Display Component - Only updates when messages or selectedConversation changes
const MessagesDisplay = React.memo(function MessagesDisplay({
  messages,
  messagesLoading,
  selectedConversation,
  replyText,
  sending,
  templates,
  templatesLoading,
  onReplyChange,
  onSendReply,
  onTemplateSelect,
  conversations,
  getDisplayName,
  formatTime,
  renderMessageContent
}: {
  messages: InboxMessage[];
  messagesLoading: boolean;
  selectedConversation: string | null;
  replyText: string;
  sending: boolean;
  templates: any[];
  templatesLoading: boolean;
  onReplyChange: (text: string) => void;
  onSendReply: (type?: string, template?: any) => void;
  onTemplateSelect: (template: any) => void;
  conversations: Conversation[];
  getDisplayName: (conv: Conversation) => string;
  formatTime: (ts: string) => string;
  renderMessageContent: (msg: any) => React.ReactNode;
}) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 0);
    }
  }, [messages]);

  if (!selectedConversation) {
    return (
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
    );
  }

  return (
    <>
      {/* Messages Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
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
              <div
                key={message._id}
                className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isOutgoing
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  {renderMessageContent(message)}
                  <p className={`text-xs mt-1 ${isOutgoing ? 'text-green-100' : 'text-gray-500'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => onReplyChange(e.target.value)}
            placeholder="Type your reply..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            onKeyPress={(e) => e.key === 'Enter' && !sending && onSendReply()}
            disabled={sending}
          />
          
          {/* Template Dropdown */}
          {templates.length > 0 && (
            <select
              onChange={(e) => {
                if (e.target.value) {
                  const selectedTemplate = templates.find((t: any) => t.name === e.target.value);
                  if (selectedTemplate) {
                    onTemplateSelect(selectedTemplate);
                  }
                  e.target.value = '';
                }
              }}
              disabled={sending || templatesLoading}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              title="Send an approved template message"
            >
              <option value="">📋 Templates ({templates.length})</option>
              {templates.map((template: any) => (
                <option key={template.name} value={template.name}>
                  {template.name} {template.variables?.length > 0 && `(${template.variables.length} params)`}
                </option>
              ))}
            </select>
          )}
          
          {/* Fallback: Simple Template Button */}
          {templates.length === 0 && (
            <button
              onClick={() => onSendReply('template', { name: 'hello_world' })}
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title="Send template message (works anytime)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Template
            </button>
          )}
          
          <button
            onClick={() => onSendReply()}
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
  );
});

export default function WhatsAppInboxPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const { user, loading: authLoading } = useAuth();
  const { hasFeature, loading: featureLoading } = useFeatureGate();
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
  const [templates, setTemplates] = useState<any[]>([]); // New: store approved templates
  const [templatesLoading, setTemplatesLoading] = useState(false); // New: loading state for templates
  
  const lastSyncRef = React.useRef<string>(new Date().toISOString());

  // SuperAdmin or user with WABA feature
  const isSuperAdmin = user?.role === 'SuperAdmin';

  // Smart polling state: only refresh when user is active
  const [isUserActive, setIsUserActive] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const inactivityTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const refreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);
  
  // Config: how long before we consider user inactive (5 minutes)
  const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  // Config: polling interval when user is active (10 seconds - increased from 2)
  const ACTIVE_POLL_INTERVAL = 10 * 1000; // 10 seconds

  // Track user activity (mouse, keyboard, scroll, touch)
  useEffect(() => {
    const handleActivity = () => {
      setIsUserActive(true);
      setLastActivityTime(Date.now());
      
      // Clear existing inactivity timeout
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      
      // Set new inactivity timeout
      inactivityTimeoutRef.current = setTimeout(() => {
        console.log('⏸️ User inactive - pausing inbox polling');
        setIsUserActive(false);
      }, INACTIVITY_THRESHOLD);
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  // Handle page visibility (pause polling when tab is not visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('📵 Tab hidden - pausing inbox polling');
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = null;
        }
      } else {
        console.log('📱 Tab visible - resuming inbox polling');
        setIsUserActive(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Memoize conversation selection handler to prevent re-renders
  const handleSelectConversation = useCallback((conversationId: string) => {
    if (selectedConversation !== conversationId) {
      setSelectedConversation(conversationId);
    }
  }, [selectedConversation]);


  // Optimized real-time sync: Only fetch and update new/changed conversations
  const syncConversationsIncremental = async () => {
    try {
      const response = await fetch(
        `/api/whatsapp/inbox/conversations?since=${encodeURIComponent(lastSyncRef.current)}`,
        { credentials: 'include' }
      );
      
      if (!response.ok) return;
      
      const data = await response.json();
      if (data.success && data.conversations.length > 0) {
        let hasChangedConversations = false;
        
        // Update only conversations that have changed
        setConversations(prev => {
          const conversationMap = new Map(prev.map(c => [c.conversationId, c]));
          data.conversations.forEach((newConv: Conversation) => {
            const oldConv = conversationMap.get(newConv.conversationId);
            // Check if message count or last message time changed
            if (!oldConv || oldConv.unreadCount !== newConv.unreadCount || oldConv.lastMessageTime !== newConv.lastMessageTime) {
              hasChangedConversations = true;
            }
            conversationMap.set(newConv.conversationId, newConv);
          });
          return Array.from(conversationMap.values());
        });
        
        // Update stats
        const statsRes = await fetch(`/api/whatsapp/inbox/stats`, {
          credentials: 'include'
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }
        
        // Update last sync time
        lastSyncRef.current = new Date().toISOString();
        
        // If viewing a conversation and it has new messages, refresh immediately
        if (selectedConversation && hasChangedConversations) {
          const updatedConv = data.conversations.find(
            (c: Conversation) => c.conversationId === selectedConversation
          );
          if (updatedConv) {
            console.log('🔄 New message detected in selected conversation, auto-fetching...');
            // Use a small delay to ensure state updates are processed
            setTimeout(() => {
              fetchConversationMessages(selectedConversation, true);
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('Incremental sync failed:', error);
    }
  };

  useEffect(() => {
    // Initial load (run once)
    fetchInboxData(true);
    fetchApprovedTemplates();

    // Set up smart polling: only poll when user is active AND tab is visible
    const setupPolling = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }

      if (!isUserActive || document.hidden) {
        console.log('⏸️ Polling paused - user inactive or tab hidden');
        return;
      }

      console.log('▶️ Starting smart polling (every 10 seconds)');
      refreshIntervalRef.current = setInterval(() => {
        if (isUserActive && !document.hidden) {
          console.log('🔄 Smart sync - polling active inbox');
          syncConversationsIncremental();
        }
      }, ACTIVE_POLL_INTERVAL);
    };

    setupPolling();

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [isUserActive]);

  // Manual refresh button handler
  const handleManualRefresh = useCallback(async () => {
    console.log('🔁 Manual refresh triggered');
    await fetchInboxData(false);
    await syncConversationsIncremental();
  }, []);

  // New: Fetch approved templates from backend
  const fetchApprovedTemplates = async () => {
    try {
      setTemplatesLoading(true);
      const response = await fetch('/api/whatsapp/templates', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn('Failed to fetch templates:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.success && data.templates) {
        console.log('📋 Fetched approved templates:', data.templates);
        // Filter only approved templates (case-insensitive)
        const approvedTemplates = data.templates.filter((t: any) => t.status?.toLowerCase() === 'approved');
        setTemplates(approvedTemplates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    // When filter changes, only update conversations without full page reload
    if (conversations.length > 0) {
      fetchInboxData(false); // Filter change - no loading screen
    }
  }, [filter]);

  // Messages auto-scroll handled inside the memoized MessagesDisplay component

  // Auto-select most recent conversation on initial load
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      // Auto-select the first (most recent) conversation
      const mostRecentConversation = conversations[0];
      setSelectedConversation(mostRecentConversation.conversationId);
      console.log('📌 Auto-selected most recent conversation:', mostRecentConversation.conversationId);
    }
  }, [conversations, selectedConversation]);

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
        fetch(`/api/whatsapp/inbox/conversations?unreadOnly=${filter === 'unread'}`, {
          credentials: 'include'
        }),
        fetch(`/api/whatsapp/inbox/stats`, {
          credentials: 'include'
        })
      ]);

      if (!conversationsRes.ok) {
        console.error('Conversations API error:', conversationsRes.status, conversationsRes.statusText);
      }
      if (!statsRes.ok) {
        console.error('Stats API error:', statsRes.status, statsRes.statusText);
      }

      const conversationsData = conversationsRes.ok ? await conversationsRes.json() : { conversations: [] };
      const statsData = statsRes.ok ? await statsRes.json() : { stats: null };

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

  const fetchConversationMessages = useCallback(async (conversationId: string, silent: boolean = false) => {
    try {
      // Use separate loading state for messages to avoid full page reload
      if (!silent) setMessagesLoading(true);
      
      // Load last 50 messages only (not full history) - limit=50 gets most recent
      const response = await fetch(
        `/api/whatsapp/inbox/conversation/${conversationId}?limit=50`,
        { credentials: 'include' }
      );
      
      const data = await response.json();
      if (data.success) {
        console.log('📥 Fetched messages for conversation:', {
          conversationId,
          count: data.messages.length,
          firstMsg: data.messages[0] ? new Date(data.messages[0].createdAt || data.messages[0].timestamp).toLocaleString() : null,
          lastMsg: data.messages[data.messages.length - 1] ? new Date(data.messages[data.messages.length - 1].createdAt || data.messages[data.messages.length - 1].timestamp).toLocaleString() : null
        });

        // Batch all state updates to minimize re-renders
        const conversation = conversations.find(c => c.conversationId === conversationId);
        const unreadCount = conversation?.unreadCount || 0;
        
        // ALWAYS update messages - don't skip even if silent
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          // MessagesDisplay component will auto-scroll to bottom when messages change
        }
        
        // Update conversation unread count
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
      } else {
        console.error('Failed to fetch messages - success is false:', data);
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error);
      if (!silent) {
        alert('Failed to load messages. Please try again.');
      }
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  }, [setMessages, setConversations, setStats, stats]);

  const sendReply = async (messageType: string = 'text', templateNameOrObj: string | any = null) => {
    if (!selectedConversation || (!replyText.trim() && !templateNameOrObj)) return;

    try {
      setSending(true);
      
      let requestBody: any;
      
      if (messageType === 'template' && templateNameOrObj) {
        // Handle both legacy string format and new object format
        let templateName: string;
        let templateParams: string[] = [];
        let templateVariables: string[] = [];
        
        if (typeof templateNameOrObj === 'string') {
          // Legacy: just template name
          templateName = templateNameOrObj;
        } else {
          // New: template object with full metadata
          templateName = templateNameOrObj.name;
          templateVariables = templateNameOrObj.variables || [];
          
          console.log('📋 Template selected:', {
            name: templateName,
            hasVariables: templateVariables.length > 0,
            variableCount: templateVariables.length,
            variables: templateVariables
          });
          
          // If template has variables, we need to get values
          if (templateVariables.length > 0) {
            console.log(`⚠️  Template has ${templateVariables.length} variables - auto-filling from contact`);
            
            // Get contact details from the selected conversation
            const selectedConv = conversations.find(c => c.conversationId === selectedConversation);
            const contactName = selectedConv?.senderName || selectedConv?.senderProfileName || 'User';
            const contactPhone = selectedConv?.senderPhone || '';
            
            console.log('📞 Contact details:', { contactName, contactPhone });
            
            // Auto-fill template parameters from contact data
            const autoFilledParams: string[] = [];
            for (let i = 0; i < templateVariables.length; i++) {
              let paramValue = '';
              
              // Smart auto-fill based on variable position/name
              // Variable {{1}} → contact name
              // Variable {{2}} → school/organization (ask user)
              // etc.
              if (i === 0) {
                // First variable → use contact name
                paramValue = contactName;
              } else if (i === 1) {
                // Second variable → might be school name, ask user
                paramValue = prompt(
                  `Enter value for parameter ${i + 1}${templateVariables[i] ? ` (${templateVariables[i]})` : ''}:`,
                  `Value${i + 1}`
                ) || `Value${i + 1}`;
              } else {
                // Other variables → ask user
                paramValue = prompt(
                  `Enter value for parameter ${i + 1}${templateVariables[i] ? ` (${templateVariables[i]})` : ''}:`,
                  `Value${i + 1}`
                ) || `Value${i + 1}`;
              }
              
              if (paramValue) {
                autoFilledParams.push(paramValue);
              }
            }
            
            templateParams = autoFilledParams;
            
            console.log('✅ Parameters auto-filled:', {
              template: templateName,
              variables: templateVariables.length,
              params: templateParams,
              autoFilled: [contactName, ...templateParams.slice(1)]
            });
          } else {
            console.log(`✅ Template has NO variables - sending without parameters`);
          }
        }
        
        requestBody = {
          messageType: 'template',
          templateName: templateName,
          templateParams: templateParams,
          message: `Template: ${templateName}`
        };
        
        console.log('📤 Sending template with params:', {
          templateName,
          paramCount: templateParams.length,
          params: templateParams
        });
      } else {
        requestBody = {
          message: replyText,
          messageType: 'text'
        };
      }

      const response = await fetch(
        `/api/whatsapp/inbox/conversation/${selectedConversation}/reply`,
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
        
        // Get template name for display
        let displayTemplateName = '';
        if (messageType === 'template' && templateNameOrObj) {
          displayTemplateName = typeof templateNameOrObj === 'string' 
            ? templateNameOrObj 
            : templateNameOrObj.name;
        }
        
        // Add the sent message to local state immediately for better UX
        const newMessage: InboxMessage = {
          _id: `temp_${Date.now()}`,
          waMessageId: data.waMessageId || `temp_${Date.now()}`,
          senderPhone: 'You',
          senderName: 'You',
          displayName: 'You',
          messageType: messageType,
          content: displayTemplateName ? { text: `Template: ${displayTemplateName}` } : { text: replyText },
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
        // Retry sending - pass the original template object if it was a template message
        setTimeout(() => sendReply(messageType, templateNameOrObj), 1000);
      }
    } finally {
      setSending(false);
    }
  };
    // Keep a ref to the latest sendReply so we can provide a stable callback
    // to the memoized MessagesDisplay component (avoids re-renders due to
    // changing function identity).
    const sendReplyRef = React.useRef(sendReply);
    React.useEffect(() => {
      sendReplyRef.current = sendReply;
    }, [sendReply]);

    const onSendReply = useCallback((type?: string, template?: any) => {
      return sendReplyRef.current(type, template);
    }, []);

    const onTemplateSelect = useCallback((template: any) => {
      return onSendReply('template', template);
    }, [onSendReply]);

    const onReplyChange = useCallback((text: string) => setReplyText(text), []);

    const formatTime = useCallback((timestamp: string) => {
      return new Date(timestamp).toLocaleString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }, []);

    const getDisplayName = useCallback((conversation: Conversation) => {
      return conversation.senderName ||
             conversation.senderProfileName ||
             `+${conversation.senderPhone}`;
    }, []);

    const renderMessageContent = useCallback((message: any) => {
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
    }, []);

  // Check feature access - AFTER all hooks, BEFORE render
  if (authLoading || featureLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Checking access...</p>
        </div>
      </div>
    );
  }

  // SuperAdmin always has access, tenants need WABA feature
  if (!isSuperAdmin && !hasFeature("waba")) {
    return (
      <UpgradeRequired 
        featureName="WhatsApp Inbox" 
        description="View and respond to all your WhatsApp conversations in one place. Manage student inquiries, send templates, and track message status. Upgrade to Pro or Enterprise plan to unlock this feature."
      />
    );
  }

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 shadow-lg flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">WhatsApp Inbox</h1>
                <p className="text-green-100">Manage incoming messages</p>
              </div>
            </div>
            
            {stats && (
              <div className="flex gap-6 items-center text-white">
                <div className="flex gap-4">
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

                {/* Activity Status Indicator */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${isUserActive && !document.hidden ? 'bg-green-300' : 'bg-yellow-300'}`}></div>
                  <span className="text-sm text-green-100">
                    {isUserActive && !document.hidden ? 'Polling Active' : 'Paused'}
                  </span>
                </div>

                {/* Manual Refresh Button */}
                <button
                  onClick={handleManualRefresh}
                  disabled={loading}
                  className="px-4 py-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  title="Manually refresh inbox data"
                >
                  <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Takes remaining vertical space */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* Conversations Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
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

            {/* Conversations List - Scrollable */}
            <div className="overflow-y-auto flex-1">
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
                        onClick={() => handleSelectConversation(conversation.conversationId)}
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

          {/* Messages Area - Memoized Component */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <MessagesDisplay
              messages={messages}
              messagesLoading={messagesLoading}
              selectedConversation={selectedConversation}
              replyText={replyText}
              sending={sending}
              templates={templates}
              templatesLoading={templatesLoading}
              onReplyChange={onReplyChange}
              onSendReply={onSendReply}
              onTemplateSelect={onTemplateSelect}
              conversations={conversations}
              getDisplayName={getDisplayName}
              formatTime={formatTime}
              renderMessageContent={renderMessageContent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
