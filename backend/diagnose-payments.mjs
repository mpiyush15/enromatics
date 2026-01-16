#!/usr/bin/env node
/**
 * Diagnostic script to check payment data issues
 * This helps identify why payments aren't showing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function diagnosePayments() {
  try {
    console.log(`🔌 Connecting to MongoDB...\n`);
    await mongoose.connect(uri);
    console.log('✅ Connected\n');

    const db = mongoose.connection.db;
    const studentsCol = db.collection('students');
    const paymentsCol = db.collection('payments');

    // Find student 2025NE011
    const student = await studentsCol.findOne({ rollNumber: '2025NE011' });
    
    if (!student) {
      console.log('❌ Student 2025NE011 not found');
      process.exit(1);
    }

    console.log('✅ STUDENT FOUND:');
    console.log(`   Name: ${student.name}`);
    console.log(`   ID: ${student._id}`);
    console.log(`   TenantId: ${student.tenantId}`);
    console.log(`   Fees: ₹${student.fees || 0}`);
    console.log(`   Balance: ₹${student.balance || 0}\n`);

    // Check payments with different queries
    console.log('🔍 CHECKING PAYMENTS:\n');

    // Query 1: By studentId only
    const paymentsByStudentId = await paymentsCol
      .find({ studentId: student._id })
      .toArray();
    console.log(`1. Payments by studentId: ${paymentsByStudentId.length}`);

    // Query 2: By tenantId only
    const paymentsByTenantId = await paymentsCol
      .find({ tenantId: student.tenantId })
      .toArray();
    console.log(`2. Payments by tenantId: ${paymentsByTenantId.length}`);

    // Query 3: By both tenantId + studentId
    const paymentsBoth = await paymentsCol
      .find({ tenantId: student.tenantId, studentId: student._id })
      .toArray();
    console.log(`3. Payments by tenantId + studentId: ${paymentsBoth.length}\n`);

    if (paymentsBoth.length === 0) {
      console.log('❌ NO PAYMENTS FOUND with tenantId + studentId\n');
      console.log('📋 TOTAL PAYMENTS IN DATABASE:', await paymentsCol.countDocuments());
      console.log('📋 SAMPLE PAYMENT (to check structure):');
      const samplePayment = await paymentsCol.findOne({});
      if (samplePayment) {
        console.log(JSON.stringify(samplePayment, null, 2));
      }
      return;
    }

    // Display found payments
    console.log('✅ FOUND PAYMENTS:');
    paymentsBoth.forEach((p, i) => {
      console.log(`\n${i + 1}. Payment`);
      console.log(`   Amount: ₹${p.amount}`);
      console.log(`   Date: ${new Date(p.date).toLocaleDateString()}`);
      console.log(`   Method: ${p.method}`);
      console.log(`   Status: ${p.status}`);
      console.log(`   StudentId: ${p.studentId}`);
      console.log(`   TenantId: ${p.tenantId}`);
    });

    console.log('\n✅ Issue resolved - payments exist in database!');
    console.log('Check frontend console logs when loading the page.');

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

diagnosePayments();
