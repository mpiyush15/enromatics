import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    const Tenant = mongoose.model('Tenant', new mongoose.Schema({}, { strict: false }));
    return Tenant.findOne({ email: 'mpiyush2727@gmail.com' }, 'email instituteName subdomain tenantId');
  })
  .then(tenant => {
    if (tenant) {
      console.log('\n✅ Tenant found:');
      console.log('Email:', tenant.email);
      console.log('Institute:', tenant.instituteName);
      console.log('Subdomain:', tenant.subdomain);
      console.log('Tenant ID:', tenant.tenantId);
      console.log('\n🔗 Login URLs:');
      console.log('Local:', 'http://' + tenant.subdomain + '.lvh.me:3000/login');
      console.log('Production:', 'https://' + tenant.subdomain + '.enromatics.com/login');
    } else {
      console.log('\n❌ No tenant found with email: mpiyush2727@gmail.com');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
