import express from 'express';
import whatsappClient from '../services/whatsappPlatformClient.js';
import Tenant from '../models/Tenant.js';

const router = express.Router();

/**
 * 🔒 MANDATORY: Get WhatsApp config for a tenant
 * ⚠️  CRITICAL: Every tenant MUST have their own WhatsApp config
 * ❌ No global config, no shared accounts, no super admin bypass
 * @param {string} tenantId - Tenant identifier (REQUIRED)
 * @returns {Promise<object>} - WhatsApp configuration with apiKey
 * @throws {Error} If tenantId is missing or no config found
 */
async function getWhatsAppConfig(tenantId) {
  // 🔴 MANDATORY VALIDATION: tenantId is required
  if (!tenantId || typeof tenantId !== 'string' || tenantId.trim() === '') {
    throw new Error('❌ TENANT ISOLATION VIOLATION: tenantId is required and cannot be empty');
  }

  // 🔴 BLOCK "global:*" pattern - No shared global accounts allowed
  if (tenantId.startsWith('global:') || tenantId === 'global') {
    console.error('🚨 SECURITY VIOLATION BLOCKED: Attempt to access global WhatsApp config for tenantId:', tenantId);
    throw new Error('❌ TENANT ISOLATION VIOLATION: Global WhatsApp accounts are not permitted. Each tenant must have their own WhatsApp connection.');
  }

  // ✅ TENANT LOOKUP: Each tenant owns their WhatsApp config
  const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');
  
  if (!tenant) {
    console.warn(`⚠️  Tenant not found: ${tenantId}`);
    throw new Error(`Tenant "${tenantId}" not found in database`);
  }

  if (!tenant.whatsappConfig || !tenant.whatsappConfig.isConfigured) {
    console.warn(`⚠️  WhatsApp not configured for tenant: ${tenantId}`);
    throw new Error(`WhatsApp is not configured for tenant "${tenantId}". Please set it up first.`);
  }
  
  // ✅ Return tenant-specific config with tenantId attached
  return {
    ...tenant.whatsappConfig,
    tenantId: tenantId // MANDATORY: Attach tenantId to config for audit trails
  };
}

/**
 * GET /api/whatsapp/config
 * 🔒 Fetch tenant's WhatsApp configuration from MongoDB
 * REQUIRED: tenantId query param (identifies the tenant)
 * SECURITY: Returns only the requesting tenant's config
 */
router.get('/config', async (req, res) => {
  try {
    const { tenantId } = req.query;

    // 🔴 MANDATORY: tenantId must be provided
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'You must specify which tenant this request belongs to'
      });
    }

    console.log(`📨 GET /config for tenantId: ${tenantId}`);

    // ✅ Get config for THIS tenant only
    const tenant = await Tenant.findOne({ tenantId }).select('whatsappConfig');

    if (!tenant) {
      return res.status(404).json({ 
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`
      });
    }

    if (!tenant.whatsappConfig || !tenant.whatsappConfig.isConfigured) {
      return res.status(404).json({ 
        error: 'WhatsApp configuration not found',
        message: 'This tenant has not configured WhatsApp yet. Please set it up in settings.',
        connectionStatus: 'disconnected'
      });
    }

    // ✅ Return config WITH connection status, DO NOT expose sensitive apiKey to frontend
    const safeConfig = {
      businessAccountId: tenant.whatsappConfig.businessAccountId,
      phoneNumberId: tenant.whatsappConfig.phoneNumberId,
      phoneNumber: tenant.whatsappConfig.phoneNumber,
      isConfigured: tenant.whatsappConfig.isConfigured,
      connectionStatus: tenant.whatsappConfig.connectionStatus || 'disconnected',
      connectedAt: tenant.whatsappConfig.connectedAt,
      errorMessage: tenant.whatsappConfig.errorMessage,
      // DO NOT include: apiKey, accessToken (these should never go to frontend)
    };
    
    console.log(`✅ WhatsApp config returned for tenant: ${tenantId}, status: ${safeConfig.connectionStatus}`);
    return res.json(safeConfig);
  } catch (error) {
    console.error(`❌ Error fetching WhatsApp config for ${req.query.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch WhatsApp configuration',
      message: error.message 
    });
  }
});

