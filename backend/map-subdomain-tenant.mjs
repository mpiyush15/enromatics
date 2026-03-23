#!/usr/bin/env node

/**
 * 🔗 MAP SUBDOMAIN TO NEW TENANT ID
 * Keep subdomain: shreecoaching
 * Map to tenant: EN260301
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function mapSubdomainToTenant() {
  try {
    console.log('\n🔗 MAPPING SUBDOMAIN TO NEW TENANT ID\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const SUBDOMAIN = 'shreecoaching';
    const OLD_TENANT_ID = '69399b7e6ac71f38cf0bd66b';
    const NEW_TENANT_ID = 'EN260301';

    // Find institution/organization by subdomain
    const institution = await db.collection('institutions').findOne({ 
      subdomain: SUBDOMAIN 
    });

    if (institution) {
      console.log(`Found Institution: ${institution.name}`);
      console.log(`Subdomain: ${SUBDOMAIN}`);
      console.log(`Old Tenant ID: ${institution.tenantId}`);
      console.log(`New Tenant ID: ${NEW_TENANT_ID}`);

      // Update institution's tenantId
      const result = await db.collection('institutions').updateOne(
        { subdomain: SUBDOMAIN },
        { $set: { tenantId: NEW_TENANT_ID } }
      );

      if (result.modifiedCount > 0) {
        console.log('\n✅ INSTITUTION TENANT ID UPDATED!\n');
      }
    } else {
      console.log(`⚠️  No institution found for subdomain: ${SUBDOMAIN}`);
      console.log('Checking in other collections...\n');
    }

    // Check other possible mappings
    const org = await db.collection('organizations').findOne({ 
      subdomain: SUBDOMAIN 
    });

    if (org) {
      console.log(`Found Organization: ${org.name}`);
      const result = await db.collection('organizations').updateOne(
        { subdomain: SUBDOMAIN },
        { $set: { tenantId: NEW_TENANT_ID } }
      );
      if (result.modifiedCount > 0) {
        console.log('✅ Organization tenant ID updated!');
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ SUBDOMAIN MAPPING COMPLETE!\n');
    console.log(`Subdomain: ${SUBDOMAIN}`);
    console.log(`Tenant ID: ${NEW_TENANT_ID}`);
    console.log(`User: mpiyush2727@gmail.com → ${NEW_TENANT_ID}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

mapSubdomainToTenant();
