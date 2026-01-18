import mongoose from 'mongoose';
import User from './src/models/User.js';
import Tenant from './src/models/Tenant.js';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI not set in .env');
  process.exit(1);
}

(async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Find all tenants with emails
    const tenants = await Tenant.find({ email: { $exists: true, $ne: null } });
    console.log(`\n📊 Found ${tenants.length} tenants with emails\n`);
    
    let updated = 0;
    let errors = 0;
    
    for (const tenant of tenants) {
      try {
        const user = await User.findOne({ email: tenant.email });
        
        if (!user) {
          console.log(`❌ User not found for: ${tenant.email}`);
          continue;
        }
        
        if (user.tenantId === tenant.tenantId) {
          console.log(`✅ ${tenant.email} already has correct tenantId`);
          continue;
        }
        
        // Update user with correct tenantId
        await User.updateOne(
          { _id: user._id },
          { tenantId: tenant.tenantId }
        );
        
        console.log(`✅ Updated: ${tenant.email} → tenantId: ${tenant.tenantId}`);
        updated++;
      } catch (err) {
        console.error(`❌ Error processing ${tenant.email}:`, err.message);
        errors++;
      }
    }
    
    console.log(`\n📈 Summary:`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Errors: ${errors}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
})();