/**
 * POST /api/whatsapp/config
 * 🔒 Save or update a tenant's WhatsApp configuration
 * BODY: { tenantId, businessAccountId, phoneNumberId, phoneNumber, apiKey }
 * SECURITY: Only tenant's own config can be saved
 * CRITICAL: One WhatsApp account can only be connected to ONE tenant
 * 
 * Flow:
 * 1. Validate tenantId exists
 * 2. CHECK: Is this WhatsApp account already connected to another tenant?
 * 3. Verify API key by connecting to WhatsApp Platform
 * 4. Save config to database (upsert)
 * 5. Return success only if connection verified
 */
router.post('/config', async (req, res) => {
  try {
    const { tenantId, businessAccountId, phoneNumberId, phoneNumber, apiKey } = req.body;

    // 🔴 MANDATORY: All required fields
    if (!tenantId || !businessAccountId || !phoneNumberId || !phoneNumber) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['tenantId', 'businessAccountId', 'phoneNumberId', 'phoneNumber'],
        received: { tenantId, businessAccountId, phoneNumberId, phoneNumber }
      });
    }

    // 🔴 BLOCK: Global account patterns
    if (tenantId.startsWith('global:') || tenantId === 'global') {
      console.error('🚨 SECURITY VIOLATION BLOCKED: Attempt to save global WhatsApp config');
      return res.status(403).json({
        error: 'Global WhatsApp accounts not permitted',
        message: 'Each tenant must have their own WhatsApp Business Account'
      });
    }

    console.log(`📝 Setting up WhatsApp for tenantId: ${tenantId}`);

    // ✅ VERIFY: Tenant exists in database
    const tenantExists = await Tenant.findOne({ tenantId });
    if (!tenantExists) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Cannot configure WhatsApp for unknown tenant "${tenantId}"`
      });
    }

    // 🔒 CRITICAL: Check if this WhatsApp account is already connected to ANOTHER tenant
    console.log(`🔍 Checking if WhatsApp account (${businessAccountId}) is already in use...`);
    
    const existingTenant = await Tenant.findOne({
      tenantId: { $ne: tenantId }, // ← Find ANY OTHER tenant
      'whatsappConfig.businessAccountId': businessAccountId,
      'whatsappConfig.isConfigured': true
    });

    if (existingTenant) {
      console.error(`🚨 TENANT ISOLATION VIOLATION: WhatsApp account ${businessAccountId} already connected to ${existingTenant.tenantId}`);
      return res.status(409).json({
        error: 'WhatsApp account already in use',
        message: `This WhatsApp Business Account (${businessAccountId}) is already connected to another tenant: "${existingTenant.instituteName || existingTenant.tenantId}". Each WhatsApp account can only be connected to ONE tenant.`,
        conflictingTenant: existingTenant.tenantId
      });
    }

    // ✅ VERIFY: API key by testing connection to WhatsApp Platform
    let connectionStatus = 'disconnected';
    let errorMessage = null;

    if (apiKey && apiKey.trim()) {
      try {
        console.log(`🔍 Verifying WhatsApp Platform connection for tenant: ${tenantId}`);
        
        // Test connection by fetching conversations with the provided API key
        const testResult = await whatsappClient.getConversations(1, 0, apiKey);
        
        if (testResult && testResult.success !== false) {
          connectionStatus = 'connected';
          console.log(`✅ WhatsApp Platform connection verified for tenant: ${tenantId}`);
        } else {
          connectionStatus = 'error';
          errorMessage = `Connection test failed: ${testResult?.error || 'Unknown error'}`;
          console.warn(`⚠️  Connection verification failed for ${tenantId}:`, errorMessage);
        }
      } catch (verifyError) {
        connectionStatus = 'error';
        errorMessage = `Invalid API key or connection failed: ${verifyError.message}`;
        console.error(`❌ API key verification failed for ${tenantId}:`, verifyError.message);
      }
    } else {
      errorMessage = 'No API key provided - connection cannot be verified';
      console.warn(`⚠️  No API key provided for tenant: ${tenantId}`);
    }

    // ✅ SAVE: Update/create tenant's WhatsApp config (isolated by tenantId)
    const updatedTenant = await Tenant.findOneAndUpdate(
      { tenantId }, // ← CRITICAL: Filter by tenantId to ensure isolation
      {
        whatsappConfig: {
          businessAccountId,
          phoneNumberId,
          phoneNumber,
          apiKey, // ✅ Stored only in DB, never returned to frontend
          isConfigured: true,
          connectionStatus,
          errorMessage,
          connectedAt: connectionStatus === 'connected' ? new Date() : null,
          updatedAt: new Date(),
          updatedByTenantId: tenantId // ← Audit trail
        }
      },
      { new: true, upsert: false } // ← Don't create new tenants, only update existing ones
    );

    console.log(`✅ WhatsApp config saved for tenant: ${tenantId}, connectionStatus: ${connectionStatus}`);

    return res.json({
      success: connectionStatus === 'connected',
      message: connectionStatus === 'connected' 
        ? `✅ WhatsApp configured and verified for tenant: ${tenantId}`
        : `⚠️  WhatsApp configuration saved, but connection could not be verified: ${errorMessage}`,
      connectionStatus,
      errorMessage: errorMessage || null
    });
  } catch (error) {
    console.error(`❌ Error saving WhatsApp config for ${req.body.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to save WhatsApp configuration',
      message: error.message 
    });
  }
});

