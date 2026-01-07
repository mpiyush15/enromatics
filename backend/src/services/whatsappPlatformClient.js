/**
 * WhatsApp Platform Client Service
 * 
 * Handles all API calls to the WhatsApp Platform (Railway)
 * Acts as a bridge between Pixels Dashboard and WhatsApp Platform
 * 
 * API Base URL: Configured via environment variable
 * Authentication: Platform API Key sent in Authorization header
 */

import axios from 'axios';

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:3000';
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

class WhatsAppPlatformClient {
  constructor() {
    this.baseURL = `${WHATSAPP_PLATFORM_URL}/api`;
    this.apiKey = WHATSAPP_PLATFORM_API_KEY;
    
    if (!this.apiKey) {
      console.warn('⚠️ WHATSAPP_PLATFORM_API_KEY not configured. WhatsApp features will not work.');
    }
  }

/**
 * Make authenticated request to WhatsApp Platform
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {object} data - Request body
 * @param {object} params - Query parameters
 * @param {string} tenantApiKey - Optional tenant-specific API key
 */
  async request(method, endpoint, data = null, params = null, tenantApiKey = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Use tenant-specific API key if provided, otherwise fall back to default
      const apiKeyToUse = tenantApiKey || this.apiKey;
      
      // Add API key if available
      if (apiKeyToUse) {
        config.headers['Authorization'] = `Bearer ${apiKeyToUse}`;
      }

      // Add data for POST/PUT/PATCH
      if (data) {
        config.data = data;
      }

      // Add query parameters
      if (params) {
        config.params = params;
      }

      console.log(`📡 ${method.toUpperCase()} ${endpoint}`, params ? `?${new URLSearchParams(params)}` : '');

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
   * Get all conversations
   * @param {number} limit - Limit results
   * @param {number} skip - Skip records
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async getConversations(limit = 50, skip = 0, tenantApiKey = null) {
    const params = { limit, skip };

    return this.request('GET', '/conversations', null, params, tenantApiKey);
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId, limit = 50) {
    return this.request('GET', `/conversations/${conversationId}/messages`, null, { limit });
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
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId) {
    return this.request('PATCH', `/conversations/${conversationId}/read`);
  }

  /**
   * Update conversation status (open/closed)
   */
  async updateConversationStatus(conversationId, status) {
    return this.request('PATCH', `/conversations/${conversationId}/status`, { status });
  }

  // ============ MESSAGES ============

  /**
   * Send text message
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} message - Message text
   * @param {string} campaign - Campaign type
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async sendTextMessage(recipientPhone, message, campaign = 'manual', tenantApiKey = null) {
    const data = {
      recipientPhone,
      message,
      campaign,
    };

    return this.request('POST', '/messages/send', data, null, tenantApiKey);
  }

  /**
   * Send template message
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async sendTemplateMessage(recipientPhone, templateName, params = [], campaign = 'manual', tenantApiKey = null) {
    const data = {
      recipientPhone,
      templateName,
      params,
      campaign,
    };

    return this.request('POST', '/messages/send-template', data, null, tenantApiKey);
  }

  /**
   * Get messages
   * @param {number} limit - Result limit
   * @param {number} skip - Skip records
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async getMessages(limit = 50, skip = 0, tenantApiKey = null) {
    const params = { limit, skip };

    return this.request('GET', '/messages', null, params, tenantApiKey);
  }

  /**
   * Get single message
   */
  async getMessage(messageId) {
    return this.request('GET', `/messages/${messageId}`);
  }

  // ============ CONTACTS ============

  /**
   * Get contacts
   * @param {number} limit - Result limit
   * @param {number} skip - Skip records
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async getContacts(limit = 100, skip = 0, tenantApiKey = null) {
    const params = { limit, skip };

    return this.request('GET', '/contacts', null, params, tenantApiKey);
  }

  /**
   * Create contact
   */
  async createContact(accountId, name, whatsappNumber, phone = null, email = null, type = 'customer', tags = [], metadata = {}) {
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

    return this.request('POST', '/contacts', data);
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
   * Delete contact
   */
  async deleteContact(contactId) {
    return this.request('DELETE', `/contacts/${contactId}`);
  }

  /**
   * Bulk import contacts
   */
  async bulkImportContacts(accountId, contacts) {
    const data = { accountId, contacts };
    return this.request('POST', '/contacts/import', data);
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
   * Get platform statistics
   * @param {string} tenantApiKey - Optional tenant-specific API key
   */
  async getStats(tenantApiKey = null) {
    return this.request('GET', '/stats', null, {}, tenantApiKey);
  }

  /**
   * Get daily statistics
   */
  async getDailyStats(accountId, phoneNumberId = null, days = 7) {
    const params = { accountId, days };
    if (phoneNumberId) params.phoneNumberId = phoneNumberId;

    return this.request('GET', '/stats/daily', null, params);
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
}

export default new WhatsAppPlatformClient();
