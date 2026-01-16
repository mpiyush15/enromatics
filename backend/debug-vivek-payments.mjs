#!/usr/bin/env node
/**
 * Debug script to check why payments aren't showing for Vivek Khanna
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function debugPayments() {
  try {
    console.log(`🔌 Connecting to MongoDB...\n`);
    await mongoose.connect(uri);

    const db = mongoose.connection.db;
    const studentsCol = db.collection('students');
    const paymentsCol = db.collection('payments');

    // Find Vivek Khanna
    const student = await studentsCol.findOne({ name: 'Vivek Khanna' });
    
    if (!student) {
      console.log('❌ Student "Vivek Khanna" not found');
      process.exit(1);
    }

    console.log('✅ STUDENT FOUND:');
    console.log(`   Name: ${student.name}`);
    console.log(`   ID: ${student._id}`);
    console.log(`   ID Type: ${typeof student._id}`);
    console.log(`   TenantId: ${student.tenantId}`);
    console.log(`   TenantId Type: ${typeof student.tenantId}`);
    console.log(`   Fees: ${student.fees}`);
    console.log(`   Balance: ${student.balance}\n`);

    // Find payments by different methods
    console.log('🔍 CHECKING PAYMENTS:\n');

    // Method 1: By studentId as ObjectId
    const paymentsByObjectId = await paymentsCol
      .find({ studentId: student._id })
      .toArray();
    console.log(`1. By studentId (ObjectId): ${paymentsByObjectId.length}`);

    // Method 2: By studentId as string
    const paymentsByString = await paymentsCol
      .find({ studentId: student._id.toString() })
      .toArray();
    console.log(`2. By studentId (String): ${paymentsByString.length}`);

    // Method 3: By tenantId only
    const paymentsByTenantOnly = await paymentsCol
      .find({ tenantId: student.tenantId })
      .toArray();
    console.log(`3. By tenantId only: ${paymentsByTenantOnly.length}`);

    // Method 4: By both
    const paymentsByBoth = await paymentsCol
      .find({ 
        tenantId: student.tenantId,
        studentId: student._id
      })
      .toArray();
    console.log(`4. By tenantId + studentId (ObjectId): ${paymentsByBoth.length}`);

    // Method 5: By both with string
    const paymentsByBothString = await paymentsCol
      .find({ 
        tenantId: student.tenantId,
        studentId: student._id.toString()
      })
      .toArray();
    console.log(`5. By tenantId + studentId (String): ${paymentsByBothString.length}\n`);

    // If found, show sample
    if (paymentsByBoth.length > 0) {
      console.log('✅ PAYMENTS FOUND (Method 4):');
      paymentsByBoth.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. Payment:`);
        console.log(`   Amount: ₹${p.amount}`);
        console.log(`   Date: ${new Date(p.date).toLocaleDateString()}`);
        console.log(`   Method: ${p.method}`);
        console.log(`   Status: ${p.status}`);
        console.log(`   StudentId: ${p.studentId} (Type: ${typeof p.studentId})`);
      });
    } else if (paymentsByObjectId.length > 0) {
      console.log('✅ PAYMENTS FOUND (Method 1 - Using ObjectId):');
      paymentsByObjectId.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. Payment: ₹${p.amount} - ${new Date(p.date).toLocaleDateString()}`);
      });
    } else if (paymentsByString.length > 0) {
      console.log('✅ PAYMENTS FOUND (Method 2 - Using String):');
      paymentsByString.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. Payment: ₹${p.amount} - ${new Date(p.date).toLocaleDateString()}`);
      });
    } else {
      console.log('❌ NO PAYMENTS FOUND');
      console.log('\n📊 TOTAL PAYMENTS IN DB:', await paymentsCol.countDocuments());
      
      console.log('\n📋 SAMPLE PAYMENT STRUCTURE:');
      const sample = await paymentsCol.findOne({});
      if (sample) {
        console.log(JSON.stringify(sample, null, 2));
      }
    }

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

debugPayments();
