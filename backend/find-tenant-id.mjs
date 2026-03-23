#!/usr/bin/env node

/**
 * 🔍 FIND TENANT ID
 * Check which tenant is associated with your email
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function findTenantId() {
  try {
    console.log('\n🔍 FINDING TENANT ID FOR: mpiyush2727@gmail.com\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Find user by email
    const user = await db.collection('users').findOne({ 
      email: 'mpiyush2727@gmail.com' 
    });

    if (user) {
      console.log('\n✅ USER FOUND!\n');
      console.log(`Email: ${user.email}`);
      console.log(`Tenant ID: ${user.tenantId}`);
      console.log(`Role: ${user.role}`);
      console.log(`Name: ${user.name || 'N/A'}`);
      
      // Now fetch data for this tenant
      console.log('\n' + '='.repeat(70));
      console.log(`\n📊 DATA FOR TENANT: ${user.tenantId}\n`);

      const [leads, students, payments, tests] = await Promise.all([
        db.collection('leads').countDocuments({ tenantId: user.tenantId }),
        db.collection('students').countDocuments({ tenantId: user.tenantId }),
        db.collection('payments').countDocuments({ tenantId: user.tenantId }),
        db.collection('tests').countDocuments({ tenantId: user.tenantId }),
      ]);

      console.log(`Leads: ${leads}`);
      console.log(`Students: ${students}`);
      console.log(`Payments: ${payments}`);
      console.log(`Tests: ${tests}`);
      console.log(`TOTAL: ${leads + students + payments + tests}`);

    } else {
      console.log('\n❌ USER NOT FOUND\n');
      console.log('Email: mpiyush2727@gmail.com not in database');
    }

    // Also list all tenants
    console.log('\n' + '='.repeat(70));
    console.log('\n📋 ALL TENANTS IN DATABASE:\n');

    const tenants = await db.collection('users').distinct('tenantId');
    tenants.forEach((t, i) => {
      console.log(`${i + 1}. ${t}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

findTenantId();
