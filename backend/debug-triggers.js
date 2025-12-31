/**
 * Complete Debug Script for WhatsApp Automation Triggers
 * Checks all the pieces required for workflow triggering to work
 */

import mongoose from 'mongoose';
import WhatsAppConfig from './src/models/WhatsAppConfig.js';
import AutomationWorkflow from './src/models/AutomationWorkflow.js';
import WorkflowConversation from './src/models/WorkflowConversation.js';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  header: (text) => console.log(`\n${colors.bright}${colors.cyan}═══ ${text} ═══${colors.reset}`),
  success: (text) => console.log(`${colors.green}✅ ${text}${colors.reset}`),
  error: (text) => console.log(`${colors.red}❌ ${text}${colors.reset}`),
  warn: (text) => console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`),
  info: (text) => console.log(`${colors.blue}ℹ️  ${text}${colors.reset}`),
};

async function debugWhatsAppTriggers() {
  try {
    log.header('WhatsApp Automation Trigger Debug');

    // Connect to MongoDB
    log.info('Connecting to MongoDB...');
    await mongoose.connect('mongodb+srv://mpiyush15:piyush1510@pixels.d24yk.mongodb.net/enromatics?retryWrites=true&w=majority');
    log.success('Connected to MongoDB');

    // Models already imported at top
    // Now query the data
    log.header('1. Checking WhatsApp Configuration');
    const config = await WhatsAppConfig.findOne({ tenantId: 'global' });
    
    if (!config) {
      log.error('No WhatsApp config found for tenant "global"');
      process.exit(1);
    }
    
    log.success(`Found WhatsApp config`);
    console.log(`   - Phone Number ID: ${config.phoneNumberId}`);
    console.log(`   - WABA ID: ${config.wabaId}`);
    console.log(`   - Business Name: ${config.businessName}`);
    console.log(`   - Active: ${config.isActive}`);
    console.log(`   - Verified: ${config.verifiedAt ? 'Yes' : 'No'}`);

    // 2. Check Workflows
    log.header('2. Checking Automation Workflows');
    const allWorkflows = await AutomationWorkflow.find({ tenantId: 'global' });
    
    if (allWorkflows.length === 0) {
      log.error('No workflows found for tenant "global"');
      process.exit(1);
    }
    
    console.log(`Found ${allWorkflows.length} workflows:\n`);
    
    const activeWorkflows = [];
    const inactiveWorkflows = [];
    
    allWorkflows.forEach((wf, idx) => {
      const isActive = wf.status === 'active' && wf.isPublished;
      console.log(`${idx + 1}. ${wf.name}`);
      console.log(`   - Status: ${wf.status} ${wf.isPublished ? '(Published)' : '(Draft)'}`);
      console.log(`   - Trigger Keywords: ${wf.triggerKeyword}`);
      console.log(`   - Linked Phone: ${wf.linkedPhoneNumber || 'Not set'}`);
      console.log(`   - Can Trigger: ${isActive ? colors.green + 'YES ✅' : colors.red + 'NO ❌'} ${colors.reset}`);
      console.log();
      
      if (isActive) {
        activeWorkflows.push(wf);
      } else {
        inactiveWorkflows.push(wf);
      }
    });

    if (activeWorkflows.length === 0) {
      log.error(`No active workflows found! ${inactiveWorkflows.length} workflow(s) are inactive`);
      console.log(`\nTo fix: Update workflow status to "active" and ensure isPublished = true`);
      process.exit(1);
    }
    
    log.success(`${activeWorkflows.length} active workflow(s) ready to trigger`);

    // 3. Check Phone Number Matching
    log.header('3. Verifying Phone Number Matching');
    let phoneMatchesOk = true;
    
    activeWorkflows.forEach(wf => {
      if (!wf.linkedPhoneNumber) {
        log.warn(`Workflow "${wf.name}" has no linkedPhoneNumber set`);
        phoneMatchesOk = false;
      } else if (wf.linkedPhoneNumber !== config.phoneNumberId) {
        log.error(`Workflow "${wf.name}" phone ${wf.linkedPhoneNumber} ≠ config phone ${config.phoneNumberId}`);
        phoneMatchesOk = false;
      } else {
        log.success(`Workflow "${wf.name}" phone matches config`);
      }
    });

    if (!phoneMatchesOk) {
      log.error('Phone number mismatch detected!');
      console.log(`\nWorkflow linkedPhoneNumber MUST equal config phoneNumberId: ${config.phoneNumberId}`);
      process.exit(1);
    }

    // 4. Test Trigger Keyword Matching
    log.header('4. Testing Trigger Keyword Matching');
    
    const testMessages = [
      'admissions',
      'coaching class',
      'how to enroll',
      'Hi there',
      'hello world'
    ];
    
    activeWorkflows.forEach(wf => {
      console.log(`\nWorkflow: "${wf.name}"`);
      console.log(`Trigger Keywords: [${wf.triggerKeyword}]`);
      
      const triggerKeywords = (wf.triggerKeyword || 'hi')
        .split(',')
        .map(k => k.toLowerCase().trim())
        .filter(k => k.length > 0);
      
      testMessages.forEach(msg => {
        const matched = triggerKeywords.some(kw => msg.toLowerCase().includes(kw));
        const result = matched ? `${colors.green}✅ MATCH${colors.reset}` : `${colors.red}❌ NO${colors.reset}`;
        console.log(`   "${msg}" → ${result}`);
      });
    });

    // 5. Check Webhook Routes
    log.header('5. Webhook Configuration');
    console.log(`Webhook URL: POST http://your-backend/api/whatsapp/webhook`);
    console.log(`Webhook Verify Token: pixels_webhook_secret_2025`);
    console.log(`Phone Number ID to use in Meta: ${config.phoneNumberId}`);
    console.log(`WABA ID to use in Meta: ${config.wabaId}`);

    // 6. Summary
    log.header('Summary & Next Steps');
    
    if (activeWorkflows.length > 0 && phoneMatchesOk) {
      log.success('All checks passed! System is ready for triggering');
      console.log(`\nNext steps:`);
      console.log(`1. Send a test message from WhatsApp with one of these keywords:`);
      activeWorkflows.forEach(wf => {
        const keywords = wf.triggerKeyword.split(',').map(k => `"${k.trim()}"`).join(', ');
        console.log(`   - For "${wf.name}": ${keywords}`);
      });
      console.log(`2. Check backend logs for webhook activity`);
      console.log(`3. Verify message appears in webhook logs with trigger matching`);
      console.log(`4. Check if WorkflowConversation record is created in MongoDB`);
    }

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    log.error(`Fatal error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

debugWhatsAppTriggers();
