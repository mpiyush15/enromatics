/**
 * Migration: Drop old global unique indexes that should be compound indexes
 * 
 * This fixes the issue where:
 * - employeeId had unique: true (global) but should be unique per tenant
 * - The compound index { tenantId: 1, employeeId: 1 } is the correct one
 */

import mongoose from 'mongoose';

export async function dropOldStaffIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.log('⏳ DB not ready, skipping index migration');
      return;
    }

    const staffCollection = db.collection('staffs');
    
    // Get existing indexes
    const indexes = await staffCollection.indexes();
    console.log('📋 Current staff indexes:', indexes.map(i => i.name));
    
    // Check if the old global employeeId_1 index exists
    const oldIndex = indexes.find(i => i.name === 'employeeId_1');
    
    if (oldIndex) {
      console.log('🗑️ Dropping old global employeeId_1 index...');
      await staffCollection.dropIndex('employeeId_1');
      console.log('✅ Dropped old employeeId_1 index successfully');
    } else {
      console.log('✅ No old employeeId_1 index found - already cleaned up');
    }
    
    // Verify the correct compound index exists
    const compoundIndex = indexes.find(i => 
      i.key?.tenantId === 1 && i.key?.employeeId === 1
    );
    
    if (compoundIndex) {
      console.log('✅ Compound index { tenantId: 1, employeeId: 1 } exists');
    } else {
      console.log('⚠️ Compound index missing - will be created by Mongoose');
    }
    
  } catch (error) {
    // Ignore "index not found" errors
    if (error.code === 27 || error.message?.includes('index not found')) {
      console.log('✅ Index already dropped or does not exist');
    } else {
      console.error('❌ Error in index migration:', error.message);
    }
  }
}

export default dropOldStaffIndexes;
