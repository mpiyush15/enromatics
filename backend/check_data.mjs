import 'dotenv/config.js';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const tenantId = 'global';
  
  console.log('\n📊 Data Fetched for Tenant: ' + tenantId + '\n');
  
  // Check conversations/chats
  const conversations = await db.collection('conversations').countDocuments({tenantId});
  console.log(`📱 Conversations/Chats: ${conversations}`);
  
  // Check contacts
  const contacts = await db.collection('whatsappcontacts').countDocuments({tenantId});
  console.log(`👥 WhatsApp Contacts: ${contacts}`);
  
  // Check messages
  const messages = await db.collection('messages').countDocuments({tenantId});
  console.log(`💬 Messages: ${messages}`);
  
  // Check chatbots
  const chatbots = await db.collection('chatbots').countDocuments({tenantId});
  console.log(`🤖 Chatbots: ${chatbots}`);
  
  // Check broadcasts
  const broadcasts = await db.collection('broadcasts').countDocuments({tenantId});
  console.log(`📢 Broadcasts: ${broadcasts}`);
  
  // Show sample conversation if exists
  console.log('\n--- Sample Data Preview ---\n');
  
  if (conversations > 0) {
    const sample = await db.collection('conversations').findOne({tenantId});
    console.log('📱 Sample Conversation:');
    console.log(JSON.stringify(sample, null, 2).slice(0, 300) + '...\n');
  }
  
  if (contacts > 0) {
    const sample = await db.collection('whatsappcontacts').findOne({tenantId});
    console.log('👥 Sample Contact:');
    console.log(JSON.stringify(sample, null, 2).slice(0, 300) + '...\n');
  }
  
  if (messages > 0) {
    const sample = await db.collection('messages').findOne({tenantId});
    console.log('💬 Sample Message:');
    console.log(JSON.stringify(sample, null, 2).slice(0, 300) + '...\n');
  }
  
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