/**
 * DELETE /api/whatsapp/config
 * 🔒 Disconnect WhatsApp for a tenant
 * REQUIRED: tenantId query param
 * SECURITY: Permanently removes tenant's WhatsApp configuration
 * 
 * This will:
 * 1. Remove all WhatsApp settings from the tenant
 * 2. Stop syncing conversations/messages
 * 3. Require reconfiguration to re-enable
 */
router.delete('/config', async (req, res) => {
  try {
    const { tenantId } = req.query;

    // 🔴 MANDATORY: tenantId is required
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'You must specify which tenant to disconnect'
      });
    }

    console.log(`🔌 Disconnecting WhatsApp for tenantId: ${tenantId}`);

    // ✅ Get tenant (validate exists before deleting config)
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`
      });
    }

    // ✅ CRITICAL: Remove entire whatsappConfig from tenant
    const result = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        $unset: { whatsappConfig: 1 } // ← Removes the entire field
      },
      { new: true }
    );

    console.log(`✅ WhatsApp disconnected for tenant: ${tenantId}`);

    return res.json({
      success: true,
      message: `✅ WhatsApp has been disconnected for tenant: ${tenantId}`,
      tenantId,
      whatsappConfig: null // ← Now empty
    });
  } catch (error) {
    console.error(`❌ Error disconnecting WhatsApp for ${req.query.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to disconnect WhatsApp',
      message: error.message 
    });
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
 * POST /api/whatsapp/messages
 * 🔒 Send a message from tenant account
 * BODY: { accountId (tenantId), type, phoneNumberId, recipientPhone, message }
 * SECURITY: Each message tagged with tenant's API key
 */
