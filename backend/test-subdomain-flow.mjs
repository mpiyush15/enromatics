import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const BACKEND_URL = 'http://localhost:5050';
const TENANT_EMAIL = 'mriche123@gmail.com';

async function testSubdomainFlow() {
  try {
    console.log('\n🧪 TESTING SUBDOMAIN WORKFLOW FOR:', TENANT_EMAIL);
    console.log('━'.repeat(70));

    // Step 1: Get superadmin token (using test credentials)
    console.log('\n1️⃣ Getting superadmin token...');
    const loginRes = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@enromatics.com',
      password: 'Admin@123'
    }).catch(err => {
      console.warn('⚠️ Could not login with test credentials, continuing without auth token');
      return { data: { token: null } };
    });

    const token = loginRes.data?.token;

    // Step 2: Check if tenant exists
    console.log('\n2️⃣ Checking if tenant already exists...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const TenantModel = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    let existingTenant = await TenantModel.findOne({ email: TENANT_EMAIL });
    
    if (existingTenant) {
      console.log(`   ✅ Tenant found with ID: ${existingTenant.tenantId}`);
      console.log(`   📍 Current subdomain: ${existingTenant.subdomain || 'NOT SET'}`);
      
      // Show current details
      console.log('\n   Current Tenant Details:');
      console.log(`   - Name: ${existingTenant.name}`);
      console.log(`   - Institute: ${existingTenant.instituteName || 'NOT SET'}`);
      console.log(`   - Email: ${existingTenant.email}`);
      console.log(`   - Subdomain: ${existingTenant.subdomain || 'NOT SET'}`);
      console.log(`   - Active: ${existingTenant.active}`);
    } else {
      console.log('   ❌ Tenant does not exist');
    }

    await mongoose.disconnect();

    console.log('\n' + '━'.repeat(70));
    console.log('✅ Subdomain Flow Check Complete');
    console.log('━'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  } finally {
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  }
}

testSubdomainFlow();
