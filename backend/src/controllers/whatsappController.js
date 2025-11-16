import whatsappService from '../services/whatsappService.js';
import WhatsAppConfig from '../models/WhatsAppConfig.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import WhatsAppContact from '../models/WhatsAppContact.js';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';

// Save or update WhatsApp configuration
export const saveConfig = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, wabaId, businessName } = req.body;
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;
    
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

// Test WhatsApp connection
export const testConnection = async (req, res) => {
  try {
    const { phoneNumberId, accessToken, testPhone } = req.body;
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;
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
    const tenantId = req.user.tenantId;
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
    const tenantId = req.user.tenantId;
    
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
    const tenantId = req.user.tenantId;
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

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('Webhook verification failed');
    res.sendStatus(403);
  }
};

// Webhook handler (POST)
export const handleWebhook = async (req, res) => {
  try {
    const body = req.body;

    // Acknowledge receipt immediately
    res.sendStatus(200);

    // Process webhook data
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            const value = change.value;
            
            // Handle status updates
            if (value.statuses) {
              for (const statusUpdate of value.statuses) {
                await whatsappService.handleStatusUpdate(
                  statusUpdate.id,
                  statusUpdate.status,
                  statusUpdate.timestamp,
                  statusUpdate.errors?.[0] || {}
                );
              }
            }

            // Handle incoming messages
            if (value.messages) {
              console.log('Incoming messages:', value.messages);
              // TODO: Handle incoming messages if needed
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Webhook handler error:', error);
  }
};

// Get templates
export const getTemplates = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const { status, useCase } = req.query;

    const query = { tenantId };
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
    const tenantId = req.user.tenantId;
    
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

    // Sync to database
    let synced = 0;
    let updated = 0;

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
          lastSyncedAt: new Date()
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

    res.json({
      success: true,
      message: `Synced ${synced} new templates, updated ${updated} existing templates`,
      stats: {
        total: metaTemplates.length,
        synced,
        updated,
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
    const tenantId = req.user.tenantId;

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

// Create manual contact
export const createContact = async (req, res) => {
  try {
    const { name, phone, type, studentId, email } = req.body;
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;

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
    const tenantId = req.user.tenantId;

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

// Debug endpoint to test Meta API directly
export const debugMetaAPI = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
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
    const tenantId = req.user.tenantId;
    
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
  createTemplate,
  createContact,
  importContacts,
  deleteContact,
  debugMetaAPI,
  debugMessages
};
