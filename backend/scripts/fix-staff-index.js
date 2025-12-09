/**
 * Migration script to fix Staff collection indexes
 * 
 * Problem: employeeId has a global unique index (employeeId_1) which conflicts
 * with multi-tenant design. We only want uniqueness within a tenant.
 * 
 * Solution: Drop the global index, keep the compound index { tenantId: 1, employeeId: 1 }
 * 
 * Run: node scripts/fix-staff-index.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function fixStaffIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const staffCollection = db.collection('staffs');

    // List current indexes
    console.log('\nCurrent indexes on staffs collection:');
    const indexes = await staffCollection.indexes();
    indexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? ' (UNIQUE)' : ''}`);
    });

    // Check if the problematic global index exists
    const globalEmployeeIdIndex = indexes.find(idx => 
      idx.name === 'employeeId_1' && idx.unique === true
    );

    if (globalEmployeeIdIndex) {
      console.log('\n⚠️  Found problematic global unique index: employeeId_1');
      console.log('   Dropping this index...');
      
      await staffCollection.dropIndex('employeeId_1');
      console.log('   ✅ Dropped employeeId_1 index');
    } else {
      console.log('\n✅ Global employeeId_1 index not found (already fixed or never existed)');
    }

    // Ensure the correct compound index exists
    const compoundIndex = indexes.find(idx => 
      idx.key.tenantId === 1 && idx.key.employeeId === 1
    );

    if (compoundIndex) {
      console.log('✅ Compound index { tenantId: 1, employeeId: 1 } exists');
    } else {
      console.log('⚠️  Creating compound index { tenantId: 1, employeeId: 1 }...');
      await staffCollection.createIndex(
        { tenantId: 1, employeeId: 1 },
        { unique: true, name: 'tenantId_1_employeeId_1' }
      );
      console.log('✅ Created compound index');
    }

    // Also fix User collection if needed
    const usersCollection = db.collection('users');
    console.log('\nChecking users collection indexes...');
    const userIndexes = await usersCollection.indexes();
    userIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? ' (UNIQUE)' : ''}`);
    });

    // Note: For users, email should be globally unique, so email_1 unique index is correct
    // But if you want per-tenant uniqueness, you'd need to change this

    console.log('\n✅ Index migration complete!');
    
    // List final indexes
    console.log('\nFinal indexes on staffs collection:');
    const finalIndexes = await staffCollection.indexes();
    finalIndexes.forEach(idx => {
      console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}${idx.unique ? ' (UNIQUE)' : ''}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

fixStaffIndexes();
