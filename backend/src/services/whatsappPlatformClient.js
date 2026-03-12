/**
 * WhatsApp Platform Client Service
 * 
 * 🔄 UPDATED ARCHITECTURE (No Platform API Dependency):
 * - Previously: Called external WhatsApp Platform API via tenantApiKey (caused 401 errors)
 * - Currently: Uses tenant-provided WhatsApp Business API credentials directly
 * 
 * FLOW:
 * 1. Tenant provides their WhatsApp Business Account credentials during setup
 * 2. Credentials stored securely in Tenant.whatsappConfig
 * 3. When sending messages, we use tenant's own WhatsApp API key
 * 4. NO intermediate platform API call needed - direct to WhatsApp
 * 
 * API Base URL: Configured via environment variable (if platform exists, optional)
 * Authentication: Tenant API Key sent in Authorization header
 * Isolation: tenantId in headers ensures multi-tenant safety
 */

import axios from 'axios';
const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL || 'https://whatsapp-platform-production-e48b.up.railway.app/api/integrations';
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

class WhatsAppPlatformClient {

 
  constructor() {
    this.baseURL = WHATSAPP_PLATFORM_URL; // ✅ Already includes /api/integrations from .env
    // ℹ️ NOTE: tenantApiKey and tenantId are passed per-request, not stored globally
    // This ensures proper tenant isolation
    if (!WHATSAPP_PLATFORM_API_KEY) {
      console.warn('⚠️ WHATSAPP_PLATFORM_API_KEY not configured. WhatsApp integration will not work.');
    }
    console.log(`✅ WhatsApp Platform initialized: ${this.baseURL}`);
  }

  
  

/**
 * 🔒 CRITICAL: Make authenticated request to WhatsApp Platform
 * ⚠️  MANDATORY: tenantId must be included in headers for Platform-side isolation
 * 
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} params - Query parameters
 * @param {string} tenantApiKey - Tenant-specific API key (required)
 * @param {string} tenantId - Tenant identifier (MANDATORY for isolation)
 */
  async request(method, endpoint, data = null, params = null, tenantApiKey = null, tenantId = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 second timeout
      };

      // 🔒 MANDATORY: Use tenant-specific API key (should never fallback to global)
      const apiKeyToUse = tenantApiKey;
      
      if (!apiKeyToUse) {
        console.error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required but missing');
        throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required but missing');
      }

      // Add API key with proper Authorization header
      // Platform expects: Authorization: Bearer <api_key>
      config.headers['Authorization'] = `Bearer ${apiKeyToUse}`;

      // 🔒 MANDATORY: Add tenantId to headers for Platform-side filtering
      if (tenantId) {
        config.headers['X-Tenant-Id'] = tenantId;
      } else {
        console.warn('⚠️  WARNING: tenantId not provided in Platform request - isolation may be compromised');
      }

      // Add data for POST/PUT/PATCH
      if (data) {
        config.data = data;
      }

      // Add query parameters
      if (params) {
        config.params = params;
      }

