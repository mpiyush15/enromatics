 ❌ Backend error: 403 { message: 'Tenant ID missing' }
// Script to fix tenantId for mpiyush2727@gmail.com
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import Tenant from './src/models/Tenant.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '.env') });

console.log('📋 Environment check:');
console.log('   MONGODB_URI:', process.env.MONGODB_URI ? 'SET ✅' : 'NOT SET ❌');
console.log('   MONGO_URI:', process.env.MONGO_URI ? 'SET ✅' : 'NOT SET ❌');

async function fixUserTenantId() {
  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI or MONGO_URI not found in environment');
      process.exit(1);
    }
    
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find the user
    const user = await User.findOne({ email: 'mpiyush2727@gmail.com' });
    
    if (!user) {
      console.log('❌ User mpiyush2727@gmail.com not found');
      process.exit(1);
    }

    console.log('📋 Current user data:');
    console.log('  Name:', user.name);
    console.log('  Email:', user.email);
    console.log('  TenantId:', user.tenantId || 'MISSING ❌');
    console.log('  Role:', user.role);
    console.log('');

    // If tenantId is already set, we're good
    if (user.tenantId) {
      console.log('✅ User already has tenantId:', user.tenantId);
      
      // Verify the tenant exists
      const tenant = await Tenant.findOne({ tenantId: user.tenantId });
      if (tenant) {
        console.log('✅ Tenant found:', tenant.name || tenant.instituteName);
      } else {
        console.log('⚠️  Tenant not found - needs investigation');
      }
      
      await mongoose.disconnect();
      process.exit(0);
    }

    // If tenantId is missing, we need to find which tenant this user belongs to
    // Check if they're a tenantAdmin (they should have created a tenant)
    if (user.role === 'tenantAdmin') {
      const tenant = await Tenant.findOne({ email: user.email });
      
      if (tenant) {
        console.log('✅ Found tenant created by this user:', tenant.tenantId);
        console.log('   Institution:', tenant.instituteName || tenant.name);
        
        // Update user with correct tenantId
        user.tenantId = tenant.tenantId;
        await user.save();
        
        console.log('\n✅ USER FIXED!');
        console.log('  Email:', user.email);
        console.log('  TenantId:', user.tenantId);
      } else {
        console.log('❌ No tenant found for this tenantAdmin');
        console.log('   This user may need manual assignment');
      }
    } else {
      console.log('⚠️  User is not a tenantAdmin (role:', user.role + ')');
      console.log('   Please check manually which tenant they belong to');
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixUserTenantId();
