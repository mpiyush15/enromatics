/**
 * Notification Engine Service
 * Handles automated notifications across multiple channels (email, WhatsApp, SMS, in-app)
 * Uses template-based system for consistency and flexibility
 */

import NotificationTemplate from '../models/NotificationTemplate.js';
import Notification from '../models/Notification.js';
import * as emailService from './emailService.js';
import replysysIntegration from './replysysIntegration.js';
import Student from '../models/Student.js';

class NotificationEngine {
  /**
   * Trigger a notification based on event and template
   */
  async triggerNotification(tenantId, triggerEvent, studentId, variables = {}) {
    try {
      // 1. Find the template for this event
      const template = await NotificationTemplate.findOne({
        tenantId,
        triggerEvent,
        isActive: true,
      });

      if (!template) {
        return { success: false, reason: 'No template found' };
      }

      // 2. Get student details
      const student = await Student.findById(studentId).select(
        'name email phone'
      );

      if (!student) {
        return { success: false, reason: 'Student not found' };
      }

      // 3. Process variables and build messages
      const processedVars = {
        studentName: student.name,
        email: student.email,
        phone: student.phone,
        ...variables,
      };

      const messages = this.buildMessages(template, processedVars);

      // 4. Send via enabled channels
      const results = {};

      // Email
      if (template.channels.email?.enabled && student.email) {
        results.email = await this.sendEmail(
          student.email,
          messages.email.subject,
          messages.email.body
        );
      }

      // WhatsApp
      if (template.channels.whatsapp?.enabled && student.phone) {
        results.whatsapp = await this.sendWhatsApp(
          tenantId,
          student.phone,
          messages.whatsapp.body
        );
      }

      // SMS
      if (template.channels.sms?.enabled && student.phone) {
        results.sms = await this.sendSMS(
          student.phone,
          messages.sms.body
        );
      }

      // In-app notification
      if (template.channels.inApp?.enabled) {
        results.inApp = await this.createInAppNotification(
          tenantId,
          studentId,
          messages.inApp.title,
          messages.inApp.body,
          triggerEvent
        );
      }

      return {
        success: true,
        templateId: template._id,
        studentId,
        results,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build messages by replacing variables in templates
   */
  buildMessages(template, variables) {
    const replaceVariables = (text) => {
      if (!text) return text;
      let result = text;
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        result = result.replace(regex, variables[key] || '');
      });
      return result;
    };

    return {
      email: {
        subject: replaceVariables(template.channels.email?.subject || ''),
        body: replaceVariables(template.channels.email?.body || ''),
      },
      whatsapp: {
        body: replaceVariables(template.channels.whatsapp?.body || ''),
      },
      sms: {
        body: replaceVariables(template.channels.sms?.body || ''),
      },
      inApp: {
        title: replaceVariables(template.channels.inApp?.title || ''),
        body: replaceVariables(template.channels.inApp?.body || ''),
      },
    };
  }

  /**
   * Send email notification
   */
  async sendEmail(toEmail, subject, body) {
    try {
      await emailService.sendNotificationEmail({
        to: toEmail,
        subject,
        htmlBody: body,
      });

      return { success: true, channel: 'email' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(tenantId, phone, message) {
    try {
      const response = await replysysIntegration.sendMessage(
        phone,
        message,
        tenantId
      );

      return response;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send SMS notification (placeholder - implement SMS service)
   */
  async sendSMS(phone, message) {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)

      return {
        success: true,
        channel: 'sms',
        note: 'SMS service not yet configured',
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create in-app notification
   */
  async createInAppNotification(
    tenantId,
    studentId,
    title,
    body,
    eventType
  ) {
    try {
      const notification = await Notification.create({
        tenantId,
        studentId,
        title,
        message: body,
        type: eventType,
        priority: 'medium',
        isRead: false,
      });

      return {
        success: true,
        channel: 'inApp',
        notificationId: notification._id,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new template
   */
  async createTemplate(tenantId, templateData) {
    try {
      const template = await NotificationTemplate.create({
        tenantId,
        ...templateData,
      });

      return { success: true, template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all templates for a tenant
   */
  async getTemplates(tenantId, filters = {}) {
    try {
      const query = { tenantId, ...filters };
      const templates = await NotificationTemplate.find(query);

      return { success: true, templates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a template
   */
  async updateTemplate(tenantId, templateId, updates) {
    try {
      const template = await NotificationTemplate.findOneAndUpdate(
        { _id: templateId, tenantId },
        updates,
        { new: true }
      );

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      return { success: true, template };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Test template with sample data
   */
  async testTemplate(tenantId, templateId) {
    try {
      const template = await NotificationTemplate.findOne({
        _id: templateId,
        tenantId,
      });

      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const messages = this.buildMessages(
        template,
        template.sampleData || {}
      );

      return {
        success: true,
        messages,
        note: 'Preview only - no actual messages sent',
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationEngine();
