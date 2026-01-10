/**
 * Script to send credentials email to tenant with subdomain & institute URL
 * Usage: node send-tenant-credentials.mjs [tenantEmail] [autoGenSubdomain?]
 * Example: node send-tenant-credentials.mjs mriche123@gmail.com true
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import email service
import { sendCredentialsEmail } from './src/services/emailService.js';

const TENANT_EMAIL = process.argv[2] || 'mriche123@gmail.com';
const AUTO_GEN_SUBDOMAIN = process.argv[3] === 'true' || true;

// Mongoose schema
const tenantSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });

async function generatePassword(length = 12) {
  return crypto.randomBytes(length).toString('base64').substring(0, length);
}

async function sendTenantEmail() {
  try {
    console.log('\n📧 SENDING CREDENTIALS EMAIL TO TENANT');
    console.log('━'.repeat(70));
    console.log(`📬 Target Email: ${TENANT_EMAIL}`);
    console.log(`🔄 Auto-Generate Subdomain: ${AUTO_GEN_SUBDOMAIN}`);
    console.log('━'.repeat(70));

    // Connect to MongoDB
    console.log('\n1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected');

    const Tenant = mongoose.model('Tenant', tenantSchema);
    const User = mongoose.model('User', userSchema);

    // Find tenant
    console.log(`\n2️⃣ Finding tenant: ${TENANT_EMAIL}...`);
    const tenant = await Tenant.findOne({ email: TENANT_EMAIL });

    if (!tenant) {
      console.error(`❌ Tenant not found: ${TENANT_EMAIL}`);
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Tenant found:`);
    console.log(`   - ID: ${tenant.tenantId}`);
    console.log(`   - Name: ${tenant.name}`);
    console.log(`   - Institute: ${tenant.instituteName}`);

    // Auto-generate subdomain if needed
    console.log(`\n3️⃣ Checking subdomain...`);
    let subdomain = tenant.subdomain;

    if (!subdomain || AUTO_GEN_SUBDOMAIN) {
      console.log('   Generating new subdomain...');
      const baseName = tenant.instituteName || tenant.name || tenant.email.split('@')[0];
      const cleanSubdomain = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      const suffix = Math.random().toString(36).substr(2, 5);
      subdomain = cleanSubdomain + suffix;

      // Save to database
      tenant.subdomain = subdomain;
      await tenant.save();
      console.log(`✅ Subdomain generated and saved: ${subdomain}`);
    } else {
      console.log(`✅ Using existing subdomain: ${subdomain}`);
    }

    // Check if user exists, if not create one
    console.log(`\n4️⃣ Checking user account...`);
    let user = await User.findOne({ email: TENANT_EMAIL });
    let password;

    if (!user) {
      console.log('   User not found, creating new user...');
      password = generatePassword();
      user = new User({
        name: tenant.name,
        email: tenant.email,
        password: password, // In real system, this should be hashed
        tenantId: tenant.tenantId,
        role: 'tenantAdmin',
        status: 'active',
        plan: tenant.plan || 'free',
        subscriptionStatus: tenant.subscription?.status || 'inactive',
        requirePasswordReset: true,
      });
      await user.save();
      console.log(`✅ New user created`);
    } else {
      console.log('   User already exists, generating new password...');
      password = generatePassword();
      user.password = password;
      user.requirePasswordReset = true;
      await user.save();
      console.log(`✅ Password reset`);
    }

    // Build URLs - Production domain
    const baseDomain = 'enromatics.com';
    const instituteUrl = `https://${subdomain}.${baseDomain}`;
    const loginUrl = `https://${subdomain}.${baseDomain}/login`;

    // Send email
    console.log(`\n5️⃣ Sending credentials email...`);
    console.log(`   - Institute URL: ${instituteUrl}`);
    console.log(`   - Login URL: ${loginUrl}`);
    console.log(`   - Email: ${TENANT_EMAIL}`);
    console.log(`   - Password: ${password}`);

    await sendCredentialsEmail({
      to: tenant.email,
      name: tenant.name,
      instituteName: tenant.instituteName || tenant.name,
      email: tenant.email,
      password: password,
      loginUrl: loginUrl,
      instituteUrl: instituteUrl,
      tenantId: tenant.tenantId,
      userId: user._id
    });

    console.log(`✅ Email sent successfully!`);

    // Summary
    console.log('\n' + '━'.repeat(70));
    console.log('📋 SUMMARY');
    console.log('━'.repeat(70));
    console.log(`✅ Tenant: ${tenant.name} (${TENANT_EMAIL})`);
    console.log(`✅ Subdomain: ${subdomain}`);
    console.log(`✅ Institute URL: ${instituteUrl}`);
    console.log(`✅ Login URL: ${loginUrl}`);
    console.log(`✅ Email Sent: YES`);
    console.log(`✅ Password: ${password}`);
    console.log('━'.repeat(70));
    console.log('\n✨ Tenant will receive email with all details!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  }
}

sendTenantEmail();
