#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

const studentSchema = new mongoose.Schema({}, { strict: false, collection: 'students' });

studentSchema.methods.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const Student = mongoose.model('Student', studentSchema);

async function resetPassword() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    const email = 'pixelsadvertise@gmail.com';
    const newPassword = 'test123';

    const student = await Student.findOne({ email });
    if (!student) {
      console.log('❌ Student not found');
      process.exit(1);
    }

    console.log('📋 Student found:', student.name);
    console.log('   Email:', student.email);
    console.log('   Tenant ID:', student.tenantId);

    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update with hashed password
    const updated = await Student.findByIdAndUpdate(
      student._id,
      { password: hashedPassword },
      { new: true }
    );

    console.log('✅ Password reset successfully!');
    console.log('   Email:', updated.email);
    console.log('   Password: test123 (hashed)');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
