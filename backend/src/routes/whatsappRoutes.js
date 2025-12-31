import express from 'express';
import whatsappController from '../controllers/whatsappController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import {
  getWorkflows,
  getWorkflow,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  publishWorkflow,
  getTemplates,
  getTemplate,
  createWorkflowFromTemplate,
  getWorkflowAnalytics,
} from '../controllers/automationController.js';

const router = express.Router();

// Configuration routes
router.post('/config', protect, whatsappController.saveConfig);
router.get('/config', protect, whatsappController.getConfig);
router.get('/linked-phone-number', protect, whatsappController.getLinkedPhoneNumber);
router.delete('/config', protect, whatsappController.removeConfig);
router.post('/test-connection', protect, whatsappController.testConnection);

// Messaging routes
router.post('/send', protect, whatsappController.sendMessage);
router.post('/send-template', protect, whatsappController.sendTemplate);
router.get('/messages', protect, whatsappController.getMessages);

// Contacts routes
router.get('/contacts', protect, whatsappController.getContacts);
router.get('/contacts/consenting', protect, whatsappController.getConsentingContacts);
router.post('/contacts', protect, whatsappController.createContact);
router.post('/contacts/import', protect, whatsappController.importContacts);
router.delete('/contacts/:id', protect, whatsappController.deleteContact);
router.post('/sync-contacts', protect, whatsappController.syncContacts);
router.post('/sync-tenant-contacts', protect, whatsappController.syncTenantContacts);

// Statistics
router.get('/stats', protect, whatsappController.getStats);

// Templates
router.get('/templates', protect, whatsappController.getTemplates);
router.post('/templates', protect, whatsappController.createTemplate);
router.post('/templates/sync', protect, whatsappController.syncTemplatesFromMeta);
router.post('/templates/submit', protect, whatsappController.submitTemplateToMeta);

// Webhook routes (no auth required - verified by token)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleWebhook);

// Debug routes
router.post('/debug-send', protect, whatsappController.debugSendMessage);
router.get('/debug-api', protect, whatsappController.debugMetaAPI);
router.get('/debug-messages', protect, whatsappController.debugMessages);
router.get('/debug-tenant-data', protect, whatsappController.debugTenantData);

// 🔐 Inbox routes - Restricted to SuperAdmin and tenantAdmin only
router.get('/inbox/conversations', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.getInboxConversations);
router.get('/inbox/conversation/:conversationId', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.getConversation);
router.post('/inbox/conversation/:conversationId/read', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.markConversationRead);
router.post('/inbox/conversation/:conversationId/reply', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.replyToConversation);
router.get('/inbox/stats', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.getInboxStats);
router.get('/inbox/search', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), whatsappController.searchInbox);

/**
 * ==================== AUTOMATION WORKFLOWS ====================
 * These routes are nested under /api/whatsapp/automation
 */

// Create workflow from template (MUST BE BEFORE :workflowId routes)
router.post('/automation/workflows/from-template/:templateId', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), createWorkflowFromTemplate);

// Get all workflows for tenant
router.get('/automation/workflows', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), getWorkflows);

// Create new workflow
router.post('/automation/workflows', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), createWorkflow);

// Get specific workflow
router.get('/automation/workflows/:workflowId', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), getWorkflow);

// Update workflow
router.put('/automation/workflows/:workflowId', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), updateWorkflow);

// Delete workflow (soft delete)
router.delete('/automation/workflows/:workflowId', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), deleteWorkflow);

// Publish workflow
router.post('/automation/workflows/:workflowId/publish', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), publishWorkflow);

// Get workflow analytics
router.get('/automation/workflows/:workflowId/analytics', protect, authorizeRoles('SuperAdmin', 'tenantAdmin'), getWorkflowAnalytics);

// Get public templates
router.get('/automation/templates', protect, getTemplates);

// Get specific template
router.get('/automation/templates/:templateId', protect, getTemplate);

export default router;
