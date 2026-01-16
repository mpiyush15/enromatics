const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:Secure%402024@pixels-cluster.mongodb.net/pixels_app';

async function testLogin() {
  try {
    await mongoose.connect(uri);
    const Student = require('./backend/src/models/Student.js');
    
    const student = await Student.findOne({ 
      email: { $regex: '^akshaymane@gmail.com$', $options: 'i' } 
    });
    
    if (student) {
      console.log('✅ Found student:', student.email);
      console.log('Password hash:', student.password);
      
      const testPassword = 'Test@123456';
      if (student.password) {
        const isMatch = await bcrypt.compare(testPassword, student.password);
        console.log('Password match:', isMatch);
      }
    }
    mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testLogin();
