import axios from 'axios';
import WhatsAppConfig from '../models/WhatsAppConfig.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import WhatsAppContact from '../models/WhatsAppContact.js';

const GRAPH_API_URL = 'https://graph.facebook.com/v21.0';

class WhatsAppService {
  /**
   * Get tenant's WhatsApp configuration
   */
  async getTenantConfig(tenantId) {
    const config = await WhatsAppConfig.findOne({ tenantId, isActive: true });
    if (!config) {
      throw new Error('WhatsApp not configured for this tenant. Please add your credentials in Settings.');
    }
    return config;
  }

  /**
   * Send a text message via WhatsApp Cloud API
   */
  async sendTextMessage(tenantId, recipientPhone, messageText, metadata = {}) {
    let message;
    
    try {
      const config = await this.getTenantConfig(tenantId);
      
      // Clean phone number (remove + and spaces)
      const cleanPhone = recipientPhone.replace(/[\s+()-]/g, '');
      
      console.log('📱 Preparing to send WhatsApp message:');
      console.log('  Tenant ID:', tenantId);
      console.log('  Original Phone:', recipientPhone);
      console.log('  Cleaned Phone:', cleanPhone);
      console.log('  Message:', messageText);
      console.log('  Config Phone Number ID:', config.phoneNumberId);
      console.log('  Config WABA ID:', config.wabaId);
      
      // Create message record
      message = new WhatsAppMessage({
        tenantId,
        recipientPhone: cleanPhone,
        messageType: 'text',
        content: { text: messageText },
        status: 'queued',
        campaign: metadata.campaign || 'manual',
        metadata,
        sentBy: metadata.sentBy
      });

      // Send via WhatsApp Cloud API
      console.log('🚀 ========== SENDING TO META API ==========');
      console.log('  API URL:', `${GRAPH_API_URL}/${config.phoneNumberId}/messages`);
      console.log('  Phone Number ID:', config.phoneNumberId);
      console.log('  Access Token Length:', config.accessToken?.length);
      console.log('  Access Token Preview:', config.accessToken?.substring(0, 20) + '...');
      console.log('  Recipient Phone:', cleanPhone);
      console.log('  Message Text:', messageText);
      console.log('  Request Payload:', JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'text',
        text: { body: messageText }
      }, null, 2));
      
