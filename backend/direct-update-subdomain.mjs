import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function updateSubdomain() {
  try {
    console.log('\n�� DIRECTLY UPDATING SUBDOMAIN IN DATABASE');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const tenantSchema = new mongoose.Schema({}, { strict: false });
    const TenantModel = mongoose.model('Tenant', tenantSchema);

    const tenantId = '3e87cfe5';
    
    // Find tenant
    const tenant = await TenantModel.findOne({ tenantId });
    if (!tenant) {
      console.log('❌ Tenant not found');
      return;
    }

    console.log('\n📋 Current Tenant Data:');
    console.log(`   - Name: ${tenant.name}`);
    console.log(`   - Institute: ${tenant.instituteName}`);
    console.log(`   - Email: ${tenant.email}`);
    console.log(`   - Current Subdomain: ${tenant.subdomain || 'NOT SET'}`);

    // Auto-generate subdomain (same logic as in controller)
    const baseName = tenant.instituteName || tenant.name || tenant.email.split('@')[0];
    const cleanSubdomain = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
    const suffix = Math.random().toString(36).substr(2, 5);
    const generatedSubdomain = cleanSubdomain + suffix;

    // Update
    tenant.subdomain = generatedSubdomain;
    await tenant.save();

    console.log('\n✅ Subdomain Updated Successfully:');
    console.log(`   - New Subdomain: ${generatedSubdomain}`);
    console.log(`   - Institute URL: https://${generatedSubdomain}.pixelsagency.in`);
    console.log(`   - Login URL: https://${generatedSubdomain}.pixelsagency.in/login`);

    console.log('\n' + '━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB\n');
  }
}

updateSubdomain();
