import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'backend/.env') });

const tenantSchema = new mongoose.Schema({}, { strict: false });
const Tenant = mongoose.model('Tenant', tenantSchema);

async function checkClient() {
  try {
    console.log('�� Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const client = await Tenant.findOne({ email: 'mriche123@gmail.com' });

    if (!client) {
      console.log('❌ Client with email mriche123@gmail.com NOT FOUND');
      return;
    }

    console.log('\n✅ CLIENT FOUND:');
    console.log('━'.repeat(60));
    console.log(`📧 Email: ${client.email}`);
    console.log(`👤 Name: ${client.name}`);
    console.log(`🏫 Institute Name: ${client.instituteName || 'NOT SET'}`);
    console.log(`🆔 Tenant ID: ${client.tenantId}`);
    console.log(`📍 Subdomain: ${client.subdomain || 'NOT GENERATED'}`);
    console.log(`🔗 Institute URL: ${client.subdomain ? `https://${client.subdomain}.pixelsagency.in` : 'NOT GENERATED'}`);
    console.log(`✅ Active: ${client.active}`);
    console.log(`📋 Plan: ${client.plan}`);
    console.log(`💳 Subscription Status: ${client.subscription?.status || 'NONE'}`);
    console.log(`⏰ Created At: ${client.createdAt}`);
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkClient();
