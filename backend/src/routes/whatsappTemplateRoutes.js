import express from 'express';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';
import Tenant from '../models/Tenant.js';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/whatsapp/templates
 * Fetch all WhatsApp templates for a tenant
 */
router.get('/templates', async (req, res) => {
  try {
    const { tenantId } = req.query;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
        message: 'You must specify which tenant\'s templates to fetch',
      });
    }

    console.log(`📋 Fetching templates for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`,
      });
    }

    // Fetch all templates for this tenant
    const templates = await WhatsAppTemplate.find({ tenantId }).sort({ createdAt: -1 });

    console.log(`✅ Retrieved ${templates.length} templates for tenant: ${tenantId}`);

    return res.json({
      success: true,
      tenantId,
      templates,
      count: templates.length,
    });
  } catch (error) {
    console.error(`❌ Error fetching templates for ${req.query.tenantId}:`, error.message);
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/templates
 * Create a new WhatsApp template
 */
router.post('/templates', async (req, res) => {
  try {
    const { tenantId, templateName, templateBody, category = 'MARKETING', language = 'en' } = req.body;

    if (!tenantId || !templateName || !templateBody) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['tenantId', 'templateName', 'templateBody'],
      });
    }

    console.log(`🆕 Creating template "${templateName}" for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`,
      });
    }

    // Check if WhatsApp is configured for this tenant
    if (!tenant.whatsappConfig?.isConfigured) {
      return res.status(400).json({
        error: 'WhatsApp not configured',
        message: 'Please configure WhatsApp first before creating templates',
      });
    }

    // Extract variables from template body (e.g., {{studentName}}, {{date}})
    const variableRegex = /\{\{(\w+)\}\}/g;
    const variables = [];
    let match;
    while ((match = variableRegex.exec(templateBody)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    // Create template in database
    const newTemplate = new WhatsAppTemplate({
      tenantId,
      templateName,
      templateBody,
      category,
      language,
      variables,
      status: 'pending',
      isLocalOnly: true, // Mark as local until synced to WhatsApp Platform
    });

    await newTemplate.save();

    console.log(`✅ Template "${templateName}" created successfully for tenant: ${tenantId}`);

    return res.status(201).json({
      success: true,
      message: `Template "${templateName}" created successfully`,
      template: newTemplate,
    });
  } catch (error) {
    console.error(`❌ Error creating template for ${req.body.tenantId}:`, error.message);
    res.status(500).json({
      error: 'Failed to create template',
      message: error.message,
    });
  }
});

/**
 * DELETE /api/whatsapp/templates/:templateId
 * Delete a WhatsApp template
 */
