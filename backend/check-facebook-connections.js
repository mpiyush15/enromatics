#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({ 'facebookBusiness.connected': true }).select('name email tenantId facebookBusiness');

    if (!users.length) {
      console.log('No users with Facebook connected found.');
    } else {
      console.log(`Found ${users.length} user(s) with Facebook connected:`);
      users.forEach(u => {
        console.log(`- ${u.name} <${u.email}> (tenant: ${u.tenantId})`);
        console.log(`  Facebook User ID: ${u.facebookBusiness.facebookUserId}`);
        console.log(`  Connected At: ${u.facebookBusiness.connectedAt}`);
        console.log(`  Permissions: ${JSON.stringify(u.facebookBusiness.permissions)}`);
        console.log('');
      });
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

check();