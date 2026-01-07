import express from 'express';
import whatsappClient from '../services/whatsappPlatformClient.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

/**
 * GET /api/whatsapp/config
 * Fetch tenant's WhatsApp configuration from MongoDB
 * Query params: tenantId (required)
 */
router.get('/config', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Fetch tenant from MongoDB
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    if (!tenant.whatsappConfig) {
      return res.status(404).json({ 
        error: 'WhatsApp configuration not found for this tenant',
        message: 'Please configure WhatsApp settings first'
      });
    }

    return res.json(tenant.whatsappConfig);
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/config
 * Save or update tenant's WhatsApp configuration
 * Body: { tenantId, businessAccountId, phoneNumberId, phoneNumber }
 */
router.post('/config', async (req, res) => {
  try {
    const { tenantId, businessAccountId, phoneNumberId, phoneNumber } = req.body;

    if (!tenantId || !businessAccountId || !phoneNumberId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenantId, businessAccountId, phoneNumberId, phoneNumber' 
      });
    }

    // Test connection with platform before saving
    try {
      const testResult = await whatsappClient.testConnection(businessAccountId);
      if (!testResult.success) {
        return res.status(400).json({ 
          error: 'Failed to connect to WhatsApp Platform',
          details: testResult.message
        });
      }
    } catch (platformError) {
      return res.status(400).json({ 
        error: 'Platform connection test failed',
        details: platformError.message
      });
    }

    // Save to MongoDB
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        whatsappConfig: {
          businessAccountId,
          phoneNumberId,
          phoneNumber,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }

    return res.json({
      success: true,
      message: 'WhatsApp configuration saved successfully',
      config: tenant.whatsappConfig
    });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/messages
 * Fetch messages for a tenant from WhatsApp Platform
 * Query params: tenantId (required)
 */
router.get('/messages', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Get tenant config
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant || !tenant.whatsappConfig) {
      return res.status(404).json({ error: 'WhatsApp configuration not found' });
    }

    // Fetch messages from platform
    const messages = await whatsappClient.getMessages(tenant.whatsappConfig.businessAccountId);

    return res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/messages/send
 * Send a message from tenant account
 * Body: { tenantId, to, message }
 */
router.post('/messages/send', async (req, res) => {
  try {
    const { tenantId, to, message } = req.body;

    if (!tenantId || !to || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenantId, to, message' 
      });
    }

    // Get tenant config
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant || !tenant.whatsappConfig) {
      return res.status(404).json({ error: 'WhatsApp configuration not found' });
    }

    // Send message via platform
    const result = await whatsappClient.sendMessage(
      tenant.whatsappConfig.businessAccountId,
      to,
      message
    );

    return res.json(result);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/conversations
 * Fetch conversations for a tenant
 * Query params: tenantId (required)
 */
router.get('/conversations', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Get tenant config
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant || !tenant.whatsappConfig) {
      return res.status(404).json({ error: 'WhatsApp configuration not found' });
    }

    // Fetch conversations from platform
    const conversations = await whatsappClient.getConversations(
      tenant.whatsappConfig.businessAccountId
    );

    return res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/contacts
 * Fetch contacts for a tenant
 * Query params: tenantId (required)
 */
router.get('/contacts', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Get tenant config
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant || !tenant.whatsappConfig) {
      return res.status(404).json({ error: 'WhatsApp configuration not found' });
    }

    // Fetch contacts from platform
    const contacts = await whatsappClient.getContacts(
      tenant.whatsappConfig.businessAccountId
    );

    return res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/stats
 * Fetch statistics for a tenant
 * Query params: tenantId (required)
 */
router.get('/stats', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Get tenant config
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant || !tenant.whatsappConfig) {
      return res.status(404).json({ error: 'WhatsApp configuration not found' });
    }

    // Fetch stats from platform
    const stats = await whatsappClient.getStats(
      tenant.whatsappConfig.businessAccountId
    );

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
