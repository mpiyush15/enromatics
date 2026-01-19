import dotenv from 'dotenv';

dotenv.config();

// Debug: Log email configuration
console.log('📧 Email Configuration:');
console.log('- API URL:', process.env.ZEPTO_API_URL || process.env.ZEPTOMAIL_API_TOKEN ? 'SET' : 'NOT SET');
console.log('- API Token:', process.env.ZEPTO_API_TOKEN || process.env.ZEPTOMAIL_API_TOKEN ? 'SET' : 'NOT SET');
console.log('- From:', process.env.ZEPTO_FROM || process.env.EMAIL_FROM || 'NOT SET');
console.log('- Agent:', process.env.ZEPTO_AGENT || 'NOT SET');

/**
 * Send email using ZeptoMail API (works on serverless platforms)
 * Railway/Vercel block SMTP ports, so we use HTTP API instead
 */
const sendEmailViaAPI = async ({ to, subject, html, from = process.env.ZEPTO_FROM || process.env.EMAIL_FROM, attachments = [] }) => {
    try {
        console.log(`📤 Attempting to send email to: ${to}`);
        console.log(`📧 Subject: ${subject}`);
        
        // Get API token (support both variable names)
        const apiToken = process.env.ZEPTO_API_TOKEN || process.env.ZEPTOMAIL_API_TOKEN;
        const apiUrl = process.env.ZEPTO_API_URL || 'https://api.zeptomail.in/v1.1/email';
        
        if (!apiToken) {
            throw new Error('ZEPTO_API_TOKEN or ZEPTOMAIL_API_TOKEN not configured in environment variables');
        }
        
        if (!from) {
            throw new Error('ZEPTO_FROM or EMAIL_FROM not configured in environment variables');
        }

        // Prepare authorization header - add "Zoho-enczapikey" prefix if not present
        const authHeader = apiToken.startsWith('Zoho-enczapikey') 
            ? apiToken 
            : `Zoho-enczapikey ${apiToken}`;

        const payload = {
            from: {
                address: from,
                name: 'Enromatics'
            },
            to: [
                {
                    email_address: {
                        address: to,
                        name: to.split('@')[0]
                    }
                }
            ],
            subject: subject,
            htmlbody: html
        };

        // Add attachments if provided (ZeptoMail format)
        if (attachments && attachments.length > 0) {
            payload.attachments = attachments.map(att => ({
                name: att.filename,
                content: att.content.toString('base64'),
                mime_type: att.contentType || 'application/pdf'
            }));
            console.log(`📎 Attaching ${attachments.length} file(s)`);
        }

        console.log('📨 Sending to ZeptoMail API...');
        console.log('🔗 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ ZeptoMail API Error Response:', data);
            throw new Error(data.message || `API Error: ${response.status}`);
        }

        console.log('✅ Email sent successfully to:', to);
        return {
            success: true,
            messageId: data.request_id || data.message,
            message: 'Email sent successfully'
        };

    } catch (error) {
        console.error('❌ ZeptoMail API Error:', error.message);
        console.error('❌ Full error:', error);
        throw error;
    }
};

/**
 * Base email sending function (uses ZeptoMail API)
 */
