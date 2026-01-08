import 'dotenv/config.js';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const tenants = await db.collection('tenants').find({}).limit(10).toArray();
  
  console.log('\n📱 WhatsApp Configurations:\n');
  let found = false;
  
  tenants.forEach(tenant => {
    if (tenant.whatsappConfig) {
      found = true;
      console.log(`✅ Tenant: ${tenant.tenantId}`);
      console.log(`   Business Account ID: ${tenant.whatsappConfig.businessAccountId}`);
      console.log(`   Phone Number ID: ${tenant.whatsappConfig.phoneNumberId}`);
      console.log(`   Phone Number: ${tenant.whatsappConfig.phoneNumber}`);
      console.log(`   Connection Status: ${tenant.whatsappConfig.connectionStatus || 'N/A'}`);
      console.log(`   Connected At: ${tenant.whatsappConfig.connectedAt || 'N/A'}`);
      console.log(`   Configured: ${tenant.whatsappConfig.isConfigured}`);
      console.log('');
    }
  });
  
  if (!found) {
    console.log('❌ No WhatsApp configurations found');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
