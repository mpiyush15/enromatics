import mongoose from 'mongoose';
import Student from '../models/Student.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const cleanUtkarshStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    const tenantId = '0946d809'; // Utkarsh Education tenant ID

    // Delete all existing students for Utkarsh tenant
    const deletedStudents = await Student.deleteMany({ tenantId });
    console.log(`🗑️  Deleted ${deletedStudents.deletedCount} existing students for tenant ${tenantId}`);

    // Delete all mobile users for Utkarsh tenant (email contains @0946d809.mobile)
    const deletedUsers = await User.deleteMany({ 
      tenantId,
      email: { $regex: '@0946d809\.mobile$' }
    });
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} mobile users for tenant ${tenantId}`);

    console.log('✅ Cleanup completed! Users can now re-register with proper linking.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanUtkarshStudents();