import User from '../models/User.js';
import Student from '../models/Student.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mobile user registration
const registerMobileUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      tenantId,
      dateOfBirth,
      fatherName,
      motherName,
      address,
      school,
      currentClass,
      course, // Allow course to be provided directly
      batch,  // Allow batch to be provided directly
      registrationSource = 'mobile_app'
    } = req.body;

    // Validate required fields
    if (!name || !password || !phone || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, password, and tenant ID are required'
      });
    }

    // Check if user already exists (by phone or email)
    const existingUser = await User.findOne({
      $or: [
        { email },
        { email: `${phone}@${tenantId}.mobile` }
      ],
      tenantId
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this phone number or email'
      });
    }

    // Create user account
    const userData = {
      name,
      email: email || `${phone}@${tenantId}.mobile`,
      password,
      tenantId,
      role: 'student',
      status: 'active',
      plan: 'free',
      subscriptionStatus: 'active'
    };

    const user = await User.create(userData);

    // Determine course and batch based on tenant and provided data
    let defaultCourse = course || currentClass || 'General Studies';
    let defaultBatch = batch || 'Mobile Registration';
    
    // Tenant-specific defaults for better user experience
    if (tenantId === 'utkarsh_education_2024') {
      defaultCourse = course || currentClass || 'JEE/NEET Foundation';
      defaultBatch = batch || 'Foundation Batch 2024';
    } else if (tenantId === 'enromatics_main_portal') {
      defaultCourse = course || currentClass || 'Competitive Exam Prep';
      defaultBatch = batch || 'Regular Batch';
    }

    // Create corresponding student record for scholarship eligibility
    const studentData = {
      name,
      email: user.email,
      phone,
      course: defaultCourse,
      batch: defaultBatch,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      fatherName,
      motherName,
      address,
      school,
      currentClass,
      tenantId,
      userId: user._id,
      status: 'active',
      registrationSource,
      admissionDate: new Date()
    };

    const student = await Student.create(studentData);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        tenantId: user.tenantId,
        role: user.role,
        studentId: student._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare user response (remove sensitive data)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
      studentId: student._id,
      phone,
      registrationSource
    };

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Mobile registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Mobile user login
const loginMobileUser = async (req, res) => {
  try {
    const { email, password, tenantId } = req.body;

    if (!email || !password || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and tenant ID are required'
      });
    }

    // Find user by email and tenantId
    const user = await User.findOne({ 
      email, 
      tenantId,
      role: 'student',
      status: 'active'
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Find corresponding student record
    const student = await Student.findOne({ 
      userId: user._id, 
      tenantId 
    });

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        tenantId: user.tenantId,
        role: user.role,
        studentId: student?._id
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Prepare user response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
      studentId: student?._id,
      phone: student?.phone,
      registrationSource: student?.registrationSource || 'mobile_app'
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get mobile user profile
const getMobileUserProfile = async (req, res) => {
  try {
    const { userId, tenantId } = req.user;

    const user = await User.findOne({ 
      _id: userId, 
      tenantId 
    }).select('-password');

    const student = await Student.findOne({ 
      userId, 
      tenantId 
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userProfile = {
      ...user.toObject(),
      studentDetails: student?.toObject() || null
    };

    res.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

// Update mobile user profile
const updateMobileUserProfile = async (req, res) => {
  try {
    const { userId, tenantId } = req.user;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email;
    delete updateData.tenantId;
    delete updateData.role;

    const user = await User.findOneAndUpdate(
      { _id: userId, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update corresponding student record if exists
    if (updateData.phone || updateData.dateOfBirth || updateData.fatherName || 
        updateData.motherName || updateData.address || updateData.school || 
        updateData.currentClass) {
      
      const studentUpdateData = {};
      if (updateData.phone) studentUpdateData.phone = updateData.phone;
      if (updateData.dateOfBirth) studentUpdateData.dateOfBirth = updateData.dateOfBirth;
      if (updateData.fatherName) studentUpdateData.fatherName = updateData.fatherName;
      if (updateData.motherName) studentUpdateData.motherName = updateData.motherName;
      if (updateData.address) studentUpdateData.address = updateData.address;
      if (updateData.school) studentUpdateData.school = updateData.school;
      if (updateData.currentClass) studentUpdateData.currentClass = updateData.currentClass;

      await Student.findOneAndUpdate(
        { userId, tenantId },
        { $set: studentUpdateData },
        { new: true, runValidators: true }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

export {
  registerMobileUser,
  loginMobileUser,
  getMobileUserProfile,
  updateMobileUserProfile
};