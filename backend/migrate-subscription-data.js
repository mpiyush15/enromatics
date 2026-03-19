/**
 * Migration: Move Tenant.subscription data to TenantSubscription
 * Ensures single source of truth for subscription data
 * Run once to consolidate existing subscription records
 */

import mongoose from 'mongoose';
import Tenant from './src/models/Tenant.js';
import TenantSubscription from './src/models/TenantSubscription.js';

async function migrateSubscriptionData() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/enromatics');
    console.log('✅ Connected to MongoDB');

    // Find all tenants with subscription data
    const tenants = await Tenant.find({ 'subscription.status': { $exists: true } });
    console.log(`📊 Found ${tenants.length} tenants with existing subscription data`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const tenant of tenants) {
      try {
        // Check if TenantSubscription already exists
        let tenantSub = await TenantSubscription.findOne({ tenantId: tenant.tenantId });

        if (!tenantSub) {
          tenantSub = new TenantSubscription({
            tenantId: tenant.tenantId,
          });
        }

        // Migrate subscription data if not already there
        if (!tenantSub.subscription || Object.keys(tenantSub.subscription).length === 0) {
          tenantSub.subscription = {
            status: tenant.subscription?.status || 'inactive',
            startDate: tenant.subscription?.startDate || null,
            endDate: tenant.subscription?.endDate || null,
            autoRenew: true,
          };
        }

        // Migrate payment history if exists
        if (tenant.subscription?.paymentId && (!tenantSub.paymentHistory || tenantSub.paymentHistory.length === 0)) {
          tenantSub.paymentHistory = [{
            date: tenant.subscription.startDate || new Date(),
            amount: tenant.subscription?.amount || 0,
            planType: tenant.plan || 'free',
            status: 'completed',
            transactionId: tenant.subscription.paymentId,
          }];
        }

        await tenantSub.save();
        migratedCount++;
        console.log(`✅ Migrated: ${tenant.tenantId}`);
      } catch (err) {
        errorCount++;
        console.error(`❌ Error migrating ${tenant.tenantId}:`, err.message);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`  ✅ Successfully migrated: ${migratedCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  🎯 Single source of truth established in TenantSubscription`);

    await mongoose.connection.close();
    console.log('✅ Migration complete - Connection closed');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateSubscriptionData();
