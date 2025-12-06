// Script to check all tenants and their subscription data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const tenantSchema = new mongoose.Schema({}, { strict: false });
const Tenant = mongoose.model('Tenant', tenantSchema);

async function checkTenants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const tenants = await Tenant.find({}).lean();
    
    console.log('=== ALL TENANTS WITH SUBSCRIPTION DATA ===\n');
    
    tenants.forEach((t, i) => {
      console.log(`--- Tenant ${i + 1} ---`);
      console.log('Name:', t.name);
      console.log('TenantId:', t.tenantId);
      console.log('Email:', t.email);
      console.log('Plan:', t.plan);
      console.log('Active:', t.active);
      console.log('Subscription:', JSON.stringify(t.subscription, null, 2));
      console.log('Created:', t.createdAt);
      console.log('');
    });

    console.log('Total Tenants:', tenants.length);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTenants();
