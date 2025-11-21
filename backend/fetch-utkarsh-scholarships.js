import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ScholarshipExam from './src/models/ScholarshipExam.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
    console.log('📦 Using database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fetch all scholarship exams for Utkarsh Education tenant
const fetchUtkarshScholarships = async () => {
  try {
    await connectDB();
    
    const utkarshTenantId = '0946d809';
    console.log(`🔍 Fetching scholarship exams for tenant: ${utkarshTenantId}`);
    
    const scholarships = await ScholarshipExam.find({ 
      tenantId: utkarshTenantId 
    })
    .sort({ createdAt: -1 })
    .lean();
    
    console.log(`📚 Found ${scholarships.length} scholarship exams:`);
    
    scholarships.forEach((exam, index) => {
      console.log(`\n${index + 1}. ${exam.examName} (${exam.examCode})`);
      console.log(`   Status: ${exam.status}`);
      console.log(`   Public: ${exam.isPublic}`);
      console.log(`   Registration: ${new Date(exam.registrationStartDate).toLocaleDateString()} - ${new Date(exam.registrationEndDate).toLocaleDateString()}`);
      console.log(`   Exam Date: ${new Date(exam.examDate).toLocaleDateString()}`);
      console.log(`   Description: ${exam.description || 'No description'}`);
      console.log(`   Goal: ${exam.goal || 'Not specified'}`);
      console.log(`   Total Marks: ${exam.totalMarks}`);
      console.log(`   Fee: ₹${exam.registrationFee?.amount || 0} (Required: ${exam.registrationFee?.paymentRequired || false})`);
      console.log(`   Stats: ${exam.stats?.totalRegistrations || 0} registrations`);
    });
    
    // Show which exams are currently available for mobile (active, public, registration open)
    const now = new Date();
    const availableExams = scholarships.filter(exam => 
      exam.status === 'active' && 
      exam.isPublic === true && 
      new Date(exam.registrationEndDate) >= now
    );
    
    console.log(`\n📱 Currently available for mobile app: ${availableExams.length} exams`);
    availableExams.forEach(exam => {
      console.log(`   ✅ ${exam.examName} (${exam.examCode}) - Open until ${new Date(exam.registrationEndDate).toLocaleDateString()}`);
    });
    
    if (availableExams.length === 0) {
      console.log('\n⚠️  No scholarship exams are currently available for mobile registration!');
      console.log('   Reasons could be:');
      console.log('   - No exams with status "active"');
      console.log('   - No exams marked as public (isPublic: true)');
      console.log('   - All exams have registration periods that are closed');
      
      // Show what needs to be fixed
      const draftExams = scholarships.filter(exam => exam.status === 'draft');
      const privateExams = scholarships.filter(exam => exam.isPublic === false);
      const closedExams = scholarships.filter(exam => new Date(exam.registrationEndDate) < now);
      
      if (draftExams.length > 0) {
        console.log(`\n📝 ${draftExams.length} exams in draft status (need to be activated):`);
        draftExams.forEach(exam => console.log(`   - ${exam.examName} (${exam.examCode})`));
      }
      
      if (privateExams.length > 0) {
        console.log(`\n🔒 ${privateExams.length} exams marked as private (need isPublic: true):`);
        privateExams.forEach(exam => console.log(`   - ${exam.examName} (${exam.examCode})`));
      }
      
      if (closedExams.length > 0) {
        console.log(`\n⏰ ${closedExams.length} exams with closed registration:`);
        closedExams.forEach(exam => console.log(`   - ${exam.examName} (${exam.examCode}) - closed on ${new Date(exam.registrationEndDate).toLocaleDateString()}`));
      }
    }
    
    // Return the available exams for API response
    return {
      total: scholarships.length,
      available: availableExams.length,
      exams: scholarships,
      availableExams: availableExams
    };
    
  } catch (error) {
    console.error('❌ Error fetching scholarships:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n📴 MongoDB disconnected');
  }
};

// Run the script
fetchUtkarshScholarships()
  .then(result => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });