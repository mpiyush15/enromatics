import express from 'express';
import OTP from '../models/OTP.js';
import EmailLog from '../models/EmailLog.js';
import Tenant from '../models/Tenant.js';
import { protect as authMiddleware, checkSuperAdmin } from '../middleware/authMiddleware.js';
import * as emailService from '../services/emailService.js';

const router = express.Router();

/**
 * @route   POST /api/email/send-otp
 * @desc    Send OTP to email
 * @access  Public
 */
router.post('/send-otp', async (req, res) => {
    try {
        const { email, purpose = 'verification', tenantId } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Create and send OTP
        const result = await OTP.createOTP({
            email,
            purpose,
            tenantId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send OTP', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/verify-otp
 * @desc    Verify OTP
 * @access  Public
 */
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, purpose = 'verification' } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const result = await OTP.verifyOTP({ email, otp, purpose });

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(400).json(result);
        }

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to verify OTP', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post('/resend-otp', async (req, res) => {
    try {
        const { email, purpose = 'verification', tenantId } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const result = await OTP.resendOTP({ email, purpose, tenantId });

        res.status(200).json(result);

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to resend OTP', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/check-email
 * @desc    Check if email is already registered as a tenant
 * @access  Public
 */
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Check if tenant exists with this email
        const tenant = await Tenant.findOne({ email: email.toLowerCase() });

        res.status(200).json({
            exists: !!tenant,
            instituteName: tenant?.instituteName || null
        });

    } catch (error) {
        console.error('Check email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to check email', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/send-welcome
 * @desc    Send welcome email (protected route)
 * @access  Private
 */
router.post('/send-welcome', authMiddleware, async (req, res) => {
    try {
        const { email, name } = req.body;
        const tenantId = req.user?.tenantId;
        const userId = req.user?._id;

        if (!email || !name) {
            return res.status(400).json({ message: 'Email and name are required' });
        }

        const result = await emailService.sendWelcomeEmail({
            to: email,
            name,
            tenantId,
            userId
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Send welcome email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send welcome email', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/send-password-reset
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/send-password-reset', async (req, res) => {
    try {
        const { email, resetLink, name } = req.body;

        if (!email || !resetLink) {
            return res.status(400).json({ message: 'Email and reset link are required' });
        }

        const result = await emailService.sendPasswordResetEmail({
            to: email,
            resetLink,
            name: name || 'User'
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Send password reset email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send password reset email', 
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/email/logs
 * @desc    Get email logs (tenant-specific or all for super admin)
 * @access  Private
 */
router.get('/logs', authMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, startDate, endDate } = req.query;
        const tenantId = req.user?.tenantId;
        const isSuperAdmin = req.user?.role === 'superadmin';

        // Build query
        const query = {};

        // Super admin can see all, others only their tenant
        if (!isSuperAdmin && tenantId) {
            query.tenantId = tenantId;
        }

        if (type) query.type = type;
        if (status) query.status = status;
        if (startDate || endDate) {
            query.sentAt = {};
            if (startDate) query.sentAt.$gte = new Date(startDate);
            if (endDate) query.sentAt.$lte = new Date(endDate);
        }

        const logs = await EmailLog.find(query)
            .sort({ sentAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .populate('userId', 'email username')
            .lean();

        const total = await EmailLog.countDocuments(query);

        res.status(200).json({
            success: true,
            logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('Get email logs error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get email logs', 
            error: error.message 
        });
    }
});

/**
 * @route   GET /api/email/stats
 * @desc    Get email statistics
 * @access  Private
 */
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const tenantId = req.user?.tenantId;
        const isSuperAdmin = req.user?.role === 'superadmin';

        const query = {};
        if (!isSuperAdmin && tenantId) {
            query.tenantId = tenantId;
        }

        // Get stats
        const totalSent = await EmailLog.countDocuments({ ...query, status: 'sent' });
        const totalFailed = await EmailLog.countDocuments({ ...query, status: 'failed' });
        const total = totalSent + totalFailed;

        // Get stats by type
        const byType = await EmailLog.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = await EmailLog.aggregate([
            {
                $match: {
                    ...query,
                    sentAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$sentAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total,
                sent: totalSent,
                failed: totalFailed,
                successRate: total > 0 ? ((totalSent / total) * 100).toFixed(2) : 0,
                byType: byType.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                recentActivity
            }
        });

    } catch (error) {
        console.error('Get email stats error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to get email statistics', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/test
 * @desc    Send test email (super admin only)
 * @access  Private (Super Admin)
 */
router.post('/test', authMiddleware, checkSuperAdmin, async (req, res) => {
    try {
        const { email, type = 'test' } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const result = await emailService.sendEmail({
            to: email,
            subject: 'Test Email from Enromatics',
            html: `
                <h1>Test Email</h1>
                <p>This is a test email from Enromatics email service.</p>
                <p>Time: ${new Date().toLocaleString()}</p>
                <p>Status: Email service is working correctly! ✅</p>
            `,
            type
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Send test email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send test email', 
            error: error.message 
        });
    }
});

/**
 * @route   POST /api/email/send-plan-details
 * @desc    Send personalized plan details to user email
 * @access  Public
 */
router.post('/send-plan-details', async (req, res) => {
    try {
        const { email, name, coachingName, plan, questionnaire } = req.body;

        if (!email || !name || !plan) {
            return res.status(400).json({ message: 'Email, name, and plan are required' });
        }

        // Plan details
        const planDetails = {
            starter: {
                price: '₹999',
                description: 'Perfect for small to medium coaching institutes',
                features: [
                    'Up to 50 students',
                    'Fee tracking & reminders',
                    'Attendance management',
                    'WhatsApp notifications',
                    'Student performance tracking',
                    'Email support'
                ]
            },
            pro: {
                price: '₹1,999',
                description: 'For growing institutes with advanced needs',
                features: [
                    'Up to 500+ students',
                    'Everything in Starter',
                    'Online tests & exams',
                    'Advanced analytics',
                    'Unlimited staff access',
                    'Priority support',
                    'Custom integrations'
                ]
            }
        };

        const selectedPlan = planDetails[plan] || planDetails.starter;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .plan-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                    .features { list-style: none; padding: 0; }
                    .features li { padding: 10px 0; border-bottom: 1px solid #eee; }
                    .features li:before { content: "✓ "; color: #28a745; font-weight: bold; margin-right: 10px; }
                    .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
                    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Your Personalized Plan</h1>
                        <p>Based on your institute's needs</p>
                    </div>
                    <div class="content">
                        <p>Hi ${name},</p>
                        <p>Thank you for sharing details about <strong>${coachingName}</strong>! 🎉</p>
                        
                        <p>Based on your questionnaire responses, we recommend:</p>
                        
                        <div class="plan-box">
                            <h2>${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan</h2>
                            <p><strong>${selectedPlan.price}/month</strong></p>
                            <p>${selectedPlan.description}</p>
                            
                            <h3>Features Included:</h3>
                            <ul class="features">
                                ${selectedPlan.features.map(feature => `<li>${feature}</li>`).join('')}
                            </ul>
                        </div>

                        <p><strong>Your Institute Profile:</strong></p>
                        <ul>
                            <li>Student Count: ${questionnaire.students}</li>
                            <li>Coaching Type: ${questionnaire.coachingType}</li>
                            <li>Current Management: ${questionnaire.currentManagement}</li>
                        </ul>

                        <p>This plan will help you save 15-20 hours every week and automate your entire institute operations! 📊</p>

                        <center>
                            <a href="https://enromatics.com/home?plan=${plan}" class="cta-button">Start Your Free Trial</a>
                        </center>

                        <p>Have questions? Our team is here to help!</p>
                        
                        <div class="footer">
                            <p>© 2025 Enromatics. All rights reserved.</p>
                            <p>This email was sent to you because you filled our questionnaire on our website.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const result = await emailService.sendEmail({
            to: email,
            subject: `Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${coachingName}`,
            html: htmlContent,
            type: 'plan_details'
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Send plan details email error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Failed to send plan details email', 
            error: error.message 
        });
    }
});

export default router;
