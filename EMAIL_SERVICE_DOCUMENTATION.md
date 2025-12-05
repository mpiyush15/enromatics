# 📧 Email Service Documentation

## Overview
Complete email service integration with Zeptomail SMTP for multi-tenant SaaS architecture.

## ✅ Features Implemented

### 1. **Email Service** (`backend/src/services/emailService.js`)
- ✅ Nodemailer SMTP transport configuration
- ✅ Automatic email logging to database
- ✅ Error handling and retry logic
- ✅ HTML email templates with responsive design

### 2. **Email Templates**
All templates include beautiful HTML design with:
- Responsive layout
- Brand colors and gradients
- Mobile-friendly design
- Security warnings where applicable

**Available Templates:**
1. **OTP Email** - For verification codes
2. **Welcome Email** - New user signup
3. **Password Reset** - With secure reset link
4. **Tenant Registration** - Institute setup confirmation
5. **Student Registration** - Student portal access
6. **Payment Confirmation** - Payment receipts
7. **Subscription Confirmation** - Plan activation

### 3. **Database Models**

#### EmailLog Model
Tracks all sent emails:
```javascript
{
  tenantId: String,
  userId: ObjectId,
  recipient: String,
  subject: String,
  type: Enum,  // otp, welcome, password-reset, etc.
  status: Enum, // sent, failed, bounced, opened, clicked
  messageId: String,
  error: String,
  sentAt: Date,
  openedAt: Date,
  clickedAt: Date
}
```

#### OTP Model
Manages OTP lifecycle:
```javascript
{
  email: String,
  phone: String,
  otp: String (6-digit),
  purpose: Enum, // verification, login, password-reset, etc.
  tenantId: String,
  userId: ObjectId,
  verified: Boolean,
  attempts: Number (max 3),
  expiresAt: Date (10 minutes default),
  verifiedAt: Date
}
```

### 4. **API Endpoints** (`backend/src/routes/emailRoutes.js`)

#### Public Endpoints:
```
POST /api/email/send-otp
POST /api/email/verify-otp
POST /api/email/resend-otp
POST /api/email/send-password-reset
```

#### Protected Endpoints:
```
POST /api/email/send-welcome
GET  /api/email/logs
GET  /api/email/stats
```

#### Super Admin Only:
```
POST /api/email/test
```

## 🚀 Usage Examples

### 1. Send OTP
```javascript
POST /api/email/send-otp
{
  "email": "user@example.com",
  "purpose": "verification",
  "tenantId": "tenant123"
}
```

**Response:**
```javascript
{
  "success": true,
  "otpId": "65f...",
  "expiresAt": "2025-12-05T10:10:00.000Z",
  "message": "OTP sent successfully"
}
```

### 2. Verify OTP
```javascript
POST /api/email/verify-otp
{
  "email": "user@example.com",
  "otp": "123456",
  "purpose": "verification"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "OTP verified successfully",
  "userId": "65f...",
  "tenantId": "tenant123"
}
```

### 3. Send Welcome Email
```javascript
POST /api/email/send-welcome
Headers: { Authorization: "Bearer <token>" }
{
  "email": "newuser@example.com",
  "name": "John Doe"
}
```

### 4. Send Password Reset
```javascript
POST /api/email/send-password-reset
{
  "email": "user@example.com",
  "resetLink": "https://enromatics.com/reset-password?token=xyz",
  "name": "John Doe"
}
```

### 5. Send Payment Confirmation
```javascript
// From your payment controller
import { sendPaymentConfirmationEmail } from '../services/emailService.js';

await sendPaymentConfirmationEmail({
  to: student.email,
  paymentDetails: {
    amount: 5000,
    receiptNumber: "RCP/2512/0001",
    paymentMethod: "upi",
    studentName: "John Doe",
    instituteName: "ABC Institute",
    date: new Date(),
    description: "Monthly Fee - December 2025"
  },
  tenantId: tenant.id,
  userId: user.id
});
```

### 6. Send Student Registration Email
```javascript
// From your student registration controller
import { sendStudentRegistrationEmail } from '../services/emailService.js';

await sendStudentRegistrationEmail({
  to: student.email,
  studentName: "Jane Smith",
  instituteName: "ABC Institute",
  loginCredentials: {
    username: "jane.smith",
    password: "temp123",
    studentId: "STU001"
  },
  tenantId: tenant.id
});
```

### 7. Get Email Logs (Admin)
```javascript
GET /api/email/logs?page=1&limit=20&type=otp&status=sent
Headers: { Authorization: "Bearer <token>" }
```

### 8. Get Email Statistics (Admin)
```javascript
GET /api/email/stats
Headers: { Authorization: "Bearer <token>" }
```

