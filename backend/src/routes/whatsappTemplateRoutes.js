import express from 'express';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';
import Tenant from '../models/Tenant.js';
import axios from 'axios';

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
 */
router.post('/templates/sync', async (req, res) => {
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

    // Fetch templates from WhatsApp Platform API
    const businessAccountId = tenant.whatsappConfig.businessAccountId;
    const accessToken = tenant.whatsappConfig.accessToken;

    if (!businessAccountId || !accessToken) {
      return res.status(400).json({
        error: 'Missing WhatsApp credentials',
        message: 'Business Account ID or Access Token is missing',
      });
    }

    try {
      // Call Meta Graph API to fetch templates
      const response = await axios.get(
        `https://graph.instagram.com/v21.0/${businessAccountId}/message_templates`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,status,category,language,components',
          },
        }
      );

      const metaTemplates = response.data.data || [];
      let syncedCount = 0;

      // Process and save each template
      for (const metaTemplate of metaTemplates) {
        const templateBody = metaTemplate.components
          ?.find((c) => c.type === 'BODY')
          ?.text || '';

        const existingTemplate = await WhatsAppTemplate.findOne({
          tenantId,
          templateId: metaTemplate.id,
        });

        if (existingTemplate) {
          // Update existing template
          existingTemplate.templateName = metaTemplate.name;
          existingTemplate.templateBody = templateBody;
          existingTemplate.status = metaTemplate.status?.toLowerCase() || 'pending';
          existingTemplate.category = metaTemplate.category || 'MARKETING';
          existingTemplate.language = metaTemplate.language || 'en';
          existingTemplate.isLocalOnly = false;
          await existingTemplate.save();
        } else {
          // Create new template
          const newTemplate = new WhatsAppTemplate({
            tenantId,
            templateId: metaTemplate.id,
            templateName: metaTemplate.name,
            templateBody,
            status: metaTemplate.status?.toLowerCase() || 'pending',
            category: metaTemplate.category || 'MARKETING',
            language: metaTemplate.language || 'en',
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
      console.error(`❌ Error calling WhatsApp API:`, apiError.message);
      return res.status(400).json({
        error: 'Failed to fetch templates from WhatsApp Platform',
        message: apiError.message,
      });
    }
  } catch (error) {
    console.error(`❌ Error syncing templates for ${req.body.tenantId}:`, error.message);
    res.status(500).json({
      error: 'Failed to sync templates',
      message: error.message,
    });
  }
});

export default router;
