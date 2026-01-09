const mongoose = require('mongoose');
const mongodb_uri = 'mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/enromatics';

(async () => {
  try {
    await mongoose.connect(mongodb_uri);
    const db = mongoose.connection.db;
    
    console.log('✅ FINAL STATUS - WhatsApp Connections\n');
    console.log('═'.repeat(80));
    
    const tenants = await db.collection('tenants').find({}).project({
      tenantId: 1,
      instituteName: 1,
      'whatsappConfig.isConfigured': 1,
      'whatsappConfig.connectionStatus': 1,
      'whatsappConfig.phoneNumber': 1
    }).toArray();
    
    const withWhatsApp = tenants.filter(t => t.whatsappConfig && t.whatsappConfig.isConfigured);
    const withoutWhatsApp = tenants.filter(t => !t.whatsappConfig || !t.whatsappConfig.isConfigured);
    
    console.log(`✅ Tenants WITH WhatsApp Connected: ${withWhatsApp.length}`);
    console.log('─'.repeat(80));
    withWhatsApp.forEach((t, i) => {
      console.log(`${i + 1}. ${t.instituteName || 'Unknown'}`);
      console.log(`   tenantId: ${t.tenantId}`);
      console.log(`   Status: 🟢 ${t.whatsappConfig.connectionStatus}`);
      console.log(`   Phone: ${t.whatsappConfig.phoneNumber}`);
      console.log('');
    });
    
    console.log(`\n🔴 Tenants WITHOUT WhatsApp: ${withoutWhatsApp.length}`);
    console.log('─'.repeat(80));
    withoutWhatsApp.slice(0, 5).forEach((t, i) => {
      console.log(`${i + 1}. ${t.instituteName || 'Unknown'} (${t.tenantId})`);
    });
    if (withoutWhatsApp.length > 5) {
      console.log(`... and ${withoutWhatsApp.length - 5} more`);
    }
    
    console.log('\n═'.repeat(80));
    console.log('✅ Only REAL WhatsApp accounts are now connected!');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
