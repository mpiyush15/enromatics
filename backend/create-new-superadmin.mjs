#!/usr/bin/env node

/**
 * 🔐 CREATE NEW SUPERADMIN WITH FULL ACCESS
 * Delete old one, create fresh with proper permissions
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function createNewSuperadmin() {
  try {
    console.log('\n🔐 CREATING NEW SUPERADMIN WITH FULL ACCESS\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Delete old superadmin
    const deleteResult = await db.collection('users').deleteMany({
      role: 'superadmin'
    });

    console.log(`🗑️  Deleted ${deleteResult.deletedCount} old superadmin(s)`);

    // Create new superadmin with full details
    const PASSWORD = 'Pm@22442232';
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    const newSuperadmin = {
      name: 'System Administrator',
      email: 'superadmin@enromatics.com',
      role: 'superadmin',
      tenantId: 'superadmin',
      password: hashedPassword,
      isActive: true,
      permissions: ['all'],
      access: 'full',
      organization: 'Enromatics',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('users').insertOne(newSuperadmin);

    console.log('\n✅ NEW SUPERADMIN CREATED!\n');
    console.log(`ID: ${result.insertedId}`);
    console.log(`Name: ${newSuperadmin.name}`);
    console.log(`Email: ${newSuperadmin.email}`);
    console.log(`Role: ${newSuperadmin.role}`);
    console.log(`Access: ${newSuperadmin.access}`);
    console.log(`Status: ${newSuperadmin.isActive ? 'ACTIVE' : 'INACTIVE'}`);

    console.log('\n' + '='.repeat(70));
    console.log('\n🔑 SUPERADMIN LOGIN CREDENTIALS\n');
    console.log(`Email: ${newSuperadmin.email}`);
    console.log(`Password: ${PASSWORD}`);
    console.log('\n✨ Full access enabled!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createNewSuperadmin();
