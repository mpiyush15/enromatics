#!/usr/bin/env node

/**
 * 🔐 SET SUPERADMIN PASSWORD
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function setSuperadminPassword() {
  try {
    console.log('\n🔐 SETTING SUPERADMIN PASSWORD\n');
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const EMAIL = 'admin@enromatics.com';
    const PASSWORD = 'Pm@22442232';

    // Hash password
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);

    console.log(`Email: ${EMAIL}`);
    console.log(`Password: ${PASSWORD}`);
    console.log(`Hashed: ${hashedPassword}`);

    // Update user with hashed password
    const result = await db.collection('users').updateOne(
      { email: EMAIL, role: 'superadmin' },
      { $set: { password: hashedPassword } }
    );

    if (result.modifiedCount > 0) {
      console.log('\n✅ PASSWORD UPDATED!\n');
      console.log('='.repeat(70));
      console.log('\n🔑 SUPERADMIN LOGIN CREDENTIALS\n');
      console.log(`Email: ${EMAIL}`);
      console.log(`Password: ${PASSWORD}`);
      console.log('\n✨ Ready to login!\n');
    } else {
      console.log('❌ User not found');
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

setSuperadminPassword();
