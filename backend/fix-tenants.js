/**
 * Script to fix existing paid tenants:
 * 1. Add missing plan field
 * 2. Create tenantAdmin user accounts if missing
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Tenant Schema (minimal for this script)
const tenantSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  instituteName: String,
  email: String,
  plan: String,
  active: Boolean,
  contact: {
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
  },
  subscription: {
    status: String,
    paymentId: String,
    startDate: Date,
    endDate: Date,
    billingCycle: String,
  },
}, { timestamps: true });

// User Schema (minimal for this script)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  tenantId: String,
  role: String,
  status: String,
  plan: String,
  subscriptionStatus: String,
  subscriptionEndDate: Date,
  requirePasswordReset: Boolean,
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const Tenant = mongoose.model('Tenant', tenantSchema);
const User = mongoose.model('User', userSchema);

// Generate 6-digit password
const generatePassword = () => Math.floor(100000 + Math.random() * 900000).toString();

async function fixTenants() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find tenants with active subscriptions but missing plan
    const tenants = await Tenant.find({
      'subscription.status': 'active',
      $or: [
        { plan: { $exists: false } },
        { plan: null },
        { plan: '' }
      ]
    });

    console.log(`Found ${tenants.length} tenants with missing plan field`);

    for (const tenant of tenants) {
      console.log(`\n--- Processing: ${tenant.name} (${tenant.email}) ---`);
      
      // 1. Update plan to 'professional' (default for paid)
      tenant.plan = 'professional';
      await tenant.save();
      console.log(`✅ Updated plan to 'professional'`);

      // 2. Check if user exists
      let user = await User.findOne({ email: tenant.email, role: 'tenantAdmin' });
      
      if (user) {
        console.log(`User already exists with role: ${user.role}, tenantId: ${user.tenantId}`);
        // Update tenantId if different
        if (user.tenantId !== tenant.tenantId) {
          user.tenantId = tenant.tenantId;
          user.plan = tenant.plan;
          user.subscriptionStatus = 'active';
          user.subscriptionEndDate = tenant.subscription.endDate;
          await user.save();
          console.log(`✅ Updated user's tenantId to ${tenant.tenantId}`);
        }
      } else {
        // Check if user exists with any role
        let existingUser = await User.findOne({ email: tenant.email });
        
        if (existingUser) {
          // Update existing user to tenantAdmin
          existingUser.role = 'tenantAdmin';
          existingUser.tenantId = tenant.tenantId;
          existingUser.plan = tenant.plan;
          existingUser.subscriptionStatus = 'active';
          existingUser.subscriptionEndDate = tenant.subscription.endDate;
          await existingUser.save();
          console.log(`✅ Updated existing user to tenantAdmin for ${tenant.tenantId}`);
        } else {
          // Create new user
          const password = generatePassword();
          user = new User({
            name: tenant.name,
            email: tenant.email,
            password: password,
            phone: tenant.contact?.phone || null,
            tenantId: tenant.tenantId,
            role: 'tenantAdmin',
            status: 'active',
            plan: tenant.plan,
            subscriptionStatus: 'active',
            subscriptionEndDate: tenant.subscription.endDate,
            requirePasswordReset: true,
          });
          await user.save();
          console.log(`✅ Created new tenantAdmin user`);
          console.log(`   Email: ${tenant.email}`);
          console.log(`   Password: ${password}`);
          console.log(`   ⚠️  SAVE THIS PASSWORD - User will need to reset on first login`);
        }
      }
    }

    // Also find ALL tenants and ensure they have plan field
    const allTenants = await Tenant.find({});
    console.log(`\n\n=== Summary ===`);
    console.log(`Total tenants: ${allTenants.length}`);
    
    for (const t of allTenants) {
      const user = await User.findOne({ email: t.email, role: 'tenantAdmin' });
      console.log(`\n${t.name} (${t.email})`);
      console.log(`  Tenant ID: ${t.tenantId}`);
      console.log(`  Plan: ${t.plan || 'NOT SET'}`);
      console.log(`  Subscription: ${t.subscription?.status || 'None'}`);
      console.log(`  User Account: ${user ? '✅ Yes' : '❌ No'}`);
    }

    console.log('\n✅ Done!');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

fixTenants();
