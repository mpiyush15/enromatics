/**
 * ReplySys Integration Service
 * Handles communication with ReplySys platform for WhatsApp integration
 */

class ReplySysIntegration {
  constructor() {
    this.baseUrl = process.env.REPLYSYS_PLATFORM_URL;
    this.token = process.env.REPLYSYS_INTEGRATION_TOKEN;
    this.headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Fetch all conversations from ReplySys
   * @param {number} limit - Number of conversations to fetch
   * @param {number} offset - Offset for pagination
   */
  async getConversations(limit = 50, offset = 0) {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversations?limit=${limit}&offset=${offset}`,
        { method: 'GET', headers: this.headers }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error.message);
      throw error;
    }
  }

  /**
   * Get messages for a specific conversation
   * @param {string} conversationId - ReplySys conversation ID
   */
  async getConversationMessages(conversationId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/conversations/${conversationId}/messages`,
        { method: 'GET', headers: this.headers }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to fetch messages:', error.message);
      throw error;
    }
  }

  /**
   * Send a message via ReplySys
   * @param {string} recipientPhone - Recipient phone number (with country code)
   * @param {string} message - Message text
   * @param {string} mediaUrl - Optional media URL
   */
  async sendMessage(recipientPhone, message, mediaUrl = null) {
    try {
      const payload = {
        recipientPhone,
        message,
        mediaUrl
      };

      const response = await fetch(
        `${this.baseUrl}/send-message`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to send message:', error.message);
      throw error;
    }
  }

  /**
   * Send a template message
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} templateId - Template ID
   * @param {array} variables - Template variables
   */
  async sendTemplate(recipientPhone, templateId, variables = []) {
    try {
      const payload = {
        recipientPhone,
        templateId,
        variables
      };

      const response = await fetch(
        `${this.baseUrl}/send-template`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to send template:', error.message);
      throw error;
    }
  }

  /**
   * Send a broadcast to multiple contacts
   * @param {array} phoneList - Array of phone numbers
   * @param {string} message - Message text
   * @param {string} templateId - Optional template ID
   */
  async sendBroadcast(phoneList, message, templateId = null) {
    try {
      const payload = {
        phones: phoneList,
        message,
        templateId
      };

      const response = await fetch(
        `${this.baseUrl}/broadcast`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Failed to send broadcast:', error.message);
      throw error;
    }
  }

  /**
   * Get account/health status
   */
  async getHealth() {
    try {
      const response = await fetch(
        `${this.baseUrl}/health`,
        { method: 'GET', headers: this.headers }
      );

      if (!response.ok) throw new Error(`ReplySys API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      throw error;
    }
  }
}

export default new ReplySysIntegration();
