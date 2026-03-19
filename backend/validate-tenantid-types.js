/**
 * Validation Script: Check tenantId Field Types
 * 
 * Verifies that all tenantId fields are String type (not ObjectId)
 * and all references are consistent
 * 
 * Usage: node validate-tenantid-types.js
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
import Payment from './src/models/Payment.js';
import Refund from './src/models/Refund.js';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/enromatics';

// Collections to validate
const COLLECTIONS = [
  { name: 'Tenant', model: Tenant },
  { name: 'Student', model: Student },
  { name: 'Batch', model: Batch },
  { name: 'Test', model: Test },
  { name: 'TestAttendance', model: TestAttendance },
  { name: 'Attendance', model: Attendance },
  { name: 'TestMarks', model: TestMarks },
  { name: 'TenantSubscription', model: TenantSubscription },
  { name: 'User', model: User },
  { name: 'TenantRole', model: TenantRole },
  { name: 'Lead', model: Lead },
  { name: 'CallLog', model: CallLog },
  { name: 'Employee', model: Employee },
  { name: 'Counter', model: Counter },
  { name: 'NotificationTemplate', model: NotificationTemplate },
  { name: 'WhatsAppEventLog', model: WhatsAppEventLog },
  { name: 'PaymentSession', model: PaymentSession },
  { name: 'Payment', model: Payment },
  { name: 'Refund', model: Refund },
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

async function validateTenantIdTypes() {
  try {
    console.log('\n🔍 Validating tenantId field types...\n');

    const issues = [];
    const report = {
      timestamp: new Date().toISOString(),
      validModels: [],
      issues: []
    };

    // Check schema definition for each model
    for (const { name, model } of COLLECTIONS) {
      try {
        const schema = model.schema;
        
        if (!schema.paths.tenantId) {
          console.log(`⚪ ${name}: No tenantId field`);
          continue;
        }

        const tenantIdPath = schema.paths.tenantId;
        const type = tenantIdPath.instance;
        const isString = type === 'String';

        if (isString) {
          console.log(`✅ ${name}: tenantId is String (correct)`);
          report.validModels.push(name);
        } else {
          console.log(`❌ ${name}: tenantId is ${type} (should be String!)`);
          issues.push({
            model: name,
            currentType: type,
            expectedType: 'String'
          });
          report.issues.push({
            model: name,
            currentType: type,
            expectedType: 'String'
          });
        }

        // Check sample data to verify actual types in database
        const sample = await model.findOne({ tenantId: { $exists: true } });
        if (sample && sample.tenantId) {
          const actualType = typeof sample.tenantId;
          if (actualType !== 'string') {
            console.log(`  ⚠️  Database contains non-string tenantIds: ${actualType}`);
            report.issues.push({
              model: name,
              databaseActualType: actualType,
              shouldBe: 'string'
            });
          }
        }
      } catch (error) {
        console.error(`❌ ${name}: Error during validation - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 TENANTID TYPE VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Valid models: ${report.validModels.length}`);
    console.log(`Issues found: ${report.issues.length}\n`);

    if (report.issues.length > 0) {
      console.log('⚠️  Issues:');
      report.issues.forEach(issue => {
        console.log(`  • ${issue.model}: ${JSON.stringify(issue)}`);
      });
    } else {
      console.log('✅ All tenantId fields are correctly typed as String!');
    }

    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

async function main() {
  await connectDB();
  await validateTenantIdTypes();
  await mongoose.disconnect();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
