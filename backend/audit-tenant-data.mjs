#!/usr/bin/env node

/**
 * 📊 TENANT DATA AUDIT
 * Shows what data exists for mpiyush2727@gmail.com (EN260301)
 * before deletion
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function auditTenantData() {
  try {
    console.log('\n📊 TENANT DATA AUDIT FOR: EN260301\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const TENANT_ID = 'EN260301';

    // Check all collections for this tenant
    const collections = [
      'leads',
      'students',
      'payments',
      'tests',
      'enrollments',
      'scholarships',
      'batches',
      'attendance',
      'notifications',
      'workflows',
      'users',
      'contacts'
    ];

    let totalRecords = 0;
    const summary = {};

    for (const col of collections) {
      const count = await db.collection(col).countDocuments({ tenantId: TENANT_ID });
      if (count > 0) {
        summary[col] = count;
        totalRecords += count;
        console.log(`✅ ${col.padEnd(20)} : ${count} records`);
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`TOTAL RECORDS TO DELETE: ${totalRecords}`);
    console.log('='.repeat(70));

    // Sample data
    console.log('\n📋 SAMPLE DATA:');
    
    const leadSample = await db.collection('leads').findOne({ tenantId: TENANT_ID });
    if (leadSample) {
      console.log(`\nLead Sample: ${leadSample.name} (${leadSample.email})`);
    }

    const paymentSample = await db.collection('payments').findOne({ tenantId: TENANT_ID });
    if (paymentSample) {
      console.log(`Payment Sample: ₹${paymentSample.amount} - ${paymentSample.status}`);
    }

    const studentSample = await db.collection('students').findOne({ tenantId: TENANT_ID });
    if (studentSample) {
      console.log(`Student Sample: ${studentSample.name} (${studentSample.email})`);
    }

    await mongoose.connection.close();
    console.log('\n✅ Audit complete');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

auditTenantData();
