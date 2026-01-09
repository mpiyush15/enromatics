#!/usr/bin/env node

/**
 * WhatsApp Platform API - Complete Test
 * Tests template fetch for Shree Coaching Classes (mpiyush2727@gmail.com)
 * 
 * The Platform API requires:
 * - Tenant-specific API key (from tenant configuration)
 * - Tenant ID for header isolation
 * - Bearer token authentication
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const TENANT_ID = '4b778ad5'; // Shree Coaching Classes
const TENANT_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY; // Using admin key for testing

console.log('\n' + '='.repeat(70));
console.log('🧪 SHREE COACHING CLASSES - WHATSAPP TEMPLATES TEST');
console.log('='.repeat(70) + '\n');

console.log('📋 Test Configuration:');
console.log(`   Tenant: Shree Coaching Classes (mpiyush2727@gmail.com)`);
console.log(`   Tenant ID: ${TENANT_ID}`);
console.log(`   Platform URL: ${WHATSAPP_PLATFORM_URL}`);
console.log(`   Using Admin API Key for auth\n`);

/**
 * Test Platform Templates Endpoint with proper headers
 */
async function testPlatformTemplates() {
  console.log('📡 TEST: Fetch Templates from WhatsApp Platform');
  console.log('-'.repeat(70));

  try {
    const response = await axios({
      method: 'GET',
      url: `${WHATSAPP_PLATFORM_URL}/api/integrations/templates`,
      headers: {
        'Authorization': `Bearer ${TENANT_API_KEY}`,
        'X-Tenant-Id': TENANT_ID,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    console.log(`✅ Successfully fetched templates from Platform API`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${response.data.templates?.length || response.data.data?.length || 0}`);
    
    if (response.data.templates?.length > 0 || response.data.data?.length > 0) {
      const templates = response.data.templates || response.data.data;
      console.log(`\n   Sample templates:`);
      templates.slice(0, 3).forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.name || t.templateName || t.id}`);
      });
    }
    
    return {
      success: true,
      count: response.data.templates?.length || response.data.data?.length || 0,
      data: response.data
    };
  } catch (error) {
    console.error(`❌ Platform API Error:`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    if (error.response?.data) {
      console.error(`   Details:`, error.response.data);
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Test Backend Templates Endpoint (should use database sync)
 */
async function testBackendTemplates() {
  console.log('\n\n📦 TEST: Fetch Templates from Backend API');
  console.log('-'.repeat(70));

  try {
    const response = await axios({
      method: 'GET',
      url: `http://localhost:5050/api/whatsapp/templates?tenantId=${TENANT_ID}`,
      timeout: 10000,
    });

    console.log(`✅ Successfully fetched templates from Backend API`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Templates found: ${response.data.templates?.length || 0}`);
    console.log(`   Tenant: ${response.data.tenantId}`);
    
    if (response.data.templates?.length > 0) {
      console.log(`\n   Sample templates:`);
      response.data.templates.slice(0, 3).forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.templateName}`);
      });
    }
    
    return {
      success: true,
      count: response.data.templates?.length || 0,
      data: response.data
    };
  } catch (error) {
    console.error(`❌ Backend API Error:`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  const results = {
    platform: await testPlatformTemplates(),
    backend: await testBackendTemplates(),
  };

  // Summary
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Platform API: ${results.platform.success ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`   └─ Templates: ${results.platform.count || 0}`);
  console.log(`✅ Backend API:  ${results.backend.success ? '✓ PASS' : '✗ FAIL'}`);
  console.log(`   └─ Templates: ${results.backend.count || 0}`);
  console.log('\n' + '='.repeat(70));

  const passed = Object.values(results).filter(r => r.success).length;
  console.log(`\n📈 Result: ${passed}/2 tests passed\n`);

  if (results.platform.success === false && results.platform.error?.includes('expired')) {
    console.log('⚠️  Platform API Key may be expired. Check WhatsApp Platform dashboard.');
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite error:', error.message);
  process.exit(1);
});
