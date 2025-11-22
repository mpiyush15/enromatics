import express from 'express';
import whatsappController from '../controllers/whatsappController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configuration routes
router.post('/config', protect, whatsappController.saveConfig);
router.get('/config', protect, whatsappController.getConfig);
router.delete('/config', protect, whatsappController.removeConfig);
router.post('/test-connection', protect, whatsappController.testConnection);

// Messaging routes
router.post('/send', protect, whatsappController.sendMessage);
router.post('/send-template', protect, whatsappController.sendTemplate);
router.get('/messages', protect, whatsappController.getMessages);

// Contacts routes
router.get('/contacts', protect, whatsappController.getContacts);
router.post('/contacts', protect, whatsappController.createContact);
router.post('/contacts/import', protect, whatsappController.importContacts);
router.delete('/contacts/:id', protect, whatsappController.deleteContact);
router.post('/sync-contacts', protect, whatsappController.syncContacts);

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

export default router;
