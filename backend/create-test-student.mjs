import mongoose from 'mongoose';
import Student from './src/models/Student.js';
import Batch from './src/models/Batch.js';

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function createTestStudent() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get the tenant ID (should be from shreecoaching)
    const tenantId = '0b37dbac'; // From the logs above
    
    // Get first batch for this tenant
    const batch = await Batch.findOne({ tenantId }).select('_id name');
    
    if (!batch) {
      console.log('❌ No batch found for tenant. Please create a batch first.');
      process.exit(1);
    }

    console.log(`✅ Found batch: ${batch.name}`);

    // Create test student
    const student = await Student.create({
      tenantId,
      name: 'Test Student',
      email: 'teststudent@example.com',
      phone: '9999999999',
      gender: 'Male',
      course: 'NEET',
      batchId: batch._id,
      batch: batch.name,
      address: 'Test Address',
      fees: 50000,
      balance: 25000,
      password: 'student123', // Will be hashed by pre-save hook
      rollNumber: '2025TST001',
      status: 'active',
    });

    console.log(`\n✅ TEST STUDENT CREATED!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Email: teststudent@example.com`);
    console.log(`Password: student123`);
    console.log(`Name: ${student.name}`);
    console.log(`Roll: ${student.rollNumber}`);
    console.log(`Batch: ${student.batch}`);
    console.log(`TenantId: ${student.tenantId}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n🌐 Login URL: http://shreecoaching.lvh.me:3000/tenant/login`);
    console.log(`📧 Use email: teststudent@example.com`);
    console.log(`🔐 Use password: student123`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTestStudent();
