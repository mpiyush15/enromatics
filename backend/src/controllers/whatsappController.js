import whatsappService from '../services/whatsappService.js';
import WhatsAppConfig from '../models/WhatsAppConfig.js';
import WhatsAppMessage from '../models/WhatsAppMessage.js';
import WhatsAppContact from '../models/WhatsAppContact.js';
import WhatsAppTemplate from '../models/WhatsAppTemplate.js';
import WhatsAppInbox from '../models/WhatsAppInbox.js';
import AutomationWorkflow from '../models/AutomationWorkflow.js';
import WorkflowConversation from '../models/WorkflowConversation.js';
import User from '../models/User.js';

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

/**
 * Get the linked WhatsApp phone number for the tenant
 * Used by automation workflows to auto-select the phone number
 * Returns phoneNumberId (Meta ID), not the display phone number
 */
export const getLinkedPhoneNumber = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    const config = await WhatsAppConfig.findOne({ tenantId });
    
    if (!config) {
      return res.json({ 
        linkedPhoneNumber: null,
        phoneNumberId: null,
        message: 'No WhatsApp configuration found' 
      });
    }

    // ✅ Return phoneNumberId (Meta's internal ID)
    // IMPORTANT: This is NOT the actual WhatsApp phone number (+91xxxxxxx)
    // This is Meta's internal identifier used for:
    //   - Webhook routing
    //   - Sending messages
    //   - Workflow filtering (linkedPhoneNumber field)
    // Example: "889344924259692" 
    // See: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/phone-number
    return res.json({
      linkedPhoneNumber: config.phoneNumberId,
      phoneNumberId: config.phoneNumberId,
      wabaId: config.wabaId,
      businessName: config.businessName,
      displayPhoneNumber: null // TODO: Fetch from Meta Graph API if needed for UI display
    });
  } catch (error) {
    console.error('Get linked phone number error:', error);
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

// Sync tenant contacts (SuperAdmin only)
export const syncTenantContacts = async (req, res) => {
  try {
    // Only SuperAdmin can sync tenant contacts
    if (req.user.role !== 'SuperAdmin') {
      return res.status(403).json({ 
        message: 'Access denied. Only SuperAdmin can sync tenant contacts.' 
      });
    }

    const tenantId = getTenantId(req);
    
    const result = await whatsappService.syncTenantContacts(tenantId);

    res.json({
      success: true,
      message: `Synced ${result.synced} tenant contacts (${result.skipped} skipped)`,
      data: result
    });
  } catch (error) {
    console.error('Sync tenant contacts error:', error);
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

/**
 * Check if incoming message triggers any automation workflow
 * Matches trigger keyword and phone number
 */
const checkAndTriggerAutomation = async (tenantId, phoneNumberId, messageText, senderPhone) => {
  try {
    if (!messageText || !messageText.trim()) {
      console.log('⚠️ No message text to check for automation triggers');
      return null;
    }

    // Find all published workflows for this tenant (both active and inactive)
    // They will trigger based on keyword match
    const workflows = await AutomationWorkflow.find({
      tenantId,
      isPublished: true,
      // Include both active and inactive - let keyword matching determine trigger
    });

    console.log(`🔍 Checking ${workflows.length} published workflows for triggers`);

    for (const workflow of workflows) {
      // ✅ Filter workflows by phone_number_id
      // NOTE: linkedPhoneNumber stores Meta's internal Phone Number ID (e.g., "889344924259692")
      // This ensures the workflow only triggers on messages received to THIS specific WABA number
      // See best-practice rule: **Logic = phone_number_id, UI = display_phone_number**
      if (workflow.linkedPhoneNumber && workflow.linkedPhoneNumber !== phoneNumberId) {
        console.log(`⏭️  Workflow "${workflow.name}" is not linked to phone ${phoneNumberId}, skipping`);
        continue;
      }

      // Check if message matches trigger keyword(s)
      // Split by comma and check if ANY keyword matches
      const triggerKeywords = (workflow.triggerKeyword || 'hi')
        .split(',')
        .map(k => k.toLowerCase().trim())
        .filter(k => k.length > 0);
      
      const incomingMessage = messageText.toLowerCase().trim();
      
      // Check if incoming message contains ANY of the trigger keywords
      const keywordMatched = triggerKeywords.some(keyword => 
        incomingMessage.includes(keyword)
      );

      if (keywordMatched) {
        const matchedKeyword = triggerKeywords.find(keyword => 
          incomingMessage.includes(keyword)
        );
        console.log(`✅ AUTOMATION TRIGGER MATCHED!`);
        console.log(`  - Workflow: ${workflow.name}`);
        console.log(`  - Trigger keyword: "${matchedKeyword}" from [${triggerKeywords.join(', ')}]`);
        console.log(`  - Message: "${incomingMessage}"`);

        // Create a workflow conversation record
        const conversationId = `${tenantId}_${senderPhone}`;
        
        // Close any previous conversation for this user
        const previousConversation = await WorkflowConversation.findOne({
          tenantId,
          conversationId,
          status: { $in: ['triggered', 'in_progress'] }, // Match either status
        });
        
        if (previousConversation) {
          console.log(`⚠️  Closing previous conversation and starting new one`);
          previousConversation.status = 'abandoned';
          previousConversation.abandonedAt = new Date();
          await previousConversation.save();
        }
        
        const workflowConversation = new WorkflowConversation({
          tenantId,
          workflowId: workflow._id,
          conversationId,
          senderPhone,
          currentQuestionIndex: 0,
          answers: [],
          status: 'triggered', // ✅ Use "triggered" instead of "active"
          startedAt: new Date(),
        });

        await workflowConversation.save();
        console.log(`✅ Created workflow conversation: ${workflowConversation._id}`);

        // Update workflow conversation count
        workflow.conversationCount = (workflow.conversationCount || 0) + 1;
        await workflow.save();

        return {
          workflow,
          conversation: workflowConversation,
          firstQuestion: workflow.questions && workflow.questions.length > 0 ? workflow.questions[0] : null,
        };
      }
    }

    console.log('ℹ️ No automation triggers matched');
    return null;
  } catch (error) {
    console.error('❌ Error checking automation triggers:', error);
    return null;
  }
};

/**
 * Handle ongoing workflow conversation
 * Processes user answers and moves to next question
 */
const handleWorkflowConversationMessage = async (tenantId, senderPhone, messageText) => {
  try {
    if (!messageText || !messageText.trim()) {
      console.log('⚠️ No message text to process for workflow');
      return null;
    }

    // Find existing workflow conversation for this user
    const conversationId = `${tenantId}_${senderPhone}`;
    const conversation = await WorkflowConversation.findOne({
      tenantId,
      conversationId,
      status: { $in: ['triggered', 'in_progress'] }, // Match either status
    }).populate('workflowId');

    if (!conversation) {
      console.log(`ℹ️ No active workflow conversation found for ${senderPhone}`);
      return null;
    }

    const workflow = conversation.workflowId;
    console.log(`🔄 Processing answer for workflow: ${workflow.name}`);
    console.log(`  - Current question index: ${conversation.currentQuestionIndex}`);
    console.log(`  - User answer: ${messageText}`);

    // Get current question
    const currentQuestion = workflow.questions[conversation.currentQuestionIndex];
    
    if (!currentQuestion) {
      console.log('✅ All questions completed!');
      conversation.status = 'completed';
      conversation.completedAt = new Date();
      await conversation.save();

      // Update workflow completion count
      workflow.completionCount = (workflow.completionCount || 0) + 1;
      await workflow.save();

      return {
        conversation,
        workflow,
        isComplete: true,
        message: 'Thank you! Your responses have been recorded.',
      };
    }

    // Store the answer
    conversation.answers.push({
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      answer: messageText,
      timestamp: new Date(),
    });

    // If this is a name field, extract and store
    if (currentQuestion.isNameField) {
      conversation.extractedData = conversation.extractedData || {};
      conversation.extractedData.name = messageText;
    }

    // If this is a mobile field, extract and store
    if (currentQuestion.isMobileField) {
      conversation.extractedData = conversation.extractedData || {};
      conversation.extractedData.phone = messageText;
    }

    // ✅ FIX: Check if this is the last question BEFORE incrementing
    const isLastQuestion = conversation.currentQuestionIndex === workflow.questions.length - 1;
    
    if (isLastQuestion) {
      // This is the final answer - mark as complete
      console.log(`✅ Final answer received. Workflow complete!`);
      conversation.currentQuestionIndex = conversation.currentQuestionIndex; // Keep at last index
      conversation.status = 'completed';
      conversation.completedAt = new Date();
      await conversation.save();

      // Update workflow completion count
      workflow.completionCount = (workflow.completionCount || 0) + 1;
      await workflow.save();

      return {
        conversation,
        workflow,
        currentQuestion,
        nextQuestion: null,
        isComplete: true,
        message: 'Thank you for completing the workflow!',
      };
    } else {
      // Move to next question
      conversation.currentQuestionIndex = (conversation.currentQuestionIndex || 0) + 1;
      await conversation.save();

      // Get next question
      const nextQuestion = workflow.questions[conversation.currentQuestionIndex];

      console.log(`✅ Answer recorded. Moving to question ${conversation.currentQuestionIndex + 1}/${workflow.questions.length}`);

      return {
        conversation,
        workflow,
        currentQuestion,
        nextQuestion,
        isComplete: false,
        message: nextQuestion.text,
      };
    }
  } catch (error) {
    console.error('❌ Error handling workflow conversation:', error);
    return null;
  }
};

// Webhook handler (POST)
export const handleWebhook = async (req, res) => {
  console.log('\n🔔🔔🔔 WEBHOOK HIT! 🔔🔔🔔 Timestamp:', new Date().toISOString());
  
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
              console.log('📬 ========== INCOMING MESSAGES ==========');
              console.log(`Received ${value.messages.length} incoming message(s)`);
              
              for (const message of value.messages) {
                try {
                  console.log('📥 Processing incoming message:', message.id);
                  console.log('From:', message.from);
                  console.log('Type:', message.type);
                  console.log('Timestamp:', message.timestamp);
                  console.log('🔍 Debug - value.metadata:', JSON.stringify(value.metadata, null, 2));
                  console.log('🔍 Debug - entry.id:', entry.id);
                  
                  // ✅ Get phone_number_id from webhook metadata
                  // NOTE: This is Meta's internal Phone Number ID, NOT the actual WhatsApp number (+91xxxxxxx)
                  // Example: "889344924259692" (used for routing) vs "+91XXXXXXXXXX" (display only)
                  // See: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-example
                  const phoneNumberId = value.metadata?.phone_number_id || entry.id;
                  console.log('📞 Looking for config with phone_number_id:', phoneNumberId);
                  
                  const config = await WhatsAppConfig.findOne({ 
                    phoneNumberId: phoneNumberId
                  });
                  
                  if (!config) {
                    console.log('⚠️ No config found for phone_number_id:', phoneNumberId);
                    console.log('⚠️ Attempting fallback search in WhatsAppConfig collection');
                    const allConfigs = await WhatsAppConfig.find({}, 'phoneNumberId tenantId');
                    console.log('📋 Available configs:', allConfigs);
                    continue;
                  }
                  
                  const tenantId = config.tenantId;
                  console.log('📋 TenantId:', tenantId);
                  
                  // Create conversation ID (unique per sender)
                  const conversationId = `${tenantId}_${message.from}`;
                  
                  // Prepare message content based on type
                  const content = {};
                  let messageType = message.type;
                  
                  switch (message.type) {
                    case 'text':
                      content.text = message.text?.body;
                      break;
                      
                    case 'image':
                    case 'document':
                    case 'audio':
                    case 'video':
                    case 'voice':
                      const media = message[message.type];
                      content.mediaId = media?.id;
                      content.mimeType = media?.mime_type;
                      content.filename = media?.filename;
                      content.caption = media?.caption;
                      if (message.type === 'voice') messageType = 'audio';
                      break;
                      
                    case 'location':
                      content.latitude = message.location?.latitude;
                      content.longitude = message.location?.longitude;
                      content.address = message.location?.address;
                      content.name = message.location?.name;
                      break;
                      
                    case 'contacts':
                      content.contacts = message.contacts?.map(contact => ({
                        name: contact.name?.formatted_name,
                        phone: contact.phones?.[0]?.phone,
                        email: contact.emails?.[0]?.email
                      }));
                      messageType = 'contact';
                      break;
                      
                    case 'interactive':
                      if (message.interactive?.type === 'button_reply') {
                        content.interactiveType = 'button_reply';
                        content.buttonId = message.interactive.button_reply?.id;
                        content.buttonText = message.interactive.button_reply?.title;
                      } else if (message.interactive?.type === 'list_reply') {
                        content.interactiveType = 'list_reply';
                        content.listId = message.interactive.list_reply?.id;
                        content.listTitle = message.interactive.list_reply?.title;
                        content.listDescription = message.interactive.list_reply?.description;
                      }
                      break;
                      
                    case 'reaction':
                      content.reactionEmoji = message.reaction?.emoji;
                      content.reactedToMessageId = message.reaction?.message_id;
                      break;
                      
                    default:
                      console.log('⚠️ Unsupported message type:', message.type);
                      content.text = `[${message.type.toUpperCase()}] Unsupported message type`;
                  }
                  
                  // Get sender profile information
                  const contacts = value.contacts || [];
                  const senderProfile = contacts.find(c => c.wa_id === message.from);
                  
                  // Create inbox message
                  const inboxMessage = {
                    tenantId,
                    waMessageId: message.id,
                    senderPhone: message.from,
                    senderName: senderProfile?.profile?.name,
                    senderProfileName: senderProfile?.profile?.name,
                    messageType,
                    content,
                    timestamp: new Date(parseInt(message.timestamp) * 1000),
                    conversationId,
                    context: {
                      forwarded: message.context?.forwarded || false,
                      quotedMessageId: message.context?.id,
                      quotedMessage: message.context?.body
                    },
                    webhookData: message
                  };
                  
                  // Save to inbox
                  const savedMessage = await WhatsAppInbox.create(inboxMessage);
                  console.log('✅ Saved incoming message to inbox:', savedMessage._id);
                  
                  // Log message details
                  console.log('💬 Message details:');
                  console.log(`  - Type: ${messageType}`);
                  console.log(`  - From: ${message.from} (${senderProfile?.profile?.name || 'Unknown'})`);
                  console.log(`  - Content: ${JSON.stringify(content, null, 2)}`);
                  console.log(`  - Conversation: ${conversationId}`);
                  
                  // Check for automation workflow triggers (only for text messages)
                  if (message.type === 'text' && content.text) {
                    // Priority 1: Check for NEW workflow triggers FIRST
                    // This allows re-triggering even if user is in an active conversation
                    let automationResult = await checkAndTriggerAutomation(
                      tenantId,
                      config.phoneNumberId,
                      content.text,
                      message.from
                    );
                    
                    // Priority 2: If no trigger matched, check if user is in ongoing conversation
                    if (!automationResult) {
                      automationResult = await handleWorkflowConversationMessage(
                        tenantId,
                        message.from,
                        content.text
                      );
                    }
                    
                    if (automationResult) {
                      console.log(`🤖 Automation result:`, {
                        isNewTrigger: automationResult.workflow && !automationResult.conversation,
                        isOngoing: automationResult.conversation && automationResult.conversation._id,
                        isComplete: automationResult.isComplete,
                        nextQuestion: automationResult.nextQuestion?.text || 'Workflow complete',
                      });
                    }
                  }
                } catch (messageError) {
                  console.error('❌ Error processing incoming message:', messageError);
                  console.error('Message data:', JSON.stringify(message, null, 2));
                }
              }
              
              console.log('========== INCOMING MESSAGES PROCESSED ==========');
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

    const query = { tenantId, deleted: { $ne: true }, status: 'approved' }; // Only approved templates
    if (status) query.status = status; // Allow override if explicitly requested
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

        const variableCount = templateData.variables?.length || 0;
        const statusBadge = metaTemplate.status === 'APPROVED' ? '✅' : metaTemplate.status === 'PENDING' ? '⏳' : '❌';
        console.log(`${statusBadge} Template: ${metaTemplate.name} | Status: ${metaTemplate.status} | Variables: ${variableCount}`);

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

// ========== INBOX MANAGEMENT ==========

// Get inbox conversations list
export const getInboxConversations = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { limit = 20, unreadOnly = false } = req.query;

    console.log('📥 Getting inbox conversations for tenant:', tenantId);

    // Get conversations with aggregation
    const conversations = await WhatsAppInbox.getConversations(tenantId, parseInt(limit));
    
    // Filter unread only if requested
    const filteredConversations = unreadOnly === 'true' 
      ? conversations.filter(conv => conv.unreadCount > 0)
      : conversations;

    // Get total unread count
    const totalUnreadCount = await WhatsAppInbox.getUnreadCount(tenantId);

    res.json({
      success: true,
      conversations: filteredConversations,
      totalUnreadCount,
      count: filteredConversations.length
    });
  } catch (error) {
    console.error('Get inbox conversations error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get conversation messages
export const getConversation = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { conversationId } = req.params;
    const { limit = 50 } = req.query;
    const limitNum = parseInt(limit);

    console.log('💬 Getting conversation:', conversationId, 'for tenant:', tenantId);
    console.log('📄 Requested limit:', limitNum);

    // Get ALL messages (inbox + sent) for this conversation to find the most recent ones
    const inboxMessages = await WhatsAppInbox.find({ tenantId, conversationId })
      .populate('readBy', 'name email')
      .populate('repliedBy', 'name email')
      .lean();

    console.log('📥 Inbox messages found:', inboxMessages.length, 'for conversationId:', conversationId);

    // Get sent messages from WhatsAppMessage collection for complete history
    const senderPhone = conversationId.replace(`${tenantId}_`, '');
    
    // Try multiple phone formats in case of +/formatting variations
    const sentMessages = await WhatsAppMessage.find({ 
      tenantId,
      $or: [
        { recipientPhone: senderPhone },
        { recipientPhone: `+${senderPhone}` },
        { recipientPhone: senderPhone.replace(/^\+/, '') }
      ]
    })
      .populate('sentBy', 'name email')
      .lean();

    console.log('📤 Sent messages found:', sentMessages.length, 'for phone:', senderPhone, '(trying multiple formats)');

    // Combine all messages with consistent structure
    const allMessages = [
      ...inboxMessages.map(msg => ({
        ...msg,
        direction: 'inbound',
        displayName: msg.senderName || msg.senderProfileName || `+${msg.senderPhone}`
      })),
      ...sentMessages.map(msg => ({
        _id: msg._id,
        waMessageId: msg.waMessageId,
        senderPhone: 'You',
        senderName: 'You',
        displayName: 'You',
        messageType: msg.messageType,
        content: msg.content,
        timestamp: msg.createdAt,
        isRead: true,
        replied: false,
        conversationId: conversationId,
        createdAt: msg.createdAt,
        direction: 'outbound',
        status: msg.status
      }))
    ]
      .sort((a, b) => new Date(a.createdAt || a.timestamp).getTime() - new Date(b.createdAt || b.timestamp).getTime())
      .slice(-limitNum); // Get last N messages (most recent)

    // Mark inbox messages as read when viewing conversation
    await WhatsAppInbox.updateMany(
      { tenantId, conversationId, isRead: false },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date(),
          readBy: req.user._id
        }
      }
    );

    res.json({
      success: true,
      messages: allMessages,
      conversationId,
      count: allMessages.length
    });
    
    console.log('✅ Returning conversation messages:', {
      conversationId,
      count: allMessages.length,
      firstMsg: allMessages[0] ? {
        timestamp: allMessages[0].createdAt || allMessages[0].timestamp,
        direction: allMessages[0].direction
      } : null,
      lastMsg: allMessages[allMessages.length - 1] ? {
        timestamp: allMessages[allMessages.length - 1].createdAt || allMessages[allMessages.length - 1].timestamp,
        direction: allMessages[allMessages.length - 1].direction
      } : null
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Mark conversation as read
export const markConversationRead = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { conversationId } = req.params;

    console.log('✅ Marking conversation as read:', conversationId);

    const result = await WhatsAppInbox.updateMany(
      { tenantId, conversationId, isRead: false },
      { 
        $set: { 
          isRead: true, 
          readAt: new Date(),
          readBy: req.user._id
        }
      }
    );

    res.json({
      success: true,
      message: 'Conversation marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark conversation read error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Reply to a conversation
export const replyToConversation = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { conversationId } = req.params;
    const { message, messageType = 'text', templateName, templateParams = [] } = req.body;

    console.log('📤 Replying to conversation:', conversationId);
    console.log('📄 Message type:', messageType);
    
    // Extract phone number from conversation ID
    const senderPhone = conversationId.replace(`${tenantId}_`, '');
    
    // Send message via WhatsApp API
    try {
      let result;
      
      if (messageType === 'template' && templateName) {
        console.log('📋 Sending template message:', templateName);
        result = await whatsappService.sendTemplateMessage(
          tenantId,
          senderPhone,
          templateName,
          templateParams,
          { 
            campaign: 'inbox_reply',
            sentBy: req.user._id 
          }
        );
      } else {
        console.log('💬 Sending text message:', message);
        result = await whatsappService.sendTextMessage(
          tenantId,
          senderPhone,
          message,
          { 
            campaign: 'inbox_reply',
            sentBy: req.user._id 
          }
        );
      }

      if (result.success) {
        // Mark original messages as replied
        await WhatsAppInbox.updateMany(
          { tenantId, conversationId, replied: false },
          { 
            $set: { 
              replied: true, 
              repliedAt: new Date(),
              repliedBy: req.user._id,
              replyMessageId: result.waMessageId
            }
          }
        );
      }

      res.json({
        success: result.success,
        message: result.success ? 'Reply sent successfully' : 'Failed to send reply',
        messageId: result.messageId,
        waMessageId: result.waMessageId
      });
    } catch (sendError) {
      console.error('Reply send error:', sendError);
      res.json({
        success: false,
        message: `Failed to send reply: ${sendError.message}`,
        error: sendError.message
      });
    }
  } catch (error) {
    console.error('Reply to conversation error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get inbox stats
export const getInboxStats = async (req, res) => {
  try {
    const tenantId = getTenantId(req);

    console.log('📊 Getting inbox stats for tenant:', tenantId);

    const stats = await WhatsAppInbox.aggregate([
      { $match: { tenantId } },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          unreadMessages: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          },
          repliedMessages: {
            $sum: { $cond: [{ $eq: ['$replied', true] }, 1, 0] }
          },
          todayMessages: {
            $sum: {
              $cond: [
                {
                  $gte: ['$createdAt', new Date(new Date().setHours(0, 0, 0, 0))]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalMessages: 0,
      unreadMessages: 0,
      repliedMessages: 0,
      todayMessages: 0
    };

    // Get unique conversations count
    const conversationsCount = await WhatsAppInbox.distinct('conversationId', { tenantId });

    res.json({
      success: true,
      stats: {
        ...result,
        uniqueConversations: conversationsCount.length,
        responseRate: result.totalMessages > 0 
          ? ((result.repliedMessages / result.totalMessages) * 100).toFixed(1) + '%'
          : '0%'
      }
    });
  } catch (error) {
    console.error('Get inbox stats error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Search inbox messages
export const searchInbox = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    const { query, messageType, dateFrom, dateTo, limit = 50 } = req.query;

    console.log('🔍 Searching inbox for:', query);

    const searchFilter = { tenantId };

    // Add text search
    if (query) {
      searchFilter.$or = [
        { 'content.text': { $regex: query, $options: 'i' } },
        { senderPhone: { $regex: query, $options: 'i' } },
        { senderName: { $regex: query, $options: 'i' } },
        { senderProfileName: { $regex: query, $options: 'i' } }
      ];
    }

    // Add message type filter
    if (messageType) {
      searchFilter.messageType = messageType;
    }

    // Add date range filter
    if (dateFrom || dateTo) {
      searchFilter.createdAt = {};
      if (dateFrom) searchFilter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) searchFilter.createdAt.$lte = new Date(dateTo);
    }

    const messages = await WhatsAppInbox.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('readBy', 'name email')
      .populate('repliedBy', 'name email')
      .lean();

    res.json({
      success: true,
      messages,
      count: messages.length,
      searchQuery: query
    });
  } catch (error) {
    console.error('Search inbox error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get contacts for campaigns (users who opted in + ALL tenants with phone numbers)
export const getConsentingContacts = async (req, res) => {
  try {
    const tenantId = getTenantId(req);
    
    console.log('📋 Fetching consenting contacts for tenant:', tenantId);

    // Get users (tenants/staff) who opted in to WhatsApp
    const consentingUsers = await User.find({ 
      tenantId, 
      whatsappOptIn: true,
      phone: { $exists: true, $ne: null, $ne: "" }
    }).select('name email phone role');

    // Get students who opted in to WhatsApp  
    const Student = (await import('../models/Student.js')).default;
    const consentingStudents = await Student.find({
      tenantId,
      whatsappOptIn: true,
      phone: { $exists: true, $ne: null, $ne: "" }
    }).select('name email phone rollNumber class');

    // Get ALL tenants (free and paid) with phone numbers for campaign targeting
    const Tenant = (await import('../models/Tenant.js')).default;
    const tenantContacts = await Tenant.find({
      'contact.phone': { $exists: true, $ne: null, $ne: "" },
      active: true // Only active tenants
    }).select('name instituteName email contact.phone plan tenantId');

    const contacts = [
      // Add users who opted in
      ...consentingUsers.map(user => ({
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        type: 'user',
        role: user.role,
        displayName: `${user.name} (${user.role})`
      })),
      // Add students who opted in  
      ...consentingStudents.map(student => ({
        id: student._id,
        name: student.name,
        phone: student.phone,
        email: student.email,
        type: 'student',
        rollNumber: student.rollNumber,
        class: student.class,
        displayName: `${student.name} - ${student.class} (Student)`
      })),
      // Add ALL tenants (free and paid) for campaign targeting
      ...tenantContacts.map(tenant => ({
        id: tenant._id,
        name: tenant.name,
        phone: tenant.contact.phone,
        email: tenant.email,
        type: 'tenant',
        plan: tenant.plan,
        tenantId: tenant.tenantId,
        instituteName: tenant.instituteName,
        displayName: `${tenant.name} - ${tenant.instituteName || 'Owner'} (${tenant.plan.toUpperCase()} Plan)`
      }))
    ];

    console.log(`✅ Found ${contacts.length} total contacts:`, {
      users: consentingUsers.length,
      students: consentingStudents.length,
      tenants: tenantContacts.length
    });

    res.json({
      success: true,
      contacts,
      summary: {
        total: contacts.length,
        users: consentingUsers.length,
        students: consentingStudents.length,
        tenants: tenantContacts.length,
        breakdown: {
          freePlan: tenantContacts.filter(t => t.plan === 'free').length,
          trialPlan: tenantContacts.filter(t => t.plan === 'trial').length,
          paidPlan: tenantContacts.filter(t => ['pro', 'enterprise'].includes(t.plan)).length
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch consenting contacts:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch consenting contacts' 
    });
  }
};

// Debug endpoint to check tenant data
export const debugTenantData = async (req, res) => {
  try {
    const { default: Tenant } = await import('../models/Tenant.js');
    
    // Get all tenants
    const allTenants = await Tenant.find({});
    
    // Get active tenants with phone numbers
    const activeTenantsWithPhone = await Tenant.find({
      active: true,
      'contact.phone': { $exists: true, $ne: null, $ne: '' }
    });

    res.json({
      success: true,
      total: allTenants.length,
      activeWithPhone: activeTenantsWithPhone.length,
      tenants: allTenants.map(t => ({
        _id: t._id,
        name: t.name,
        instituteName: t.instituteName,
        active: t.active,
        phone: t.contact?.phone,
        plan: t.plan,
        hasPhone: !!t.contact?.phone
      })),
      activeTenantsWithPhone: activeTenantsWithPhone.map(t => ({
        name: t.name,
        instituteName: t.instituteName,
        phone: t.contact?.phone,
        plan: t.plan
      }))
    });
  } catch (error) {
    console.error('Debug tenant data error:', error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  saveConfig,
  getConfig,
  getLinkedPhoneNumber,
  removeConfig,
  testConnection,
  sendMessage,
  sendTemplate,
  getMessages,
  getContacts,
  syncContacts,
  syncTenantContacts,
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
  debugMessages,
  debugTenantData,
  // Inbox endpoints
  getInboxConversations,
  getConversation,
  markConversationRead,
  replyToConversation,
  getInboxStats,
  searchInbox,
  getConsentingContacts
};
