#!/usr/bin/env node

/**
 * 🗑️ COMPLETE DATABASE WHITEWASH
 * Delete all tenant data and user accounts
 * PRESERVE: superadmin user only
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function whitewashDatabase() {
  try {
    console.log('\n⚠️  COMPLETE DATABASE WHITEWASH\n');
    console.log('='.repeat(70));
    console.log('❗ THIS WILL DELETE ALL DATA EXCEPT SUPERADMIN');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const results = {};

    // Collections to DELETE (all data)
    const collectionsToDelete = [
      'leads',
      'students',
      'payments',
      'tests',
      'enrollments',
      'scholarships',
      'batches',
      'attendance',
      'contacts',
      'notifications',
      'workflows',
      'institutions',
      'organizations',
    ];

    console.log('\n🗑️  DELETING ALL TENANT DATA:\n');

    for (const col of collectionsToDelete) {
      const result = await db.collection(col).deleteMany({});
      results[col] = result.deletedCount;
      if (result.deletedCount > 0) {
        console.log(`✅ ${col.padEnd(20)} : ${result.deletedCount} deleted`);
      }
    }

    // DELETE all users EXCEPT superadmin
    console.log('\n👤 DELETING USER ACCOUNTS:\n');

    const deleteUsersResult = await db.collection('users').deleteMany({
      role: { $ne: 'superadmin' }
    });

    console.log(`✅ Users (non-superadmin) : ${deleteUsersResult.deletedCount} deleted`);

    // Verify superadmin still exists
    const superadmin = await db.collection('users').findOne({ 
      role: 'superadmin' 
    });

    if (superadmin) {
      console.log(`\n✅ SUPERADMIN PRESERVED:`);
      console.log(`   Email: ${superadmin.email}`);
      console.log(`   Role: ${superadmin.role}`);
    } else {
      console.log('\n⚠️  WARNING: Superadmin not found!');
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0) + deleteUsersResult.deletedCount;
    console.log(`✅ TOTAL RECORDS DELETED: ${totalDeleted}`);
    console.log('='.repeat(70));

    console.log('\n✨ DATABASE WHITEWASHED!\n');
    console.log('Status:');
    console.log('  ✅ All tenant data removed');
    console.log('  ✅ All user accounts removed (except superadmin)');
    console.log('  ✅ Ready for new tenant registrations');
    console.log('  ✅ Superadmin preserved for admin operations\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

whitewashDatabase();
