import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics');

// Tenant schema (minimal for update)
const tenantSchema = new mongoose.Schema({}, { strict: false });
const Tenant = mongoose.model('Tenant', tenantSchema);

async function expireTrialForEmail(email) {
  try {
    console.log(`\n🔍 Finding tenant with email: ${email}`);
    
    const tenant = await Tenant.findOne({ email });
    if (!tenant) {
      console.error(`❌ Tenant not found with email: ${email}`);
      return;
    }

    console.log(`✅ Found tenant: ${tenant.instituteName || tenant.name}`);
    console.log(`📊 Current status: ${tenant.subscription?.status}`);
    console.log(`📅 Current plan: ${tenant.plan}`);
    console.log(`⏰ Current endDate: ${tenant.subscription?.endDate}`);

    // Set trial to expired (yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const updatedTenant = await Tenant.updateOne(
      { _id: tenant._id },
      {
        $set: {
          'subscription.endDate': yesterday,
          'subscription.status': 'inactive',
          'plan': 'trial'
        }
      }
    );

    console.log(`\n✅ Trial expired successfully!`);
    console.log(`📅 New endDate: ${yesterday.toISOString()}`);
    console.log(`📊 New status: inactive`);
    console.log(`\n🧪 Test the tenant at: https://dashboard.enromatics.com/dashboard/client/${tenant.tenantId}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n✨ Done!');
  }
}

// Run the script
const email = process.argv[2] || 'pixelsadvertise@gmail.com';
await expireTrialForEmail(email);
