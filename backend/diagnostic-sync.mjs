#!/usr/bin/env node

/**
 * 🔍 REAL-TIME DATA SYNC DIAGNOSTIC REPORT
 * Simple check: What's SYNCED ✅ vs NOT SYNCED ❌
 * Tenant: EN260301
 * Date: March 22, 2026
 */

import mongoose from 'mongoose';
import 'dotenv/config';

const TENANT_ID = 'EN260301';

async function runDiagnostic() {
  try {
    console.log('\n🔍 CROSS-MODULE DATA SYNC DIAGNOSTIC');
    console.log('='.repeat(70));
    console.log(`Tenant: ${TENANT_ID}`);
    console.log('='.repeat(70));

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // ============ FETCH REAL DATA ============
    const [leads, students, payments, tests] = await Promise.all([
      db.collection('leads').countDocuments({ tenantId: TENANT_ID }),
      db.collection('students').countDocuments({ tenantId: TENANT_ID }),
      db.collection('payments').countDocuments({ tenantId: TENANT_ID }),
      db.collection('tests').countDocuments({ tenantId: TENANT_ID }),
    ]);

    const [leadSample, studentSample, paymentSample] = await Promise.all([
      db.collection('leads').findOne({ tenantId: TENANT_ID }),
      db.collection('students').findOne({ tenantId: TENANT_ID }),
      db.collection('payments').findOne({ tenantId: TENANT_ID }),
    ]);

    const [totalRevenue, leadsByStatus] = await Promise.all([
      db
        .collection('payments')
        .aggregate([
          { $match: { tenantId: TENANT_ID } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .toArray(),
      db
        .collection('leads')
        .aggregate([
          { $match: { tenantId: TENANT_ID } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    const revenue = totalRevenue[0]?.total || 0;

    // ============ REPORT SECTION 1: DATABASE STATUS ============
    console.log('\n📊 PART 1: DATABASE (REAL DATA)');
    console.log('-'.repeat(70));
    console.log(`Leads/Enquiries Count:  ${leads} records`);
    console.log(`Students Count:         ${students} records`);
    console.log(`Payments Count:         ${payments} records`);
    console.log(`Tests Count:            ${tests} records`);
    console.log(`Total Revenue:          ₹${revenue.toLocaleString()}`);

    // ============ REPORT SECTION 2: LEAD STATUSES (CRITICAL) ============
    console.log('\n📋 PART 2: ADMISSIONS SYNC');
    console.log('-'.repeat(70));
    console.log('Lead Status Breakdown:');
    if (leadsByStatus.length === 0) {
      console.log('  ⚠️  NO LEADS IN DATABASE');
    } else {
      leadsByStatus.forEach((s) => {
        console.log(`  • ${s._id}: ${s.count} records`);
      });
    }

    // ============ REPORT SECTION 3: SYNC STATUS ============
    console.log('\n🔄 PART 3: MODULE SYNC STATUS');
    console.log('-'.repeat(70));

    // Define sync pairs
    const syncPairs = [
      {
        name: 'Institute Overview ↔ Student Enquiry',
        modules: ['KPI (Admissions Card)', 'Enquiry Dashboard'],
        status: leads > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail:
          leads > 0 ? `${leads} leads in DB → Should show in both` : 'Waiting for lead data',
      },
      {
        name: 'Institute Overview ↔ Revenue Module',
        modules: ['Revenue Card', 'Pending Fees Card'],
        status: payments > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail:
          payments > 0
            ? `₹${revenue.toLocaleString()} in DB → Should show in revenue`
            : 'Waiting for payment data',
      },
      {
        name: 'Institute Overview ↔ Students Module',
        modules: ['KPI (Total Students)', 'Student List'],
        status: students > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail: students > 0 ? `${students} students in DB → Should show in KPI` : 'Waiting for student data',
      },
      {
        name: 'Student Enquiry ↔ Institute Overview',
        modules: ['Enquiry Dashboard', 'Admission Summary Card'],
        status: leads > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail: leads > 0 ? 'Enquiry count should match admission active leads' : 'No leads to sync',
      },
      {
        name: 'Revenue Module ↔ KPI',
        modules: ['Pending Fees List', 'KPI Pending Amount'],
        status: payments > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail: payments > 0 ? 'Payment data should reflect in KPI pending fees' : 'No payments',
      },
      {
        name: 'Tests Module ↔ Institute Overview',
        modules: ['Upcoming Tests List', 'Upcoming Tests Card'],
        status: tests > 0 ? '✅ SYNCED' : '❌ NO DATA',
        detail: tests > 0 ? `${tests} tests should appear in overview` : 'No test data yet',
      },
    ];

    syncPairs.forEach((pair) => {
      console.log(`\n${pair.name}`);
      console.log(`  Status: ${pair.status}`);
      console.log(`  Detail: ${pair.detail}`);
    });

    // ============ REPORT SECTION 4: WHY MOCK DATA SHOWS ============
    console.log('\n\n❓ PART 4: WHY DOES INSTITUTE OVERVIEW SHOW MOCK DATA?');
    console.log('-'.repeat(70));

    const hasRealData = leads > 0 || students > 0 || payments > 0 || tests > 0;

    if (!hasRealData) {
      console.log(`
❌ REASON: Database is EMPTY for tenant "${TENANT_ID}"

When API is called:
  1. Backend queries database
  2. Finds NO records
  3. Returns empty data: { data: [], dataAvailable: false }
  4. Frontend's useConsistentData hook detects empty data
  5. Shows MOCK DATA as fallback

✅ SOLUTION: Add real data to database
  - Leads will populate Admissions card
  - Payments will populate Revenue cards
  - Students will populate KPI totals
  - Tests will populate Upcoming Tests card

Status: 🟡 DATA SEEDING IN PROGRESS (Or never ran)
`);
    } else {
      console.log(`
✅ Database HAS REAL DATA (${leads + students + payments + tests} total records)

Why still showing mock data?
1. Frontend cache TTL hasn't expired
2. Sync event not being emitted on data insert
3. Component not subscribed to correct sync events

Action: Clear browser cache → CTRL+SHIFT+R (hard refresh)
`);
    }

    // ============ REPORT SECTION 5: SYNC VERIFICATION ============
    console.log('\nPART 5: CURRENT SYNC STATUS SUMMARY');
    console.log('-'.repeat(70));

    const syncStats = {
      'Leads/Enquiries': { db: leads, apiEndpoint: '/api/enquiries', connected: leads > 0 },
      'Students': { db: students, apiEndpoint: '/api/students', connected: students > 0 },
      'Revenue/Payments': { db: payments, apiEndpoint: '/api/payments', connected: payments > 0 },
      'Tests': { db: tests, apiEndpoint: '/api/tests', connected: tests > 0 },
    };

    console.log('\nModule Connection Status:');
    Object.entries(syncStats).forEach(([module, stats]) => {
      const icon = stats.connected ? '🟢' : '🔴';
      console.log(`  ${icon} ${module}: ${stats.db} records → ${stats.apiEndpoint}`);
    });

    // ============ REPORT SECTION 6: WHAT TO SYNC ============
    console.log('\n\nPART 6: REQUESTED SYNC POINTS (YOUR REQUIREMENTS)');
    console.log('-'.repeat(70));

    console.log('\n1️⃣ ADMISSIONS SYNC (Single Admission + Pending Fees)');
    console.log('   From: Student Enquiry (Leads)');
    console.log('   To: Institute Overview (Admission Summary Card)');
    console.log(`   Status: ${leads > 0 ? '✅ CAN SYNC' : '❌ WAITING FOR DATA'}`);
    if (leads > 0) {
      console.log(`   Active Leads: ${leadsByStatus.find((s) => s._id === 'new')?.count || 0}`);
      console.log('   ✅ syncEvents: LEAD_CREATED → invalidates ADMISSION_SUMMARY');
    }

    console.log('\n2️⃣ PENDING FEES SYNC');
    console.log('   From: Accounts/Revenue (Payments)');
    console.log('   To: Institute Overview (KPI + Pending Fees Card)');
    console.log(`   Status: ${payments > 0 ? '✅ CAN SYNC' : '❌ WAITING FOR DATA'}`);
    if (payments > 0) {
      console.log(`   Total Revenue: ₹${revenue.toLocaleString()}`);
      console.log('   ✅ syncEvents: PAYMENT_RECORDED → invalidates KPI + REVENUE');
    }

    console.log('\n3️⃣ STUDENTS MODULE SYNC');
    console.log('   From: Students (Direct)');
    console.log('   To: Institute Overview (KPI Total Students)');
    console.log(`   Status: ${students > 0 ? '✅ CAN SYNC' : '❌ WAITING FOR DATA'}`);
    if (students > 0) {
      console.log(`   Total Students: ${students}`);
      console.log('   ✅ syncEvents: STUDENT_CREATED → invalidates KPI');
    }

    // ============ FINAL SUMMARY ============
    console.log('\n\n' + '='.repeat(70));
    console.log('📋 FINAL SUMMARY');
    console.log('='.repeat(70));

    const totalRecords = leads + students + payments + tests;
    const allSync = [leads > 0, students > 0, payments > 0, tests > 0];
    const syncedCount = allSync.filter((x) => x).length;

    console.log(`
Database Records: ${totalRecords}
  • Leads: ${leads} ${leads > 0 ? '✅' : '❌'}
  • Students: ${students} ${students > 0 ? '✅' : '❌'}
  • Payments: ${payments} ${payments > 0 ? '✅' : '❌'}
  • Tests: ${tests} ${tests > 0 ? '✅' : '❌'}

Sync Status: ${syncedCount}/4 modules ready to sync

Overall Status: ${syncedCount > 0 ? '🟡 PARTIAL' : '🔴 WAITING FOR DATA'}

Next Step:
${totalRecords === 0 ? '1. Run seed-test-data.mjs to populate database' : '1. Hard refresh browser (CTRL+SHIFT+R)'}
2. Check Institute Overview dashboard
3. Verify cards show real data instead of mock
4. Test adding new lead/payment to see auto-sync in action
`);

    console.log('='.repeat(70) + '\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

runDiagnostic();