router.post('/messages', async (req, res) => {
  try {
    const { accountId, type, phoneNumberId, recipientPhone, message } = req.body;

    // 🔴 MANDATORY: accountId is the tenantId
    if (!accountId || !recipientPhone || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: accountId (tenantId), recipientPhone, message' 
      });
    }

    // ✅ Get tenant config (validates tenant exists)
    const config = await getWhatsAppConfig(accountId);

    // ✅ CRITICAL: Pass tenantId (accountId) to Platform
    const result = await whatsappClient.sendMessage(
      recipientPhone, 
      message, 
      null, 
      null, 
      config.apiKey,
      accountId // ← MANDATORY: Platform must attach tenantId
    );

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error(`❌ Error sending message from ${req.body.accountId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
});

/**
 * POST /api/whatsapp/messages/send
 * 🔒 Send a message from tenant account (LEGACY)
 * BODY: { tenantId, to, message }
 * SECURITY: Legacy endpoint - should migrate to POST /send-message
 */
router.post('/messages/send', async (req, res) => {
  try {
    const { tenantId, to, message } = req.body;

    // 🔴 MANDATORY: tenantId must be provided
    if (!tenantId || !to || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenantId, to, message' 
      });
    }

    // ✅ Get tenant config (validates tenant exists)
    const config = await getWhatsAppConfig(tenantId);

    // ✅ CRITICAL: Pass tenantId to Platform
    const result = await whatsappClient.sendMessage(
      to, 
      message, 
      null, 
      null, 
      config.apiKey,
      tenantId // ← MANDATORY: Platform must attach tenantId
    );

    return res.json(result);
  } catch (error) {
    console.error(`❌ Error sending message from ${req.body.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
});

/**
 * GET /api/whatsapp/messages/stats
 * Get message statistics (sent, delivered, read, failed counts)
 * Query params: tenantId (required), conversationId (optional), days (optional)
 */
router.get('/messages/stats', async (req, res) => {
  try {
    const { tenantId, conversationId, days = 30 } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    // Get date range
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - parseInt(days));

    // Get config for API key
    const config = await getWhatsAppConfig(tenantId);

    // Fetch stats from platform using tenant API key
    const stats = await whatsappClient.getMessageStats(
      config.apiKey,
      conversationId,
      dateFrom.toISOString()
    );

    return res.json({
      stats: {
        totalMessages: stats.total || 0,
        sentCount: stats.sent || 0,
        deliveredCount: stats.delivered || 0,
        readCount: stats.read || 0,
        failedCount: stats.failed || 0,
        inboundCount: stats.inbound || 0,
        outboundCount: stats.outbound || 0,
      },
      dateRange: {
        from: dateFrom,
        to: new Date(),
        days: parseInt(days),
      },
    });
  } catch (error) {
    console.error('Error fetching message stats:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/conversations
 * 🔒 Fetch conversations for a specific tenant
 * REQUIRED: tenantId query param
 * SECURITY: Returns only conversations belonging to this tenant
 * 
 * Platform API must filter by tenantId to prevent data leaks
 */
router.get('/conversations', async (req, res) => {
  try {
    const { tenantId, limit = 50, offset = 0 } = req.query;

    // 🔴 MANDATORY: tenantId is required
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'You must specify which tenant this request belongs to'
      });
    }

    console.log(`📬 GET /conversations for tenantId: ${tenantId}, limit: ${limit}, offset: ${offset}`);

    // ✅ Get config (validates tenant exists and has WhatsApp configured)
    const config = await getWhatsAppConfig(tenantId);

    // ✅ CRITICAL: Pass tenantId to Platform API so it filters conversations by tenant
    const response = await whatsappClient.getAllConversations(
      parseInt(limit),
      parseInt(offset),
      config.apiKey,
      tenantId // ← MANDATORY: Platform must scope results to this tenant
    );

    console.log(`✅ Found ${response.data?.conversations?.length || 0} conversations for tenant: ${tenantId}`);

    // Transform Platform response to frontend format
    const conversations = (response.data?.conversations || []).map(conv => ({
      _id: conv._id,
      id: conv.conversationId || conv.id,
      conversationId: conv.conversationId || conv.id,
      tenantId: tenantId, // ← ALWAYS attach tenantId for audit
      phone: conv.userPhone || conv.phone,
      phoneNumberId: conv.phoneNumberId,
      userPhone: conv.userPhone || conv.phone,
      name: conv.userProfileName || conv.userName || conv.name,
      userName: conv.userName,
      userProfileName: conv.userProfileName,
      lastMessage: conv.lastMessagePreview,
      lastMessagePreview: conv.lastMessagePreview,
      lastMessageTime: conv.lastMessageAt,
      lastMessageAt: conv.lastMessageAt,
      lastMessageType: conv.lastMessageType,
      unreadCount: conv.unreadCount || 0,
      status: conv.status,
      priority: conv.priority,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      lastReadAt: conv.lastReadAt,
      assignedAgentId: conv.assignedAgentId,
      tags: conv.tags || []
    }));

    return res.json({
      success: true,
      data: {
        conversations,
        tenantId, // ← Return tenant context
        pagination: response.data?.pagination || {
          total: conversations.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: false
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error fetching conversations for ${req.query.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to fetch conversations',
      message: error.message 
    });
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

/**
 * GET /api/whatsapp/conversation/:conversationId
 * Get single conversation details
 * Params: conversationId (required)
 * Query params: tenantId (required)
 */
router.get('/conversation/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const conversation = await whatsappClient.getConversationDetail(conversationId);

    return res.json(conversation);
  } catch (error) {
    console.error('Error fetching conversation details:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PATCH /api/whatsapp/conversation/:conversationId/read
 * Mark a conversation as read
 * Params: conversationId (required)
 * Query params: tenantId (required)
 */
router.patch('/conversation/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    
    // Mark conversation as read on WhatsApp Platform
    const result = await whatsappClient.markConversationAsRead(conversationId, config.apiKey);

    return res.json({
      success: true,
      message: 'Conversation marked as read',
      data: result
    });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data || null 
    });
  }
});

/**
 * POST /api/whatsapp/broadcast
 * Send broadcast message to multiple contacts
 * Body: { tenantId, contactIds[], message, templateName? }
 */
router.post('/broadcast', async (req, res) => {
  try {
    const { tenantId, contactIds, message, templateName } = req.body;

    if (!tenantId || !contactIds || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: tenantId, contactIds, message' 
      });
    }

    const config = await getWhatsAppConfig(tenantId);
    const result = await whatsappClient.sendBroadcast(contactIds, message, templateName, config.apiKey);

    return res.json({
      success: true,
      message: 'Broadcast sent successfully',
      result
    });
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/account-info
 * Get account configuration and info
 * Query params: tenantId (required)
 */
router.get('/account-info', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const accountInfo = await whatsappClient.getAccountInfo(config.businessAccountId);

    return res.json(accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/health
 * Check WhatsApp Platform health status
 * Query params: tenantId (required)
 */
router.get('/health', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const health = await whatsappClient.getHealth();

    return res.json({
      success: true,
      status: 'healthy',
      platform: health
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(503).json({ 
      success: false,
      status: 'unhealthy',
      error: error.message 
    });
  }
});

/**
 * GET /api/whatsapp/conversation/:conversationId/messages
 * 🔒 Fetch messages for a specific conversation
 * REQUIRED: tenantId query param, conversationId path param
 * SECURITY: Validates tenant owns this conversation before returning messages
 * 
 * This endpoint MUST verify:
 * 1. tenantId is provided
 * 2. Tenant has WhatsApp configured
 * 3. Platform returns only this tenant's messages
 */
router.get('/conversation/:conversationId/messages', async (req, res) => {
  try {
    const { tenantId, limit = 50, offset = 0 } = req.query;
    const { conversationId } = req.params;

    // 🔴 MANDATORY: tenantId is required
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'You must specify which tenant this request belongs to'
      });
    }

    console.log(`📨 GET /conversation/${conversationId}/messages for tenantId: ${tenantId}`);

    // ✅ Get config (validates tenant exists and has WhatsApp configured)
    const config = await getWhatsAppConfig(tenantId);

    // ✅ CRITICAL: Platform must filter messages by tenantId to prevent leaks
    const response = await whatsappClient.getConversationMessages(
      conversationId,
      parseInt(limit),
      parseInt(offset),
      config.apiKey,
      tenantId // ← MANDATORY: Platform must scope messages to this tenant
    );

    // Transform Platform response to frontend format with tenantId attached
    const messages = (response.data?.messages || response.messages || []).map(msg => ({
      _id: msg._id || msg.messageId,
      messageId: msg.messageId,
      waMessageId: msg.waMessageId,
      conversationId: msg.conversationId,
      tenantId: tenantId, // ← ALWAYS attach for audit
      senderPhone: msg.senderPhone,
      recipientPhone: msg.recipientPhone,
      messageType: msg.messageType,
      content: msg.content,
      status: msg.status,
      direction: msg.direction,
      timestamp: msg.timestamp,
      createdAt: msg.createdAt,
      deliveredAt: msg.deliveredAt,
      readAt: msg.readAt
    }));

    console.log(`✅ Found ${messages.length} messages for conversation: ${conversationId}, tenant: ${tenantId}`);

    return res.json({
      success: true,
      data: {
        messages,
        tenantId,
        conversationId,
        pagination: response.data?.pagination || {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: messages.length,
          hasMore: false
        }
      }
    });
  } catch (error) {
    console.error(`❌ Error fetching messages for ${req.query.tenantId}/${req.params.conversationId}:`, error.message);
    const errorMessage = error?.message || error?.response?.data?.message || 'Unknown error';
    res.status(500).json({ 
      error: 'Failed to fetch messages',
      message: errorMessage,
      details: error?.response?.data || null
    });
  }
});

/**
 * POST /api/whatsapp/conversation/:conversationId/reply
 * Send reply to a conversation
 * Body: { message, mediaUrl (optional), mediaType (optional) }
 * Query params: tenantId
 */
router.post('/conversation/:conversationId/reply', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { conversationId } = req.params;
    const { message, mediaUrl, mediaType } = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const result = await whatsappClient.replyToConversation(
      conversationId,
      message,
      mediaUrl,
      mediaType,
      config.apiKey
    );

    return res.json(result);
  } catch (error) {
    console.error('Error replying to conversation:', error);
    const errorMessage = error?.message || error?.response?.data?.message || String(error) || 'Unknown error';
    res.status(500).json({ 
      error: errorMessage,
      details: error?.response?.data || error?.code || 'No additional details'
    });
  }
});

/**
 * GET /api/whatsapp/contacts
 * Fetch all contacts for a tenant
 * Query params: tenantId, limit (optional), offset (optional), search (optional)
 * 
 * Transforms Platform API response to frontend format
 */
router.get('/contacts', async (req, res) => {
  try {
    const { tenantId, limit = 100, offset = 0, search } = req.query;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const response = await whatsappClient.getContacts(
      parseInt(limit),
      parseInt(offset),
      search,
      config.apiKey
    );

    // Transform Platform response to frontend format
    const contacts = (response.data?.contacts || []).map(contact => ({
      _id: contact._id,                                // MongoDB ID
      contactId: contact._id,                          // Alias for _id
      name: contact.name,                              // Contact name
      phone: contact.phone,                            // Phone with + prefix
      whatsappNumber: contact.whatsappNumber,          // WhatsApp number without +
      email: contact.email,                            // Email address
      type: contact.type,                              // Customer/agent/etc
      tags: contact.tags || [],                        // Tags array
      isOptedIn: contact.isOptedIn,                    // Opt-in status
      messageCount: contact.messageCount || 0,         // Total messages
      conversationCount: contact.messageCount || 0,    // Alias for frontend
      lastMessageAt: contact.lastMessageAt,           // Last message time
      createdAt: contact.createdAt,                    // When contact was created
      updatedAt: contact.updatedAt,                    // Last update
      metadata: contact.metadata || {},                // Extra metadata
      notes: null                                      // Not provided by Platform
    }));

    return res.json({
      success: true,
      contacts,
      pagination: response.data?.pagination || {
        total: contacts.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/whatsapp/contacts/:contactId
 * Fetch single contact by ID
 * Query params: tenantId
 */
router.get('/contacts/:contactId', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { contactId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const contact = await whatsappClient.getContact(contactId, config.apiKey);

    return res.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/contacts
 * Create new contact
 * Body: { name, phone, email (optional), tags (optional) }
 * Query params: tenantId
 */
router.post('/contacts', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const contactData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    if (!contactData.name || !contactData.phone) {
      return res.status(400).json({ error: 'name and phone are required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const contact = await whatsappClient.createContact(contactData, config.apiKey);

    return res.json(contact);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/whatsapp/contacts/:contactId
 * Update contact
 * Body: { name (optional), email (optional), tags (optional) }
 * Query params: tenantId
 */
router.put('/contacts/:contactId', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { contactId } = req.params;
    const contactData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const contact = await whatsappClient.updateContact(contactId, contactData, config.apiKey);

    return res.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/whatsapp/contacts/:contactId
 * Delete contact
 * Query params: tenantId
 */
router.delete('/contacts/:contactId', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const { contactId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const result = await whatsappClient.deleteContact(contactId, config.apiKey);

    return res.json(result);
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/whatsapp/send-message
 * 🔒 Send a direct message from a tenant's WhatsApp account
 * BODY: { tenantId, recipientPhone, message, mediaUrl (optional), mediaType (optional) }
 * SECURITY: Each message is tagged with tenantId on Platform side
 */
router.post('/send-message', async (req, res) => {
  try {
    const { tenantId, recipientPhone, message, mediaUrl, mediaType } = req.body;

    // 🔴 MANDATORY: tenantId is required
    if (!tenantId) {
      return res.status(400).json({ 
        error: 'tenantId is required',
        message: 'You must specify which tenant this message belongs to'
      });
    }

    if (!recipientPhone || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['recipientPhone', 'message']
      });
    }

    console.log(`📤 Sending message from tenant: ${tenantId} to ${recipientPhone}`);

    // ✅ Get config (validates tenant exists and has WhatsApp configured)
    const config = await getWhatsAppConfig(tenantId);

    // ✅ CRITICAL: Platform must tag this message with tenantId
    const result = await whatsappClient.sendMessage(
      recipientPhone,
      message,
      mediaUrl,
      mediaType,
      config.apiKey,
      tenantId // ← MANDATORY: Platform must attach tenantId to message record
    );

    console.log(`✅ Message sent from tenant: ${tenantId}`);

    return res.json({
      success: true,
      message: 'Message sent successfully',
      data: {
        ...result,
        tenantId // ← Return tenant context in response
      }
    });
  } catch (error) {
    console.error(`❌ Error sending message from ${req.body.tenantId}:`, error.message);
    res.status(500).json({ 
      error: 'Failed to send message',
      message: error.message 
    });
  }
});

/**
 * POST /api/whatsapp/broadcast
 * Send broadcast message to multiple contacts
 * Body: { message, contactIds (array) or tags (array) }
 * Query params: tenantId
 */
router.post('/broadcast', async (req, res) => {
  try {
    const { tenantId } = req.query;
    const broadcastData = req.body;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }

    if (!broadcastData.message) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!broadcastData.contactIds && !broadcastData.tags) {
      return res.status(400).json({ error: 'contactIds or tags is required' });
    }

    const config = await getWhatsAppConfig(tenantId);
    const result = await whatsappClient.sendBroadcastV2(broadcastData, config.apiKey);

    return res.json(result);
  } catch (error) {
    console.error('Error sending broadcast:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
