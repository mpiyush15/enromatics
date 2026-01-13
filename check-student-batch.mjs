import mongoose from 'mongoose';

const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixels_dev';

async function checkStudents() {
  try {
    await mongoose.connect(mongoUrl);
    
    const Student = mongoose.model('Student', 
      new mongoose.Schema({}, { strict: false }), 
      'students'
    );
    
    // Get first 5 students
    const students = await Student.find().limit(5).lean();
    
    console.log('Sample students from DB:');
    students.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.name}`);
      console.log(`   - Email: ${s.email}`);
      console.log(`   - batchId: ${s.batchId || 'NOT SET'}`);
      console.log(`   - batch: ${s.batch || 'NOT SET'}`);
      console.log(`   - course: ${s.course || 'NOT SET'}`);
    });
    
    // Check how many have batchId
    const withBatchId = await Student.countDocuments({ batchId: { $exists: true, $ne: null } });
    const total = await Student.countDocuments();
    
    console.log(`\n\nStatistics:`);
    console.log(`Total students: ${total}`);
    console.log(`Students with batchId: ${withBatchId}`);
    console.log(`Students without batchId: ${total - withBatchId}`);
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkStudents();