router.delete('/templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`🗑️ Deleting template ${templateId} for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`,
      });
    }

    // Find and delete template
    const template = await WhatsAppTemplate.findOneAndDelete({
      _id: templateId,
      tenantId,
    });

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID "${templateId}" not found for this tenant`,
      });
    }

    console.log(`✅ Template "${template.templateName}" deleted for tenant: ${tenantId}`);

    return res.json({
      success: true,
      message: `Template "${template.templateName}" deleted successfully`,
      templateId,
    });
  } catch (error) {
    console.error(`❌ Error deleting template for ${req.body.tenantId}:`, error.message);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message,
    });
  }
});

/**
 * POST /api/whatsapp/templates/sync
 * Sync templates from WhatsApp Platform
 * Protected: Requires valid user authentication
 */
router.post('/templates/sync', protect, async (req, res) => {
  try {
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({
        error: 'tenantId is required',
      });
    }

    console.log(`🔄 Syncing templates from WhatsApp Platform for tenant: ${tenantId}`);

    // Verify tenant exists
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        message: `Tenant "${tenantId}" does not exist`,
      });
    }

    // Check if WhatsApp is configured
    if (!tenant.whatsappConfig?.isConfigured) {
      return res.status(400).json({
        error: 'WhatsApp not configured',
        message: 'Please configure WhatsApp first before syncing templates',
      });
    }

    // Fetch templates from WhatsApp Platform API using tenant's credentials
    const businessAccountId = tenant.whatsappConfig.businessAccountId;
    const phoneNumberId = tenant.whatsappConfig.phoneNumberId;
    // 🔒 CRITICAL: Use tenant's own API key (NOT global hardcoded token)
    const tenantApiKey = tenant.whatsappConfig.apiKey;

    if (!businessAccountId) {
      return res.status(400).json({
        error: 'Missing Business Account ID',
        message: 'Business Account ID is missing. Please connect your WhatsApp Business Account in Settings first.',
      });
    }

    if (!phoneNumberId) {
      return res.status(400).json({
        error: 'Missing Phone Number ID',
        message: 'Phone Number ID is missing. Please configure WhatsApp settings first.',
      });
    }

    if (!tenantApiKey) {
      return res.status(400).json({
        error: 'Missing WhatsApp API Key',
        message: 'Your WhatsApp API key is missing. Please reconfigure WhatsApp in settings.',
      });
    }

    try {
      // Call WhatsApp Platform to fetch templates using tenant's credentials
      const platformUrl = process.env.WHATSAPP_PLATFORM_URL;
      if (!platformUrl) {
        return res.status(500).json({
          error: 'Platform Configuration Error',
          message: 'WhatsApp Platform URL is not configured on the server.',
        });
      }

      if (!platformUrl) {
        return res.status(500).json({
          error: 'Platform Configuration Error',
          message: 'WhatsApp Platform URL is not configured on the server.',
        });
      }

      console.log(`📞 Fetching templates from WhatsApp Platform`);
      console.log(`🔗 URL: ${platformUrl}/api/integrations/templates`);
      console.log(`📱 Tenant: ${tenantId} | Phone Number ID: ${phoneNumberId}`);
      
      // 🔒 Use tenant's API key for the request
      const response = await axios.get(
        `${platformUrl}/api/integrations/templates`,
        {
          headers: {
            'Authorization': `Bearer ${tenantApiKey}`,
            'X-Tenant-Id': tenantId,
            'Content-Type': 'application/json',
          },
        }
      );

      const platformTemplates = response.data?.data?.templates || response.data?.templates || response.data?.data || [];
      console.log(`✅ Fetched ${platformTemplates.length} templates from platform`);

      let syncedCount = 0;

      // Process and save each template
      for (const platformTemplate of platformTemplates) {
        const templateBody = platformTemplate.content || platformTemplate.body || platformTemplate.message || '';
        const templateName = platformTemplate.name || platformTemplate.templateName || '';
        const templateId = platformTemplate._id || platformTemplate.id || platformTemplate.templateId || '';
        const status = (platformTemplate.status || 'APPROVED').toLowerCase();
        const language = platformTemplate.language || 'en_US';
        const category = platformTemplate.category || 'MARKETING';
        const usageCount = platformTemplate.usageCount || 0;

        // Extract variables from template body
        const variableRegex = /\{\{(\w+)\}\}/g;
        const variables = [];
        let match;
        while ((match = variableRegex.exec(templateBody)) !== null) {
          if (!variables.includes(match[1])) {
            variables.push(match[1]);
          }
        }

        const existingTemplate = await WhatsAppTemplate.findOne({
          tenantId,
          templateId: templateId,
        });

        if (existingTemplate) {
          // Update existing template
          existingTemplate.templateName = templateName;
          existingTemplate.templateBody = templateBody;
          existingTemplate.status = status.toLowerCase();
          existingTemplate.category = category;
          existingTemplate.language = language;
          existingTemplate.variables = variables;
          existingTemplate.isLocalOnly = false;
          await existingTemplate.save();
        } else {
          // Create new template
          const newTemplate = new WhatsAppTemplate({
            tenantId,
            templateId: templateId,
            templateName: templateName,
            templateBody: templateBody,
            status: status.toLowerCase(),
            category: category,
            language: language,
            variables: variables,
            isLocalOnly: false,
          });
          await newTemplate.save();
        }
        syncedCount++;
      }

      console.log(`✅ Synced ${syncedCount} templates from WhatsApp Platform for tenant: ${tenantId}`);

      return res.json({
        success: true,
        message: `Successfully synced ${syncedCount} templates`,
        tenantId,
        syncedCount,
      });
    } catch (apiError) {
      console.error(`❌ Error calling WhatsApp Platform API:`, apiError.message);
      return res.status(400).json({
        error: 'Failed to fetch templates from WhatsApp Platform',
        message: apiError.message,
      });
    }
  } catch (error) {
    console.error(`❌ Error syncing templates for ${req.query.tenantId}:`, error.message);
    res.status(500).json({
      error: 'Failed to sync templates',
      message: error.message,
    });
  }
});

export default router;
