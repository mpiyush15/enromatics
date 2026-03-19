/**
 * Audit Script: Find Orphaned Records
 * 
 * This script identifies records in all collections that reference tenantIds
 * which no longer exist in the Tenant collection.
 * 
 * Usage: node find-orphaned-records.js
 * 
 * Output: Detailed report of orphaned records by collection
 */

import mongoose from 'mongoose';
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

// Collections to check (model name -> collection name)
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

async function findOrphanedRecords() {
  try {
    console.log('\n🔍 Starting orphaned records audit...\n');

    // Get all valid tenantIds
    const validTenants = await Tenant.find({}, 'tenantId');
    const validTenantIds = new Set(validTenants.map(t => t.tenantId));

    console.log(`📊 Found ${validTenantIds.size} valid tenants\n`);
    console.log('Checking collections for orphaned records...\n');

    let totalOrphaned = 0;
    const orphanedByCollection = {};

    // Check each collection
    for (const { model, instance } of COLLECTIONS_TO_CHECK) {
      try {
        // Get all records with tenantId
        const records = await instance.find(
          { tenantId: { $exists: true } },
          'tenantId'
        );

        // Find orphaned records
        const orphaned = records.filter(
          r => !validTenantIds.has(r.tenantId)
        );

        if (orphaned.length > 0) {
          orphanedByCollection[model] = {
            count: orphaned.length,
            totalRecords: records.length,
            orphanedTenantIds: [...new Set(orphaned.map(r => r.tenantId))]
          };
          totalOrphaned += orphaned.length;

          console.log(
            `⚠️  ${model}: ${orphaned.length} orphaned out of ${records.length} total`
          );
          console.log(
            `   Orphaned tenantIds: ${orphanedByCollection[model].orphanedTenantIds.join(', ')}`
          );
        } else if (records.length > 0) {
          console.log(
            `✅ ${model}: ${records.length} records - all valid (0 orphaned)`
          );
        } else {
          console.log(`⚪ ${model}: No records found`);
        }
      } catch (error) {
        console.error(`❌ ${model}: Error checking - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📋 ORPHANED RECORDS SUMMARY`);
    console.log('='.repeat(60));
    console.log(`Total orphaned records: ${totalOrphaned}\n`);

    if (totalOrphaned > 0) {
      console.log('By Collection:');
      Object.entries(orphanedByCollection).forEach(([collection, data]) => {
        console.log(
          `  • ${collection}: ${data.count} orphaned (${data.orphanedTenantIds.join(', ')})`
        );
      });
    } else {
      console.log('✅ No orphaned records found!');
    }

    console.log('\n' + '='.repeat(60));
  } catch (error) {
    console.error('❌ Audit error:', error);
  }
}

async function main() {
  await connectDB();
  await findOrphanedRecords();
  await mongoose.disconnect();
  console.log('\n✅ Audit complete\n');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
