#!/usr/bin/env node

/**
 * Test: Check WhatsApp Platform Templates Availability
 * For Shree Coaching Classes (mpiyush2727@gmail.com)
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL;
const TENANT_API_KEY = process.env.WHATSAPP_PLATFORM_API_KEY;
const TENANT_ID = '4b778ad5';

console.log('\n' + '='.repeat(70));
console.log('🔍 CHECKING WHATSAPP PLATFORM TEMPLATES');
console.log('='.repeat(70) + '\n');

async function checkPlatformTemplates() {
  try {
    console.log('📡 Connecting to WhatsApp Platform...\n');
    
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

    console.log('✅ Connected successfully!\n');
    console.log('📊 Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\n' + '='.repeat(70));
    console.log('📈 SUMMARY');
    console.log('='.repeat(70));
    
    // Handle nested response structure
    const templates = response.data?.data?.templates || response.data?.templates || [];
    const templateCount = Array.isArray(templates) ? templates.length : 0;
    const stats = response.data?.data?.stats || {};
    
    console.log(`✅ Platform Status: Connected`);
    console.log(`📦 Templates Found: ${templateCount}`);
    console.log(`   ├─ Approved: ${stats.approved || 0}`);
    console.log(`   ├─ Pending: ${stats.pending || 0}`);
    console.log(`   ├─ Rejected: ${stats.rejected || 0}`);
    console.log(`   └─ Draft: ${stats.draft || 0}`);
    
    if (templateCount > 0) {
      console.log(`\n📋 Available Templates:\n`);
      templates.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name || t.templateName || 'Unknown'}`);
        console.log(`   ├─ ID: ${t._id || t.id || 'N/A'}`);
        console.log(`   ├─ Status: ${t.status || 'N/A'}`);
        console.log(`   ├─ Category: ${t.category || 'N/A'}`);
        console.log(`   ├─ Language: ${t.language || 'N/A'}`);
        if (t.content) {
          const content = t.content.substring(0, 80).replace(/\n/g, ' ');
          console.log(`   └─ Content: ${content}...`);
        }
        console.log('');
      });
    } else {
      console.log(`\n⚠️  No templates currently available on the platform`);
      console.log(`   You can create templates in the WhatsApp Business Manager`);
    }
    
    console.log('\n' + '='.repeat(70) + '\n');
    return true;

  } catch (error) {
    console.error('❌ Error connecting to Platform:');
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.response?.data?.message || error.message}`);
    console.error(`   Details:`, error.response?.data);
    
    console.log('\n' + '='.repeat(70));
    console.log('🔧 Troubleshooting:');
    console.log('='.repeat(70));
    console.log('1. Verify WHATSAPP_PLATFORM_API_KEY is correct');
    console.log('2. Check if Platform URL is accessible');
    console.log('3. Ensure WhatsApp Business Account has templates created');
    console.log('\n');
    
    return false;
  }
}

// Run check
checkPlatformTemplates().catch(err => {
  console.error('Test failed:', err.message);
  process.exit(1);
});
