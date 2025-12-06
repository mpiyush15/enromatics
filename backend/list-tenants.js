import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tenantSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  email: String,
  instituteName: String,
  plan: String,
  active: Boolean,
  subscription: Object,
  createdAt: Date,
  updatedAt: Date
}, { strict: false });

const Tenant = mongoose.model('Tenant', tenantSchema);

async function listTenants() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const tenants = await Tenant.find({}).sort({ createdAt: -1 }).lean();
    
    console.log('=== ALL TENANTS ===\n');
    tenants.forEach((t, i) => {
      console.log(`${i + 1}. ${t.name || 'No Name'}`);
      console.log(`   TenantId: ${t.tenantId}`);
      console.log(`   Email: ${t.email}`);
      console.log(`   Plan: ${t.plan || 'free'}`);
      console.log(`   Active: ${t.active}`);
      console.log(`   Created: ${t.createdAt}`);
      console.log('');
    });
    
    console.log(`\nTotal Tenants: ${tenants.length}`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

listTenants();