export const sendEmail = async ({ to, subject, html, text, tenantId = null, userId = null, type = 'general', attachments = [] }) => {
    try {
        // Send via ZeptoMail API (works on Railway/Vercel)
        const result = await sendEmailViaAPI({
            to,
            subject,
            html,
            from: process.env.EMAIL_FROM,
            attachments
        });

        // Log email
        const emailLog = {
            tenantId,
            userId,
            recipient: to,
            subject,
            type,
            status: 'sent',
            messageId: result.messageId,
            sentAt: new Date()
        };

        // Save log to database
        try {
            const EmailLog = (await import('../models/EmailLog.js')).default;
            await EmailLog.create(emailLog);
        } catch (err) {
            console.warn('Email log not saved:', err.message);
        }

        return result;

    } catch (error) {
        console.error('❌ Email sending failed:', error);

        // Log failed email
        try {
            const EmailLog = (await import('../models/EmailLog.js')).default;
            await EmailLog.create({
                tenantId,
                userId,
                recipient: to,
                subject,
                type,
                status: 'failed',
                error: error.message,
                sentAt: new Date()
            });
        } catch (err) {
            console.warn('Failed email log not saved:', err.message);
        }

        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Send OTP Email
 */
export const sendOTPEmail = async ({ to, otp, purpose = 'verification', tenantId = null, userId = null }) => {
    const purposeText = {
        'verification': 'Email Verification',
        'login': 'Login Verification',
        'password-reset': 'Password Reset',
        'phone-verification': 'Phone Verification'
    };

    const subject = `${purposeText[purpose] || 'Verification'} - Your OTP Code`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .otp-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
                .otp-code { font-size: 32px; font-weight: bold; color: #1e40af; letter-spacing: 8px; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
                .warning { color: #dc2626; font-size: 14px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🔐 ${purposeText[purpose] || 'Verification'}</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>You have requested a verification code for your Enromatics account.</p>
                    
                    <div class="otp-box">
                        <p style="margin: 0; font-size: 14px; color: #6b7280;">Your OTP Code</p>
                        <div class="otp-code">${otp}</div>
                        <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">Valid for 10 minutes</p>
                    </div>

                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP is valid for 10 minutes only</li>
                        <li>Do not share this code with anyone</li>
                        <li>If you didn't request this, please ignore this email</li>
                    </ul>

                    <p class="warning">⚠️ Never share your OTP with anyone, including Enromatics staff.</p>
                </div>
                <div class="footer">
                    <p>This is an automated email from Enromatics. Please do not reply.</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'otp' });
};

/**
 * Send Welcome Email (New User Signup)
 */
export const sendWelcomeEmail = async ({ to, name, tenantId = null, userId = null }) => {
    const subject = 'Welcome to Enromatics! 🎉';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .features { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Welcome to Enromatics! 🎉</h1>
                </div>
                <div class="content">
                    <p>Hi ${name},</p>
                    <p>Welcome aboard! We're thrilled to have you join Enromatics - your all-in-one institute management platform.</p>
                    
                    <div class="features">
                        <h3 style="margin-top: 0;">🚀 Get Started:</h3>
                        <ul>
                            <li>📊 Manage students and staff</li>
                            <li>💰 Track fees and payments</li>
                            <li>📱 Send WhatsApp notifications</li>
                            <li>📈 Run Meta ads campaigns</li>
                            <li>🎓 Conduct scholarship exams</li>
                        </ul>
                    </div>

                    <p>Ready to transform your institute? Login to your dashboard and explore!</p>
                    
                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://enromatics.com'}/login" class="button">
                            Go to Dashboard →
                        </a>
                    </div>

                    <p>Need help? Our support team is here for you 24/7.</p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'welcome' });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async ({ to, resetLink, name, tenantId = null, userId = null }) => {
    const subject = 'Reset Your Password - Enromatics';
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
                .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🔒 Password Reset Request</h1>
                </div>
                <div class="content">
                    <p>Hi ${name},</p>
                    <p>We received a request to reset your Enromatics account password.</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetLink}" class="button">
                            Reset Password
                        </a>
                    </div>

                    <p>Or copy and paste this link in your browser:</p>
                    <p style="background: #f9fafb; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                        ${resetLink}
                    </p>

                    <div class="warning">
                        <p style="margin: 0;"><strong>⚠️ Security Notice:</strong></p>
                        <ul style="margin: 5px 0;">
                            <li>This link expires in 1 hour</li>
                            <li>If you didn't request this, please ignore this email</li>
                            <li>Your password will remain unchanged</li>
                        </ul>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated email from Enromatics. Please do not reply.</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'password-reset' });
};

/**
 * Send Tenant Registration Success Email
 */
