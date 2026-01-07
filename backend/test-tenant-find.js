import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function findTenants() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Access tenants collection directly
    const db = mongoose.connection.db;
    const tenants = await db.collection('tenants').find({}).limit(5).toArray();
    
    console.log('\n📋 Sample Tenants in Database:');
    tenants.forEach((tenant, index) => {
      console.log(`${index + 1}. tenantId: ${tenant.tenantId}`);
    });
    
    if (tenants.length === 0) {
      console.log('❌ No tenants found in database');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

findTenants();
