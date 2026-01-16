#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/enromatics';

async function setupTestStudent() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get student model with password hashing middleware
    const studentSchema = new mongoose.Schema({}, { strict: false });
    
    // Add the password hashing hook like in the real Student model
    studentSchema.pre('save', async function (next) {
      if (!this.isModified('password')) return next();
      if (!this.password) return next();
      const bcrypt = (await import('bcryptjs')).default;
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    const Student = mongoose.model('TestStudent', studentSchema, 'students');

    const email = 'akshaymane@gmail.com';
    const newPassword = 'Test@123456';

    const student = await Student.findOne({ email });
    if (!student) {
      console.log('❌ Student not found:', email);
      process.exit(1);
    }

    student.password = newPassword;
    await student.save();

    console.log('✅ Password updated for:', email);
    console.log('📧 Email:', email);
    console.log('🔑 Password: Test@123456');
    console.log('\n✅ Ready to login!');

    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

setupTestStudent();
