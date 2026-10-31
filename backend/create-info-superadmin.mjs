#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createSuperadmin() {
  try {
    console.log('\n🔐 CREATING / UPDATING SUPERADMIN USER\n');
    console.log('='.repeat(60));

    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/enromatics';
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const EMAIL = 'info@enromatics.com';
    const PASSWORD = '02072023';
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    // 1. Ensure 'superadmin' tenant exists in tenants collection
    await db.collection('tenants').updateOne(
      { tenantId: 'superadmin' },
      {
        $set: {
          tenantId: 'superadmin',
          instituteName: 'Enromatics Global Administration',
          status: 'active',
          plan: 'enterprise',
          subdomain: 'admin',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('✅ Superadmin tenant record ensured');

    // 2. Create or update the superadmin user
    const userUpdate = {
      name: 'Enromatics Super Admin',
      email: EMAIL,
      role: 'superadmin',
      tenantId: 'superadmin',
      password: hashedPassword,
      status: 'active',
      isActive: true,
      plan: 'enterprise',
      permissions: ['all'],
      access: 'full',
      updatedAt: new Date()
    };

    const result = await db.collection('users').updateOne(
      { email: EMAIL },
      {
        $set: userUpdate,
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );

    console.log('✅ SUPERADMIN USER READY!');
    console.log(`   Email:    ${EMAIL}`);
    console.log(`   Password: ${PASSWORD}`);
    console.log(`   Role:     superadmin`);
    console.log(`   Status:   active`);
    console.log(`   Matched:  ${result.matchedCount}, Upserted: ${result.upsertedCount || 0}`);
    console.log('='.repeat(60));
    console.log('\n✨ You can now login at https://enromatics.com/login with this superadmin!\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating superadmin:', error);
    process.exit(1);
  }
}

createSuperadmin();
