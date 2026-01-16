import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:Secure%402024@pixels-cluster.mongodb.net/pixels_app';

(async () => {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB\n');

    // Define models
    const studentSchema = new mongoose.Schema({}, { strict: false });
    const paymentSchema = new mongoose.Schema({}, { strict: false });

    const Student = mongoose.model('Student', studentSchema, 'students');
    const Payment = mongoose.model('Payment', paymentSchema, 'payments');

    // Find Vivek Khanna
    const student = await Student.findOne({ 
      name: { $regex: 'Vivek Khanna', $options: 'i' } 
    });

    if (!student) {
      console.log('❌ Vivek Khanna not found');
      process.exit(0);
    }

    console.log('✅ FOUND STUDENT');
    console.log('👤 Name:', student.name);
    console.log('📧 Email:', student.email);
    console.log('🏢 TenantId:', student.tenantId);
    console.log('💰 Fees:', student.fees);
    console.log('💳 Balance:', student.balance);
    console.log('Student ID:', student._id);

    // Find payments for this student
    const payments = await Payment.find({ 
      studentId: student._id.toString() 
    }).sort({ date: -1 });

    console.log(`\n📋 PAYMENT RECORDS (Found: ${payments.length})`);
    if (payments.length > 0) {
      payments.forEach((p, idx) => {
        console.log(`\n  Payment ${idx + 1}:`);
        console.log(`    Amount: ₹${p.amount}`);
        console.log(`    Date: ${p.date}`);
        console.log(`    Status: ${p.status}`);
        console.log(`    Method: ${p.method}`);
        console.log(`    TenantId: ${p.tenantId}`);
      });
    } else {
      console.log('  ❌ No payments found');
    }

    mongoose.connection.close();
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