**Response:**
```javascript
{
  "success": true,
  "stats": {
    "total": 1250,
    "sent": 1200,
    "failed": 50,
    "successRate": "96.00",
    "byType": {
      "otp": 450,
      "welcome": 200,
      "payment-confirmation": 350,
      "password-reset": 50,
      "student-registration": 150
    },
    "recentActivity": [
      { "_id": "2025-12-01", "count": 45 },
      { "_id": "2025-12-02", "count": 52 }
    ]
  }
}
```

## 🔧 Integration Guide

### In Auth Routes (Signup/Login)
```javascript
import { sendWelcomeEmail, sendOTPEmail } from '../services/emailService.js';
import OTP from '../models/OTP.js';

// On user signup
await sendWelcomeEmail({
  to: user.email,
  name: user.username,
  tenantId: user.tenantId,
  userId: user._id
});

// On OTP request
await OTP.createOTP({
  email: user.email,
  purpose: 'login',
  tenantId: user.tenantId,
  userId: user._id
});
```

### In Payment Routes
```javascript
import { sendPaymentConfirmationEmail } from '../services/emailService.js';

// After successful payment
await sendPaymentConfirmationEmail({
  to: student.email,
  paymentDetails: {
    amount: payment.amount,
    receiptNumber: payment.receiptNumber,
    paymentMethod: payment.method,
    studentName: student.name,
    instituteName: tenant.name,
    date: payment.date
  },
  tenantId: tenant.id,
  userId: payment.userId
});
```

### In Tenant Registration
```javascript
import { sendTenantRegistrationEmail } from '../services/emailService.js';

// After tenant creation
await sendTenantRegistrationEmail({
  to: user.email,
  tenantName: tenant.name,
  loginUrl: `${process.env.FRONTEND_URL}/login`,
  tenantId: tenant.id,
  userId: user._id
});
```

## 🎨 Email Template Customization

All email templates are in `emailService.js`. To customize:

1. Edit the HTML template in the respective function
2. Maintain responsive design with inline CSS
3. Keep the consistent color scheme:
   - Primary: `#3b82f6` (blue)
   - Success: `#10b981` (green)
   - Warning: `#f59e0b` (amber)
   - Error: `#dc2626` (red)

## 📊 Monitoring & Analytics

### Email Logs Dashboard
- View all sent emails per tenant
- Filter by type, status, date range
- Track delivery status

### Statistics
- Total emails sent/failed
- Success rate percentage
- Breakdown by email type
- Recent activity chart (last 7 days)

## 🔒 Security Features

1. **OTP Security:**
   - 6-digit random OTP
   - 10-minute expiration
   - Maximum 3 attempts
   - Automatic cleanup after 24 hours

2. **Email Logging:**
   - All emails logged to database
   - Failed attempts tracked
   - Error messages stored

3. **Multi-tenant Isolation:**
   - Tenant-specific email logs
   - Super admin sees all
   - Regular users see only their tenant data

## ⚙️ Environment Configuration

Required `.env` variables:
```env
SMTP_HOST=smtp.zeptomail.in
SMTP_PORT=587
SMTP_USER=emailapikey
SMTP_PASSWORD=your_api_key
EMAIL_FROM=noreply@enromatics.com
FRONTEND_URL=https://enromatics.com
```

## 🧪 Testing

### Test Email Service
```bash
node backend/test-email-smtp.js
```

### Send Test Email (API)
```javascript
POST /api/email/test
Headers: { Authorization: "Bearer <super-admin-token>" }
{
  "email": "test@example.com"
}
```

## 📝 TODO: Next Steps

- [ ] Add email queue system (Bull/Redis) for high volume
- [ ] Implement email templates in separate files
- [ ] Add email tracking (open/click rates)
- [ ] Add bounce handling
- [ ] Add unsubscribe functionality
- [ ] Add email scheduling
- [ ] Add bulk email sending
- [ ] Add email attachments (PDF receipts)

## 🆘 Troubleshooting

### Email not sending?
1. Check SMTP credentials in `.env`
2. Verify domain is verified in Zeptomail
3. Check email logs: `GET /api/email/logs`
4. Run test script: `node backend/test-email-smtp.js`

### OTP not working?
1. Check OTP expiration time
2. Verify email address is correct
3. Check attempt count (max 3)
4. Look at email logs for delivery status

### Email showing as failed?
1. Check recipient email is valid
2. Verify Zeptomail account status
3. Check daily sending limits
4. Review error message in email log

## 📞 Support
For issues, contact: support@enromatics.com

---
**Last Updated:** December 5, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
