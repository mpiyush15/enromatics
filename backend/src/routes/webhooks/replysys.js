/**
 * ReplySys Webhook Routes
 * Receives real-time events from ReplySys platform
 */

import express from 'express';
import crypto from 'crypto';
import WhatsAppEventLog from '../models/WhatsAppEventLog.js';

const router = express.Router();

/**
 * Middleware to verify webhook signature from ReplySys
 */
const verifyWebhookSignature = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const secret = process.env.REPLYSYS_WEBHOOK_SECRET;

  if (!signature || !secret) {
    console.warn('⚠️  Missing signature or secret in webhook request');
    return res.status(401).json({ error: 'Unauthorized: Missing signature or secret' });
  }

  const payload = JSON.stringify(req.body);
  const hash = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (hash !== signature) {
    console.warn('⚠️  Invalid webhook signature. Expected:', signature, 'Computed:', hash);
    return res.status(401).json({ error: 'Unauthorized: Invalid signature' });
  }

  console.log('✅ Webhook signature verified');
  next();
};

/**
 * Health check endpoint
 * GET /webhook/replysys/health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enromatics ReplySys Webhook',
    timestamp: new Date().toISOString()
  });
});

/**
 * Receive new message events from ReplySys
 * POST /webhook/replysys/message
 */
router.post('/message', verifyWebhookSignature, async (req, res) => {
  try {
    const { conversationId, messageId, message, sender, senderName, timestamp } = req.body;

    console.log('📨 New message from ReplySys:', {
      conversationId,
      messageId,
      sender,
      senderName,
      messagePreview: message?.substring(0, 50) + '...'
    });

    // Log the event
    await WhatsAppEventLog.create({
      eventType: 'new_message',
      conversationId,
      messageId,
      sender,
      senderName,
      message,
      timestamp: new Date(timestamp),
      metadata: req.body
    });

    // TODO: Process message in Enromatics
    // - Save to database
    // - Trigger notifications
    // - Update conversation status
    // - Check for AI auto-reply triggers

    res.json({
      success: true,
      message: 'Webhook received and logged',
      messageId
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Receive message delivery status from ReplySys
 * POST /webhook/replysys/delivery-status
 */
router.post('/delivery-status', verifyWebhookSignature, async (req, res) => {
  try {
    const { messageId, status, timestamp, conversationId } = req.body;

    console.log('✅ Delivery status:', {
      messageId,
      status,
      conversationId,
      timestamp
    });

    // Log the event
    await WhatsAppEventLog.create({
      eventType: 'message_status',
      messageId,
      status,
      conversationId,
      timestamp: new Date(timestamp),
      metadata: req.body
    });

    // TODO: Update message status in Enromatics
    // - Mark as sent/delivered/read
    // - Update UI in real-time
    // - Trigger notifications if needed

    res.json({
      success: true,
      message: 'Delivery status received and logged',
      messageId,
      status
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Receive contact/conversation update events from ReplySys
 * POST /webhook/replysys/contact-update
 */
router.post('/contact-update', verifyWebhookSignature, async (req, res) => {
  try {
    const { conversationId, contactPhone, contactName, profilePicUrl, timestamp } = req.body;

    console.log('👥 Contact updated:', {
      conversationId,
      contactPhone,
      contactName,
      timestamp
    });

    // Log the event
    await WhatsAppEventLog.create({
      eventType: 'contact_updated',
      conversationId,
      contactPhone,
      contactName,
      profilePicUrl,
      timestamp: new Date(timestamp),
      metadata: req.body
    });

    // TODO: Update contact information in Enromatics
    // - Update profile picture
    // - Update contact name
    // - Sync with CRM

    res.json({
      success: true,
      message: 'Contact update received and logged',
      conversationId
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Receive read receipt from ReplySys
 * POST /webhook/replysys/message-read
 */
router.post('/message-read', verifyWebhookSignature, async (req, res) => {
  try {
    const { messageId, conversationId, timestamp } = req.body;

    console.log('👁️  Message read:', {
      messageId,
      conversationId,
      timestamp
    });

    // Log the event
    await WhatsAppEventLog.create({
      eventType: 'message_read',
      messageId,
      conversationId,
      timestamp: new Date(timestamp),
      metadata: req.body
    });

    // TODO: Update message read status in Enromatics
    // - Mark message as read
    // - Update conversation last activity

    res.json({
      success: true,
      message: 'Read receipt received and logged',
      messageId
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
