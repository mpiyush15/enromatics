import 'dotenv/config.js';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  
  console.log('\n🔍 Checking Tenant Data:\n');
  
  const tenant = await db.collection('tenants').findOne({tenantId: 'global'});
  
  if (tenant) {
    console.log('✅ Tenant Found: global');
    console.log('\nWhatsApp Config:');
    console.log(JSON.stringify(tenant.whatsappConfig, null, 2));
  } else {
    console.log('❌ Tenant NOT found: global');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
