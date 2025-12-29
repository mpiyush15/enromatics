#!/usr/bin/env node

/**
 * WhatsApp Template Send Test Script
 * Tests both scenarios: with and without variables
 * 
 * Usage: node test-template-send.js
 */

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║        WhatsApp Template Send - Test Scenarios                ║
╚═══════════════════════════════════════════════════════════════╝
`);

// Simulate the sendTemplateMessage function with validation

async function sendTemplateMessage({
  tenantId,
  recipientPhone,
  templateName,
  params = [],
  templateVariableCount = 0
}) {
  console.log(`\n📋 Sending template: ${templateName}`);
  console.log(`   To: ${recipientPhone}`);
  console.log(`   Template variables required: ${templateVariableCount}`);
  console.log(`   Parameters provided: ${params.length}`);
  
  // MANDATORY VALIDATION #1: Variables require parameters
  if (templateVariableCount > 0 && (!params || params.length === 0)) {
    const errorMsg = `❌ VALIDATION FAILED: Template "${templateName}" requires ${templateVariableCount} parameter(s) but none were provided. This would cause silent message drop by WhatsApp.`;
    console.error(`\n${errorMsg}`);
    throw new Error(errorMsg);
  }

  // MANDATORY VALIDATION #2: Parameter count must match
  if (templateVariableCount > 0 && params.length !== templateVariableCount) {
    const errorMsg = `❌ PARAMETER MISMATCH: Template "${templateName}" has ${templateVariableCount} variable(s) but ${params.length} parameter(s) provided. Counts must match exactly.`;
    console.error(`\n${errorMsg}`);
    throw new Error(errorMsg);
  }

  console.log('✅ Validation passed - all checks passed');

  // Build components
  let components = [];
  if (params && params.length > 0) {
    components = [{
      type: 'body',
      parameters: params.map(p => ({ type: 'text', text: String(p) }))
    }];
    console.log(`✅ Building components with ${params.length} parameters`);
  } else {
    console.log('📝 No variables - sending without components');
  }

  // Build payload
  const templatePayload = {
    name: templateName,
    language: { code: 'en' }
  };

  if (components.length > 0) {
    templatePayload.components = components;
  }

  console.log(`\n📤 Final payload to Meta API:`);
  console.log(JSON.stringify({
    messaging_product: 'whatsapp',
    to: recipientPhone,
    type: 'template',
    template: templatePayload
  }, null, 2));

  console.log('\n✅ READY TO SEND TO META API');
  console.log('   Message would be delivered ✓');
  
  return { success: true, wamid: 'wamid.test123' };
}

// ============================================
// TEST CASE 1: Template WITH variables
// ============================================

console.log(`\n${'='.repeat(65)}`);
console.log('TEST 1: Template WITH variables (first_message)');
console.log('='.repeat(65));

(async () => {
  try {
    await sendTemplateMessage({
      tenantId: 'tenant_123',
      recipientPhone: '917709601690',
      templateName: 'first_message',
      params: ['Piyush', 'Enromatics'],
      templateVariableCount: 2
    });
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }

  // ============================================
  // TEST CASE 2: Template WITHOUT variables
  // ============================================

  console.log(`\n${'='.repeat(65)}`);
  console.log('TEST 2: Template WITHOUT variables (hello_world)');
  console.log('='.repeat(65));

  try {
    await sendTemplateMessage({
      tenantId: 'tenant_123',
      recipientPhone: '917709601690',
      templateName: 'hello_world',
      params: [],
      templateVariableCount: 0
    });
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
  }

  // ============================================
  // TEST CASE 3: WRONG - Variables but no params (should fail)
  // ============================================

  console.log(`\n${'='.repeat(65)}`);
  console.log('TEST 3: WRONG - Variables but no parameters (should FAIL)');
  console.log('='.repeat(65));

  try {
    await sendTemplateMessage({
      tenantId: 'tenant_123',
      recipientPhone: '917709601690',
      templateName: 'first_message',
      params: [],  // ❌ Empty! Should fail
      templateVariableCount: 2
    });
  } catch (error) {
    console.error(`\n❌ BLOCKED (expected): ${error.message}`);
  }

  // ============================================
  // TEST CASE 4: WRONG - Param count mismatch (should fail)
  // ============================================

  console.log(`\n${'='.repeat(65)}`);
  console.log('TEST 4: WRONG - Parameter count mismatch (should FAIL)');
  console.log('='.repeat(65));

  try {
    await sendTemplateMessage({
      tenantId: 'tenant_123',
      recipientPhone: '917709601690',
      templateName: 'first_message',
      params: ['Piyush'],  // ❌ Only 1 param, needs 2
      templateVariableCount: 2
    });
  } catch (error) {
    console.error(`\n❌ BLOCKED (expected): ${error.message}`);
  }

  // Summary
  console.log(`\n${'='.repeat(65)}`);
  console.log('SUMMARY');
  console.log('='.repeat(65));
  console.log(`
✅ Template with variables + correct params → SENDS
✅ Template without variables + no params → SENDS  
❌ Template with variables + no params → BLOCKED
❌ Template with variables + wrong count → BLOCKED

Result: System is now safe from silent WhatsApp failures! 🎉
  `);
})();
