#!/usr/bin/env node

import axios from 'axios';

const API_BASE = 'http://localhost:5050/api';
const tenantId = '67a1234567890abcdef00001';

// Test admin login and then test WhatsApp endpoints
async function testWithValidAuth() {
  try {
    // First, login to get token
    console.log('🔐 Logging in as admin...\n');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@example.com',
      password: 'password123'
    });

    if (!loginRes.data?.token) {
      console.log('❌ Login failed - no token received');
      console.log('Response:', loginRes.data);
      return;
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful! Token:', token.substring(0, 20) + '...\n');

    const api = axios.create({
      baseURL: `${API_BASE}/whatsapp`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Test 1: GET settings
    console.log('1️⃣ GET /events/settings');
    try {
      const res = await api.get('/events/settings');
      console.log('✅ Status:', res.status, '| Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 2: PUT settings
    console.log('2️⃣ PUT /events/settings');
    try {
      const res = await api.put('/events/settings', {
        eventType: 'absenceNotifications',
        enabled: true,
        template: 'Hi {studentName}, you were absent on {date}'
      });
      console.log('✅ Status:', res.status, '| Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 3: POST test message
    console.log('3️⃣ POST /events/test');
    try {
      const res = await api.post('/events/test', {
        phone: '+919876543210'
      });
      console.log('✅ Status:', res.status, '| Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    // Test 4: GET logs
    console.log('4️⃣ GET /events/logs');
    try {
      const res = await api.get('/events/logs?limit=5');
      console.log('✅ Status:', res.status, '| Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.log('❌ Error:', err.response?.data || err.message);
    }
    console.log('');

    console.log('✨ Tests completed!');
  } catch (error) {
    console.error('💥 Fatal error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testWithValidAuth();
