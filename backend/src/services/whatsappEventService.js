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
      console.log(`🔍 [SEND] sendViaWhatsApp called - Phone: ${phone}, LogId: ${logId}`);
      
      // Get tenant WhatsApp config
      const tenant = await Tenant.findOne({ tenantId }).select("whatsappConfig");
      console.log(`🔍 [SEND] Tenant config loaded, isConfigured:`, tenant?.whatsappConfig?.isConfigured);
      console.log(`🔍 [SEND] WhatsApp connection status:`, tenant?.whatsappConfig?.connectionStatus);
      
      if (!tenant?.whatsappConfig?.isConfigured) {
        throw new Error("WhatsApp not configured");
      }

      console.log(`📤 [SEND] Calling whatsappClient.sendMessage to ${phone}`);
      console.log(`📤 [SEND] Message preview:`, message.substring(0, 100) + "...");

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
      console.log(`✅ [SEND] Log updated to "sent" for logId: ${logId}`);
      console.log(`✅ WhatsApp sent to ${phone}`);
    } catch (error) {
      // Silently fail, just log the error
      console.error(`⚠️  [SEND] WhatsApp send failed for phone ${phone}: ${error.message}`);
      console.error(`⚠️  [SEND] Full error:`, error);

      // Update log to failed
      await WhatsAppEventLog.findByIdAndUpdate(logId, {
        status: "failed",
        error: error.message,
      }).catch(() => {});
    }
  }

  /**
   * Send enrollment notification when new student enrolled
   * @param {String} tenantId - Tenant ID
   * @param {Object} studentData - { _id, name, phone, rollNumber, batch, portalUrl, password, googlePlayUrl }
   */
  async sendEnrollmentNotification(tenantId, studentData) {
    try {
      console.log(`📚 [ENROLLMENT] Called for student: ${studentData.name}, Phone: ${studentData.phone}`);
      console.log(`📚 [ENROLLMENT] Full student data:`, JSON.stringify(studentData, null, 2));

      // 1. Get tenant config
      const tenant = await Tenant.findOne({ tenantId }).select(
        "whatsappConfig eventTriggers whatsappOptIn"
      );
      console.log(`🔍 [ENROLLMENT] Tenant found:`, tenant?.tenantId);
      console.log(`🔍 [ENROLLMENT] WhatsApp isConfigured:`, tenant?.whatsappConfig?.isConfigured);
      console.log(`🔍 [ENROLLMENT] WhatsApp config details:`, {
        phoneNumber: tenant?.whatsappConfig?.phoneNumber,
        businessAccountId: tenant?.whatsappConfig?.businessAccountId,
        connectionStatus: tenant?.whatsappConfig?.connectionStatus
      });
      console.log(`🔍 [ENROLLMENT] Event triggers:`, tenant?.eventTriggers?.enrollmentNotifications);

      if (!tenant?.whatsappConfig?.isConfigured) {
        console.log(`⚠️  [ENROLLMENT] WhatsApp not configured for tenant ${tenantId}`);
        return { success: false, reason: "WhatsApp not configured" };
      }

      // 1.5. Check if enrollment notifications are enabled
      if (!tenant?.eventTriggers?.enrollmentNotifications?.enabled) {
        console.log(`⚠️  [ENROLLMENT] Enrollment notifications disabled for tenant ${tenantId}`);
        return { success: false, reason: "Enrollment notifications disabled" };
      }

      // 2. Validate student has phone number
      if (!studentData?.phone) {
        console.log(`⚠️  [ENROLLMENT] Student ${studentData.name} has no phone number`);
        return { success: false, reason: "No phone number" };
      }

      console.log(`✅ [ENROLLMENT] All checks passed, proceeding to send message`);

      // 3. Build message with template placeholders
      const template = tenant?.eventTriggers?.enrollmentNotifications?.whatsappTemplate || 
        "Hi {studentName}, welcome! You have been enrolled in {batchName}. 📚\n\nYour Portal Access:\n🔗 URL: {portalUrl}\n👤 Login ID: {loginId}\n🔐 Password: {password}\n\nDownload our app: {googlePlayUrl}\n\nHappy Learning!";
      
      const message = this.buildEnrollmentMessage(
        studentData.name,
        studentData.batch || "Our Program",
        studentData.portalUrl,
        studentData.rollNumber, // Use roll number as login ID
        studentData.password,
        studentData.googlePlayUrl || "",
        template
      );
      console.log(`🔍 [ENROLLMENT] Message built:`, message);

      // 4. Log attempt
      const logEntry = await WhatsAppEventLog.create({
        tenantId,
        studentId: studentData._id,
        studentName: studentData.name,
        studentPhone: studentData.phone,
        eventType: "enrollment",
        message,
        status: "pending",
      });
      console.log(`✅ [ENROLLMENT] Log entry created with ID:`, logEntry._id);

      // 5. Send via WhatsApp (async, don't wait)
      console.log(`📱 [ENROLLMENT] Calling sendViaWhatsApp for phone: ${studentData.phone}`);
      this.sendViaWhatsApp(tenantId, studentData.phone, message, logEntry._id).catch(
        (err) => console.error("❌ [ENROLLMENT] WhatsApp send error:", err.message)
      );
      console.log(`📱 [ENROLLMENT] sendViaWhatsApp called (async, non-blocking)`);

      return { success: true, logId: logEntry._id };
    } catch (error) {
      console.error("❌ [ENROLLMENT] Enrollment notification error:", error.message);
      console.error("❌ [ENROLLMENT] Full error:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build enrollment message with template placeholders
   */
  buildEnrollmentMessage(studentName, batchName, portalUrl, loginId, password, googlePlayUrl = "", template = null) {
    const messageTemplate = template || "Hi {studentName}, welcome! You have been enrolled in {batchName}. 📚\n\nYour Portal Access:\n🔗 URL: {portalUrl}\n👤 Login ID: {loginId}\n🔐 Password: {password}\n\nDownload our app: {googlePlayUrl}\n\nHappy Learning!";
    
    // Replace placeholders
    return messageTemplate
      .replace(/{studentName}/g, studentName)
      .replace(/{batchName}/g, batchName)
      .replace(/{portalUrl}/g, portalUrl)
      .replace(/{loginId}/g, loginId)
      .replace(/{password}/g, password)
      .replace(/{googlePlayUrl}/g, googlePlayUrl || "Coming soon");
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
