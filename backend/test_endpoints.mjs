import 'dotenv/config.js';

const BASE_URL = 'http://localhost:5050/api/whatsapp';
const tenantId = 'global';

async function testEndpoint(name, endpoint, params = {}) {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('tenantId', tenantId);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    console.log(`\n📡 Testing: ${name}`);
    console.log(`URL: ${url.toString()}`);
    
    const response = await fetch(url.toString(), {
      timeout: 10000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS (${response.status})`);
      console.log(`Response:`, JSON.stringify(data, null, 2).substring(0, 300));
    } else {
      console.log(`❌ ERROR (${response.status})`);
      const error = await response.text();
      console.log(`Response:`, error.substring(0, 200));
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}`);
  }
}

console.log('🚀 Testing WhatsApp Platform Data Fetching\n');
console.log(`Base URL: ${BASE_URL}`);
console.log(`Tenant ID: ${tenantId}\n`);

await testEndpoint('1. Health Check', '/health');
await testEndpoint('2. Account Info', '/account-info');
await testEndpoint('3. Conversations', '/conversations', { limit: 5 });
await testEndpoint('4. Contacts', '/contacts', { limit: 5 });

console.log('\n✅ All tests completed!');
process.exit(0);
