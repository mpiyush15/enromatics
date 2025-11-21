import mongoose from 'mongoose';
import ScholarshipExam from './src/models/ScholarshipExam.js';
import sampleUtkarshExams from './utkarsh-scholarship-seed.js';

const seedUtkarshScholarships = async () => {
  try {
    console.log('🌱 Seeding Utkarsh Education scholarship exams...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Check if exams already exist for this tenant
    const existingExams = await ScholarshipExam.find({ 
      tenantId: 'utkarsh_education_2024' 
    });

    console.log(`📊 Found ${existingExams.length} existing exams for Utkarsh Education`);

    // Remove existing exams to avoid duplicates
    if (existingExams.length > 0) {
      await ScholarshipExam.deleteMany({ tenantId: 'utkarsh_education_2024' });
      console.log('🗑️  Removed existing exams');
    }

    // Insert new exams
    const insertedExams = await ScholarshipExam.insertMany(sampleUtkarshExams);
    console.log(`✅ Successfully inserted ${insertedExams.length} scholarship exams for Utkarsh Education`);

    // List the created exams
    console.log('\n📋 Created Scholarship Exams:');
    insertedExams.forEach((exam, index) => {
      console.log(`${index + 1}. ${exam.examName} (${exam.examCode})`);
      console.log(`   📅 Exam Date: ${exam.examDate.toDateString()}`);
      console.log(`   🎓 Category: ${exam.category}`);
      console.log(`   💰 Scholarships: ${exam.scholarshipDetails.totalScholarships}`);
      console.log('');
    });

    console.log('🎉 Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding scholarship exams:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

// Run the seeding function
seedUtkarshScholarships();