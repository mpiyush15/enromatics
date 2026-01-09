#!/usr/bin/env node

/**
 * Test Template Sync via Frontend API
 * Uses frontend endpoint which handles authentication
 */

import axios from 'axios';

const FRONTEND_URL = 'http://localhost:3001';
const TENANT_ID = '4b778ad5';

console.log('\n' + '='.repeat(70));
console.log('🔄 TESTING TEMPLATE SYNC VIA FRONTEND API');
console.log('='.repeat(70) + '\n');

async function testSync() {
  try {
    console.log(`📡 Syncing templates for tenant: ${TENANT_ID}`);
    console.log(`🔗 Endpoint: ${FRONTEND_URL}/api/whatsapp/templates/sync\n`);

    const response = await axios.post(
      `${FRONTEND_URL}/api/whatsapp/templates/sync`,
      { tenantId: TENANT_ID },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );

    console.log('✅ Sync successful!\n');
    console.log('📊 Response:');
    console.log(JSON.stringify(response.data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Sync failed!\n');
    console.error('Error Details:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.message || error.message}`);
      console.error(`  Data:`, error.response.data);
    } else {
      console.error(`  ${error.message}`);
    }
    return false;
  }
}

async function testGetTemplates() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('📋 FETCHING TEMPLATES');
    console.log('='.repeat(70) + '\n');

    console.log(`📡 Fetching templates for tenant: ${TENANT_ID}`);
    console.log(`🔗 Endpoint: ${FRONTEND_URL}/api/whatsapp/templates\n`);

    const response = await axios.get(
      `${FRONTEND_URL}/api/whatsapp/templates?tenantId=${TENANT_ID}`,
      {
        timeout: 10000,
      }
    );

    console.log('✅ Fetch successful!\n');
    console.log(`📊 Templates Found: ${response.data.templates?.length || 0}`);
    
    if (response.data.templates && response.data.templates.length > 0) {
      console.log('\n📋 Template List:');
      response.data.templates.slice(0, 3).forEach((t, i) => {
        console.log(`  ${i + 1}. ${t.templateName || t.name}`);
      });
    }

    return true;
  } catch (error) {
    console.error('❌ Fetch failed!\n');
    console.error('Error Details:');
    if (error.response) {
      console.error(`  Status: ${error.response.status}`);
      console.error(`  Message: ${error.response.data?.message || error.message}`);
    } else {
      console.error(`  ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  const syncResult = await testSync();
  const fetchResult = await testGetTemplates();

  console.log('\n' + '='.repeat(70));
  console.log('✅ TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Sync: ${syncResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`Fetch: ${fetchResult ? '✓ PASS' : '✗ FAIL'}`);
  console.log('='.repeat(70) + '\n');

  process.exit(syncResult && fetchResult ? 0 : 1);
}

runTests();
