#!/usr/bin/env node

/**
 * Test WhatsApp Platform API Connection
 * Tests with proper header authentication
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const WHATSAPP_PLATFORM_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;

console.log('\n' + '='.repeat(70));
console.log('🧪 WHATSAPP PLATFORM API - CONNECTION TEST');
console.log('='.repeat(70) + '\n');

console.log('📋 Configuration:');
console.log(`   Platform URL: ${WHATSAPP_PLATFORM_URL}`);
console.log(`   API Key: ${WHATSAPP_PLATFORM_API_KEY ? WHATSAPP_PLATFORM_API_KEY.substring(0, 20) + '...' : '❌ Missing'}`);
console.log(`   Full Key: ${WHATSAPP_PLATFORM_API_KEY}\n`);

/**
 * Test different header formats
 */
async function testPlatformAPI() {
  const endpoints = [
    { path: '/api/templates', method: 'GET', description: 'GET /api/templates' },
    { path: '/templates', method: 'GET', description: 'GET /templates' },
    { path: '/api/v1/templates', method: 'GET', description: 'GET /api/v1/templates' },
  ];

  const headers = [
    { 
      name: 'x-api-key header',
      headers: {
        'x-api-key': WHATSAPP_PLATFORM_API_KEY,
        'Content-Type': 'application/json',
      }
    },
    { 
      name: 'Authorization Bearer',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_PLATFORM_API_KEY}`,
        'Content-Type': 'application/json',
      }
    },
    { 
      name: 'API-Key header',
      headers: {
        'API-Key': WHATSAPP_PLATFORM_API_KEY,
        'Content-Type': 'application/json',
      }
    },
  ];

  for (const headerConfig of headers) {
    console.log(`\n📡 Testing with: ${headerConfig.name}`);
    console.log('-'.repeat(70));

    for (const endpoint of endpoints) {
      const url = `${WHATSAPP_PLATFORM_URL}${endpoint.path}`;
      
      try {
        const response = await axios({
          method: endpoint.method,
          url: url,
          headers: headerConfig.headers,
          timeout: 5000,
        });

        console.log(`✅ ${endpoint.description}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Data: ${JSON.stringify(response.data).substring(0, 100)}...`);
        return true;
      } catch (error) {
        const status = error.response?.status;
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`❌ ${endpoint.description} - ${status || 'Error'}: ${errorMsg.substring(0, 50)}`);
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary: Could not authenticate with any method');
  console.log('='.repeat(70) + '\n');
}

testPlatformAPI().catch(error => {
  console.error('❌ Test error:', error.message);
  process.exit(1);
});
