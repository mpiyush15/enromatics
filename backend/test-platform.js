#!/usr/bin/env node

/**
 * 🧪 Test WhatsApp Platform Server Connection
 * Checks if Railway server is responding and syncs templates/chatbots
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/.env` });

const PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL || 'https://whatsapp-platform-production-e48b.up.railway.app';
const PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

console.log('\n========================================');
console.log('🧪 WhatsApp Platform Server Test');
console.log('========================================\n');

console.log(`📡 Platform URL: ${PLATFORM_URL}`);
console.log(`🔑 API Key: ${PLATFORM_API_KEY ? '✅ Configured' : '❌ Missing'}\n`);

async function testConnection() {
  try {
    console.log('🔍 Testing connection to WhatsApp Platform...\n');

    // Test 1: Health check
    console.log('1️⃣  Health Check:');
    const healthResponse = await axios.get(`${PLATFORM_URL}/health`, {
      timeout: 5000,
    });
    console.log(`✅ Status: ${healthResponse.status}`);
    console.log(`✅ Response: ${JSON.stringify(healthResponse.data)}\n`);

    // Test 2: Get stats (basic connectivity test)
    console.log('2️⃣  Getting Platform Stats:');
    const statsResponse = await axios.get(`${PLATFORM_URL}/api/integrations/stats`, {
      headers: {
        'Authorization': `Bearer ${PLATFORM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    console.log(`✅ Status: ${statsResponse.status}`);
    console.log(`✅ Data:`, JSON.stringify(statsResponse.data, null, 2), '\n');

    // Test 3: List tenants
    console.log('3️⃣  Listing Available Resources:');
    try {
      const resourcesResponse = await axios.get(`${PLATFORM_URL}/api/integrations/resources`, {
        headers: {
          'Authorization': `Bearer ${PLATFORM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      });
      console.log(`✅ Status: ${resourcesResponse.status}`);
      console.log(`✅ Data:`, JSON.stringify(resourcesResponse.data, null, 2), '\n');
    } catch (error) {
      console.log(`⚠️  Resources endpoint not available: ${error.response?.status || error.message}\n`);
    }

    console.log('\n✅ ========== CONNECTION SUCCESSFUL ==========');
    console.log('🚀 WhatsApp Platform is ONLINE and responding!\n');

    return true;
  } catch (error) {
    console.error('\n❌ ========== CONNECTION FAILED ==========');
    console.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
    console.log('\n');
    return false;
  }
}

async function main() {
  const isConnected = await testConnection();
  process.exit(isConnected ? 0 : 1);
}

main();
