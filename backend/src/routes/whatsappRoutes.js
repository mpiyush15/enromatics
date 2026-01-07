import express from 'express';
import whatsappClient from '../services/whatsappPlatformClient.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

/**
 * Helper function to get WhatsApp config for a tenant or global super admin
 * @param {string} tenantId - Tenant identifier (can be "global:*" for super admin)
 * @returns {Promise<object>} - WhatsApp configuration with apiKey
 */
async function getWhatsAppConfig(tenantId) {
  // Super admin with global config (no tenant-specific DB record needed)
  if (tenantId.startsWith('global:')) {
    const globalConfig = {
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
      phoneNumber: process.env.WHATSAPP_PHONE_NUMBER_ID,
      apiKey: process.env.WHATSAPP_PLATFORM_API_KEY,
      isGlobal: true,
      source: 'environment'
    };
    
    if (!globalConfig.businessAccountId || !globalConfig.phoneNumberId) {
      throw new Error('Global WhatsApp configuration not found in environment variables');
    }
    
    return globalConfig;
  }

  // Regular tenant lookup
  const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');
  
  if (!tenant || !tenant.whatsappConfig) {
    throw new Error('WhatsApp configuration not found for this tenant');
  }
  
  return tenant.whatsappConfig;
}

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

    // Super admin with global config (no tenant-specific DB record needed)
    if (tenantId.startsWith('global:')) {
      const globalConfig = {
        businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
        phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        phoneNumber: process.env.WHATSAPP_PHONE_NUMBER_ID, // Using phone number ID as fallback
        apiKey: process.env.WHATSAPP_PLATFORM_API_KEY,
        isGlobal: true,
        source: 'environment'
      };
      
      if (!globalConfig.businessAccountId || !globalConfig.phoneNumberId) {
        return res.status(404).json({ 
          error: 'Global WhatsApp configuration not found',
          message: 'Please set WHATSAPP_BUSINESS_ACCOUNT_ID and WHATSAPP_PHONE_NUMBER_ID in environment'
        });
      }
      
      return res.json(globalConfig);
    }

    // Regular tenant lookup
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
 * Body: { tenantId, businessAccountId, phoneNumberId, phoneNumber, apiKey }
 * 
 * If apiKey is provided, verifies connection to WhatsApp Platform
 * Creates tenant if it doesn't exist
 */
router.post('/config', async (req, res) => {
  try {
    const { tenantId, businessAccountId, phoneNumberId, phoneNumber, apiKey } = req.body;

    if (!tenantId || !businessAccountId || !phoneNumberId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenantId, businessAccountId, phoneNumberId, phoneNumber' 
      });
    }

    // If API key is provided, verify the connection before saving
    let connectionStatus = 'disconnected';
    let errorMessage = null;

    if (apiKey && apiKey.trim()) {
      try {
        console.log('🔍 Verifying WhatsApp Platform connection with provided API key...');
        
        // Try to fetch stats with the provided API key to verify it works
        const stats = await whatsappClient.getStats(apiKey);
        
        if (stats && stats.success) {
          connectionStatus = 'connected';
          console.log('✅ WhatsApp Platform connection verified successfully');
        } else {
          connectionStatus = 'error';
          errorMessage = 'Failed to verify connection: ' + (stats?.error || 'Unknown error');
          console.warn('⚠️ Connection verification failed:', errorMessage);
        }
      } catch (verifyError) {
        connectionStatus = 'error';
        errorMessage = 'Invalid API key or connection failed: ' + verifyError.message;
        console.error('❌ API key verification failed:', verifyError.message);
        
        // Don't stop - allow saving even if verification fails (user can retry)
        // This allows for network issues to be retried later
      }
    }

    // Save to MongoDB - create tenant if it doesn't exist
    const tenant = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        whatsappConfig: {
          businessAccountId,
          phoneNumberId,
          phoneNumber,
          apiKey: apiKey || null,
          isConfigured: true,
          connectionStatus,
          errorMessage,
          connectedAt: connectionStatus === 'connected' ? new Date() : null,
          updatedAt: new Date()
        }
      },
      { new: true, upsert: true }
    );

    console.log('✅ WhatsApp config saved for tenant:', tenantId);

    return res.json({
      success: true,
      message: connectionStatus === 'connected' 
        ? 'WhatsApp configuration saved and verified!' 
        : 'Configuration saved. API key verification pending or failed.',
      config: tenant.whatsappConfig,
      connectionStatus
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

    // Get tenant or global config
    const config = await getWhatsAppConfig(tenantId);

    // Fetch messages from platform using tenant API key
    const messages = await whatsappClient.getMessages(50, 0, config.apiKey);

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

    // Get tenant or global config
    const config = await getWhatsAppConfig(tenantId);

    // Send message via platform using tenant API key
    const result = await whatsappClient.sendTextMessage(to, message, 'manual', config.apiKey);

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

    // Get tenant or global config
    const config = await getWhatsAppConfig(tenantId);

    // Fetch conversations from platform using tenant API key
    const conversations = await whatsappClient.getConversations(50, 0, config.apiKey);

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

    // Get tenant or global config
    const config = await getWhatsAppConfig(tenantId);

    // Fetch contacts from platform using tenant API key
    const contacts = await whatsappClient.getContacts(100, 0, config.apiKey);

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

    // Get tenant or global config
    const config = await getWhatsAppConfig(tenantId);

    // Fetch stats from platform using tenant API key
    const stats = await whatsappClient.getStats(config.apiKey);

    return res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
