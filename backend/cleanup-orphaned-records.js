/**
 * Cleanup Script: Remove Orphaned Records
 * 
 * This script removes records from all collections that reference tenantIds
 * which no longer exist in the Tenant collection.
 * 
 * Usage: node cleanup-orphaned-records.js
 * 
 * ⚠️  WARNING: This script performs DELETE operations. Use with caution!
 * It will backup results to orphaned-records-deleted-{timestamp}.json
 */

import mongoose from 'mongoose';
import fs from 'fs';
import Tenant from './src/models/Tenant.js';
import Student from './src/models/Student.js';
import Batch from './src/models/Batch.js';
import Test from './src/models/Test.js';
import TestAttendance from './src/models/TestAttendance.js';
import Attendance from './src/models/Attendance.js';
import TestMarks from './src/models/TestMarks.js';
import TenantSubscription from './src/models/TenantSubscription.js';
import User from './src/models/User.js';
import TenantRole from './src/models/TenantRole.js';
import Lead from './src/models/Lead.js';
import CallLog from './src/models/CallLog.js';
import Employee from './src/models/Employee.js';
import Counter from './src/models/Counter.js';
import NotificationTemplate from './src/models/NotificationTemplate.js';
import WhatsAppEventLog from './src/models/WhatsAppEventLog.js';
import PaymentSession from './src/models/PaymentSession.js';
import Chapter from './src/models/Chapter.js';
import Subject from './src/models/Subject.js';
import Lesson from './src/models/Lesson.js';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/enromatics';

// Collections to check
const COLLECTIONS_TO_CHECK = [
  { model: 'Student', instance: Student },
  { model: 'Batch', instance: Batch },
  { model: 'Test', instance: Test },
  { model: 'TestAttendance', instance: TestAttendance },
  { model: 'Attendance', instance: Attendance },
  { model: 'TestMarks', instance: TestMarks },
  { model: 'TenantSubscription', instance: TenantSubscription },
  { model: 'User', instance: User },
  { model: 'TenantRole', instance: TenantRole },
  { model: 'Lead', instance: Lead },
  { model: 'CallLog', instance: CallLog },
  { model: 'Employee', instance: Employee },
  { model: 'Counter', instance: Counter },
  { model: 'NotificationTemplate', instance: NotificationTemplate },
  { model: 'WhatsAppEventLog', instance: WhatsAppEventLog },
  { model: 'PaymentSession', instance: PaymentSession },
  { model: 'Chapter', instance: Chapter },
  { model: 'Subject', instance: Subject },
  { model: 'Lesson', instance: Lesson },
];

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

async function cleanupOrphanedRecords() {
  try {
    console.log('\n🧹 Starting cleanup of orphaned records...\n');

    // Get all valid tenantIds
    const validTenants = await Tenant.find({}, 'tenantId');
    const validTenantIds = new Set(validTenants.map(t => t.tenantId));

    console.log(`📊 Valid tenants: ${validTenantIds.size}\n`);

    const deletedRecords = {
      timestamp: new Date().toISOString(),
      totalDeleted: 0,
      byCollection: {}
    };

    // Check and delete from each collection
    for (const { model, instance } of COLLECTIONS_TO_CHECK) {
      try {
        // Find all orphaned records (with tenantId not in valid set)
        const orphaned = await instance.find(
          { tenantId: { $exists: true, $nin: Array.from(validTenantIds) } }
        );

        if (orphaned.length > 0) {
          // Store orphaned data for backup
          deletedRecords.byCollection[model] = {
            count: orphaned.length,
            records: orphaned.map(r => ({
              _id: r._id,
              tenantId: r.tenantId
            }))
          };

          // Delete the orphaned records
          const result = await instance.deleteMany(
            { tenantId: { $exists: true, $nin: Array.from(validTenantIds) } }
          );

          console.log(`🗑️  ${model}: Deleted ${result.deletedCount} orphaned records`);
          deletedRecords.totalDeleted += result.deletedCount;
        } else {
          console.log(`✅ ${model}: No orphaned records`);
        }
      } catch (error) {
        console.error(`❌ ${model}: Error during cleanup - ${error.message}`);
      }
    }

    // Save backup of deleted records
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = `orphaned-records-deleted-${timestamp}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(deletedRecords, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log(`✅ Cleanup Complete`);
    console.log('='.repeat(60));
    console.log(`Total records deleted: ${deletedRecords.totalDeleted}`);
    console.log(`Backup saved to: ${backupFile}`);
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Cleanup error:', error);
  }
}

async function main() {
  await connectDB();
  await cleanupOrphanedRecords();
  await mongoose.disconnect();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
