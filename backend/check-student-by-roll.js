#!/usr/bin/env node
/**
 * Check student by roll number and list their payments
 * Usage: node backend/check-student-by-roll.js "2025NE011"
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function checkStudentByRoll() {
  try {
    const rollNo = process.argv[2] || '2025NE011';
    
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Connected\n');

    // Get collections
    const db = mongoose.connection.db;
    const studentsCol = db.collection('students');
    const paymentsCol = db.collection('payments');

    // Find by roll number
    console.log(`🔍 Searching for student with roll number: ${rollNo}\n`);
    const student = await studentsCol.findOne({
      rollNumber: rollNo
    });

    if (!student) {
      console.log(`❌ Student with roll number ${rollNo} not found`);
      process.exit(1);
    }

    console.log('✅ STUDENT FOUND:');
    console.log(`   Name: ${student.name}`);
    console.log(`   Email: ${student.email}`);
    console.log(`   Roll: ${student.rollNumber}`);
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

    console.log(`📋 TOTAL PAYMENTS FOUND: ${payments.length}\n`);
    
    if (payments.length === 0) {
      console.log('⚠️  NO PAYMENTS FOUND\n');
    } else {
      payments.slice(0, 10).forEach((p, i) => {
        console.log(`${i + 1}. ₹${p.amount} - ${new Date(p.date).toLocaleDateString()} (${p.status}) [${p.method}]`);
      });
      if (payments.length > 10) {
        console.log(`   ... and ${payments.length - 10} more payments`);
      }
    }

    // Test API endpoint
    console.log(`\n🧪 Testing API endpoint...`);
    console.log(`   GET /api/student-auth/me`);
    console.log(`   Should return student object with payments array`);
    console.log(`   Expected payments count in response: ${payments.length}`);

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkStudentByRoll();
