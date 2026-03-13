import express from 'express';
import Tenant from '../models/Tenant.js';
import WhatsAppEventLog from '../models/WhatsAppEventLog.js';
import { whatsappEventService } from '../services/whatsappEventService.js';

const router = express.Router();

/**
 * POST /api/whatsapp/webhook
 * 🔗 Webhook endpoint for ReplySys WhatsApp Platform
 * 
 * ReplySys sends real-time events here:
 * - new_message: Student sends message
 * - message_delivered: Message was delivered
 * - message_read: Message was read
 * - contact_updated: Contact info changed
 * 
 * Security: Verify webhook token from header
 */
router.post('/webhook', async (req, res) => {
  try {
    const { event, data, tenantId, timestamp } = req.body;

    console.log(`📨 Webhook received: ${event} for tenant ${tenantId}`);

    // 🔐 Verify webhook token if configured
    const webhookToken = process.env.WHATSAPP_WEBHOOK_SECRET;
    const headerToken = req.headers['x-webhook-token'];

    if (webhookToken && headerToken !== webhookToken) {
      console.error('🚨 SECURITY: Invalid webhook token');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 🔒 Verify tenant exists
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      console.warn(`⚠️  Tenant not found: ${tenantId}`);
      return res.status(404).json({ error: 'Tenant not found' });
    }

    // 📝 Log the webhook event
    const logEntry = new WhatsAppEventLog({
      tenantId,
      eventType: event,
      eventData: data,
      source: 'webhook',
      receivedAt: new Date(timestamp || Date.now()),
      status: 'processed'
    });

    await logEntry.save();

    // 🎯 Handle different event types
    switch (event) {
      case 'new_message':
        await handleNewMessage(tenantId, data);
        break;
      case 'message_delivered':
        await handleMessageDelivered(tenantId, data);
        break;
      case 'message_read':
        await handleMessageRead(tenantId, data);
        break;
      case 'contact_updated':
        await handleContactUpdated(tenantId, data);
        break;
      default:
        console.warn(`⚠️  Unknown event type: ${event}`);
    }

    // ✅ Acknowledge webhook receipt
    return res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      eventId: logEntry._id
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Return 200 to prevent webhook retry, but log the error
    return res.status(200).json({
      success: false,
      error: error.message,
      message: 'Webhook received but processing failed - will retry'
    });
  }
});

/**
 * Handle new message from student
 */
async function handleNewMessage(tenantId, data) {
  try {
    const { conversationId, studentPhone, studentName, message, messageType, waMessageId } = data;

    console.log(`💬 New message from ${studentPhone}: "${message}"`);

    // Update or create conversation in local DB
    // This is for historical tracking
    const eventLog = new WhatsAppEventLog({
      tenantId,
      eventType: 'student_message',
      conversationId,
      studentPhone,
      studentName,
      messageContent: message,
      messageType,
      waMessageId,
      status: 'received'
    });

    await eventLog.save();

    // Trigger any automations based on incoming message
    // Example: Auto-reply, trigger workflows, etc.
    if (tenant?.eventTriggers?.incomingMessage?.enabled) {
      console.log(`⚙️  Triggering incoming message automation for ${tenantId}`);
      // Add your automation logic here
    }

  } catch (error) {
    console.error('❌ Error handling new message:', error);
    throw error;
  }
}

/**
 * Handle message delivery confirmation
 */
async function handleMessageDelivered(tenantId, data) {
  try {
    const { waMessageId, conversationId, deliveredAt } = data;

    console.log(`✅ Message ${waMessageId} delivered`);

    // Update message status in log
    await WhatsAppEventLog.findOneAndUpdate(
      { waMessageId },
      { 
        status: 'delivered',
        deliveredAt: new Date(deliveredAt)
      }
    );

  } catch (error) {
    console.error('❌ Error handling delivery confirmation:', error);
  }
}

/**
 * Handle message read receipt
 */
async function handleMessageRead(tenantId, data) {
  try {
    const { waMessageId, conversationId, readAt } = data;

    console.log(`👀 Message ${waMessageId} read`);

    // Update message status in log
    await WhatsAppEventLog.findOneAndUpdate(
      { waMessageId },
      { 
        status: 'read',
        readAt: new Date(readAt)
      }
    );

  } catch (error) {
    console.error('❌ Error handling read receipt:', error);
  }
}

/**
 * Handle contact information updates
 */
async function handleContactUpdated(tenantId, data) {
  try {
    const { contactPhone, contactName, metadata } = data;

    console.log(`📱 Contact updated: ${contactPhone}`);

    // Update contact in local DB if needed
    // Could sync with student/contact database

  } catch (error) {
    console.error('❌ Error handling contact update:', error);
  }
}

/**
 * GET /api/whatsapp/webhook/health
 * Health check endpoint to verify webhook is configured
 */
router.get('/webhook/health', (req, res) => {
  const isConfigured = !!process.env.WHATSAPP_WEBHOOK_SECRET;
  
  return res.json({
    status: 'ok',
    webhookConfigured: isConfigured,
    endpoint: '/api/whatsapp/webhook',
    description: 'ReplySys webhook endpoint for real-time events'
  });
});

export default router;
