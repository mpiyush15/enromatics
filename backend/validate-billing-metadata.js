/**
 * Validation Script: Verify Billing Metadata Consistency (Issue 8)
 * 
 * Purpose:
 * - Validate all Tenant records have subscriptionMetadata
 * - Check billing cycle and autoRenew values
 * - Verify metadata matches TenantSubscription
 * - Identify orphaned or inconsistent records
 * 
 * Usage: node validate-billing-metadata.js
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import TenantSubscription from './src/models/TenantSubscription.js';

async function validateTenantMetadata() {
  console.log('\n🔍 Validating Tenant subscription metadata...');

  const missingMetadata = await Tenant.find({
    subscriptionMetadata: { $exists: false }
  });

  if (missingMetadata.length === 0) {
    console.log('✅ All Tenant records have subscriptionMetadata');
  } else {
    console.log(`❌ Found ${missingMetadata.length} Tenant records without metadata:`);
    missingMetadata.slice(0, 5).forEach(tenant => {
      console.log(`   • ${tenant.tenantId}`);
    });
  }

  // Validate enum values
  const invalidBillingCycles = await Tenant.find({
    'subscriptionMetadata.billingCycle': { $nin: ['monthly', 'annual'] }
  });

  if (invalidBillingCycles.length > 0) {
    console.log(`⚠️  Found ${invalidBillingCycles.length} records with invalid billing cycle`);
  }

  // Stats
  const stats = await Tenant.aggregate([
    {
      $group: {
        _id: '$subscriptionMetadata.billingCycle',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  console.log('\n📊 Billing Cycle Distribution:');
  stats.forEach(stat => {
    console.log(`   • ${stat._id || 'missing'}: ${stat.count}`);
  });

  return missingMetadata.length === 0 && invalidBillingCycles.length === 0;
}

async function validateAutoRenew() {
  console.log('\n🔍 Validating Auto-Renew settings...');

  const autoRenewStats = await Tenant.aggregate([
    {
      $group: {
        _id: '$subscriptionMetadata.autoRenew',
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('📊 Auto-Renew Distribution:');
  autoRenewStats.forEach(stat => {
    const status = stat._id === true ? 'Enabled' : stat._id === false ? 'Disabled' : 'Missing';
    console.log(`   • ${status}: ${stat.count}`);
  });

  return true;
}

async function validateMetadataConsistency() {
  console.log('\n🔍 Validating Tenant-TenantSubscription consistency...');

  // Find mismatches between Tenant and TenantSubscription
  const mismatches = await Tenant.aggregate([
    {
      $lookup: {
        from: 'tenantsubscriptions',
        localField: 'tenantId',
        foreignField: 'tenantId',
        as: 'subscription'
      }
    },
    {
      $unwind: {
        path: '$subscription',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $match: {
        subscription: { $exists: true },
        $expr: {
          $or: [
            { $ne: ['$subscriptionMetadata.billingCycle', '$subscription.billingCycle'] },
            { $ne: ['$subscriptionMetadata.autoRenew', '$subscription.subscription.autoRenew'] }
          ]
        }
      }
    }
  ]);

  if (mismatches.length === 0) {
    console.log('✅ Tenant metadata matches TenantSubscription');
  } else {
    console.log(`⚠️  Found ${mismatches.length} records with metadata mismatches:`);
    mismatches.slice(0, 5).forEach(record => {
      console.log(`   • ${record.tenantId}:`);
      console.log(`     Tenant cycle: ${record.subscriptionMetadata?.billingCycle}, Sub cycle: ${record.subscription?.billingCycle}`);
      console.log(`     Tenant autoRenew: ${record.subscriptionMetadata?.autoRenew}, Sub autoRenew: ${record.subscription?.subscription?.autoRenew}`);
    });
  }

  return mismatches.length === 0;
}

async function validateRenewalDates() {
  console.log('\n🔍 Validating Renewal Dates...');

  // Check for null renewal dates
  const nullRenewalDates = await Tenant.find({
    'subscriptionMetadata.nextBillingDate': null,
    active: true,
    plan: { $ne: 'free' }
  });

  if (nullRenewalDates.length > 0) {
    console.log(`⚠️  Found ${nullRenewalDates.length} active paid tenants without renewal dates`);
  }

  // Check for overdue renewals
  const overdueRenewals = await Tenant.find({
    'subscriptionMetadata.nextBillingDate': { $lt: new Date() },
    'subscriptionMetadata.autoRenew': true,
    active: true
  });

  if (overdueRenewals.length > 0) {
    console.log(`⚠️  Found ${overdueRenewals.length} tenants due for renewal:`);
    overdueRenewals.slice(0, 5).forEach(tenant => {
      const date = new Date(tenant.subscriptionMetadata.nextBillingDate);
      const daysOverdue = Math.floor((new Date() - date) / (1000 * 60 * 60 * 24));
      console.log(`   • ${tenant.tenantId}: ${daysOverdue} days overdue`);
    });
  } else {
    console.log('✅ No overdue renewals found');
  }

  return true;
}

async function validateReminderFlags() {
  console.log('\n🔍 Validating Renewal Reminder Flags...');

  const stats = await Tenant.aggregate([
    {
      $group: {
        _id: '$subscriptionMetadata.renewalReminderSent',
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('📊 Renewal Reminder Status:');
  stats.forEach(stat => {
    const status = stat._id === true ? 'Sent' : 'Not Sent';
    console.log(`   • ${status}: ${stat.count}`);
  });

  return true;
}

async function main() {
  try {
    console.log('🔍 Starting Billing Metadata Validation (Issue 8)...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Run all validations
    const validation1 = await validateTenantMetadata();
    const validation2 = await validateAutoRenew();
    const validation3 = await validateMetadataConsistency();
    const validation4 = await validateRenewalDates();
    const validation5 = await validateReminderFlags();

    // Overall result
    console.log('\n' + '='.repeat(50));
    if (validation1 && validation3) {
      console.log('✅ All validations passed!');
    } else {
      console.log('⚠️  Some validations need attention. Review above.');
    }
    console.log('='.repeat(50));

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Run validation
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
