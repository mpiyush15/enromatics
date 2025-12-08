import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        index: true
    },

    phone: {
        type: String,
        index: true
    },

    otp: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        enum: ['verification', 'login', 'password-reset', 'phone-verification', 'email-verification', 'subscription-verification', 'signup'],
        required: true,
        index: true
    },

    tenantId: {
        type: String,
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    verified: {
        type: Boolean,
        default: false
    },

    attempts: {
        type: Number,
        default: 0
    },

    maxAttempts: {
        type: Number,
        default: 3
    },

    expiresAt: {
        type: Date,
        required: true,
        index: true
    },

    verifiedAt: {
        type: Date
    },

    ipAddress: {
        type: String
    },

    userAgent: {
        type: String
    }

}, { timestamps: true });

// Automatically delete expired OTPs after 24 hours
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

// Generate 6-digit OTP
otpSchema.statics.generateOTP = function() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Create and send OTP
otpSchema.statics.createOTP = async function({ 
    email, 
    phone = null,
    purpose, 
    tenantId = null, 
    userId = null,
    validityMinutes = 10,
    ipAddress = null,
    userAgent = null
}) {
    const otp = this.generateOTP();
    
    const otpDoc = await this.create({
        email,
        phone,
        otp,
        purpose,
        tenantId,
        userId,
        expiresAt: new Date(Date.now() + validityMinutes * 60 * 1000),
        ipAddress,
        userAgent
    });

    // Send OTP via email
    if (email) {
        const emailService = await import('../services/emailService.js');
        await emailService.sendOTPEmail({
            to: email,
            otp,
            purpose,
            tenantId,
            userId
        });
    }

    return {
        success: true,
        otpId: otpDoc._id,
        expiresAt: otpDoc.expiresAt,
        message: 'OTP sent successfully'
    };
};

// Verify OTP
otpSchema.statics.verifyOTP = async function({ 
    email, 
    otp, 
    purpose 
}) {
    const otpDoc = await this.findOne({
        email,
        otp,
        purpose,
        verified: false,
        expiresAt: { $gt: new Date() }
    });

    if (!otpDoc) {
        // Check if OTP exists but expired or wrong
        const expiredOTP = await this.findOne({ email, purpose, verified: false });
        
        if (!expiredOTP) {
            return {
                success: false,
                error: 'Invalid OTP'
            };
        }

        if (expiredOTP.expiresAt < new Date()) {
            return {
                success: false,
                error: 'OTP expired. Please request a new one.'
            };
        }

        // Increment failed attempts
        expiredOTP.attempts += 1;
        await expiredOTP.save();

        if (expiredOTP.attempts >= expiredOTP.maxAttempts) {
            return {
                success: false,
                error: 'Maximum attempts exceeded. Please request a new OTP.'
            };
        }

        return {
            success: false,
            error: 'Invalid OTP',
            attemptsLeft: expiredOTP.maxAttempts - expiredOTP.attempts
        };
    }

    // Mark as verified
    otpDoc.verified = true;
    otpDoc.verifiedAt = new Date();
    await otpDoc.save();

    return {
        success: true,
        message: 'OTP verified successfully',
        userId: otpDoc.userId,
        tenantId: otpDoc.tenantId
    };
};

// Resend OTP
otpSchema.statics.resendOTP = async function({ 
    email, 
    purpose, 
    tenantId = null, 
    userId = null 
}) {
    // Invalidate previous OTPs
    await this.updateMany(
        { email, purpose, verified: false },
        { $set: { verified: true } }
    );

    // Create new OTP
    return this.createOTP({
        email,
        purpose,
        tenantId,
        userId
    });
};

export default mongoose.model('OTP', otpSchema);
