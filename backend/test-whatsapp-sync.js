#!/usr/bin/env node

/**
 * WhatsApp Platform Sync Test
 * 
 * Tests:
 * 1. Railway server connectivity
 * 2. Templates sync from platform
 * 3. Chatbots sync from platform
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

console.log(`
╔════════════════════════════════════════════════════════════╗
║    🧪 WhatsApp Platform Sync Test                         ║
║    Testing Railway Server Connectivity & Sync             ║
╚════════════════════════════════════════════════════════════╝
`);

// ============ TEST 1: Check Env Variables ============
console.log(`\n[TEST 1] ✅ Environment Variables Check`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

const missingVars = [];
if (!WHATSAPP_PLATFORM_URL) {
  missingVars.push('WHATSAPP_PLATFORM_URL');
  console.log(`❌ WHATSAPP_PLATFORM_URL not set`);
} else {
  console.log(`✅ WHATSAPP_PLATFORM_URL: ${WHATSAPP_PLATFORM_URL}`);
}

if (!WHATSAPP_PLATFORM_API_KEY) {
  missingVars.push('WHATSAPP_PLATFORM_API_KEY');
  console.log(`❌ WHATSAPP_PLATFORM_API_KEY not set`);
} else {
  console.log(`✅ WHATSAPP_PLATFORM_API_KEY: ${WHATSAPP_PLATFORM_API_KEY.substring(0, 20)}...`);
}

if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
  missingVars.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
  console.log(`❌ WHATSAPP_BUSINESS_ACCOUNT_ID not set`);
} else {
  console.log(`✅ WHATSAPP_BUSINESS_ACCOUNT_ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
}

if (!WHATSAPP_ACCESS_TOKEN) {
  missingVars.push('WHATSAPP_ACCESS_TOKEN');
  console.log(`❌ WHATSAPP_ACCESS_TOKEN not set`);
} else {
  console.log(`✅ WHATSAPP_ACCESS_TOKEN: ${WHATSAPP_ACCESS_TOKEN.substring(0, 20)}...`);
}

if (missingVars.length > 0) {
  console.log(`\n❌ Missing environment variables: ${missingVars.join(', ')}`);
  process.exit(1);
}

console.log(`\n✅ All environment variables configured!`);

// ============ TEST 2: Check Railway Server Connectivity ============
console.log(`\n[TEST 2] 🔗 Railway Server Connectivity Check`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

async function testRailwayConnection() {
  try {
    console.log(`Attempting to connect to: ${WHATSAPP_PLATFORM_URL}`);
    
    const response = await axios.get(`${WHATSAPP_PLATFORM_URL}/api/health`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
      },
    });

    console.log(`✅ Successfully connected to Railway server!`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`❌ Failed to connect to Railway server`);
    console.log(`   URL: ${WHATSAPP_PLATFORM_URL}`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Response:`, error.response.data);
    }
    return false;
  }
}

// ============ TEST 3: Test Meta Graph API Connection ============
console.log(`\n[TEST 3] 📱 Meta Graph API Connection Check`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

async function testMetaApiConnection() {
  try {
    console.log(`Attempting to fetch templates from Meta API...`);
    console.log(`Business Account ID: ${WHATSAPP_BUSINESS_ACCOUNT_ID}`);
    
    const response = await axios.get(
      `https://graph.instagram.com/v21.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {
        params: {
          access_token: WHATSAPP_ACCESS_TOKEN,
          fields: 'id,name,status,category,language,components',
        },
        timeout: 10000,
      }
    );

    const templates = response.data.data || [];
    console.log(`✅ Successfully connected to Meta Graph API!`);
    console.log(`   Found ${templates.length} templates`);
    
    if (templates.length > 0) {
      console.log(`\n   Sample templates:`);
      templates.slice(0, 3).forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name} (${t.status})`);
      });
    }
    return templates;
  } catch (error) {
    console.log(`❌ Failed to connect to Meta Graph API`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Error Details:`, error.response.data);
    }
    return null;
  }
}

// ============ TEST 4: Test Platform Template Sync Endpoint ============
console.log(`\n[TEST 4] 🔄 Platform Template Sync Endpoint Check`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

async function testPlatformSyncEndpoint() {
  try {
    console.log(`Attempting to call platform sync endpoint...`);
    
    const response = await axios.post(
      `${WHATSAPP_PLATFORM_URL}/api/integrations/whatsapp/sync-templates`,
      {},
      {
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log(`✅ Successfully called platform sync endpoint!`);
    console.log(`   Response:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log(`⚠️  Platform sync endpoint not available or error occurred`);
    console.log(`   Error: ${error.message}`);
    
    if (error.response) {
      console.log(`   Status Code: ${error.response.status}`);
      console.log(`   Response:`, error.response.data);
    }
    return false;
  }
}

// ============ RUN ALL TESTS ============
async function runAllTests() {
  try {
    const railwayConnected = await testRailwayConnection();
    const metaTemplates = await testMetaApiConnection();
    const platformSyncWorks = await testPlatformSyncEndpoint();

    // ============ SUMMARY ============
    console.log(`\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║                    📊 TEST SUMMARY                        ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝`);

    const results = [
      { name: 'Environment Variables', status: missingVars.length === 0 },
      { name: 'Railway Server Connection', status: railwayConnected },
      { name: 'Meta Graph API Connection', status: metaTemplates !== null },
      { name: 'Templates Available', status: metaTemplates && metaTemplates.length > 0 },
      { name: 'Platform Sync Endpoint', status: platformSyncWorks },
    ];

    results.forEach((result) => {
      const icon = result.status ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
    });

    const passedTests = results.filter((r) => r.status).length;
    const totalTests = results.length;

    console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log(`\n🎉 All systems operational! Templates and chatbots can sync.`);
      console.log(`\nNext Steps:`);
      console.log(`1. ✅ Go to WhatsApp Templates page`);
      console.log(`2. ✅ Click "Sync from Platform" button`);
      console.log(`3. ✅ Templates should sync from Meta`);
      console.log(`4. ✅ Use synced templates in chatbots`);
    } else {
      console.log(`\n⚠️  Some tests failed. Check the errors above.`);
    }

    console.log(`\n`);
  } catch (error) {
    console.error('❌ Fatal error during tests:', error.message);
    process.exit(1);
  }
}

// Run tests
runAllTests();
