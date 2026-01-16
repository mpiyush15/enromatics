#!/usr/bin/env node
/**
 * Quick check script to verify student records and payments
 * Usage: node backend/check-student-details.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function checkStudent() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Connected\n');

    // Get collections
    const db = mongoose.connection.db;
    const studentsCol = db.collection('students');
    const paymentsCol = db.collection('payments');

    // Find Vivek Khanna
    console.log('🔍 Searching for "Vivek Khanna"...\n');
    const student = await studentsCol.findOne({
      name: { $regex: 'Vivek', $options: 'i' }
    });

    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log('✅ STUDENT FOUND:');
    console.log(`   Name: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   ID: ${student._id}`);
    console.log(`   TenantId: ${student.tenantId}`);
    console.log(`   Fees: ₹${student.fees || 0}`);
    console.log(`   Balance: ₹${student.balance || 0}\n`);

    // Check payments
    console.log('🔍 Checking payment records...\n');
    const payments = await paymentsCol
      .find({ studentId: student._id })
      .sort({ date: -1 })
      .toArray();

    console.log(`📋 PAYMENTS FOUND: ${payments.length}\n`);
    
    if (payments.length === 0) {
      console.log('⚠️  NO PAYMENTS YET\n');
      console.log('💡 To add a test payment, run:');
      console.log('   db.payments.insertOne({');
      console.log(`     studentId: ObjectId("${student._id}"),`);
      console.log(`     tenantId: "${student.tenantId}",`);
      console.log('     amount: 5000,');
      console.log('     method: "cash",');
      console.log('     date: new Date(),');
      console.log('     status: "success",');
      console.log('     receiptNumber: "REC001"');
      console.log('   })');
    } else {
      payments.forEach((p, i) => {
        console.log(`Payment ${i + 1}:`);
        console.log(`  Amount: ₹${p.amount}`);
        console.log(`  Date: ${p.date}`);
        console.log(`  Status: ${p.status}`);
        console.log(`  Method: ${p.method}`);
        console.log(`  TenantId: ${p.tenantId}\n`);
      });
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudent();
