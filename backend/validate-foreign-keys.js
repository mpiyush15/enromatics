/**
 * Validation Script: Check Foreign Key Integrity
 * 
 * Identifies records with invalid tenantIds (references to non-existent tenants)
 * 
 * Usage: node validate-foreign-keys.js
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import Student from './src/models/Student.js';
import Batch from './src/models/Batch.js';
import Test from './src/models/Test.js';
import Employee from './src/models/Employee.js';
import User from './src/models/User.js';
import TenantSubscription from './src/models/TenantSubscription.js';
import Lead from './src/models/Lead.js';
import CallLog from './src/models/CallLog.js';

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/enromatics';

// Collections to validate
const COLLECTIONS = [
  { name: 'User', model: User },
  { name: 'Student', model: Student },
  { name: 'Batch', model: Batch },
  { name: 'Test', model: Test },
  { name: 'Employee', model: Employee },
  { name: 'TenantSubscription', model: TenantSubscription },
  { name: 'Lead', model: Lead },
  { name: 'CallLog', model: CallLog },
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

async function validateForeignKeys() {
  try {
    console.log('\n🔍 Validating foreign key integrity...\n');

    // Get all valid tenantIds
    const validTenants = await Tenant.find({}, 'tenantId');
    const validTenantIds = new Set(validTenants.map(t => t.tenantId));

    console.log(`📊 Valid tenants: ${validTenantIds.size}\n`);

    const report = {
      timestamp: new Date().toISOString(),
      totalValid: 0,
      totalInvalid: 0,
      byCollection: {}
    };

    // Check each collection
    for (const { name, model } of COLLECTIONS) {
      try {
        // Get all records with tenantId
        const records = await model.find(
          { tenantId: { $exists: true } },
          'tenantId -_id'
        );

        // Find records with invalid tenantIds
        const invalid = records.filter(
          r => !validTenantIds.has(r.tenantId)
        );

        const valid = records.length - invalid.length;

        report.byCollection[name] = {
          total: records.length,
          valid: valid,
          invalid: invalid.length,
          invalidTenantIds: [...new Set(invalid.map(r => r.tenantId))]
        };

        report.totalValid += valid;
        report.totalInvalid += invalid.length;

        if (invalid.length > 0) {
          console.log(`⚠️  ${name}: ${invalid.length} invalid out of ${records.length}`);
          console.log(`   Invalid tenantIds: ${report.byCollection[name].invalidTenantIds.join(', ')}`);
        } else {
          console.log(`✅ ${name}: ${valid} records - all valid`);
        }
      } catch (error) {
        console.error(`❌ ${name}: Error validating - ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📋 FOREIGN KEY VALIDATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total valid records: ${report.totalValid}`);
    console.log(`Total invalid records: ${report.totalInvalid}\n`);

    if (report.totalInvalid > 0) {
      console.log('❌ Foreign key violations found:');
      Object.entries(report.byCollection).forEach(([collection, data]) => {
        if (data.invalid > 0) {
          console.log(`  • ${collection}: ${data.invalid} invalid references`);
        }
      });
    } else {
      console.log('✅ All foreign keys are valid!');
    }

    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

async function main() {
  await connectDB();
  await validateForeignKeys();
  await mongoose.disconnect();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
