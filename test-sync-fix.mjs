#!/usr/bin/env node

/**
 * Test Template Sync
 * Tests the backend template sync endpoint with fixed configuration
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const BACKEND_URL = 'http://localhost:5050';
const TENANT_ID = '4b778ad5';

console.log('\n' + '='.repeat(70));
console.log('🔄 TESTING TEMPLATE SYNC');
console.log('='.repeat(70) + '\n');

async function testSync() {
  try {
    console.log(`📡 Syncing templates for tenant: ${TENANT_ID}`);
    console.log(`🔗 Endpoint: ${BACKEND_URL}/api/whatsapp/templates/sync\n`);

    const response = await axios.post(
      `${BACKEND_URL}/api/whatsapp/templates/sync`,
      { tenantId: TENANT_ID },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
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

testSync().then(success => {
  if (success) {
    console.log('\n' + '='.repeat(70));
    console.log('✅ Sync test passed!');
    console.log('='.repeat(70) + '\n');
  }
  process.exit(success ? 0 : 1);
});
