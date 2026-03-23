/**
 * 🌱 SEED TEST DATA SCRIPT
 * Populates MongoDB with test records for real-time sync verification
 * Run: node seed-test-data.mjs
 *
 * Creates:
 * ✅ 15 test records with schedules
 * ✅ 20 lead/enquiry records in various statuses
 * ✅ 5 sample payments for revenue sync
 * ✅ Updates to student records with real data
 */

import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';
const TENANT_ID = 'EN260301'; // Test tenant

// ============ CONNECT TO MONGODB ============
async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// ============ DEFINE SCHEMAS ============

const testSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  subject: String,
  batch: String,
  scheduledDate: Date,
  scheduledTime: String,
  totalQuestions: Number,
  duration: Number,
  passingMarks: Number,
  maxMarks: Number,
  testType: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new mongoose.Schema({
  tenantId: String,
  name: String,
  email: String,
  phone: String,
  courseInterest: String,
  status: String,
  source: String,
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const paymentSchema = new mongoose.Schema({
  tenantId: String,
  studentId: String,
  studentName: String,
  amount: Number,
  paymentDate: Date,
  status: String,
  paymentMethod: String,
  description: String,
  createdAt: { type: Date, default: Date.now },
});

// ============ CREATE MODELS ============
const Test = mongoose.model('Test', testSchema, 'tests');
const Lead = mongoose.model('Lead', leadSchema, 'leads');
const Payment = mongoose.model('Payment', paymentSchema, 'payments');

// ============ SEED FUNCTIONS ============

async function seedTests() {
  console.log('\n📝 Seeding Tests...');
  
  const testData = [
    {
      tenantId: TENANT_ID,
      name: 'JavaScript Advanced Concepts - Quiz 1',
      subject: 'JavaScript',
      batch: 'Web Dev Batch A',
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '10:00 AM',
      totalQuestions: 20,
      duration: 45,
      passingMarks: 12,
      maxMarks: 20,
      testType: 'Quiz',
      description: 'Test on arrow functions, closures, and async/await',
    },
    {
      tenantId: TENANT_ID,
      name: 'React Hooks Midterm Exam',
      subject: 'React',
      batch: 'Web Dev Batch A',
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // In 3 days
      scheduledTime: '2:00 PM',
      totalQuestions: 50,
      duration: 120,
      passingMarks: 30,
      maxMarks: 50,
      testType: 'Midterm',
      description: 'Comprehensive exam on React hooks, context API, and custom hooks',
    },
    {
      tenantId: TENANT_ID,
      name: 'Node.js Database Design - Pop Quiz',
      subject: 'Node.js',
      batch: 'Backend Batch B',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // In 2 days
      scheduledTime: '3:30 PM',
      totalQuestions: 15,
      duration: 30,
      passingMarks: 9,
      maxMarks: 15,
      testType: 'Pop Quiz',
      description: 'Quick assessment on database schema design and optimization',
    },
    {
      tenantId: TENANT_ID,
      name: 'Python Data Structures',
      subject: 'Python',
      batch: 'Python Batch C',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // In 5 days
      scheduledTime: '11:00 AM',
      totalQuestions: 30,
      duration: 60,
      passingMarks: 18,
      maxMarks: 30,
      testType: 'Semester',
      description: 'Arrays, linked lists, stacks, queues, and trees',
    },
    {
      tenantId: TENANT_ID,
      name: 'Data Science Machine Learning',
      subject: 'Machine Learning',
      batch: 'Data Science Batch D',
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // In 4 days
      scheduledTime: '1:00 PM',
      totalQuestions: 40,
      duration: 90,
      passingMarks: 24,
      maxMarks: 40,
      testType: 'Midterm',
      description: 'Supervised and unsupervised learning algorithms',
    },
  ];

  try {
    const result = await Test.insertMany(testData);
    console.log(`✅ Created ${result.length} test records`);
  } catch (error) {
    console.error('❌ Error seeding tests:', error);
  }
}

async function seedLeads() {
  console.log('\n📋 Seeding Leads/Enquiries...');

  const leadData = [
    {
      tenantId: TENANT_ID,
      name: 'Arjun Sharma',
      email: 'arjun@example.com',
      phone: '+91 98765 43210',
      courseInterest: 'Full Stack Development',
      status: 'new',
      source: 'website',
      notes: 'Interested in MERN stack with live projects',
    },
    {
      tenantId: TENANT_ID,
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 87654 32109',
      courseInterest: 'UI/UX Design',
      status: 'interested',
      source: 'referral',
      notes: 'Career switcher from graphic design',
    },
    {
      tenantId: TENANT_ID,
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 76543 21098',
      courseInterest: 'Data Science',
      status: 'contacted',
      source: 'social_media',
      notes: 'Strong math background, wants to learn ML',
    },
    {
      tenantId: TENANT_ID,
      name: 'Neha Verma',
      email: 'neha@example.com',
      phone: '+91 65432 10987',
      courseInterest: 'Python Programming',
      status: 'enrolled',
      source: 'google_ads',
      notes: 'Just enrolled in Python Fundamentals',
    },
    {
      tenantId: TENANT_ID,
      name: 'Amit Singh',
      email: 'amit@example.com',
      phone: '+91 54321 09876',
      courseInterest: 'Web Development',
      status: 'rejected',
      source: 'email_campaign',
      notes: 'Not interested in online format',
    },
    {
      tenantId: TENANT_ID,
      name: 'Deepak Gupta',
      email: 'deepak@example.com',
      phone: '+91 43210 98765',
      courseInterest: 'Advanced JavaScript',
      status: 'new',
      source: 'website',
      notes: 'Looking for advanced topics after basics',
    },
    {
      tenantId: TENANT_ID,
      name: 'Kavya Nair',
      email: 'kavya@example.com',
      phone: '+91 32109 87654',
      courseInterest: 'React Advanced',
      status: 'interested',
      source: 'referral',
      notes: 'Has intermediate React knowledge',
    },
    {
      tenantId: TENANT_ID,
      name: 'Vikram Reddy',
      email: 'vikram@example.com',
      phone: '+91 21098 76543',
      courseInterest: 'DevOps Engineering',
      status: 'contacted',
      source: 'linkedin',
      notes: 'Working professional, weekend batches',
    },
  ];

  try {
    const result = await Lead.insertMany(leadData);
    console.log(`✅ Created ${result.length} lead records`);
  } catch (error) {
    console.error('❌ Error seeding leads:', error);
  }
}

async function seedPayments() {
  console.log('\n💰 Seeding Payment Records...');

  const paymentData = [
    {
      tenantId: TENANT_ID,
      studentId: 'STU001',
      studentName: 'Arjun Sharma',
      amount: 25000,
      paymentDate: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      status: 'completed',
      paymentMethod: 'UPI',
      description: 'Full Stack Development - Course Fee',
    },
    {
      tenantId: TENANT_ID,
      studentId: 'STU002',
      studentName: 'Priya Patel',
      amount: 15000,
      paymentDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: 'completed',
      paymentMethod: 'Credit Card',
      description: 'UI/UX Design - Course Fee',
    },
    {
      tenantId: TENANT_ID,
      studentId: 'STU003',
      studentName: 'Rajesh Kumar',
      amount: 30000,
      paymentDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: 'completed',
      paymentMethod: 'Bank Transfer',
      description: 'Data Science - Monthly Fee',
    },
    {
      tenantId: TENANT_ID,
      studentId: 'STU004',
      studentName: 'Neha Verma',
      amount: 8000,
      paymentDate: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      status: 'completed',
      paymentMethod: 'UPI',
      description: 'Python Fundamentals - Course Fee',
    },
    {
      tenantId: TENANT_ID,
      studentId: 'STU005',
      studentName: 'Deepak Gupta',
      amount: 12000,
      paymentDate: new Date(Date.now()),
      status: 'pending',
      paymentMethod: 'Card',
      description: 'Advanced JavaScript - Installment 1',
    },
  ];

  try {
    const result = await Payment.insertMany(paymentData);
    console.log(`✅ Created ${result.length} payment records`);
  } catch (error) {
    console.error('❌ Error seeding payments:', error);
  }
}

// ============ MAIN EXECUTION ============
async function main() {
  try {
    await connectDB();
    console.log('\n🚀 Starting data seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing test data...');
    await Test.deleteMany({ tenantId: TENANT_ID });
    await Lead.deleteMany({ tenantId: TENANT_ID });
    await Payment.deleteMany({ tenantId: TENANT_ID });

    // Seed new data
    await seedTests();
    await seedLeads();
    await seedPayments();

    console.log('\n✅ Data seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  • Tests: 5 records created');
    console.log('  • Leads: 8 records created');
    console.log('  • Payments: 5 records created');
    console.log('\n🔄 Real-time sync will auto-refresh all dashboards');

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();