export const sendTenantRegistrationEmail = async ({ to, tenantName, loginUrl, tenantId, userId = null }) => {
    const subject = `🎉 Your Institute "${tenantName}" is Ready!`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .info-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎉 Congratulations!</h1>
                    <p style="margin: 10px 0 0 0;">Your Institute is Now Live</p>
                </div>
                <div class="content">
                    <p>Great news!</p>
                    <p>Your institute <strong>"${tenantName}"</strong> has been successfully registered on Enromatics.</p>
                    
                    <div class="info-box">
                        <h3 style="margin-top: 0;">📋 Your Account Details:</h3>
                        <p><strong>Institute Name:</strong> ${tenantName}</p>
                        <p><strong>Status:</strong> Active ✅</p>
                        <p><strong>Dashboard Access:</strong> Ready to use</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="${loginUrl}" class="button">
                            Access Your Dashboard →
                        </a>
                    </div>

                    <h3>🚀 Next Steps:</h3>
                    <ol>
                        <li>Login to your dashboard</li>
                        <li>Complete your institute profile</li>
                        <li>Add staff members</li>
                        <li>Start adding students</li>
                        <li>Configure WhatsApp notifications</li>
                    </ol>

                    <p>Need help getting started? Check out our <a href="#">Getting Started Guide</a> or contact support.</p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'tenant-registration' });
};

/**
 * Send Student Registration Email
 */
export const sendStudentRegistrationEmail = async ({ to, studentName, instituteName, loginCredentials, tenantId, userId = null }) => {
    const subject = `Welcome to ${instituteName} - Student Portal Access`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .button { display: inline-block; padding: 12px 30px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .credentials { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎓 Welcome ${studentName}!</h1>
                    <p style="margin: 10px 0 0 0;">Student Portal Access</p>
                </div>
                <div class="content">
                    <p>Dear ${studentName},</p>
                    <p>Congratulations! You have been successfully registered as a student at <strong>${instituteName}</strong>.</p>
                    
                    <div class="credentials">
                        <h3 style="margin-top: 0;">🔐 Your Login Credentials:</h3>
                        <p><strong>Username:</strong> ${loginCredentials.username}</p>
                        <p><strong>Password:</strong> ${loginCredentials.password}</p>
                        <p><strong>Student ID:</strong> ${loginCredentials.studentId}</p>
                    </div>

                    <div style="text-align: center;">
                        <a href="${process.env.FRONTEND_URL || 'https://enromatics.com'}/login" class="button">
                            Login to Student Portal →
                        </a>
                    </div>

                    <h3>📱 What You Can Do:</h3>
                    <ul>
                        <li>View your attendance records</li>
                        <li>Check test scores and results</li>
                        <li>Track fee payments</li>
                        <li>Access study materials</li>
                        <li>View class schedule</li>
                    </ul>

                    <p style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b;">
                        <strong>⚠️ Security Tip:</strong> Please change your password after first login for security.
                    </p>
                </div>
                <div class="footer">
                    <p>If you have any questions, contact your institute at ${instituteName}</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'student-registration' });
};

/**
 * Send Payment Confirmation Email
 */
export const sendPaymentConfirmationEmail = async ({ 
    to, 
    paymentDetails, 
    tenantId, 
    userId = null 
}) => {
    const { 
        amount, 
        receiptNumber, 
        paymentMethod, 
        studentName, 
        instituteName,
        date,
        description 
    } = paymentDetails;

    const subject = `Payment Receipt #${receiptNumber} - ${instituteName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .receipt { background: #f9fafb; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .amount { font-size: 32px; font-weight: bold; color: #059669; text-align: center; margin: 20px 0; }
                .details { border-top: 1px solid #e5e7eb; padding-top: 15px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">✅ Payment Successful!</h1>
                    <p style="margin: 10px 0 0 0;">Thank you for your payment</p>
                </div>
                <div class="content">
                    <p>Dear ${studentName},</p>
                    <p>This is to confirm that we have received your payment.</p>
                    
                    <div class="amount">₹${amount.toLocaleString('en-IN')}</div>

                    <div class="receipt">
                        <h3 style="margin-top: 0; text-align: center;">📄 Payment Receipt</h3>
                        <div class="details">
                            <div class="row">
                                <span><strong>Receipt Number:</strong></span>
                                <span>${receiptNumber}</span>
                            </div>
                            <div class="row">
                                <span><strong>Date:</strong></span>
                                <span>${new Date(date).toLocaleDateString('en-IN')}</span>
                            </div>
                            <div class="row">
                                <span><strong>Payment Method:</strong></span>
                                <span>${paymentMethod.toUpperCase()}</span>
                            </div>
                            <div class="row">
                                <span><strong>Student Name:</strong></span>
                                <span>${studentName}</span>
                            </div>
                            <div class="row">
                                <span><strong>Institute:</strong></span>
                                <span>${instituteName}</span>
                            </div>
                            ${description ? `
                            <div class="row">
                                <span><strong>Description:</strong></span>
                                <span>${description}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <p style="background: #d1fae5; padding: 15px; border-radius: 5px; text-align: center;">
                        💾 <strong>Save this receipt</strong> for your records
                    </p>

                    <p style="text-align: center; margin-top: 20px;">
                        <a href="${process.env.FRONTEND_URL}/dashboard" style="color: #3b82f6; text-decoration: none;">
                            View Payment History →
                        </a>
                    </p>
                </div>
                <div class="footer">
                    <p>This is a computer-generated receipt. No signature required.</p>
                    <p>For queries, contact ${instituteName}</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'payment-confirmation' });
};

/**
 * Send Login Credentials Email (after subscription payment)
 */