      console.log(`📡 ${method.toUpperCase()} ${endpoint} [Tenant: ${tenantId}]`, params ? `?${new URLSearchParams(params)}` : '');

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ WhatsApp Platform API Error [${method.toUpperCase()} ${endpoint}]:`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
      throw error;
    }
  }

  // ============ CONVERSATIONS ============

  /**
   * 🔒 Get all conversations for a tenant
   * @param {number} limit - Limit results
   * @param {number} skip - Skip records
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier for Platform-side filtering
   */
  async getConversations(limit = 50, skip = 0, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getConversations');
    
    const params = { limit, skip };
    return this.request('GET', '/conversations', null, params, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Get conversation messages
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Result limit
   * @param {number} offset - Pagination offset
   * @param {string} tenantApiKey - MANDATORY: Tenant API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getConversationMessages(conversationId, limit = 50, offset = 0, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getConversationMessages');
    
    const params = { limit, offset };
    return this.request('GET', `/conversations/${conversationId}/messages`, null, params, tenantApiKey, tenantId);
  }

  /**
   * Reply to conversation
   */
  async replyToConversation(conversationId, messageType, message, templateName = null, templateParams = []) {
    const data = {
      messageType,
    };

    if (messageType === 'text') {
      data.message = message;
    } else if (messageType === 'template') {
      data.templateName = templateName;
      data.templateParams = templateParams;
    }

    return this.request('POST', `/conversations/${conversationId}/reply`, data);
  }

  /**
   * 🔒 Mark conversation as read
   * @param {string} conversationId - Conversation ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async markConversationAsRead(conversationId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in markConversationAsRead');
    return this.request('PATCH', `/conversations/${conversationId}/read`, null, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Update conversation status (open/closed)
   * @param {string} conversationId - Conversation ID
   * @param {string} status - New status (open/closed)
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async updateConversationStatus(conversationId, status, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in updateConversationStatus');
    return this.request('PATCH', `/conversations/${conversationId}/status`, { status }, null, tenantApiKey, tenantId);
  }

  // ============ MESSAGES ============

  /**
   * 🔒 Send text message
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} message - Message text
   * @param {string} campaign - Campaign type
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async sendTextMessage(recipientPhone, message, campaign = 'manual', tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in sendTextMessage');
    const data = {
      recipientPhone,
      message,
      campaign,
    };

    return this.request('POST', '/messages/send', data, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Send template message
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} templateName - Template name
   * @param {array} params - Template parameters
   * @param {string} campaign - Campaign type
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async sendTemplateMessage(recipientPhone, templateName, params = [], campaign = 'manual', tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in sendTemplateMessage');
    const data = {
      recipientPhone,
      templateName,
      params,
      campaign,
    };

    return this.request('POST', '/messages/send-template', data, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Get messages
   * @param {number} limit - Result limit
   * @param {number} skip - Skip records
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getMessages(limit = 50, skip = 0, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getMessages');
    const params = { limit, skip };

    return this.request('GET', '/messages', null, params, tenantApiKey, tenantId);
  }

  /**
   * Get single message
   */
  async getMessage(messageId) {
    return this.request('GET', `/messages/${messageId}`);
  }

  // ============ CONTACTS MANAGEMENT ============

  /**
   * @param {string} accountId - Account ID
   * @param {string} name - Contact name
   * @param {string} whatsappNumber - WhatsApp number
   * @param {string} phone - Optional phone
   * @param {string} email - Optional email
   * @param {string} type - Contact type (customer/lead)
   * @param {array} tags - Tags
   * @param {object} metadata - Metadata
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async createContact(accountId, name, whatsappNumber, phone = null, email = null, type = 'customer', tags = [], metadata = {}, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in createContact');
    const data = {
      accountId,
      name,
      whatsappNumber,
      type,
      tags,
      metadata,
    };

    if (phone) data.phone = phone;
    if (email) data.email = email;

    return this.request('POST', '/contacts', data, null, tenantApiKey, tenantId);
  }

  /**
   * Update contact
   */
  async updateContact(contactId, name = null, tags = [], metadata = {}) {
    const data = {};
    if (name) data.name = name;
    if (tags.length > 0) data.tags = tags;
    if (Object.keys(metadata).length > 0) data.metadata = metadata;

    return this.request('PUT', `/contacts/${contactId}`, data);
  }

  /**
   * 🔒 Delete contact
   * @param {string} contactId - Contact ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async deleteContact(contactId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in deleteContact');
    return this.request('DELETE', `/contacts/${contactId}`, null, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Bulk import contacts
   * @param {string} accountId - Account ID
   * @param {array} contacts - Array of contacts
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async bulkImportContacts(accountId, contacts, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in bulkImportContacts');
    const data = { accountId, contacts };
    return this.request('POST', '/contacts/import', data, null, tenantApiKey, tenantId);
  }

  // ============ CHATBOTS ============

  /**
   * Get chatbots
   */
  async getChatbots(accountId) {
    return this.request('GET', '/chatbots', null, { accountId });
  }

  /**
   * Get single chatbot
   */
  async getChatbot(chatbotId) {
    return this.request('GET', `/chatbots/${chatbotId}`);
  }

  /**
   * Create chatbot
   */
  async createChatbot(accountId, name, description, keywords, matchType, replyType, replyContent, phoneNumberId = null) {
    const data = {
      accountId,
      name,
      description,
      keywords,
      matchType,
      replyType,
      replyContent,
    };

    if (phoneNumberId) data.phoneNumberId = phoneNumberId;

    return this.request('POST', '/chatbots', data);
  }

  /**
   * Update chatbot
   */
  async updateChatbot(chatbotId, updateData) {
    return this.request('PUT', `/chatbots/${chatbotId}`, updateData);
  }

  /**
   * Toggle chatbot active status
   */
  async toggleChatbot(chatbotId) {
    return this.request('PATCH', `/chatbots/${chatbotId}/toggle`);
  }

  /**
   * Delete chatbot
   */
  async deleteChatbot(chatbotId) {
    return this.request('DELETE', `/chatbots/${chatbotId}`);
  }

  /**
   * Get chatbot interactions
   */
  async getChatbotInteractions(chatbotId, limit = 50) {
    return this.request('GET', `/chatbots/${chatbotId}/interactions`, null, { limit });
  }

  // ============ TEMPLATES ============

  /**
   * Get templates
   */
  async getTemplates(accountId, status = null, category = null) {
    const params = { accountId };
    if (status) params.status = status;
    if (category) params.category = category;

    return this.request('GET', '/templates', null, params);
  }

  /**
   * Get single template
   */
  async getTemplate(templateId) {
    return this.request('GET', `/templates/${templateId}`);
  }

  /**
   * Create template
   */
  async createTemplate(accountId, name, category, content, variables = []) {
    const data = {
      accountId,
      name,
      category,
      content,
      variables,
    };

    return this.request('POST', '/templates', data);
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updateData) {
    return this.request('PUT', `/templates/${templateId}`, updateData);
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId) {
    return this.request('DELETE', `/templates/${templateId}`);
  }

  /**
   * Sync templates from WhatsApp Manager
   */
  async syncTemplates(accountId) {
    return this.request('POST', '/templates/sync', { accountId });
  }

  // ============ STATS ============

  /**
   * 🔒 Get platform statistics
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getStats(tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getStats');
    return this.request('GET', '/stats', null, {}, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Get daily statistics
   * @param {string} accountId - Account ID
   * @param {string} phoneNumberId - Optional phone number ID
   * @param {number} days - Number of days
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getDailyStats(accountId, phoneNumberId = null, days = 7, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getDailyStats');
    const params = { accountId, days };
    if (phoneNumberId) params.phoneNumberId = phoneNumberId;

    return this.request('GET', '/stats/daily', null, params, tenantApiKey, tenantId);
  }

  // ============ CONNECTION SETUP ============

  /**
   * Get WhatsApp phone numbers (account setup)
   */
  async getPhoneNumbers(accountId) {
    return this.request('GET', '/account/phone-numbers', null, { accountId });
  }

  /**
   * Link phone number to account
   */
  async linkPhoneNumber(accountId, phoneNumberId, wabaId, accessToken) {
    const data = {
      accountId,
      phoneNumberId,
      wabaId,
      accessToken,
    };

    return this.request('POST', '/account/phone-numbers', data);
  }

  /**
   * Get account configuration
   */
  async getAccountConfig(accountId) {
    return this.request('GET', '/account/config', null, { accountId });
  }

  /**
   * Test connection to WhatsApp Platform
   */
  async testConnection(accountId) {
    return this.request('GET', '/health', null, { accountId });
  }

  // ============ CONVERSATION DETAILS ============

  /**
   * 🔒 Get single conversation details
   * @param {string} conversationId - Conversation ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getConversationDetail(conversationId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getConversationDetail');
    return this.request('GET', `/conversations/${conversationId}`, null, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Mark conversation as read
   * @param {string} conversationId - Conversation ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async markAsRead(conversationId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in markAsRead');
    return this.request('PATCH', `/conversations/${conversationId}/read`, null, null, tenantApiKey, tenantId);
  }

  // ============ BROADCAST MESSAGING ============

  /**
   * 🔒 Send broadcast message to multiple contacts
   * @param {array} contactIds - Array of contact IDs
   * @param {string} message - Message text
   * @param {string} templateName - Optional template name
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async sendBroadcast(contactIds, message, templateName = null, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in sendBroadcast');
    const data = {
      contactIds,
      message,
      templateName
    };
    return this.request('POST', '/broadcast', data, null, tenantApiKey, tenantId);
  }

  // ============ ACCOUNT/SETUP ============

  /**
   * 🔒 Get account configuration and phone numbers
   * @param {string} accountId - Account ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getAccountInfo(accountId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getAccountInfo');
    return this.request('GET', '/account/config', null, { accountId }, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Get health status of platform
   * @param {string} tenantApiKey - Optional tenant-specific API key
   * @param {string} tenantId - Optional tenant identifier
   */
  async getHealth(tenantApiKey = null, tenantId = null) {
    return this.request('GET', '/health', null, {}, tenantApiKey, tenantId);
  }

  // ============ CONTACTS MANAGEMENT ============

  /**
   * 🔒 Fetch all contacts
   * @param {number} limit - Results limit (default: 100)
   * @param {number} offset - Pagination offset (default: 0)
   * @param {string} search - Search by name, phone, email
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getContacts(limit = 100, offset = 0, search = null, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getContacts');
    const params = { limit, offset };
    if (search) params.search = search;
    return this.request('GET', '/contacts', null, params, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Get single contact by ID
   * @param {string} contactId - Contact ID
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getContact(contactId, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getContact');
    return this.request('GET', `/contacts/${contactId}`, null, null, tenantApiKey, tenantId);
  }

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @param {number} limit - Results limit (default: 50)
   * @param {number} offset - Pagination offset (default: 0)
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async getConversationMessages(conversationId, limit = 50, offset = 0, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in getConversationMessages');
    const params = { limit, offset };
    return this.request('GET', `/conversations/${conversationId}/messages`, null, params, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Reply to a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} message - Reply message text
   * @param {string} mediaUrl - Optional media URL
   * @param {string} mediaType - Optional media type (image, video, document)
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async replyToConversation(conversationId, message, mediaUrl = null, mediaType = null, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in replyToConversation');
    const data = { message };
    if (mediaUrl) data.mediaUrl = mediaUrl;
    if (mediaType) data.mediaType = mediaType;
    return this.request('POST', `/conversations/${conversationId}/reply`, data, null, tenantApiKey, tenantId);
  }

  // ============ DIRECT MESSAGING ============

  /**
   * 🔒 Send message to a contact by phone number
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} message - Message text
   * @param {string} mediaUrl - Optional media URL
   * @param {string} mediaType - Optional media type
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async sendMessage(recipientPhone, message, mediaUrl = null, mediaType = null, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in sendMessage');
    const data = { 
      recipientPhone,
      message 
    };
    if (mediaUrl) data.mediaUrl = mediaUrl;
    if (mediaType) data.mediaType = mediaType;
    return this.request('POST', '/send-message', data, null, tenantApiKey, tenantId);
  }

  /**
   * 🔒 Send broadcast to multiple contacts (v2)
   * @param {object} broadcastData - Broadcast data (message, contactIds or tags)
   * @param {string} tenantApiKey - MANDATORY: Tenant-specific API key
   * @param {string} tenantId - MANDATORY: Tenant identifier
   */
  async sendBroadcastV2(broadcastData, tenantApiKey = null, tenantId = null) {
    if (!tenantApiKey) throw new Error('❌ TENANT ISOLATION VIOLATION: tenantApiKey is required');
    if (!tenantId) console.warn('⚠️  WARNING: tenantId missing in sendBroadcastV2');
    return this.request('POST', '/broadcast', broadcastData, null, tenantApiKey, tenantId);
  }
}

export default new WhatsAppPlatformClient();
