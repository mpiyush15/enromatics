/**
 * Verify all tenant URLs use production domain (enromatics.com)
 * NOT localhost, pixelsagency, or any dev domains
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tenantSchema = new mongoose.Schema({}, { strict: false });

async function verifyDomains() {
  try {
    console.log('\n🔍 VERIFYING PRODUCTION DOMAINS');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const Tenant = mongoose.model('Tenant', tenantSchema);

    // Get all tenants with subdomains
    const tenants = await Tenant.find({ subdomain: { $exists: true, $ne: null } });

    if (tenants.length === 0) {
      console.log('⚠️ No tenants with subdomains found');
      await mongoose.disconnect();
      return;
    }

    console.log(`\n✅ Found ${tenants.length} tenant(s) with subdomain:`);
    console.log('━'.repeat(70));

    let allValid = true;

    for (const tenant of tenants) {
      const subdomain = tenant.subdomain;
      const instituteUrl = `https://${subdomain}.enromatics.com`;
      const loginUrl = `https://${subdomain}.enromatics.com/login`;

      // Check for invalid patterns
      const hasLocalhost = subdomain.includes('localhost') || subdomain.includes('127.0.0.1');
      const hasPixelsagency = subdomain.includes('pixelsagency');
      const hasDevDomain = subdomain.includes('lvh.me') || subdomain.includes('dev') || subdomain.includes('test');

      const isValid = !hasLocalhost && !hasPixelsagency && !hasDevDomain;
      const status = isValid ? '✅' : '❌';

      console.log(`\n${status} Tenant: ${tenant.name || 'N/A'}`);
      console.log(`   Email: ${tenant.email}`);
      console.log(`   Subdomain: ${subdomain}`);
      console.log(`   Institute URL: ${instituteUrl}`);
      console.log(`   Login URL: ${loginUrl}`);

      if (!isValid) {
        allValid = false;
        if (hasLocalhost) console.log(`   ❌ ERROR: Contains 'localhost'`);
        if (hasPixelsagency) console.log(`   ❌ ERROR: Contains 'pixelsagency'`);
        if (hasDevDomain) console.log(`   ❌ ERROR: Contains dev/test domain`);
      }
    }

    console.log('\n' + '━'.repeat(70));

    if (allValid) {
      console.log('✅ ALL TENANTS USE PRODUCTION DOMAIN (enromatics.com)');
    } else {
      console.log('❌ SOME TENANTS HAVE INVALID DOMAINS - FIX REQUIRED');
    }

    console.log('━'.repeat(70) + '\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDomains();
