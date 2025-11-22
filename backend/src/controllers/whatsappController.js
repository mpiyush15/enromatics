import whatsappService from '../services/whatsappService.js';
import WhatsAppConfig from '../models/WhatsAppConfig.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import WhatsAppContact from '../models/WhatsAppContact.js';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';

// Helper function to get tenantId (supports SuperAdmin accessing any tenant)
const getTenantId = (req, source = 'query') => {
  if (req.user.role === 'SuperAdmin') {
    const paramTenantId = source === 'body' ? req.body.tenantId : req.query.tenantId;
    return paramTenantId || req.user.tenantId;
  }
  return req.user.tenantId;
};


// Save or update WhatsApp configuration
export const saveConfig = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, wabaId, businessName } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!phoneNumberId || !wabaId) {
      return res.status(400).json({ 
        message: 'Phone Number ID and WABA ID are required' 
      });
    }

    // Check if config exists
    const existingConfig = await WhatsAppConfig.findOne({ tenantId });

    // If updating and no accessToken provided, keep the old one
    if (existingConfig && (!accessToken || accessToken.trim() === '')) {
      // Update without changing accessToken
      const config = await WhatsAppConfig.findOneAndUpdate(
        { tenantId },
        {
          phoneNumberId,
          wabaId,
          businessName,
          isActive: true
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: 'WhatsApp configuration updated successfully (token unchanged)',
        config: {
          phoneNumberId: config.phoneNumberId,
          wabaId: config.wabaId,
          businessName: config.businessName,
          isActive: config.isActive
        }
      });
    }

    // For new config or when token is provided, validate token
    if (!accessToken || accessToken.trim() === '') {
      return res.status(400).json({ 
        message: 'Access Token is required for new configuration' 
      });
    }

    // Upsert configuration with token
    const config = await WhatsAppConfig.findOneAndUpdate(
      { tenantId },
      {
        phoneNumberId,
        accessToken: accessToken.trim(),
        wabaId,
        businessName,
        isActive: true
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'WhatsApp configuration saved successfully',
      config: {
        phoneNumberId: config.phoneNumberId,
        wabaId: config.wabaId,
        businessName: config.businessName,
        isActive: config.isActive
      }
    });
  } catch (error) {
    console.error('Save config error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get WhatsApp configuration
export const getConfig = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const config = await WhatsAppConfig.findOne({ tenantId });
    
    if (!config) {
      return res.json({ 
        configured: false,
        message: 'WhatsApp not configured yet' 
      });
    }

    res.json({
      configured: true,
      config: {
        phoneNumberId: config.phoneNumberId,
        wabaId: config.wabaId,
        businessName: config.businessName,
        isActive: config.isActive,
        verifiedAt: config.verifiedAt,
        lastTestedAt: config.lastTestedAt,
        messageCount: config.messageCount,
        settings: config.settings
      }
    });
  } catch (error) {
    console.error('Get config error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove WhatsApp configuration
export const removeConfig = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const config = await WhatsAppConfig.findOne({ tenantId });
    
    if (!config) {
      return res.status(404).json({ 
        message: 'No WhatsApp configuration found' 
      });
    }

    // Delete the configuration
    await WhatsAppConfig.deleteOne({ tenantId });
    
    console.log(`✅ WhatsApp config removed for tenant: ${tenantId}`);

    res.json({
      success: true,
      message: 'WhatsApp configuration removed successfully'
    });
  } catch (error) {
    console.error('Remove config error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Test WhatsApp connection
export const testConnection = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, testPhone } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!phoneNumberId || !accessToken || !testPhone) {
      return res.status(400).json({ 
        message: 'Phone Number ID, Access Token, and Test Phone are required' 
      });
    }

    const result = await whatsappService.testConnection(phoneNumberId, accessToken, testPhone);

    // Update last tested time
    await WhatsAppConfig.updateOne(
      { tenantId },
      { 
        lastTestedAt: new Date(),
        verifiedAt: new Date(),
        isActive: true
      }
    );

    res.json({
      success: true,
      message: 'Connection test successful! Test message sent.',
      data: result
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Send text message
export const sendMessage = async (req, res) => {
  try {
    const { recipientPhone, message, contactId, campaign } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!recipientPhone || !message) {
      return res.status(400).json({ 
        message: 'Recipient phone and message are required' 
      });
    }

    const metadata = {
      campaign: campaign || 'manual',
      sentBy: req.user._id
    };

    if (contactId) {
      metadata.contactId = contactId;
    }

    const result = await whatsappService.sendTextMessage(
      tenantId,
      recipientPhone,
      message,
      metadata
    );

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Send template message
export const sendTemplate = async (req, res) => {
  try {
    const { recipientPhone, templateName, params, campaign } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!recipientPhone || !templateName) {
      return res.status(400).json({ 
        message: 'Recipient phone and template name are required' 
      });
    }

    const metadata = {
      campaign: campaign || 'manual',
      sentBy: req.user._id
    };

    const result = await whatsappService.sendTemplateMessage(
      tenantId,
      recipientPhone,
      templateName,
      params || [],
      metadata
    );

    res.json({
      success: true,
      message: 'Template message sent successfully',
      data: result
    });
  } catch (error) {
    console.error('Send template error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get message history
export const getMessages = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { page = 1, limit = 20, status, campaign, startDate, endDate } = req.query;

    const query = { tenantId };
    
    if (status) query.status = status;
    if (campaign) query.campaign = campaign;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const messages = await WhatsAppMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sentBy', 'name email')
      .lean();

    const total = await WhatsAppMessage.countDocuments(query);

    res.json({
      success: true,
      messages,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get contacts
export const getContacts = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { type, search } = req.query;

    const query = { tenantId };
    
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await WhatsAppContact.find(query)
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      contacts,
      total: contacts.length
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Sync student contacts
export const syncContacts = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const result = await whatsappService.syncStudentContacts(tenantId);

    res.json({
      success: true,
      message: `Synced ${result.synced} contacts (${result.skipped} skipped)`,
      data: result
    });
  } catch (error) {
    console.error('Sync contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { startDate, endDate } = req.query;

    const stats = await whatsappService.getStats(tenantId, { startDate, endDate });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Webhook verification (GET)
export const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'pixels_webhook_secret_2025';

  console.log('🔐 ========== WEBHOOK VERIFICATION ==========');
  console.log('Mode:', mode);
  console.log('Received Token:', token);
  console.log('Expected Token:', VERIFY_TOKEN);
  console.log('Challenge:', challenge);
  console.log('Match:', token === VERIFY_TOKEN ? '✅ YES' : '❌ NO');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified successfully!');
    console.log('Responding with challenge:', challenge);
    console.log('==========================================\n');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification FAILED!');
    console.log('Responding with 403 Forbidden');
    console.log('==========================================\n');
    res.sendStatus(403);
  }
};

// Webhook handler (POST)
export const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    console.log('📥 ========== WEBHOOK RECEIVED ==========');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Full Body:', JSON.stringify(body, null, 2));

    // Acknowledge receipt immediately
    res.sendStatus(200);

    // Process webhook data
    if (body.object === 'whatsapp_business_account') {
      console.log('✅ Valid WhatsApp webhook object');
      
      for (const entry of body.entry) {
        console.log('📦 Processing entry:', entry.id);
        
        for (const change of entry.changes) {
          console.log('🔄 Change field:', change.field);
          
          if (change.field === 'messages') {
            const value = change.value;
            console.log('📨 Messages value:', JSON.stringify(value, null, 2));
            
            // Handle status updates
            if (value.statuses) {
              console.log(`🔔 ${value.statuses.length} status update(s) received`);
              
              for (const statusUpdate of value.statuses) {
                console.log('📊 ========== STATUS UPDATE DETAILS ==========');
                console.log('  - Message ID:', statusUpdate.id);
                console.log('  - Status:', statusUpdate.status);
                console.log('  - Timestamp:', statusUpdate.timestamp);
                console.log('  - Recipient ID:', statusUpdate.recipient_id);
                console.log('  - Conversation ID:', statusUpdate.conversation?.id || 'Not provided');
                console.log('  - Pricing Model:', statusUpdate.pricing?.pricing_model || 'Not provided');
                
                if (statusUpdate.errors && statusUpdate.errors.length > 0) {
                  console.log('  ❌ ========== ERROR DETAILS ==========');
                  statusUpdate.errors.forEach((error, index) => {
                    console.log(`  Error ${index + 1}:`);
                    console.log(`    - Code: ${error.code}`);
                    console.log(`    - Title: ${error.title}`);
                    console.log(`    - Message: ${error.message || 'No message'}`);
                    console.log(`    - Details: ${error.details || 'No details'}`);
                    console.log(`    - Error Data: ${JSON.stringify(error.error_data || {}, null, 2)}`);
                  });
                  console.log('  ========================================');
                } else {
                  console.log('  ✅ No errors - successful status update');
                }
                
                // Log why this message might have failed
                if (statusUpdate.status === 'failed') {
                  console.log('  🔍 ========== FAILURE ANALYSIS ==========');
                  console.log('  Possible reasons for failure:');
                  console.log('  1. Phone number not on WhatsApp');
                  console.log('  2. Invalid phone number format');
                  console.log('  3. 24-hour messaging window expired');
                  console.log('  4. Account quality/rate limiting');
                  console.log('  5. Template message required');
                  console.log('  =========================================');
                }
                
                console.log('===============================================');
                
                await whatsappService.handleStatusUpdate(
                  statusUpdate.id,
                  statusUpdate.status,
                  statusUpdate.timestamp,
                  statusUpdate.errors?.[0] || {}
                );
                
                console.log(`✅ Status updated in database: ${statusUpdate.status}`);
              }
            } else {
              console.log('⚠️ No status updates in this webhook');
            }

            // Handle incoming messages
            if (value.messages) {
              console.log('📬 Incoming messages:', value.messages.length);
              console.log('Messages:', JSON.stringify(value.messages, null, 2));
              // TODO: Handle incoming messages if needed
            }
          } else {
            console.log('ℹ️ Ignoring field:', change.field);
          }
        }
      }
    } else {
      console.log('⚠️ Unknown webhook object type:', body.object);
    }
    
    console.log('========== WEBHOOK PROCESSING COMPLETE ==========\n');
  } catch (error) {
    console.error('❌ ========== WEBHOOK ERROR ==========');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
  }
};

// Get templates
export const getTemplates = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { status, useCase } = req.query;

    const query = { tenantId, deleted: { $ne: true } }; // Exclude deleted templates
    if (status) query.status = status;
    if (useCase) query.useCase = useCase;

    const templates = await WhatsAppTemplate.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Fetch templates from Meta API and sync to database
export const syncTemplatesFromMeta = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    // Get WhatsApp config
    const config = await WhatsAppConfig.findOne({ tenantId });
    if (!config) {
      return res.status(404).json({ 
        success: false,
        message: 'WhatsApp not configured. Please configure WhatsApp first.' 
      });
    }

    console.log('🔄 Fetching templates from Meta for WABA:', config.wabaId);

    // Fetch templates from Meta API
    const axios = (await import('axios')).default;
    const response = await axios.get(
      `https://graph.facebook.com/v21.0/${config.wabaId}/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        },
        params: {
          limit: 100 // Fetch up to 100 templates
        }
      }
    );

    const metaTemplates = response.data.data || [];
    console.log(`✅ Fetched ${metaTemplates.length} templates from Meta`);

    // Get all existing templates for this tenant to mark deleted ones
    const existingTemplates = await WhatsAppTemplate.find({ tenantId, deleted: { $ne: true } });
    const metaTemplateIds = new Set(metaTemplates.map(t => t.id));

    // Sync to database
    let synced = 0;
    let updated = 0;
    let deleted = 0;

    for (const metaTemplate of metaTemplates) {
      try {
        // Extract template details
        const templateData = {
          tenantId,
          name: metaTemplate.name,
          language: metaTemplate.language || 'en',
          category: metaTemplate.category || 'UTILITY',
          status: metaTemplate.status?.toLowerCase() || 'pending',
          metaTemplateId: metaTemplate.id,
          components: metaTemplate.components || [],
          // Extract body text from components
          content: metaTemplate.components?.find(c => c.type === 'BODY')?.text || '',
          // Extract variables from body text ({{1}}, {{2}}, etc.)
          variables: extractVariablesFromTemplate(metaTemplate.components?.find(c => c.type === 'BODY')?.text || ''),
          rejectedReason: metaTemplate.rejected_reason,
          lastSyncedAt: new Date(),
          deleted: false // Ensure it's marked as not deleted
        };

        // Upsert template
        const existing = await WhatsAppTemplate.findOne({ 
          tenantId, 
          name: metaTemplate.name,
          language: metaTemplate.language 
        });

        if (existing) {
          await WhatsAppTemplate.updateOne(
            { _id: existing._id },
            { $set: templateData }
          );
          updated++;
        } else {
          await WhatsAppTemplate.create(templateData);
          synced++;
        }
      } catch (err) {
        console.error(`Error syncing template ${metaTemplate.name}:`, err.message);
      }
    }

    // Mark templates as deleted if they no longer exist in Meta
    for (const existingTemplate of existingTemplates) {
      if (existingTemplate.metaTemplateId && !metaTemplateIds.has(existingTemplate.metaTemplateId)) {
        await WhatsAppTemplate.updateOne(
          { _id: existingTemplate._id },
          { $set: { deleted: true, lastSyncedAt: new Date() } }
        );
        deleted++;
        console.log(`🗑️ Marked template as deleted: ${existingTemplate.name}`);
      }
    }

    res.json({
      success: true,
      message: `Synced ${synced} new, updated ${updated}, deleted ${deleted} templates`,
      stats: {
        total: metaTemplates.length,
        synced,
        updated,
        deleted,
        approved: metaTemplates.filter(t => t.status === 'APPROVED').length,
        pending: metaTemplates.filter(t => t.status === 'PENDING').length,
        rejected: metaTemplates.filter(t => t.status === 'REJECTED').length
      }
    });

  } catch (error) {
    console.error('Sync templates error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      message: error.response?.data?.error?.message || error.message 
    });
  }
};

// Helper function to extract variables from template text
function extractVariablesFromTemplate(text) {
  if (!text) return [];
  const matches = text.match(/\{\{(\d+)\}\}/g);
  if (!matches) return [];
  return matches.map(m => m.replace(/\{\{|\}\}/g, ''));
}

// Create template
export const createTemplate = async (req, res) => {
  try {
    const { name, category, content, variables, useCase } = req.body;
    const tenantId = getTenantId(req, 'body');

    const template = new WhatsAppTemplate({
      tenantId,
      name,
      category: category || 'UTILITY',
      content,
      variables: variables || [],
      useCase: useCase || 'general',
      status: 'draft'
    });

    await template.save();

    res.json({
      success: true,
      message: 'Template created successfully',
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Submit template to Meta for approval
export const submitTemplateToMeta = async (req, res) => {
  try {
    const { name, category, language, bodyText, headerText, footerText, buttons } = req.body;
    const tenantId = getTenantId(req, 'body');

    // Validate required fields
    if (!name || !category || !bodyText) {
      return res.status(400).json({
        success: false,
        message: 'Template name, category, and body text are required'
      });
    }

    // Get WhatsApp config
    const config = await WhatsAppConfig.findOne({ tenantId });
    if (!config) {
      return res.status(404).json({ 
        success: false,
        message: 'WhatsApp not configured. Please configure WhatsApp first.' 
      });
    }

    console.log('📤 Submitting template to Meta:', name);

    // Build template components
    const components = [];

    // Add header if provided
    if (headerText) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: headerText
      });
    }

    // Add body (required)
    components.push({
      type: 'BODY',
      text: bodyText
    });

    // Add footer if provided
    if (footerText) {
      components.push({
        type: 'FOOTER',
        text: footerText
      });
    }

    // Add buttons if provided
    if (buttons && buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: buttons.map(btn => ({
          type: btn.type || 'QUICK_REPLY',
          text: btn.text
        }))
      });
    }

    // Submit to Meta API
    const axios = (await import('axios')).default;
    const response = await axios.post(
      `https://graph.facebook.com/v21.0/${config.wabaId}/message_templates`,
      {
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'), // Meta requires lowercase and underscores
        language: language || 'en',
        category: category,
        components: components
      },
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Template submitted to Meta:', response.data);

    // Save template to database
    const template = new WhatsAppTemplate({
      tenantId,
      name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      language: language || 'en',
      category,
      content: bodyText,
      variables: extractVariablesFromTemplate(bodyText),
      components,
      status: 'pending',
      metaTemplateId: response.data.id
    });

    await template.save();

    res.json({
      success: true,
      message: 'Template submitted to Meta for approval! Review typically takes 24-48 hours.',
      template: {
        id: template._id,
        name: template.name,
        status: template.status,
        metaTemplateId: response.data.id
      }
    });

  } catch (error) {
    console.error('Submit template error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false,
      message: error.response?.data?.error?.message || error.message,
      details: error.response?.data?.error?.error_user_msg || 'Failed to submit template to Meta'
    });
  }
};

// Create manual contact
export const createContact = async (req, res) => {
  try {
    const { name, phone, type, studentId, email } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!name || !phone) {
      return res.status(400).json({ 
        message: 'Name and phone number are required' 
      });
    }

    // Validate phone format (remove spaces and special chars)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      return res.status(400).json({ 
        message: 'Invalid phone number format. Must be 10-15 digits.' 
      });
    }

    // Check if contact already exists
    const existing = await WhatsAppContact.findOne({ 
      tenantId, 
      whatsappNumber: cleanPhone 
    });

    if (existing) {
      return res.status(400).json({ 
        message: 'Contact with this phone number already exists' 
      });
    }

    const contact = new WhatsAppContact({
      tenantId,
      name,
      phone: phone, // Original phone input
      whatsappNumber: cleanPhone, // Cleaned phone number
      type: type || 'other',
      studentId: studentId || null,
      isOptedIn: true
    });

    await contact.save();

    res.json({
      success: true,
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Contact with this phone number already exists for this tenant' 
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// Import contacts from CSV
export const importContacts = async (req, res) => {
  try {
    const { contacts } = req.body;
    const tenantId = getTenantId(req, 'body');

    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ 
        message: 'Contacts array is required and must not be empty' 
      });
    }

    const results = {
      total: contacts.length,
      imported: 0,
      skipped: 0,
      errors: []
    };

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        // Validate required fields
        if (!contact.name || !contact.phone) {
          results.errors.push({
            row: i + 1,
            error: 'Name and phone are required',
            contact
          });
          results.skipped++;
          continue;
        }

        // Clean phone number
        const cleanPhone = contact.phone.toString().replace(/\D/g, '');
        
        if (cleanPhone.length < 10 || cleanPhone.length > 15) {
          results.errors.push({
            row: i + 1,
            error: 'Invalid phone number format',
            contact
          });
          results.skipped++;
          continue;
        }

        // Check if exists
        const existing = await WhatsAppContact.findOne({ 
          tenantId, 
          whatsappNumber: cleanPhone 
        });

        if (existing) {
          results.skipped++;
          continue;
        }

        // Create contact
        await WhatsAppContact.create({
          tenantId,
          name: contact.name.trim(),
          phone: contact.phone.toString(), // Original phone
          whatsappNumber: cleanPhone, // Cleaned phone
          type: contact.type || 'other',
          studentId: contact.studentId || null,
          isOptedIn: true
        });

        results.imported++;
      } catch (error) {
        results.errors.push({
          row: i + 1,
          error: error.message,
          contact
        });
        results.skipped++;
      }
    }

    res.json({
      success: true,
      message: `Import completed: ${results.imported} imported, ${results.skipped} skipped`,
      results
    });
  } catch (error) {
    console.error('Import contacts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete contact
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = getTenantId(req);

    const contact = await WhatsAppContact.findOneAndDelete({ 
      _id: id, 
      tenantId 
    });

    if (!contact) {
      return res.status(404).json({ 
        message: 'Contact not found' 
      });
    }

    res.json({
      success: true,
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Debug endpoint to send test message with detailed logging
export const debugSendMessage = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { phone, message = "🔍 Debug test message from Enromatics - checking delivery status" } = req.body;

    if (!phone) {
      return res.status(400).json({ 
        success: false,
        error: 'Phone number is required' 
      });
    }

    console.log('🧪 ========== DEBUG MESSAGE SEND ==========');
    console.log('Tenant ID:', tenantId);
    console.log('Test Phone:', phone);
    console.log('Test Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User ID:', req.user._id);
    console.log('=========================================');

    const result = await whatsappService.sendTextMessage(
      tenantId, 
      phone, 
      message,
      { 
        campaign: 'debug_test',
        sentBy: req.user._id 
      }
    );

    console.log('🧪 Debug send result:', result);

    res.json({
      success: true,
      result,
      message: 'Debug message sent - check Railway logs for detailed tracking',
      instructions: 'Watch the console logs above for detailed Meta API interaction'
    });
  } catch (error) {
    console.error('🧪 Debug send error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Debug endpoint to test Meta API directly
export const debugMetaAPI = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const config = await WhatsAppConfig.findOne({ tenantId });
    
    if (!config) {
      return res.json({ 
        success: false,
        error: 'No WhatsApp config found for tenant'
      });
    }

    // Test the Meta API with current credentials
    const axios = (await import('axios')).default;
    
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v21.0/${config.phoneNumberId}`,
        {
          headers: {
            'Authorization': `Bearer ${config.accessToken}`
          }
        }
      );

      res.json({
        success: true,
        message: 'Meta API connection successful',
        phoneNumberId: config.phoneNumberId,
        wabaId: config.wabaId,
        apiResponse: response.data
      });
    } catch (apiError) {
      res.json({
        success: false,
        error: 'Meta API error',
        details: apiError.response?.data || apiError.message,
        config: {
          phoneNumberId: config.phoneNumberId,
          wabaId: config.wabaId,
          tokenLength: config.accessToken?.length || 0
        }
      });
    }
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Debug endpoint to check database messages
export const debugMessages = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const [config, messageCount, messages] = await Promise.all([
      WhatsAppConfig.findOne({ tenantId }),
      WhatsAppMessage.countDocuments({ tenantId }),
      WhatsAppMessage.find({ tenantId }).sort({ createdAt: -1 }).limit(10)
    ]);

    res.json({
      success: true,
      config: config ? {
        phoneNumberId: config.phoneNumberId,
        wabaId: config.wabaId,
        isActive: config.isActive,
        messageCount: config.messageCount
      } : null,
      totalMessages: messageCount,
      recentMessages: messages.map(m => ({
        id: m._id,
        recipientPhone: m.recipientPhone,
        status: m.status,
        messageType: m.messageType,
        content: m.content,
        waMessageId: m.waMessageId,
        errorMessage: m.errorMessage,
        createdAt: m.createdAt,
        sentAt: m.sentAt,
        statusUpdates: m.statusUpdates
      }))
    });
  } catch (error) {
    console.error('Debug messages error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export default {
  saveConfig,
  getConfig,
  removeConfig,
  testConnection,
  sendMessage,
  sendTemplate,
  getMessages,
  getContacts,
  syncContacts,
  getStats,
  verifyWebhook,
  handleWebhook,
  getTemplates,
  syncTemplatesFromMeta,
  submitTemplateToMeta,
  createTemplate,
  createContact,
  importContacts,
  deleteContact,
  debugSendMessage,
  debugMetaAPI,
  debugMessages
};
