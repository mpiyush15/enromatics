#!/usr/bin/env node

/**
 * 🌱 SEED DATA FOR NEW TENANT FORMAT
 * Tenant ID: EN260301
 */

import mongoose from 'mongoose';
import 'dotenv/config';

async function seedNewTenant() {
  try {
    console.log('\n🌱 SEEDING DATA FOR NEW TENANT: EN260301\n');

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const TENANT_ID = 'EN260301';

    // 1️⃣ Create Leads
    console.log('📝 Creating leads...');
    const leads = await db.collection('leads').insertMany([
      {
        tenantId: TENANT_ID,
        name: 'Raj Kumar',
        email: 'raj@example.com',
        phone: '9876543210',
        status: 'new',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        name: 'Priya Singh',
        email: 'priya@example.com',
        phone: '9876543211',
        status: 'interested',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        name: 'Amit Patel',
        email: 'amit@example.com',
        phone: '9876543212',
        status: 'enrolled',
        createdAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${leads.insertedIds.length} leads`);

    // 2️⃣ Create Students
    console.log('\n👨‍🎓 Creating students...');
    const students = await db.collection('students').insertMany([
      {
        tenantId: TENANT_ID,
        name: 'Amit Patel',
        email: 'amit@example.com',
        rollNumber: 'STU001',
        batch: 'NEET Batch 1',
        status: 'active',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        name: 'Vikram Desai',
        email: 'vikram@example.com',
        rollNumber: 'STU002',
        batch: 'NEET Batch 1',
        status: 'active',
        createdAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${students.insertedIds.length} students`);

    // 3️⃣ Create Payments
    console.log('\n💰 Creating payments...');
    const payments = await db.collection('payments').insertMany([
      {
        tenantId: TENANT_ID,
        studentId: students.insertedIds[0],
        amount: 50000,
        status: 'completed',
        type: 'admission_fee',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        studentId: students.insertedIds[1],
        amount: 45000,
        status: 'completed',
        type: 'admission_fee',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        studentId: students.insertedIds[0],
        amount: 15000,
        status: 'pending',
        type: 'monthly_fees',
        createdAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${payments.insertedIds.length} payments`);

    // 4️⃣ Create Tests
    console.log('\n📚 Creating tests...');
    const tests = await db.collection('tests').insertMany([
      {
        tenantId: TENANT_ID,
        name: 'Mock Test - Biology',
        batch: 'NEET Batch 1',
        totalQuestions: 90,
        duration: 180,
        status: 'scheduled',
        createdAt: new Date(),
      },
      {
        tenantId: TENANT_ID,
        name: 'Mock Test - Chemistry',
        batch: 'NEET Batch 1',
        totalQuestions: 90,
        duration: 180,
        status: 'scheduled',
        createdAt: new Date(),
      },
    ]);
    console.log(`✅ Created ${tests.insertedIds.length} tests`);

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('✨ DATA SEEDED FOR TENANT: EN260301');
    console.log('='.repeat(70));
    console.log(`Leads: ${leads.insertedIds.length}`);
    console.log(`Students: ${students.insertedIds.length}`);
    console.log(`Payments: ${payments.insertedIds.length}`);
    console.log(`Tests: ${tests.insertedIds.length}`);
    console.log(`TOTAL: ${leads.insertedIds.length + students.insertedIds.length + payments.insertedIds.length + tests.insertedIds.length}`);

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedNewTenant();
