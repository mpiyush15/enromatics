import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // 1. Delete old tenant (utkarsheducation54@gmail.com)
    const tenantResult = await db.collection('tenants').deleteOne({ email: 'utkarsheducation54@gmail.com' });
    console.log('Deleted tenant:', tenantResult.deletedCount);
    
    // 2. Delete associated user
    const userResult = await db.collection('users').deleteOne({ email: 'utkarsheducation54@gmail.com' });
    console.log('Deleted user:', userResult.deletedCount);
    
    // 3. Update correct tenant subdomain to 'utkarsheducation'
    const updateResult = await db.collection('tenants').updateOne(
      { email: 'vivekshastrakar@gmail.com' },
      { $set: { subdomain: 'utkarsheducation' } }
    );
    console.log('Updated subdomain:', updateResult.modifiedCount);
    
    // Verify
    const tenant = await db.collection('tenants').findOne({ email: 'vivekshastrakar@gmail.com' });
    console.log('Verified subdomain:', tenant.subdomain);
    
    await mongoose.disconnect();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

cleanup();
