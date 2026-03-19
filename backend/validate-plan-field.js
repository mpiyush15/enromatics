/**
 * Validation Script: Verify Plan Field Consistency (Issue 7)
 * 
 * Purpose:
 * - Validate all Tenant and TenantSubscription plans are consistent
 * - Check plan values match standardized tiers
 * - Verify features align with plans
 * 
 * Usage: node validate-plan-field.js
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import TenantSubscription from './src/models/TenantSubscription.js';
import { PLAN_TIERS, PLAN_FEATURES } from './src/utils/planUtils.js';

const VALID_PLANS = Object.values(PLAN_TIERS);

async function validateTenantPlans() {
  console.log('\n🔍 Validating Tenant plans...');

  const invalidTenants = await Tenant.find({
    plan: { $nin: VALID_PLANS }
  });

  if (invalidTenants.length === 0) {
    console.log('✅ All Tenant records use valid plans');
  } else {
    console.log(`❌ Found ${invalidTenants.length} Tenant records with invalid plans:`);
    invalidTenants.forEach(tenant => {
      console.log(`   • ${tenant.tenantId}: ${tenant.plan}`);
    });
  }

  // Stats
  const stats = await Tenant.aggregate([
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  console.log('\n📊 Tenant Plan Distribution:');
  stats.forEach(stat => {
    console.log(`   • ${stat._id}: ${stat.count}`);
  });

  return invalidTenants.length === 0;
}

async function validateSubscriptionPlans() {
  console.log('\n🔍 Validating TenantSubscription plans...');

  const invalidSubscriptions = await TenantSubscription.find({
    planType: { $nin: VALID_PLANS }
  });

  if (invalidSubscriptions.length === 0) {
    console.log('✅ All TenantSubscription records use valid plans');
  } else {
    console.log(`❌ Found ${invalidSubscriptions.length} TenantSubscription records with invalid plans:`);
    invalidSubscriptions.forEach(sub => {
      console.log(`   • ${sub.tenantId}: ${sub.planType}`);
    });
  }

  // Stats
  const stats = await TenantSubscription.aggregate([
    {
      $group: {
        _id: '$planType',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  console.log('\n📊 TenantSubscription Plan Distribution:');
  stats.forEach(stat => {
    console.log(`   • ${stat._id}: ${stat.count}`);
  });

  return invalidSubscriptions.length === 0;
}

async function validateFeatureAlignment() {
  console.log('\n🔍 Validating Feature Alignment with Plans...');

  const subscriptions = await TenantSubscription.find();
  const issues = [];

  for (const sub of subscriptions) {
    const expectedFeatures = PLAN_FEATURES[sub.planType];
    
    if (!expectedFeatures) {
      issues.push({
        tenantId: sub.tenantId,
        issue: `Unknown plan type: ${sub.planType}`
      });
      continue;
    }

    // Check if actual features match expected
    for (const [feature, expectedValue] of Object.entries(expectedFeatures)) {
      const actualValue = sub.features[feature];
      if (actualValue !== expectedValue) {
        issues.push({
          tenantId: sub.tenantId,
          issue: `Feature mismatch: ${feature} = ${actualValue}, expected ${expectedValue} for plan ${sub.planType}`
        });
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ All features align with plan definitions');
  } else {
    console.log(`❌ Found ${issues.length} feature alignment issues:`);
    issues.forEach(issue => {
      console.log(`   • ${issue.tenantId}: ${issue.issue}`);
    });
  }

  return issues.length === 0;
}

async function validateTenantSubscriptionConsistency() {
  console.log('\n🔍 Validating Tenant-TenantSubscription Consistency...');

  // Find tenants without corresponding subscriptions
  const tenantsWithoutSubscriptions = await Tenant.aggregate([
    {
      $lookup: {
        from: 'tenantsubscriptions',
        localField: 'tenantId',
        foreignField: 'tenantId',
        as: 'subscription'
      }
    },
    {
      $match: {
        subscription: { $eq: [] }
      }
    }
  ]);

  if (tenantsWithoutSubscriptions.length > 0) {
    console.log(`⚠️  Found ${tenantsWithoutSubscriptions.length} tenants without subscriptions:`);
    tenantsWithoutSubscriptions.slice(0, 5).forEach(tenant => {
      console.log(`   • ${tenant.tenantId} (plan: ${tenant.plan})`);
    });
  }

  // Find subscriptions for non-existent tenants
  const orphanedSubscriptions = await TenantSubscription.aggregate([
    {
      $lookup: {
        from: 'tenants',
        localField: 'tenantId',
        foreignField: 'tenantId',
        as: 'tenant'
      }
    },
    {
      $match: {
        tenant: { $eq: [] }
      }
    }
  ]);

  if (orphanedSubscriptions.length > 0) {
    console.log(`❌ Found ${orphanedSubscriptions.length} orphaned subscriptions (no matching tenant):`);
    orphanedSubscriptions.slice(0, 5).forEach(sub => {
      console.log(`   • ${sub.tenantId} (plan: ${sub.planType})`);
    });
  }

  // Check plan mismatch
  const mismatchedPlans = await Tenant.aggregate([
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
          $ne: ['$plan', '$subscription.planType']
        }
      }
    }
  ]);

  if (mismatchedPlans.length > 0) {
    console.log(`⚠️  Found ${mismatchedPlans.length} plan mismatches between Tenant and TenantSubscription:`);
    mismatchedPlans.slice(0, 5).forEach(record => {
      console.log(`   • ${record.tenantId}: Tenant=${record.plan}, Subscription=${record.subscription.planType}`);
    });
  }

  const issueCount = tenantsWithoutSubscriptions.length + orphanedSubscriptions.length + mismatchedPlans.length;
  return issueCount === 0;
}

async function main() {
  try {
    console.log('🔍 Starting Plan Field Validation (Issue 7)...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Run all validations
    const validation1 = await validateTenantPlans();
    const validation2 = await validateSubscriptionPlans();
    const validation3 = await validateFeatureAlignment();
    const validation4 = await validateTenantSubscriptionConsistency();

    // Overall result
    console.log('\n' + '='.repeat(50));
    if (validation1 && validation2 && validation3 && validation4) {
      console.log('✅ All validations passed!');
    } else {
      console.log('❌ Some validations failed. Review the issues above.');
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