      const response = await axios.post(
        `${GRAPH_API_URL}/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'text',
          text: { body: messageText }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ ========== META API RESPONSE ==========');
      console.log('  Status Code:', response.status);
      console.log('  Response Headers:', JSON.stringify(response.headers, null, 2));
      console.log('  Response Data:', JSON.stringify(response.data, null, 2));
      
      if (response.data.messages && response.data.messages[0]) {
        console.log('📨 Message Details from Meta:');
        console.log('  - WhatsApp Message ID:', response.data.messages[0].id);
        console.log('  - Message Status:', response.data.messages[0].message_status || 'Not provided');
        console.log('  - Recipient ID:', response.data.contacts?.[0]?.wa_id || 'Not provided');
        console.log('  - Input Phone:', response.data.contacts?.[0]?.input || 'Not provided');
      }
      
      // Check if Meta immediately indicates any issues
      if (response.data.error) {
        console.error('❌ Meta API returned error in response:', response.data.error);
      }
      
      console.log('==========================================');

      // Update message with WhatsApp message ID
      message.waMessageId = response.data.messages[0].id;
      message.status = 'sent';
      message.sentAt = new Date();
      message.statusUpdates.push({
        status: 'sent',
        timestamp: new Date()
      });
      
      await message.save();

      // Update config stats
      await WhatsAppConfig.updateOne(
        { tenantId },
        { 
          $inc: { 
            'messageCount.total': 1,
            'messageCount.sent': 1
          }
        }
      );

      // Update contact last message time
      await WhatsAppContact.updateOne(
        { tenantId, whatsappNumber: cleanPhone },
        { 
          lastMessageAt: new Date(),
          $inc: { messageCount: 1 }
        }
      );

      return {
        success: true,
        messageId: message._id,
        waMessageId: message.waMessageId,
        status: 'sent'
      };

    } catch (error) {
      console.error('❌ ========== WHATSAPP SEND ERROR ==========');
      console.error('  Error Type:', error.name);
      console.error('  Error Message:', error.message);
      console.error('  HTTP Status:', error.response?.status);
      console.error('  HTTP Status Text:', error.response?.statusText);
      
      if (error.response?.data) {
        console.error('  Meta API Error Response:', JSON.stringify(error.response.data, null, 2));
        
        // Check for specific Meta error codes
        if (error.response.data.error) {
          const metaError = error.response.data.error;
          console.error('  Meta Error Details:');
          console.error('    - Code:', metaError.code);
          console.error('    - Type:', metaError.type);
          console.error('    - Message:', metaError.message);
          console.error('    - Subcode:', metaError.error_subcode);
          console.error('    - User Title:', metaError.error_user_title);
          console.error('    - User Message:', metaError.error_user_msg);
          console.error('    - Trace ID:', metaError.fbtrace_id);
        }
      }
      
      console.error('  Request Config Used:');
      console.error('    - Tenant ID:', tenantId);
      console.error('    - Original Phone:', recipientPhone);
      console.error('    - Cleaned Phone:', recipientPhone.replace(/[\s+()-]/g, ''));
      console.error('    - Message Text:', messageText);
      
      try {
        const config = await this.getTenantConfig(tenantId);
        console.error('    - Phone Number ID:', config.phoneNumberId);
        console.error('    - WABA ID:', config.wabaId);
        console.error('    - Token Length:', config.accessToken?.length);
      } catch (configErr) {
        console.error('    - Config Error:', configErr.message);
      }
      console.error('==========================================');
      
      // Save failed message
      if (message) {
        message.status = 'failed';
        message.failedAt = new Date();
        message.errorCode = error.response?.data?.error?.code;
        message.errorMessage = error.response?.data?.error?.message || error.message;
        message.statusUpdates.push({
          status: 'failed',
          timestamp: new Date(),
          errorCode: message.errorCode,
          errorMessage: message.errorMessage
        });
        await message.save();

        await WhatsAppConfig.updateOne(
          { tenantId },
          { $inc: { 'messageCount.failed': 1 } }
        );
      }

      throw new Error(error.response?.data?.error?.message || 'Failed to send WhatsApp message');
    }
  }

  /**
   * Send template message (for pre-approved templates)
   */
  async sendTemplateMessage(tenantId, recipientPhone, templateName, params = [], metadata = {}) {
    try {
      const config = await this.getTenantConfig(tenantId);
      const cleanPhone = recipientPhone.replace(/[\s+()-]/g, '');

      console.log('📋 ========== SENDING TEMPLATE MESSAGE ==========');
      console.log('Template Name:', templateName);
      console.log('Recipient Phone:', cleanPhone);
      console.log('Parameters:', params);
      console.log('Campaign:', metadata.campaign);
      console.log('Tenant Config:', { phoneNumberId: config.phoneNumberId, wabaId: config.wabaId });

      const message = new WhatsAppMessage({
        tenantId,
        recipientPhone: cleanPhone,
        messageType: 'template',
        content: {
          templateName,
          templateParams: params
        },
        status: 'queued',
        campaign: metadata.campaign || 'manual',
        metadata,
        sentBy: metadata.sentBy
      });

      // Build template components
      const components = params.length > 0 ? [{
        type: 'body',
        parameters: params.map(p => ({ type: 'text', text: String(p) }))
      }] : [];
      
      console.log('📝 Template Components:', JSON.stringify(components, null, 2));

      console.log('📤 Sending to Meta API:', {
        url: `${GRAPH_API_URL}/${config.phoneNumberId}/messages`,
        payload: {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components
          }
        }
      });

      const response = await axios.post(
        `${GRAPH_API_URL}/${config.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Meta API Response:', response.data);

      message.waMessageId = response.data.messages[0].id;
      message.status = 'sent';
      message.sentAt = new Date();
      message.statusUpdates.push({
        status: 'sent',
        timestamp: new Date()
      });
      await message.save();

      await WhatsAppConfig.updateOne(
        { tenantId },
        { $inc: { 'messageCount.total': 1, 'messageCount.sent': 1 } }
      );

      return {
        success: true,
        messageId: message._id,
        waMessageId: message.waMessageId
      };

    } catch (error) {
      console.error('🚨 ========== TEMPLATE SEND ERROR ==========');
      console.error('Template Name:', templateName);
      console.error('Recipient Phone:', recipientPhone);
      console.error('Parameters:', params);
      console.error('Meta API Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      console.error('Error Headers:', error.response?.headers);
      console.error('Full Error:', error.message);
      console.error('=========================================');
      
      // Save failed message to database for tracking
      if (message) {
        message.status = 'failed';
        message.failedAt = new Date();
        message.errorMessage = error.response?.data?.error?.message || error.message;
        message.errorCode = error.response?.data?.error?.code;
        message.statusUpdates.push({
          status: 'failed',
          timestamp: new Date(),
          errorMessage: error.response?.data?.error?.message || error.message,
          errorCode: error.response?.data?.error?.code
        });
        await message.save();
      }
      
      throw new Error(error.response?.data?.error?.message || 'Failed to send template');
    }
  }

  /**
   * Test WhatsApp connection
   */
  async testConnection(phoneNumberId, accessToken, testPhone) {
    try {
      const response = await axios.post(
        `${GRAPH_API_URL}/${phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: testPhone,
          type: 'text',
          text: { body: '✅ WhatsApp connection successful! Your account is connected.' }
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        message: 'Test message sent successfully'
      };
    } catch (error) {
      console.error('Connection test failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error?.message || 'Connection test failed');
    }
  }

  /**
   * Sync students as WhatsApp contacts
   */
  async syncStudentContacts(tenantId) {
    try {
      const { default: Student } = await import('../models/Student.js');
      const students = await Student.find({ tenantId, isActive: true });

      let synced = 0;
      let skipped = 0;

      for (const student of students) {
        if (!student.contact?.phone) {
          skipped++;
          continue;
        }

        const cleanPhone = student.contact.phone.replace(/[\s+()-]/g, '');
        
        await WhatsAppContact.updateOne(
          { tenantId, whatsappNumber: cleanPhone },
          {
            $set: {
              studentId: student._id,
              name: student.name,
              phone: student.contact.phone,
              whatsappNumber: cleanPhone,
              type: 'student',
              metadata: {
                class: student.academicInfo?.class,
                section: student.academicInfo?.section,
                rollNumber: student.academicInfo?.rollNumber
              }
            }
          },
          { upsert: true }
        );
        synced++;

        // Sync parent contact if available
        if (student.contact?.parentPhone) {
          const cleanParentPhone = student.contact.parentPhone.replace(/[\s+()-]/g, '');
          await WhatsAppContact.updateOne(
            { tenantId, whatsappNumber: cleanParentPhone },
            {
              $set: {
                studentId: student._id,
                name: student.contact?.parentName || `${student.name}'s Parent`,
                phone: student.contact.parentPhone,
                whatsappNumber: cleanParentPhone,
                type: 'parent',
                metadata: {
                  class: student.academicInfo?.class,
                  section: student.academicInfo?.section,
                  parentName: student.contact?.parentName
                }
              }
            },
            { upsert: true }
          );
          synced++;
        }
      }

      return { synced, skipped };
    } catch (error) {
      console.error('Sync contacts error:', error);
      throw new Error('Failed to sync contacts');
    }
  }

  /**
   * Handle webhook status updates from WhatsApp
   */
  async handleStatusUpdate(waMessageId, status, timestamp, errorInfo = {}) {
    try {
      console.log('🔄 ========== HANDLING STATUS UPDATE ==========');
      console.log('Message ID:', waMessageId);
      console.log('New Status:', status);
      console.log('Timestamp:', timestamp, '→', new Date(timestamp * 1000).toISOString());
      console.log('Error Info:', errorInfo);
      
      const message = await WhatsAppMessage.findOne({ waMessageId });
      
      if (!message) {
        console.log(`❌ Message not found in database for waMessageId: ${waMessageId}`);
        console.log('This might be a message sent outside this system');
        console.log('=========================================\n');
        return;
      }

      console.log('✅ Message found in database:');
      console.log('  - Database ID:', message._id);
      console.log('  - Tenant ID:', message.tenantId);
      console.log('  - Recipient:', message.recipientPhone);
      console.log('  - Current Status:', message.status);
      console.log('  - Previous Status Updates:', message.statusUpdates.length);

      const statusUpdate = {
        status,
        timestamp: new Date(timestamp * 1000)
      };

      if (errorInfo.code) {
        statusUpdate.errorCode = errorInfo.code;
        statusUpdate.errorMessage = errorInfo.message;
        console.log('⚠️ Error in status update:');
        console.log('  - Code:', errorInfo.code);
        console.log('  - Message:', errorInfo.message);
      }

      message.status = status;
      message.statusUpdates.push(statusUpdate);

      if (status === 'delivered') {
        message.deliveredAt = statusUpdate.timestamp;
        console.log('✅ Message DELIVERED at:', statusUpdate.timestamp);
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.delivered': 1 } }
        );
      } else if (status === 'read') {
        message.readAt = statusUpdate.timestamp;
        console.log('👁️ Message READ at:', statusUpdate.timestamp);
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.read': 1 } }
        );
      } else if (status === 'failed') {
        message.failedAt = statusUpdate.timestamp;
        message.errorCode = errorInfo.code;
        message.errorMessage = errorInfo.message;
        console.log('❌ Message FAILED:');
        console.log('  - Error Code:', errorInfo.code);
        console.log('  - Error Message:', errorInfo.message);
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.failed': 1 } }
        );
      } else {
        console.log('ℹ️ Other status:', status);
      }

      await message.save();
      console.log('💾 Status update saved to database');
      console.log('  - Total status updates now:', message.statusUpdates.length);
      console.log('=========================================\n');
    } catch (error) {
      console.error('❌ ========== STATUS UPDATE ERROR ==========');
      console.error('Error handling status update:', error.message);
      console.error('Stack:', error.stack);
      console.error('==========================================\n');
    }
  }

  /**
   * Get message statistics for tenant
   */
  async getStats(tenantId, dateRange = {}) {
    try {
      const query = { tenantId };
      
      if (dateRange.startDate || dateRange.endDate) {
        query.createdAt = {};
        if (dateRange.startDate) query.createdAt.$gte = new Date(dateRange.startDate);
        if (dateRange.endDate) query.createdAt.$lte = new Date(dateRange.endDate);
      }

      const [total, sent, delivered, read, failed] = await Promise.all([
        WhatsAppMessage.countDocuments(query),
        WhatsAppMessage.countDocuments({ ...query, status: 'sent' }),
        WhatsAppMessage.countDocuments({ ...query, status: 'delivered' }),
        WhatsAppMessage.countDocuments({ ...query, status: 'read' }),
        WhatsAppMessage.countDocuments({ ...query, status: 'failed' })
      ]);

      return {
        total,
        sent,
        delivered,
        read,
        failed,
        deliveryRate: total > 0 ? ((delivered / total) * 100).toFixed(2) : 0,
        readRate: total > 0 ? ((read / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw new Error('Failed to get statistics');
    }
  }
}

export default new WhatsAppService();
