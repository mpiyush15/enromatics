#!/usr/bin/env node

/**
 * 🔄 MIGRATE TENANT ID FORMAT
 * Old: 69399b7e6ac71f38cf0bd66b
 * New: EN260301 (EN + YYMM + Serial)
 * Today: March 22, 2026 = 26-03, Serial 01
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function migrateTenant() {
  try {
    console.log('\n🔄 MIGRATING TENANT ID FORMAT\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const OLD_TENANT_ID = '69399b7e6ac71f38cf0bd66b';
    const NEW_TENANT_ID = 'EN260301'; // EN + YYMM (2603 = Mar 2026) + Serial (01)

    console.log(`Old Tenant ID: ${OLD_TENANT_ID}`);
    console.log(`New Tenant ID: ${NEW_TENANT_ID}`);
    console.log('='.repeat(70));

    // Collections to update
    const collections = [
      'users',
      'leads',
      'students',
      'payments',
      'tests',
      'enrollments',
      'batches',
      'attendance',
      'scholarships',
      'contacts',
      'notifications',
      'workflows',
    ];

    const results = {};

    for (const col of collections) {
      const result = await db.collection(col).updateMany(
        { tenantId: OLD_TENANT_ID },
        { $set: { tenantId: NEW_TENANT_ID } }
      );

      results[col] = result.modifiedCount;

      if (result.modifiedCount > 0) {
        console.log(`✅ ${col.padEnd(20)} : ${result.modifiedCount} updated`);
      }
    }

    console.log('\n' + '='.repeat(70));
    const totalUpdated = Object.values(results).reduce((a, b) => a + b, 0);
    console.log(`✅ TOTAL UPDATED: ${totalUpdated} records`);
    console.log('='.repeat(70));

    // Verify migration
    console.log('\n📊 VERIFICATION:\n');

    for (const col of collections) {
      const newCount = await db.collection(col).countDocuments({ tenantId: NEW_TENANT_ID });
      const oldCount = await db.collection(col).countDocuments({ tenantId: OLD_TENANT_ID });

      if (newCount > 0 || oldCount > 0) {
        console.log(`${col.padEnd(20)} | New: ${newCount}, Old: ${oldCount}`);
      }
    }

    console.log('\n✨ Migration complete!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

migrateTenant();
