import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;
const TEST_EMAIL = 'mpiyush2727@gmail.com';

// Define User schema
const userSchema = new mongoose.Schema({
  email: String,
  tenantId: String,
});

// Define Tenant schema
const tenantSchema = new mongoose.Schema({
  tenantId: String,
  email: String,
  whatsappConfig: {
    businessAccountId: String,
    phoneNumberId: String,
    phoneNumber: String,
    connectionStatus: String,
  },
});

const User = mongoose.model('User', userSchema);
const Tenant = mongoose.model('Tenant', tenantSchema);

async function testDisconnect() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log(`\n🔍 Finding tenant for email: ${TEST_EMAIL}`);
    
    // Find user by email
    const user = await User.findOne({ email: TEST_EMAIL });
    if (!user) {
      console.log(`❌ User not found with email: ${TEST_EMAIL}`);
      await mongoose.disconnect();
      return;
    }

    console.log(`✅ Found user: ${user.email}`);
    const tenantId = user.tenantId;
    console.log(`📌 Tenant ID: ${tenantId}`);

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      console.log(`❌ Tenant not found for ID: ${tenantId}`);
      await mongoose.disconnect();
      return;
    }

    console.log(`\n📱 Current WhatsApp Config:`);
    if (tenant.whatsappConfig) {
      console.log(`  Phone Number: ${tenant.whatsappConfig.phoneNumber}`);
      console.log(`  Business Account ID: ${tenant.whatsappConfig.businessAccountId}`);
      console.log(`  Connection Status: ${tenant.whatsappConfig.connectionStatus}`);
    } else {
      console.log('  No WhatsApp configuration found');
    }

    // Perform the disconnect
    console.log(`\n🔌 Disconnecting WhatsApp for tenant: ${tenantId}`);
    const result = await Tenant.findOneAndUpdate(
      { tenantId },
      {
        $unset: { whatsappConfig: 1 }
      },
      { new: true }
    );

    console.log(`✅ WhatsApp disconnected successfully!`);
    console.log(`\n📱 Updated WhatsApp Config:`);
    console.log(`  whatsappConfig: ${result.whatsappConfig ? 'Still exists' : 'REMOVED ✅'}`);

    await mongoose.disconnect();
    console.log(`\n✅ Test completed successfully`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testDisconnect();
