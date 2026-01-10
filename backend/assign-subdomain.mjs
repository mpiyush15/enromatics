import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const BACKEND_URL = 'http://localhost:5050';
const tenantId = '3e87cfe5';

async function assignSubdomain() {
  try {
    console.log('\n🔧 ASSIGNING SUBDOMAIN TO TENANT:', tenantId);
    console.log('━'.repeat(70));

    // Test 1: Auto-generate subdomain
    console.log('\n1️⃣ Auto-generating subdomain...');
    try {
      const autoGenRes = await axios.patch(
        `${BACKEND_URL}/api/tenants/admin/${tenantId}/subdomain`,
        { autoGenerate: true },
        {
          headers: {
            'Authorization': `Bearer test-token`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('✅ Subdomain Auto-Generated:');
      console.log(`   - Subdomain: ${autoGenRes.data.subdomain}`);
      console.log(`   - Institute URL: ${autoGenRes.data.instituteUrl}`);
      console.log(`   - Login URL: ${autoGenRes.data.loginUrl}`);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('⚠️ Auth error (expected without proper token)');
        console.log('   Response:', err.response?.data);
      } else {
        throw err;
      }
    }

    // Step 2: Verify in DB
    console.log('\n2️⃣ Verifying in database...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const TenantModel = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    const tenant = await TenantModel.findOne({ tenantId });
    
    if (tenant) {
      console.log('✅ Tenant Found in DB:');
      console.log(`   - Name: ${tenant.name}`);
      console.log(`   - Subdomain: ${tenant.subdomain || 'NOT SET'}`);
      if (tenant.subdomain) {
        console.log(`   - Institute URL: https://${tenant.subdomain}.pixelsagency.in`);
      }
    } else {
      console.log('❌ Tenant not found');
    }

    await mongoose.disconnect();

    console.log('\n' + '━'.repeat(70));
    console.log('✅ Subdomain Assignment Test Complete');
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

assignSubdomain();
