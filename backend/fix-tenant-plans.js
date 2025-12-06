// Fix tenants with wrong plan (paid ₹10 but showing 'professional')
// Run with: node fix-tenant-plans.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Plan prices for detection
const PLAN_PRICES = {
  10: 'test',
  1999: 'starter',
  16790: 'starter', // annual
  2999: 'professional',
  25190: 'professional', // annual
  4999: 'enterprise',
  41990: 'enterprise', // annual
};

async function fixTenantPlans() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Use native MongoDB driver for direct updates
    const db = mongoose.connection.db;
    const tenantsCollection = db.collection('tenants');
    const usersCollection = db.collection('users');

    // Find all tenants with active subscriptions and amount = 10
    const result = await tenantsCollection.updateMany(
      { 
        'subscription.status': 'active',
        'subscription.amount': 10,
        'plan': { $ne: 'test' }
      },
      { 
        $set: { 'plan': 'test' }
      }
    );
    console.log(`Updated ${result.modifiedCount} tenants to 'test' plan`);

    // Also update users for tenants with amount = 10
    const testTenants = await tenantsCollection.find({ 
      'subscription.amount': 10 
    }).toArray();
    
    for (const tenant of testTenants) {
      const userResult = await usersCollection.updateOne(
        { email: tenant.email },
        { $set: { plan: 'test' } }
      );
      if (userResult.modifiedCount > 0) {
        console.log(`Updated user ${tenant.email} to 'test' plan`);
      }
    }

    console.log('\nVerifying...');
    const verifyTenants = await tenantsCollection.find({ 
      'subscription.status': 'active' 
    }).project({ email: 1, plan: 1, 'subscription.amount': 1 }).toArray();
    
    for (const t of verifyTenants) {
      console.log(`  ${t.email}: plan=${t.plan}, amount=${t.subscription?.amount}`);
    }

    console.log('\nDone! Disconnecting...');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixTenantPlans();
