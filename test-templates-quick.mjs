#!/usr/bin/env node

/**
 * Quick Template Fetch Test
 * Simple test for template fetching
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: '/Users/mpiyush/Documents/Pixels_web_ dashboard/backend/.env' });

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

console.log('\n🔍 QUICK TEMPLATE FETCH TEST\n');

async function quickTest() {
  try {
    console.log(`📡 Connecting to: ${BACKEND_URL}/api/whatsapp/templates`);
    
    const response = await axios.get(`${BACKEND_URL}/api/whatsapp/templates?tenantId=prasamagar`, {
      timeout: 5000,
    });

    console.log('\n✅ SUCCESS!\n');
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📋 Templates Found: ${response.data.templates?.length || 0}`);
    console.log(`👤 Tenant ID: ${response.data.tenantId}`);
    
    if (response.data.templates?.length > 0) {
      console.log('\n📝 Templates:');
      response.data.templates.forEach((t, i) => {
        console.log(`   ${i + 1}. ${t.templateName}`);
        console.log(`      Status: ${t.status}`);
        console.log(`      Category: ${t.category}`);
      });
    }

  } catch (error) {
    console.log('❌ ERROR\n');
    console.log(`Error: ${error.message}`);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log('Is the backend running on port 5050?');
    }
  }
}

quickTest();
