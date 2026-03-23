#!/usr/bin/env node

/**
 * 🔄 UPDATE USER TENANT ID
 * Maps mpiyush2727@gmail.com to new tenant: EN260301
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function updateUserTenant() {
  try {
    console.log('\n🔄 UPDATING USER TENANT ID\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const OLD_TENANT_ID = '69399b7e6ac71f38cf0bd66b';
    const NEW_TENANT_ID = 'EN260301';
    const EMAIL = 'mpiyush2727@gmail.com';

    // Find user first
    const user = await db.collection('users').findOne({ email: EMAIL });

    if (!user) {
      console.log(`❌ User not found: ${EMAIL}`);
      process.exit(1);
    }

    console.log(`Found User: ${user.name} (${user.email})`);
    console.log(`Current Tenant: ${user.tenantId}`);
    console.log(`New Tenant: ${NEW_TENANT_ID}`);
    console.log('\n' + '='.repeat(70));

    // Update user's tenantId
    const result = await db.collection('users').updateOne(
      { email: EMAIL },
      { $set: { tenantId: NEW_TENANT_ID } }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ USER UPDATED SUCCESSFULLY!\n');
      console.log(`Email: ${EMAIL}`);
      console.log(`New Tenant ID: ${NEW_TENANT_ID}`);

      // Verify
      const updatedUser = await db.collection('users').findOne({ email: EMAIL });
      console.log(`Verified Tenant ID: ${updatedUser.tenantId}`);
    } else {
      console.log('\n❌ No changes made');
    }

    console.log('\n' + '='.repeat(70));

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateUserTenant();
