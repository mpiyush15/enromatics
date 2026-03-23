import Student from '../models/Student.js';
import NotificationTemplate from '../models/NotificationTemplate.js';
import WhatsAppEventLog from '../models/WhatsAppEventLog.js';
import { sendEmail } from './emailService.js';

class EmailAutomationService {
  constructor() {
    // Initialize with Zepto API configuration
    this.apiToken = process.env.ZEPTO_API_TOKEN;
    this.apiUrl = process.env.ZEPTO_API_URL || 'https://api.zeptomail.in/v1.1/email';
    this.from = process.env.ZEPTO_FROM || 'no-reply@enromatics.com';
  }

  /**
   * Send absence notification to student
   * Triggered when: Teacher marks attendance, student marked absent
   */
  async sendAbsenceNotification(tenantId, studentId, classDate, subject, periods) {
    try {
      const student = await Student.findById(studentId).populate('parentEmail');
      if (!student || !student.email) return false;

      const template = await NotificationTemplate.findOne({
        tenantId,
        eventType: 'absence',
        channel: 'email',
        enabled: true,
      });

      if (!template) return false;

      const variables = {
        studentName: student.name,
        studentRoll: student.rollNumber,
        classDate: new Date(classDate).toLocaleDateString('en-IN'),
        subject: subject || 'Multiple',
        periods: periods || '1',
        schoolName: process.env.SCHOOL_NAME || 'School',
        parentPortalUrl: `${process.env.FRONTEND_URL}/parent-portal`,
      };

      const emailBody = this.buildEmailBody(template.emailTemplate, variables);

      const result = await sendEmail({
        to: student.email,
        subject: `Absence Notification - ${new Date(classDate).toLocaleDateString('en-IN')}`,
        html: emailBody,
        from: this.from,
      });
      
      // Log the event
      await this.logEmailEvent(tenantId, studentId, 'absence', 'sent', result?.messageId || 'sent');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send payment receipt/reminder
   * Triggered when: Payment received or payment due date approaching
   */
  async sendPaymentNotification(tenantId, studentId, paymentData) {
    try {
      const student = await Student.findById(studentId);
      if (!student || !student.email) return false;

      const template = await NotificationTemplate.findOne({
        tenantId,
        eventType: paymentData.isDue ? 'payment-due' : 'payment-received',
        channel: 'email',
        enabled: true,
      });

      if (!template) return false;

      const variables = {
        studentName: student.name,
        amount: `₹${paymentData.amount}`,
        invoiceNumber: paymentData.invoiceNumber,
        paymentMethod: paymentData.method || 'Online',
        transactionId: paymentData.transactionId || 'N/A',
        dueDate: paymentData.dueDate ? new Date(paymentData.dueDate).toLocaleDateString('en-IN') : 'N/A',
        remainingBalance: `₹${paymentData.remainingBalance}`,
        portalUrl: `${process.env.FRONTEND_URL}/student-portal/fees`,
      };

      const subject = paymentData.isDue
        ? `Payment Due Reminder - ₹${paymentData.amount}`
        : `Payment Receipt - ₹${paymentData.amount}`;

      const emailBody = this.buildEmailBody(template.emailTemplate, variables);

      const result = await sendEmail({
        to: student.email,
        subject,
        html: emailBody,
        from: this.from,
      });
      await this.logEmailEvent(tenantId, studentId, 'payment', 'sent', result?.messageId || 'sent');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send test result notification
   * Triggered when: Test evaluated and results published
   */
  async sendTestResultNotification(tenantId, studentId, testData) {
    try {
      const student = await Student.findById(studentId);
      if (!student || !student.email) return false;

      const template = await NotificationTemplate.findOne({
        tenantId,
        eventType: 'test-result',
        channel: 'email',
        enabled: true,
      });

      if (!template) return false;

      const performanceMessage = this.getPerformanceMessage(testData.percentage);
      
      const variables = {
        studentName: student.name,
        testName: testData.testName,
        totalScore: testData.totalScore,
        marksObtained: testData.marksObtained,
        percentage: `${testData.percentage.toFixed(2)}%`,
        rank: testData.rank || 'N/A',
        performanceLevel: performanceMessage,
        classAverage: testData.classAverage ? `${testData.classAverage.toFixed(2)}%` : 'N/A',
        resultPortalUrl: `${process.env.FRONTEND_URL}/student-portal/test-results/${testData.testId}`,
      };

      const emailBody = this.buildEmailBody(template.emailTemplate, variables);

      const result = await sendEmail({
        to: student.email,
        subject: `Score Released - ${test.name}`,
        html: emailBody,
        from: this.from,
      });
      await this.logEmailEvent(tenantId, studentId, 'test-result', 'sent', result?.messageId || 'sent');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Send scholarship awarded notification
   * Triggered when: Student awarded scholarship
   */
  async sendScholarshipNotification(tenantId, studentId, scholarshipData) {
    try {
      const student = await Student.findById(studentId);
      if (!student || !student.email) return false;

      const template = await NotificationTemplate.findOne({
        tenantId,
        eventType: 'scholarship-awarded',
        channel: 'email',
        enabled: true,
      });

      if (!template) return false;

      const variables = {
        studentName: student.name,
        scholarshipName: scholarshipData.scholarshipName,
        amount: `₹${scholarshipData.amount}`,
        category: scholarshipData.category,
        criteria: scholarshipData.criteria,
        disbursalDate: scholarshipData.disbursalDate ? new Date(scholarshipData.disbursalDate).toLocaleDateString('en-IN') : 'To be announced',
        bankAccount: scholarshipData.bankAccount ? `****${scholarshipData.bankAccount.slice(-4)}` : 'N/A',
        portalUrl: `${process.env.FRONTEND_URL}/student-portal/scholarships`,
      };

      const emailBody = this.buildEmailBody(template.emailTemplate, variables);

      const result = await sendEmail({
        to: student.email,
        subject: `Congratulations! Scholarship Awarded - ₹${scholarshipData.amount}`,
        html: emailBody,
        from: this.from,
      });
      await this.logEmailEvent(tenantId, studentId, 'scholarship', 'sent', result?.messageId || 'sent');
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Build email body from template with variable substitution
   */
  buildEmailBody(template, variables) {
    let body = template;

    // Replace all variables in format {variableName}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      body = body.replace(regex, value || 'N/A');
    }

    // Wrap in professional HTML template if not already formatted
    if (!body.includes('<!DOCTYPE')) {
      body = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Notification from ${process.env.SCHOOL_NAME || 'School Management System'}</h2>
            </div>
            <div class="content">
              ${body}
            </div>
            <div class="footer">
              <p>This is an automated notification. Please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${process.env.SCHOOL_NAME || 'School'}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    return body;
  }

  /**
   * Get performance message based on percentage
   */
  getPerformanceMessage(percentage) {
    if (percentage >= 90) return 'Excellent! Outstanding performance!';
    if (percentage >= 80) return 'Great! Very good performance!';
    if (percentage >= 70) return 'Good! Keep up the hard work!';
    if (percentage >= 60) return 'Fair! You can do better. Keep practicing!';
    if (percentage >= 50) return 'Needs improvement. Focus on weak areas!';
    return 'Below average. Seek help from your teacher!';
  }

  /**
   * Log email event for tracking/audit
   */
  async logEmailEvent(tenantId, studentId, eventType, status, messageId) {
    try {
      await WhatsAppEventLog.create({
        tenantId,
        studentId,
        eventType: `email-${eventType}`,
        channel: 'email',
        status,
        messageId,
        metadata: { timestamp: new Date() },
      });
    } catch (error) {
    }
  }
}

export default new EmailAutomationService();
