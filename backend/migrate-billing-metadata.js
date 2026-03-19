/**
 * Migration Script: Add Billing Metadata to Tenant (Issue 8)
 * 
 * Purpose:
 * - Populate subscriptionMetadata in Tenant records from TenantSubscription data
 * - Calculate nextBillingDate based on subscription end dates
 * - Ensure all tenants have billing configuration
 * 
 * Usage: node migrate-billing-metadata.js
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import TenantSubscription from './src/models/TenantSubscription.js';
import { syncBillingMetadata, calculateNextBillingDate } from './src/utils/billingUtils.js';

const MIGRATION_CONFIG = {
  dryRun: process.env.DRY_RUN !== 'false', // Default to dry-run
  verbose: process.env.VERBOSE === 'true'
};

async function migrateRecord(tenant, index) {
  try {
    // Find corresponding subscription
    const subscription = await TenantSubscription.findOne({ tenantId: tenant.tenantId });

    if (!subscription) {
      if (MIGRATION_CONFIG.verbose) {
        console.log(`  [${index}] ${tenant.tenantId}: No subscription found, using defaults`);
      }
      
      // Create default metadata
      tenant.subscriptionMetadata = {
        billingCycle: 'monthly',
        autoRenew: true,
        nextBillingDate: null,
        renewalReminderSent: false,
        lastRenewalDate: null
      };
    } else {
      // Sync from subscription
      syncBillingMetadata(tenant, subscription);
      
      if (MIGRATION_CONFIG.verbose) {
        console.log(`  [${index}] ${tenant.tenantId}: Synced from subscription (${subscription.billingCycle}, autoRenew: ${subscription.subscription?.autoRenew})`);
      }
    }

    if (!MIGRATION_CONFIG.dryRun) {
      await tenant.save();
    }

    return {
      status: 'migrated',
      tenantId: tenant.tenantId,
      hasSubscription: !!subscription,
      billingCycle: tenant.subscriptionMetadata?.billingCycle
    };
  } catch (error) {
    console.error(`  ❌ Error migrating ${tenant.tenantId}: ${error.message}`);
    return {
      status: 'error',
      tenantId: tenant.tenantId,
      error: error.message
    };
  }
}

async function main() {
  try {
    console.log('🔄 Starting Billing Metadata Migration (Issue 8)...\n');
    
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
    const totalRecords = await Tenant.countDocuments();
    console.log(`📊 Total Tenant records: ${totalRecords}\n`);

    if (totalRecords === 0) {
      console.log('ℹ️  No records to migrate');
      await mongoose.connection.close();
      return;
    }

    // Fetch all tenants
    const tenants = await Tenant.find();

    // Track results
    const results = {
      migrated: [],
      errors: [],
      withSubscription: 0,
      withoutSubscription: 0
    };

    console.log('🔄 Processing records...\n');

    // Migrate each record
    for (let i = 0; i < tenants.length; i++) {
      const result = await migrateRecord(tenants[i], i + 1);
      
      if (result.status === 'migrated') {
        results.migrated.push(result);
        if (result.hasSubscription) {
          results.withSubscription++;
        } else {
          results.withoutSubscription++;
        }
      } else if (result.status === 'error') {
        results.errors.push(result);
      }
    }

    // Summary
    console.log('\n📈 Migration Summary:');
    console.log(`  ✅ Total migrated: ${results.migrated.length}`);
    console.log(`  ✓ With subscriptions: ${results.withSubscription}`);
    console.log(`  ✓ Without subscriptions (defaults): ${results.withoutSubscription}`);
    console.log(`  ❌ Errors: ${results.errors.length}`);

    // Billing cycle distribution
    const billingSummary = {};
    results.migrated.forEach(r => {
      const cycle = r.billingCycle || 'unknown';
      billingSummary[cycle] = (billingSummary[cycle] || 0) + 1;
    });

    console.log('\n📊 Billing Cycle Distribution:');
    Object.entries(billingSummary).forEach(([cycle, count]) => {
      console.log(`  • ${cycle}: ${count}`);
    });

    if (results.errors.length > 0) {
      console.log('\n❌ Errors:');
      results.errors.forEach(error => {
        console.log(`  • ${error.tenantId}: ${error.error}`);
      });
    }

    // Verify migration
    console.log('\n✔️  Verifying migration...');
    
    const withoutMetadata = await Tenant.find({
      subscriptionMetadata: { $exists: false }
    });

    if (withoutMetadata.length > 0) {
      console.log(`  ⚠️  Found ${withoutMetadata.length} tenants without metadata`);
    } else {
      console.log('  ✅ All tenants have metadata');
    }

    // Show stats
    const stats = await Tenant.aggregate([
      {
        $group: {
          _id: '$subscriptionMetadata.billingCycle',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Final Billing Cycle Stats:');
    stats.forEach(stat => {
      console.log(`  • ${stat._id || 'none'}: ${stat.count}`);
    });

    // Check auto-renew stats
    const autoRenewStats = await Tenant.aggregate([
      {
        $group: {
          _id: '$subscriptionMetadata.autoRenew',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 Auto-Renew Stats:');
    autoRenewStats.forEach(stat => {
      const status = stat._id ? 'Enabled' : 'Disabled';
      console.log(`  • ${status}: ${stat.count}`);
    });

    if (MIGRATION_CONFIG.dryRun) {
      console.log('\n⚠️  DRY RUN COMPLETE - No actual changes were made');
      console.log('   To apply changes, run: DRY_RUN=false node migrate-billing-metadata.js');
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
