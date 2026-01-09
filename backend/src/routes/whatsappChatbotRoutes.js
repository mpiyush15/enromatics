import express from 'express';
import WhatsAppChatbot from '../models/WhatsAppChatbot.js';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';
import Tenant from '../models/Tenant.js';
import axios from 'axios';

const router = express.Router();

/**
 * GET /api/whatsapp/chatbots
 * Fetch all chatbots for a tenant
 */
router.get('/chatbots', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`🤖 Fetching chatbots for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Fetch all chatbots for this tenant
    const chatbots = await WhatsAppChatbot.find({ tenantId }).sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${chatbots.length} chatbots for tenant: ${tenantId}`);

    return res.json({
      success: true,
      tenantId,
      chatbots,
      count: chatbots.length,
    });
  } catch (error) {
    console.error(`❌ Error fetching chatbots:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch chatbots',
      message: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/chatbots
 * Create a new chatbot
 */
router.post('/chatbots', async (req, res) => {
  try {
    const { tenantId, botName, description = '', welcomeTemplateId = null } = req.body;

    if (!tenantId || !botName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['tenantId', 'botName'],
      });
    }

    console.log(`🆕 Creating chatbot "${botName}" for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Check if WhatsApp is configured
    if (!tenant.whatsappConfig?.isConfigured) {
      return res.status(400).json({
        error: 'WhatsApp not configured',
        message: 'Please configure WhatsApp first',
      });
    }

    // Create chatbot
    const newChatbot = new WhatsAppChatbot({
      tenantId,
      botName,
      description,
      welcomeTemplateId,
      isEnabled: true,
    });

    await newChatbot.save();

    console.log(`✅ Chatbot "${botName}" created for tenant: ${tenantId}`);

    return res.status(201).json({
      success: true,
      message: `Chatbot "${botName}" created successfully`,
      chatbot: newChatbot,
    });
  } catch (error) {
    console.error(`❌ Error creating chatbot:`, error.message);
    res.status(500).json({
      error: 'Failed to create chatbot',
      message: error.message,
    });
  }
});

/**
 * PUT /api/whatsapp/chatbots/:botId
 * Update chatbot settings
 */
router.put('/chatbots/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const { tenantId, botName, description, isEnabled, welcomeTemplateId, settings } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`📝 Updating chatbot ${botId} for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Find and update chatbot
    const chatbot = await WhatsAppChatbot.findOneAndUpdate(
      { _id: botId, tenantId },
      {
        botName,
        description,
        isEnabled,
        welcomeTemplateId,
        settings,
      },
      { new: true }
    );

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found',
      });
    }

    console.log(`✅ Chatbot ${botId} updated for tenant: ${tenantId}`);

    return res.json({
      success: true,
      message: 'Chatbot updated successfully',
      chatbot,
    });
  } catch (error) {
    console.error(`❌ Error updating chatbot:`, error.message);
    res.status(500).json({
      error: 'Failed to update chatbot',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/whatsapp/chatbots/:botId
 * Delete a chatbot
 */
router.delete('/chatbots/:botId', async (req, res) => {
  try {
    const { botId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`🗑️ Deleting chatbot ${botId} for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Find and delete chatbot
    const chatbot = await WhatsAppChatbot.findOneAndDelete({ _id: botId, tenantId });

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found',
      });
    }

    console.log(`✅ Chatbot "${chatbot.botName}" deleted for tenant: ${tenantId}`);

    return res.json({
      success: true,
      message: `Chatbot "${chatbot.botName}" deleted successfully`,
    });
  } catch (error) {
    console.error(`❌ Error deleting chatbot:`, error.message);
    res.status(500).json({
      error: 'Failed to delete chatbot',
      message: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/chatbots/:botId/keywords
 * Add keyword to chatbot
 */
router.post('/chatbots/:botId/keywords', async (req, res) => {
  try {
    const { botId } = req.params;
    const { tenantId, keyword, templateId = null, customResponse = null, isActive = true } = req.body;

    if (!tenantId || !keyword) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['tenantId', 'keyword'],
      });
    }

    console.log(`🔑 Adding keyword "${keyword}" to chatbot ${botId} for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
      });
    }

    // Find chatbot and add keyword
    const chatbot = await WhatsAppChatbot.findOneAndUpdate(
      { _id: botId, tenantId },
      {
        $push: {
          keywords: {
            keyword,
            templateId,
            customResponse,
            isActive,
          },
        },
      },
      { new: true }
    );

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found',
      });
    }

    console.log(`✅ Keyword "${keyword}" added to chatbot ${botId}`);

    return res.status(201).json({
      success: true,
      message: `Keyword "${keyword}" added successfully`,
      chatbot,
    });
  } catch (error) {
    console.error(`❌ Error adding keyword:`, error.message);
    res.status(500).json({
      error: 'Failed to add keyword',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/whatsapp/chatbots/:botId/keywords/:keywordId
 * Delete keyword from chatbot
 */
router.delete('/chatbots/:botId/keywords/:keywordId', async (req, res) => {
  try {
    const { botId, keywordId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`🔑 Removing keyword from chatbot ${botId} for tenant: ${tenantId}`);

    // Find chatbot and remove keyword
    const chatbot = await WhatsAppChatbot.findOneAndUpdate(
      { _id: botId, tenantId },
      {
        $pull: {
          keywords: { _id: keywordId },
        },
      },
      { new: true }
    );

    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found',
      });
    }

    console.log(`✅ Keyword removed from chatbot ${botId}`);

    return res.json({
      success: true,
      message: 'Keyword removed successfully',
      chatbot,
    });
  } catch (error) {
    console.error(`❌ Error removing keyword:`, error.message);
    res.status(500).json({
      error: 'Failed to remove keyword',
      message: error.message,
    });
  }
});

/**
 * GET /api/whatsapp/chatbots/:botId/templates
 * Get available templates for chatbot
 */
router.get('/chatbots/:botId/templates', async (req, res) => {
  try {
    const { botId } = req.params;
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`📋 Fetching templates for chatbot ${botId}`);

    // Verify chatbot exists
    const chatbot = await WhatsAppChatbot.findOne({ _id: botId, tenantId });
    if (!chatbot) {
      return res.status(404).json({
        error: 'Chatbot not found',
      });
    }

    // Fetch approved templates for this tenant
    const templates = await WhatsAppTemplate.find({
      tenantId,
      status: 'approved',
    }).select('templateName templateBody _id');

    console.log(`✅ Retrieved ${templates.length} approved templates`);

    return res.json({
      success: true,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error(`❌ Error fetching templates:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message,
    });
  }
});

export default router;
