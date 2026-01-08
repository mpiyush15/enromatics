import 'dotenv/config.js';
import whatsappClient from './src/services/whatsappPlatformClient.js';

const apiKey = process.env.WHATSAPP_PLATFORM_API_KEY;

console.log('\n🚀 Testing WhatsApp Platform Client Directly\n');
console.log(`API Key: ${apiKey ? '✅ SET' : '❌ NOT SET'}`);
console.log(`Platform URL: ${process.env.WHATSAPP_PLATFORM_URL}\n`);

async function testAPI(name, fn) {
  try {
    console.log(`\n📡 ${name}`);
    console.log('⏳ Calling...');
    const result = await fn();
    console.log('✅ SUCCESS');
    console.log(JSON.stringify(result, null, 2).substring(0, 500));
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
}

// Test 1: Health Check
await testAPI('1. Health Check', () => whatsappClient.getHealth());

// Test 2: Account Info
await testAPI('2. Account Info', () => whatsappClient.getAccountInfo('1536545574042607'));

// Test 3: Conversations
await testAPI('3. Conversations (limit 5)', () => whatsappClient.getAllConversations(5, 0, apiKey));

// Test 4: Contacts
await testAPI('4. Contacts (limit 5)', () => whatsappClient.getContacts(5, 0, null, apiKey));

console.log('\n✅ All tests completed!\n');
process.exit(0);
