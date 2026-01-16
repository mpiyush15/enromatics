#!/usr/bin/env node
/**
 * Insert test payment records for a student
 * This helps verify the payment history display works correctly
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function insertTestPayments() {
  try {
    console.log(`🔌 Connecting to MongoDB...`);
    await mongoose.connect(uri);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const studentsCol = db.collection('students');
    const paymentsCol = db.collection('payments');

    // Find student by roll number
    const rollNo = '2025NE011';
    console.log(`🔍 Finding student with roll number: ${rollNo}`);
    const student = await studentsCol.findOne({ rollNumber: rollNo });

    if (!student) {
      console.log(`❌ Student not found with roll number: ${rollNo}`);
      process.exit(1);
    }

    console.log(`✅ Found student:`);
    console.log(`   Name: ${student.name}`);
    console.log(`   ID: ${student._id}`);
    console.log(`   TenantId: ${student.tenantId}\n`);

    // Check existing payments
    const existingPayments = await paymentsCol.countDocuments({
      studentId: student._id,
      tenantId: student.tenantId
    });

    console.log(`📊 Existing payments: ${existingPayments}`);

    if (existingPayments > 0) {
      console.log(`✅ Payments already exist for this student`);
      
      // Show existing payments
      const payments = await paymentsCol
        .find({ studentId: student._id, tenantId: student.tenantId })
        .sort({ date: -1 })
        .limit(5)
        .toArray();
      
      console.log(`\n📋 Recent payments:`);
      payments.forEach((p, i) => {
        console.log(`  ${i + 1}. ₹${p.amount} - ${new Date(p.date).toLocaleDateString()} (${p.status})`);
      });
    } else {
      console.log(`\n➕ No payments found. Inserting test payments...`);
      
      const testPayments = [
        {
          studentId: student._id,
          tenantId: student.tenantId,
          amount: 5000,
          method: 'cash',
          date: new Date('2024-01-15'),
          status: 'success',
          receiptUrl: null,
          description: 'Test Payment 1'
        },
        {
          studentId: student._id,
          tenantId: student.tenantId,
          amount: 10000,
          method: 'bank',
          date: new Date('2024-02-10'),
          status: 'success',
          receiptUrl: null,
          description: 'Test Payment 2'
        },
        {
          studentId: student._id,
          tenantId: student.tenantId,
          amount: 8000,
          method: 'upi',
          date: new Date('2024-03-05'),
          status: 'success',
          receiptUrl: null,
          description: 'Test Payment 3'
        }
      ];

      const result = await paymentsCol.insertMany(testPayments);
      console.log(`✅ Inserted ${result.insertedIds.length} test payments`);
      
      console.log(`\n📋 Inserted payments:`);
      result.insertedIds.forEach((id, i) => {
        console.log(`  ${i + 1}. ${testPayments[i].amount} - ${testPayments[i].method}`);
      });
    }

    console.log(`\n✅ Done! Check student payments page to see the data`);
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertTestPayments();
