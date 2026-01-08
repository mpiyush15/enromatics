#!/usr/bin/env node
/**
 * Quick Status Check for WhatsApp Configuration
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env' });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkStatus() {
  try {
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI not found in .env');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);

    // Get all tenants
    const allTenants = await Tenant.find({}).select('tenantId whatsappConfig');

    console.log('═'.repeat(80));
    console.log('📊 WHATSAPP CONFIGURATION STATUS');
    console.log('═'.repeat(80));
    console.log(`\nTotal Tenants: ${allTenants.length}\n`);

    const configured = [];
    const notConfigured = [];

    allTenants.forEach((tenant) => {
      if (tenant.whatsappConfig && tenant.whatsappConfig.phoneNumber) {
        configured.push(tenant);
      } else {
        notConfigured.push(tenant);
      }
    });

    if (configured.length > 0) {
      console.log('✅ CONFIGURED TENANTS:');
      console.log('─'.repeat(80));
      configured.forEach((tenant, idx) => {
        console.log(`\n${idx + 1}. ${tenant.tenantId}`);
        console.log(`   📱 Phone Number: ${tenant.whatsappConfig.phoneNumber}`);
        console.log(`   📍 Phone Number ID: ${tenant.whatsappConfig.phoneNumberId}`);
        console.log(`   💼 Business Account ID: ${tenant.whatsappConfig.businessAccountId}`);
        console.log(`   🔌 Status: ${tenant.whatsappConfig.connectionStatus || 'disconnected'}`);
        console.log(`   ⏰ Connected: ${tenant.whatsappConfig.connectedAt ? new Date(tenant.whatsappConfig.connectedAt).toLocaleString() : 'Never'}`);
      });
    }

    if (notConfigured.length > 0) {
      console.log('\n\n❌ NOT CONFIGURED TENANTS:');
      console.log('─'.repeat(80));
      notConfigured.forEach((tenant, idx) => {
        console.log(`\n${idx + 1}. ${tenant.tenantId}`);
        console.log(`   → User needs to visit Settings and configure WhatsApp`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`\n📈 Summary: ${configured.length} configured, ${notConfigured.length} not configured`);
    console.log('═'.repeat(80) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStatus();
