const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

(async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
    
    const Student = require('./src/models/Student.js').default;
    
    const student = await Student.findOne({ 
      email: { $regex: '^pixelsadvertise@gmail.com$', $options: 'i' } 
    });
    
    if (student) {
      console.log('\n✅ FOUND STUDENT');
      console.log('📧 Email:', student.email);
      console.log('👤 Name:', student.name);
      console.log('🔑 Password Hash:', student.password);
      console.log('📏 Hash Length:', student.password ? student.password.length : 0);
      
      if (student.password) {
        const testPass = 'jpr2mope';
        const match = await bcrypt.compare(testPass, student.password);
        console.log('\n🔐 Testing password "jpr2mope":');
        console.log(match ? '✅ MATCHES - Password is correct!' : '❌ DOES NOT MATCH');
      }
    } else {
      console.log('❌ Student NOT FOUND');
    }
    
    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
})();
