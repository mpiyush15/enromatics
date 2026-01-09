// Test script to fetch templates from WhatsApp Platform
import axios from 'axios';
import 'dotenv/config';

const platformUrl = process.env.WHATSAPP_PLATFORM_URL;
const platformApiKey = process.env.WHATSAPP_PLATFORM_API_KEY;

console.log('🧪 Testing WhatsApp Platform Template Fetch\n');
console.log(`📍 Platform URL: ${platformUrl}`);
console.log(`🔑 API Key: ${platformApiKey ? '✅ Configured' : '❌ Missing'}\n`);

if (!platformUrl || !platformApiKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

async function testFetchTemplates() {
  try {
    console.log('⏳ Fetching templates from platform...\n');

    const response = await axios.get(`${platformUrl}/api/templates`, {
      headers: {
        'x-api-key': platformApiKey,
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });

    console.log('✅ SUCCESS! Platform responded\n');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Data:');
    console.log(JSON.stringify(response.data, null, 2));

    const templates = response.data.templates || response.data.data || [];
    console.log(`\n📋 Found ${templates.length} templates\n`);

    if (templates.length > 0) {
      console.log('📝 First Template Sample:');
      console.log(JSON.stringify(templates[0], null, 2));
    }

  } catch (error) {
    console.error('❌ ERROR fetching templates:\n');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection refused. Is the platform running?');
      console.error(`URL: ${platformUrl}`);
    } else {
      console.error(error.message);
    }
  }
}

testFetchTemplates();