export const sendCredentialsEmail = async ({ 
    to, 
    name,
    instituteName,
    email,
    password,
    loginUrl,
    instituteUrl = null,
    tenantId, 
    userId = null 
}) => {
    const subject = `Your Enromatics Login Credentials`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .credentials-box { background: #f8fafc; border: 2px dashed #3b82f6; border-radius: 8px; padding: 25px; margin: 20px 0; }
                .credential-item { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #3b82f6; }
                .warning { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 5px; padding: 15px; margin: 20px 0; }
                .cta-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🔐 Your Login Credentials</h1>
                </div>
                <div class="content">
                    <p>Hello ${name},</p>
                    <p>Welcome to <strong>Enromatics</strong>! Your account for <strong>${instituteName}</strong> has been created successfully.</p>
                    
                    <div class="credentials-box">
                        <h3 style="margin-top: 0; color: #1d4ed8;">📧 Your Login Details:</h3>
                        <div class="credential-item">
                            <strong>Email (Username):</strong><br/>
                            <code style="font-size: 16px; color: #1d4ed8;">${email}</code>
                        </div>
                        <div class="credential-item">
                            <strong>Temporary Password:</strong><br/>
                            <code style="font-size: 20px; letter-spacing: 2px; color: #dc2626; font-weight: bold;">${password}</code>
                        </div>
                    </div>

                    ${instituteUrl ? `
                    <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <h3 style="margin-top: 0; color: #10b981;">🌐 Your Institute Portal URL:</h3>
                        <p style="margin: 5px 0; font-size: 14px;">Access your exclusive institute dashboard here:</p>
                        <a href="${instituteUrl}" style="font-size: 16px; color: #10b981; font-weight: bold; word-break: break-all;">${instituteUrl}</a>
                    </div>
                    ` : ''}

                    <div class="warning">
                        ⚠️ <strong>Important:</strong> For security reasons, you will be required to change your password on your first login. Please choose a strong, unique password.
                    </div>

                    <center>
                        <a href="${loginUrl}" class="cta-button">Login to Your Dashboard →</a>
                    </center>

                    <h3>🚀 What's Next?</h3>
                    <ol>
                        <li>Click the login button above</li>
                        <li>Enter your email and temporary password</li>
                        <li>Set your new password when prompted</li>
                        <li>Start managing your institute!</li>
                    </ol>

                    <p style="background: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
                        💡 <strong>Tip:</strong> Save your login URL: <a href="${loginUrl}">${loginUrl}</a>
                    </p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    // Use 'welcome' type as it's the closest match from allowed enum values
    return sendEmail({ to, subject, html, tenantId, userId, type: 'welcome' });
};

/**
 * Send Subscription/Plan Confirmation Email
 */
export const sendSubscriptionConfirmationEmail = async ({ 
    to, 
    subscriptionDetails,
    tenantId, 
    userId = null 
}) => {
    const { planName, amount, billingCycle, startDate, endDate, instituteName } = subscriptionDetails;

    const subject = `Subscription Confirmed - ${planName} Plan`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .plan-box { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #8b5cf6; border-radius: 8px; padding: 25px; margin: 20px 0; text-align: center; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎉 Subscription Activated!</h1>
                </div>
                <div class="content">
                    <p>Congratulations!</p>
                    <p>Your subscription to Enromatics has been successfully activated.</p>
                    
                    <div class="plan-box">
                        <h2 style="margin: 0 0 10px 0; color: #6d28d9;">${planName}</h2>
                        <p style="font-size: 36px; font-weight: bold; margin: 10px 0; color: #8b5cf6;">₹${amount}</p>
                        <p style="margin: 0; color: #6b7280;">per ${billingCycle}</p>
                    </div>

                    <h3>📋 Subscription Details:</h3>
                    <ul>
                        <li><strong>Institute:</strong> ${instituteName}</li>
                        <li><strong>Plan:</strong> ${planName}</li>
                        <li><strong>Start Date:</strong> ${new Date(startDate).toLocaleDateString('en-IN')}</li>
                        <li><strong>Next Billing:</strong> ${new Date(endDate).toLocaleDateString('en-IN')}</li>
                        <li><strong>Status:</strong> <span style="color: #10b981;">Active ✅</span></li>
                    </ul>

                    <p style="background: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6;">
                        💡 <strong>Tip:</strong> You can manage your subscription anytime from your dashboard.
                    </p>
                </div>
                <div class="footer">
                    <p>Questions? Contact us at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, userId, type: 'subscription' });
};

/**
 * Send Student Enrollment Notification Email to Client/Admin
 */
export const sendEnrollmentNotificationEmail = async ({ 
    to, 
    studentName, 
    batchName, 
    studentPhone, 
    rollNumber, 
    portalUrl, 
    loginId, 
    instituteName = 'Our Institute',
    tenantId = null 
}) => {
    const subject = `New Student Enrollment: ${studentName} - ${batchName}`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .student-card { background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 2px solid #10b981; border-radius: 8px; padding: 25px; margin: 20px 0; }
                .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
                .detail-row:last-child { border-bottom: none; }
                .label { font-weight: bold; color: #6b7280; }
                .value { color: #1f2937; font-weight: 600; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
                .portal-btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">✅ New Student Enrollment</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>A new student has been successfully enrolled in your institute.</p>
                    
                    <div class="student-card">
                        <h2 style="margin: 0 0 20px 0; color: #059669; text-align: center;">📚 Enrollment Details</h2>
                        
                        <div class="detail-row">
                            <span class="label">Student Name:</span>
                            <span class="value">${studentName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Roll Number:</span>
                            <span class="value">${rollNumber}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Batch:</span>
                            <span class="value">${batchName}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Phone:</span>
                            <span class="value">${studentPhone}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Portal Access:</span>
                            <span class="value">${loginId}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Enrollment Date:</span>
                            <span class="value">${new Date().toLocaleDateString('en-IN')}</span>
                        </div>
                    </div>

                    <p style="background: #eff6ff; padding: 15px; border-radius: 5px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                        💡 <strong>Access Portal:</strong> Student has been notified via WhatsApp with login credentials and portal URL.
                    </p>

                    <p style="margin-top: 20px;">A WhatsApp notification with the following details has been sent to the student:</p>
                    <ul style="background: #f9fafb; padding: 15px 30px; border-radius: 5px; margin: 15px 0;">
                        <li>Student Name & Batch</li>
                        <li>Portal URL: ${portalUrl}</li>
                        <li>Login ID: ${loginId}</li>
                        <li>Password (auto-generated)</li>
                        <li>Google Play Store Link (when available)</li>
                    </ul>

                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        ✨ Student will now have access to course materials, assignments, and can track their progress.
                    </p>
                </div>
                <div class="footer">
                    <p>Institute: ${instituteName}</p>
                    <p>Questions? Contact us at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, type: 'enrollment' });
};

/**
 * Send enrollment welcome email to the student
 */
export const sendStudentEnrollmentEmail = async ({ 
    to, 
    studentName, 
    batchName,
    rollNumber,
    password,
    portalUrl, 
    instituteName = 'Our Institute',
    tenantId = null 
}) => {
    const subject = `Welcome to ${instituteName} - Your Account is Ready!`;
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
                .credentials-box { background: #f0f9ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .credential-item { padding: 10px 0; font-size: 14px; }
                .credential-item strong { display: block; color: #1e40af; margin-bottom: 3px; }
                .credential-value { background: white; padding: 8px 12px; border-radius: 4px; font-family: monospace; color: #1f2937; }
                .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 14px 30px; text-decoration: none; border-radius: 6px; margin-top: 15px; font-weight: bold; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
                .steps { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .step { margin: 12px 0; padding-left: 25px; position: relative; }
                .step:before { content: counter(step-counter); counter-increment: step-counter; position: absolute; left: 0; background: #3b82f6; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🎓 Welcome to ${instituteName}!</h1>
                </div>
                <div class="content">
                    <p>Hello ${studentName},</p>
                    <p>Congratulations! Your account has been successfully created at <strong>${instituteName}</strong>. You're now ready to access your courses, assignments, and track your progress.</p>
                    
                    <div class="credentials-box">
                        <h3 style="margin: 0 0 15px 0; color: #1e40af;">🔐 Your Login Credentials:</h3>
                        
                        <div class="credential-item">
                            <strong>Roll Number (Username):</strong>
                            <div class="credential-value">${rollNumber}</div>
                        </div>
                        
                        <div class="credential-item">
                            <strong>Password:</strong>
                            <div class="credential-value">${password}</div>
                        </div>
                        
                        <div class="credential-item">
                            <strong>Batch:</strong>
                            <div style="padding: 8px 12px;">${batchName}</div>
                        </div>
                    </div>

                    <h3 style="color: #1e40af; margin-top: 25px;">Getting Started:</h3>
                    <div class="steps" style="counter-reset: step-counter;">
                        <div class="step">Open the student portal and log in with your credentials above</div>
                        <div class="step">Update your profile with a profile picture (optional)</div>
                        <div class="step">Browse your courses and view assignments</div>
                        <div class="step">Submit assignments before deadlines</div>
                        <div class="step">Check your attendance and performance</div>
                    </div>

                    <p style="text-align: center;">
                        <a href="${portalUrl}" class="cta-button">Access Student Portal</a>
                    </p>

                    <p style="background: #fef3c7; padding: 15px; border-radius: 5px; border-left: 4px solid #f59e0b; margin: 20px 0; font-size: 14px;">
                        <strong>💡 Tip:</strong> You'll also receive a WhatsApp message with these details. Save it for quick reference. For security, change your password after first login.
                    </p>

                    <p style="color: #6b7280; font-size: 14px;">
                        <strong>📱 Download the App:</strong> For a better experience, download the Enromatics app from Google Play Store (available soon).
                    </p>
                </div>
                <div class="footer">
                    <p><strong>${instituteName}</strong></p>
                    <p>Need help? Contact support at support@enromatics.com</p>
                    <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({ to, subject, html, tenantId, type: 'student_enrollment' });
};

export default {
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    sendTenantRegistrationEmail,
    sendStudentRegistrationEmail,
    sendPaymentConfirmationEmail,
    sendCredentialsEmail,
    sendSubscriptionConfirmationEmail,
    sendEnrollmentNotificationEmail,
    sendStudentEnrollmentEmail
};
