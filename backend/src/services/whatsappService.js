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
      console.log('🚀 Sending to Meta API:', `${GRAPH_API_URL}/${config.phoneNumberId}/messages`);
      
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

      console.log('✅ Meta API Response:', JSON.stringify(response.data, null, 2));

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
      console.error('❌ WhatsApp send error:');
      console.error('Error details:', error.response?.data || error.message);
      console.error('Config used:', {
        phoneNumberId: (await this.getTenantConfig(tenantId).catch(() => null))?.phoneNumberId,
        recipientPhone: recipientPhone
      });
      
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
        parameters: params.map(p => ({ type: 'text', text: p }))
      }] : [];

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
      console.error('Template send error:', error.response?.data || error.message);
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
      const message = await WhatsAppMessage.findOne({ waMessageId });
      if (!message) {
        console.log(`Message not found for waMessageId: ${waMessageId}`);
        return;
      }

      const statusUpdate = {
        status,
        timestamp: new Date(timestamp * 1000)
      };

      if (errorInfo.code) {
        statusUpdate.errorCode = errorInfo.code;
        statusUpdate.errorMessage = errorInfo.message;
      }

      message.status = status;
      message.statusUpdates.push(statusUpdate);

      if (status === 'delivered') {
        message.deliveredAt = statusUpdate.timestamp;
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.delivered': 1 } }
        );
      } else if (status === 'read') {
        message.readAt = statusUpdate.timestamp;
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.read': 1 } }
        );
      } else if (status === 'failed') {
        message.failedAt = statusUpdate.timestamp;
        message.errorCode = errorInfo.code;
        message.errorMessage = errorInfo.message;
        await WhatsAppConfig.updateOne(
          { tenantId: message.tenantId },
          { $inc: { 'messageCount.failed': 1 } }
        );
      }

      await message.save();
    } catch (error) {
      console.error('Handle status update error:', error);
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
