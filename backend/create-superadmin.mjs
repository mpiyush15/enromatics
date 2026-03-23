#!/usr/bin/env node

/**
 * 🔐 CREATE SUPERADMIN USER
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function createSuperadmin() {
  try {
    console.log('\n🔐 CREATING SUPERADMIN USER\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const superadmin = {
      name: 'Enromatics Admin',
      email: 'admin@enromatics.com',
      role: 'superadmin',
      tenantId: 'superadmin',
      password: 'hashed_password_here', // In real system, hash this
      createdAt: new Date(),
    };

    const result = await db.collection('users').insertOne(superadmin);

    console.log('✅ SUPERADMIN CREATED!\n');
    console.log(`Name: ${superadmin.name}`);
    console.log(`Email: ${superadmin.email}`);
    console.log(`Role: ${superadmin.role}`);
    console.log(`ID: ${result.insertedId}`);

    console.log('\n' + '='.repeat(70));
    console.log('\n✨ SUPERADMIN READY!\n');
    console.log('Use this email to login as superadmin:');
    console.log(`  Email: ${superadmin.email}`);
    console.log('\nYou can now:');
    console.log('  ✅ Create new tenants');
    console.log('  ✅ Register new institutions');
    console.log('  ✅ Create tenant admins\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createSuperadmin();
