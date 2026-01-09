import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('🧪 Testing WhatsApp Connection Function\n');
    await mongoose.connect(process.env.MONGODB_URI);

    // Test 1: Check GET config endpoint
    console.log('TEST 1: GET /api/whatsapp/config');
    console.log('─'.repeat(80));
    const response1 = await fetch('http://localhost:5050/api/whatsapp/config?tenantId=4b778ad5');
    const config = await response1.json();
    console.log(`Status: ${response1.status}`);
    console.log(`Response:`, JSON.stringify(config, null, 2).substring(0, 300));
    console.log();

    // Test 2: Check POST config endpoint
    console.log('TEST 2: POST /api/whatsapp/config');
    console.log('─'.repeat(80));
    const response2 = await fetch('http://localhost:5050/api/whatsapp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: '4b778ad5',
        businessAccountId: '1111111111111111',
        phoneNumberId: '2222222222222222',
        phoneNumber: '+919766504856',
        apiKey: 'test_key'
      })
    });
    const saveResult = await response2.json();
    console.log(`Status: ${response2.status}`);
    console.log(`Response:`, JSON.stringify(saveResult, null, 2).substring(0, 300));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

testConnection();
