#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:5050/api/whatsapp';
const tenantId = '67a1234567890abcdef00001'; // Sample tenant ID
const authToken = 'test-token'; // You may need to replace with actual auth token

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
});

console.log('🚀 Testing WhatsApp Event API Endpoints\n');

async function testEndpoints() {
  try {
    // Test 1: GET settings
    console.log('1️⃣ Testing GET /events/settings');
    try {
      const settings = await api.get('/events/settings');
      console.log('✅ Response:', JSON.stringify(settings.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 2: PUT settings
    console.log('2️⃣ Testing PUT /events/settings');
    try {
      const update = await api.put('/events/settings', {
        eventType: 'absenceNotifications',
        enabled: true,
        template: 'Hi {studentName}, you were absent on {date}'
      });
      console.log('✅ Response:', JSON.stringify(update.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 3: POST test message
    console.log('3️⃣ Testing POST /events/test');
    try {
      const test = await api.post('/events/test', {
        phone: '+919876543210'
      });
      console.log('✅ Response:', JSON.stringify(test.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 4: GET logs
    console.log('4️⃣ Testing GET /events/logs');
    try {
      const logs = await api.get('/events/logs?limit=5');
      console.log('✅ Response:', JSON.stringify(logs.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 5: DELETE log (if logs exist)
    console.log('5️⃣ Testing DELETE /events/logs/:logId');
    console.log('ℹ️  Skipping delete test (requires existing logId)\n');

    console.log('✨ Tests completed!');
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  }
}

testEndpoints();
