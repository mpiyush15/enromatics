/**
 * WhatsApp Event Service
 * Handles sending WhatsApp messages for events (absence, payment, results)
 * Simple, straightforward logic - no complexity
 */

import WhatsAppEventLog from "../models/WhatsAppEventLog.js";
import Student from "../models/Student.js";
import Tenant from "../models/Tenant.js";
import whatsappClient from "./whatsappPlatformClient.js";

class WhatsAppEventService {
  /**
   * Send absence notification when student marked absent
   * @param {String} tenantId - Tenant ID
   * @param {String} studentId - Student ID
   * @param {Object} attendanceData - { date, remarks }
   */
  async sendAbsenceNotification(tenantId, studentId, attendanceData) {
    try {
      console.log(`� [SERVICE] sendAbsenceNotification called for student ${studentId}`);

      // 1. Get tenant config
      const tenant = await Tenant.findOne({ tenantId }).select(
        "whatsappConfig eventTriggers whatsappOptIn"
      );
      console.log(`🔍 [SERVICE] Tenant found:`, tenant?.tenantId);
      console.log(`🔍 [SERVICE] WhatsApp configured:`, tenant?.whatsappConfig?.isConfigured);
      console.log(`🔍 [SERVICE] Event triggers:`, tenant?.eventTriggers?.absenceNotifications);

      if (!tenant?.whatsappConfig?.isConfigured) {
        console.log(`⚠️  WhatsApp not configured for tenant ${tenantId}`);
        return { success: false, reason: "WhatsApp not configured" };
      }

      // 1.5. Check if absence notifications are enabled
      if (!tenant?.eventTriggers?.absenceNotifications?.enabled) {
        console.log(`⚠️  Absence notifications disabled for tenant ${tenantId}`);
        return { success: false, reason: "Absence notifications disabled" };
      }

      // 2. Get student data
      const student = await Student.findById(studentId).select(
        "name phone tenantId"
      );
      console.log(`🔍 [SERVICE] Student found:`, student?.name, student?.phone);

      if (!student?.phone) {
        console.log(`⚠️  Student ${studentId} has no phone number`);
        return { success: false, reason: "No phone number" };
      }

      // 3. Build message
      const template = tenant?.eventTriggers?.absenceNotifications?.template || 
        "Hi {studentName}, you were marked absent on {date}";
      const message = this.buildAbsenceMessage(
        student.name,
        attendanceData.date,
        template
      );
      console.log(`🔍 [SERVICE] Message built:`, message);

      // 4. Log attempt
      const logEntry = await WhatsAppEventLog.create({
        tenantId,
        studentId,
        studentName: student.name,
        studentPhone: student.phone,
        eventType: "absence",
        message,
        status: "pending",
      });
      console.log(`🔍 [SERVICE] Log entry created:`, logEntry._id);

      // 5. Send via WhatsApp (async, don't wait)
      this.sendViaWhatsApp(tenantId, student.phone, message, logEntry._id).catch(
        (err) => console.error("WhatsApp send error:", err.message)
      );
      console.log(`🔍 [SERVICE] sendViaWhatsApp called (async)`);

      return { success: true, logId: logEntry._id };
    } catch (error) {
      console.error("❌ Absence notification error:", error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build absence message with template placeholders
   */
  buildAbsenceMessage(studentName, date, template = null) {
    const dateStr = new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const messageTemplate = template || "Hi {studentName}, you were marked absent on {date}";
    
    // Replace placeholders
    return messageTemplate
      .replace(/{studentName}/g, studentName)
      .replace(/{date}/g, dateStr);
  }

  /**
   * Send message via WhatsApp Platform
   * Async - don't wait, just fire and forget
   */
  async sendViaWhatsApp(tenantId, phone, message, logId) {
    try {
      console.log(`🔍 [SEND] sendViaWhatsApp called for phone: ${phone}`);
      
      // Get tenant WhatsApp config
      const tenant = await Tenant.findOne({ tenantId }).select("whatsappConfig");
      console.log(`🔍 [SEND] Tenant config loaded, isConfigured:`, tenant?.whatsappConfig?.isConfigured);
      
      if (!tenant?.whatsappConfig?.isConfigured) {
        throw new Error("WhatsApp not configured");
      }

      console.log(`📤 [SEND] Calling whatsappClient.sendMessage(${phone}, message, null, null, apiKey)`);

      // Call WhatsApp Platform Client
      // Signature: sendMessage(recipientPhone, message, mediaUrl, mediaType, tenantApiKey)
      const result = await whatsappClient.sendMessage(
        phone, 
        message, 
        null,  // mediaUrl
        null,  // mediaType
        tenant?.whatsappConfig?.apiKey  // tenantApiKey - REQUIRED!
      );
      console.log(`📤 [SEND] whatsappClient.sendMessage result:`, result);

      // Update log to sent
      await WhatsAppEventLog.findByIdAndUpdate(logId, {
        status: "sent",
        sentAt: new Date(),
      });
      console.log(`✅ [SEND] Log updated to "sent"`);
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (error) {
      // Silently fail, just log the error
      console.error(`⚠️  [SEND] WhatsApp send failed: ${error.message}`);

      // Update log to failed
      await WhatsAppEventLog.findByIdAndUpdate(logId, {
        status: "failed",
        error: error.message,
      }).catch(() => {});
    }
  }

  /**
   * For future - payment notification
   */
  async sendPaymentReceipt(tenantId, studentId, paymentData) {
    // Same structure as sendAbsenceNotification
    // TODO: Implement in Phase 2
  }

  /**
   * For future - test result notification
   */
  async sendTestResult(tenantId, studentId, marksData) {
    // Same structure as sendAbsenceNotification
    // TODO: Implement in Phase 3
  }
}

export default new WhatsAppEventService();
