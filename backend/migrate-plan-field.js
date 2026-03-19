/**
 * Migration Script: Fix Plan Field Pollution (Issue 7)
 * 
 * Purpose:
 * - Migrate TenantSubscription.planType from ['basic', 'premium'] to ['free', 'basic', 'pro', 'enterprise']
 * - Ensure feature flags align with new plan system
 * - Validate all plans are valid after migration
 * 
 * Usage: node migrate-plan-field.js
 */

import mongoose from 'mongoose';
import TenantSubscription from './src/models/TenantSubscription.js';
import { migrateLegacyPlan, PLAN_FEATURES, PLAN_PRICING } from './src/utils/planUtils.js';

const MIGRATION_CONFIG = {
  batchSize: 100,
  dryRun: process.env.DRY_RUN !== 'false', // Default to dry-run
  verbose: process.env.VERBOSE === 'true'
};

// Legacy mapping for migration
const LEGACY_PLAN_MAPPING = {
  'premium': 'pro',
  'basic': 'basic'
};

async function migrateRecord(doc, index) {
  const oldPlanType = doc.planType;
  const newPlanType = LEGACY_PLAN_MAPPING[oldPlanType] || oldPlanType;

  // Check if already using new plan system
  if (['free', 'basic', 'pro', 'enterprise'].includes(oldPlanType)) {
    if (MIGRATION_CONFIG.verbose) {
      console.log(`  [${index}] ${doc.tenantId}: Already using new plan system (${oldPlanType})`);
    }
    return { status: 'already_migrated', tenantId: doc.tenantId, plan: oldPlanType };
  }

  if (!LEGACY_PLAN_MAPPING[oldPlanType]) {
    console.warn(`  [${index}] ${doc.tenantId}: Unknown plan type '${oldPlanType}', keeping as-is`);
    return { status: 'unknown_plan', tenantId: doc.tenantId, plan: oldPlanType };
  }

  // Update features and pricing to match new plan
  const newFeatures = PLAN_FEATURES[newPlanType];
  const newPricing = PLAN_PRICING[newPlanType];

  const updateData = {
    planType: newPlanType,
    features: newFeatures,
    'pricing.monthlyPrice': newPricing.monthlyPrice,
    'pricing.annualPrice': newPricing.annualPrice,
    updatedAt: new Date()
  };

  if (!MIGRATION_CONFIG.dryRun) {
    await TenantSubscription.updateOne(
      { _id: doc._id },
      { $set: updateData }
    );
  }

  if (MIGRATION_CONFIG.verbose) {
    console.log(`  [${index}] ${doc.tenantId}: ${oldPlanType} → ${newPlanType}`);
  }

  return {
    status: 'migrated',
    tenantId: doc.tenantId,
    oldPlan: oldPlanType,
    newPlan: newPlanType
  };
}

async function main() {
  try {
    console.log('🔄 Starting Plan Field Migration (Issue 7)...\n');
    
    if (MIGRATION_CONFIG.dryRun) {
      console.log('⚠️  DRY RUN MODE - No changes will be made');
      console.log('   Set DRY_RUN=false to apply changes\n');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB\n');

    // Count total records
    const totalRecords = await TenantSubscription.countDocuments();
    console.log(`📊 Total TenantSubscription records: ${totalRecords}\n`);

    if (totalRecords === 0) {
      console.log('ℹ️  No records to migrate');
      await mongoose.connection.close();
      return;
    }

    // Fetch all records
    const subscriptions = await TenantSubscription.find().lean();

    // Track migration results
    const results = {
      migrated: [],
      already_migrated: [],
      unknown_plan: [],
      errors: []
    };

    console.log('🔄 Processing records...\n');

    // Migrate each record
    for (let i = 0; i < subscriptions.length; i++) {
      try {
        const result = await migrateRecord(subscriptions[i], i + 1);
        results[result.status].push(result);
      } catch (error) {
        results.errors.push({
          tenantId: subscriptions[i].tenantId,
          error: error.message
        });
        console.error(`  ❌ Error processing ${subscriptions[i].tenantId}: ${error.message}`);
      }
    }

    // Summary
    console.log('\n📈 Migration Summary:');
    console.log(`  ✅ Migrated: ${results.migrated.length}`);
    console.log(`  ℹ️  Already using new system: ${results.already_migrated.length}`);
    console.log(`  ⚠️  Unknown plans: ${results.unknown_plan.length}`);
    console.log(`  ❌ Errors: ${results.errors.length}`);

    if (results.migrated.length > 0) {
      console.log('\n📝 Migration Details:');
      results.migrated.forEach((record) => {
        console.log(`  • ${record.tenantId}: ${record.oldPlan} → ${record.newPlan}`);
      });
    }

    if (results.unknown_plan.length > 0) {
      console.log('\n⚠️  Unknown Plans (may need manual review):');
      results.unknown_plan.forEach((record) => {
        console.log(`  • ${record.tenantId}: ${record.plan}`);
      });
    }

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach((error) => {
        console.log(`  • ${error.tenantId}: ${error.error}`);
      });
    }

    // Verify migration
    console.log('\n✔️  Verifying migration...');
    
    const invalidPlans = await TenantSubscription.find({
      planType: { $nin: ['free', 'basic', 'pro', 'enterprise'] }
    });

    if (invalidPlans.length > 0) {
      console.log(`  ❌ Found ${invalidPlans.length} records with invalid plans:`);
      invalidPlans.forEach(doc => {
        console.log(`     • ${doc.tenantId}: ${doc.planType}`);
      });
    } else {
      console.log('  ✅ All records use valid plan values');
    }

    // Show stats by plan
    const stats = await TenantSubscription.aggregate([
      {
        $group: {
          _id: '$planType',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Current Plan Distribution:');
    stats.forEach(stat => {
      console.log(`  • ${stat._id}: ${stat.count}`);
    });

    if (MIGRATION_CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN COMPLETE - No actual changes were made');
      console.log('   To apply changes, run: DRY_RUN=false node migrate-plan-field.js');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }

    await mongoose.connection.close();

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
