import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const tenantSchema = new mongoose.Schema({}, { strict: false });

async function setSubdomain() {
  try {
    console.log('\n🔧 SETTING SUBDOMAIN FOR mriche123@gmail.com');
    console.log('━'.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    
    const Tenant = mongoose.model('Tenant', tenantSchema);
    const tenant = await Tenant.findOne({ email: 'mriche123@gmail.com' });

    if (!tenant) {
      console.log('❌ Tenant not found');
      await mongoose.disconnect();
      return;
    }

    // Generate subdomain
    const baseName = tenant.instituteName || tenant.name;
    const cleanSubdomain = baseName.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
    const suffix = Math.random().toString(36).substr(2, 5);
    const subdomain = cleanSubdomain + suffix;

    // Update tenant
    tenant.subdomain = subdomain;
    await tenant.save();

    const instituteUrl = `https://${subdomain}.enromatics.com`;
    const loginUrl = `https://${subdomain}.enromatics.com/login`;

    console.log('✅ Subdomain set successfully:');
    console.log(`   - Subdomain: ${subdomain}`);
    console.log(`   - Institute URL: ${instituteUrl}`);
    console.log(`   - Login URL: ${loginUrl}`);
    console.log('━'.repeat(70) + '\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

setSubdomain();
