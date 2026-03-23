#!/usr/bin/env node

/**
 * 🗑️ COMPLETE TENANT DATA WIPE
 * Deletes ALL data for EN260301 tenant
 * Students, Leads, Payments, Tests, Enrollments, everything
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function wipeAllTenantData() {
  try {
    console.log('\n⚠️  DELETING ALL DATA FOR TENANT: EN260301\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const TENANT_ID = 'EN260301';

    // Collections to wipe (order matters for foreign keys)
    const collections = [
      'enrollments',
      'scholarships',
      'payments',
      'attendance',
      'tests',
      'batches',
      'students',
      'leads',
      'contacts',
      'notifications',
      'workflows'
    ];

    const results = {};

    for (const col of collections) {
      const result = await db.collection(col).deleteMany({ tenantId: TENANT_ID });
      results[col] = result.deletedCount;
      if (result.deletedCount > 0) {
        console.log(`🗑️  ${col.padEnd(20)} : ${result.deletedCount} deleted`);
      }
    }

    console.log('\n' + '='.repeat(70));
    const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0);
    console.log(`✅ TOTAL DELETED: ${totalDeleted} records`);
    console.log('='.repeat(70));

    console.log('\n✨ Tenant data wiped clean. Ready for fresh start!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

wipeAllTenantData();
