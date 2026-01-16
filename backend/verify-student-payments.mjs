#!/usr/bin/env node
/**
 * Direct MongoDB check - bypassing local connection for atlas cloud
 * Run this on a system with MongoDB Atlas access
 */

import fetch from 'node-fetch';

const STUDENT_ROLL = '2025NE011';
const TENANT_URL = 'http://localhost:5050'; // Update if needed

async function checkStudent() {
  try {
    console.log(`🔍 Checking student with roll number: ${STUDENT_ROLL}\n`);
    
    // First, try to get student list or search
    console.log('📊 Testing API connectivity...');
    
    // Try to fetch from a test student email if we know it
    // For now, we'll document what to check manually
    console.log(`\n✅ Steps to verify ${STUDENT_ROLL}'s payments:\n`);
    console.log('1️⃣  Open browser Developer Tools (F12)');
    console.log('2️⃣  Go to Console tab');
    console.log('3️⃣  Login as student with roll number: ' + STUDENT_ROLL);
    console.log('4️⃣  Check browser console for payment data logs');
    console.log('5️⃣  Look for logs showing: ');
    console.log('     ✅ Student data received');
    console.log('     ✅ paymentsCount should show number > 0');
    console.log('     ✅ payments array should list all payment records\n');
    
    console.log('🔧 If no payments show:\n');
    console.log('Option A - Check MongoDB directly (if you have access):');
    console.log(`  db.students.findOne({ rollNumber: "${STUDENT_ROLL}" })`);
    console.log(`  db.payments.find({ studentId: ObjectId("...") })\n`);
    
    console.log('Option B - Check backend logs:');
    console.log('  npm run dev (in /backend folder)');
    console.log('  Look for console logs showing payment fetch results\n');
    
    console.log('Option C - Use test curl command:');
    console.log('  curl -H "Authorization: Bearer <TOKEN>" \\');
    console.log('    http://localhost:5050/api/student-auth/me\n');
    
    console.log('💡 What the backend should show:\n');
    console.log('✅ Fetching payments for student [ID] in tenant [TENANT_ID]: [COUNT] records found\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkStudent();
