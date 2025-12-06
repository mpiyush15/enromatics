# 🔧 Railway Email Configuration Checklist

## Current Issue
Demo requests are submitted successfully but **NO emails are being sent** to recipients or super admin.

## Root Cause Analysis
Most likely: **Missing or incorrect environment variables on Railway**

---

## ✅ Step-by-Step Fix Guide

### 1️⃣ Check Railway Backend Logs

**How to check:**
1. Go to Railway Dashboard → Your Backend Service
2. Click on "Deployments" tab
3. Click on the latest deployment
4. Check logs for these messages:

**What to look for:**

```bash
# At startup, you should see:
📧 Email Configuration:
- API Token: SET (or NOT SET)
- From: no-reply@enromatics.com (or NOT SET)

# When demo is submitted, you should see:
📤 Attempting to send email to: user@example.com
📧 Subject: Demo Request Received - Enromatics
📨 Sending to ZeptoMail API...
✅ Email sent successfully to: user@example.com
```

**If you see errors like:**
- `❌ ZEPTOMAIL_API_TOKEN not configured` → Go to Step 2
- `❌ ZeptoMail API Error: 401` → Invalid API token (Step 2)
- `❌ ZeptoMail API Error: 403` → Domain not verified (Step 3)

---

### 2️⃣ Update Railway Environment Variables

**Go to:** Railway Dashboard → Backend Service → Variables Tab

**Required Variables:**

```bash
# Email Service (CRITICAL)
ZEPTOMAIL_API_TOKEN=Zoho-enczapikey PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==

EMAIL_FROM=no-reply@enromatics.com

SUPER_ADMIN_EMAIL=mpiyush2727@gmail.com
```

**⚠️ IMPORTANT:** 
- The token format MUST be: `Zoho-enczapikey YOUR_ACTUAL_KEY`
- Don't add quotes around the value
- Make sure there are no extra spaces

**Remove these OLD variables (if present):**
```bash
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
```

---

### 3️⃣ Verify ZeptoMail Domain

**Check if domain is verified:**
1. Go to https://www.zoho.com/zeptomail/
2. Login to your account
3. Go to "Mail Agents" → "Sending Domains"
4. Check if `enromatics.com` is verified ✅

**If NOT verified:**
- Add DNS records provided by ZeptoMail
- Wait for verification (can take 24-48 hours)
- Use a verified domain in the meantime

---

### 4️⃣ Test the Email Service

After updating Railway variables, test with this curl command:

```bash
curl -X POST https://api.zeptomail.in/v1.1/email \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Zoho-enczapikey PHtE6r0FR7+52jV+9EVUsPG/FZOsYdh7+Lk0f1ZE5oxKD6BVGk1Xr9kqlGOwoh4sAfQXRvCbmt9r4O/O4bqFc2e7MWpJCmqyqK3sx/VYSPOZsbq6x00asV8dcUfYUYbsetJo0Czfu9fZNA==" \
  -d '{
    "from": {
      "address": "no-reply@enromatics.com",
      "name": "Enromatics Test"
    },
    "to": [
      {
        "email_address": {
          "address": "mpiyush2727@gmail.com",
          "name": "Test"
        }
      }
    ],
    "subject": "Test Email",
    "htmlbody": "<h1>Test successful!</h1>"
  }'
```

**Expected response:**
```json
{
  "request_id": "some-id",
  "message": "OK"
}
```

---

### 5️⃣ Monitor Railway Deployment

After updating variables:
1. Railway will automatically redeploy
2. Wait 1-2 minutes for deployment to complete
3. Check logs again for "Email Configuration" message
4. Test by submitting a demo request on your website

---

## 🔍 Common Issues & Solutions

### Issue 1: "API Token: NOT SET"
**Solution:** Add `ZEPTOMAIL_API_TOKEN` to Railway variables

### Issue 2: "401 Unauthorized"
**Cause:** Invalid or expired API token
**Solution:** Generate new token from ZeptoMail dashboard

### Issue 3: "403 Forbidden"
**Cause:** Domain not verified or sender email mismatch
**Solution:** 
- Verify domain in ZeptoMail
- Ensure `EMAIL_FROM` matches verified domain

### Issue 4: "Network Error / Fetch Failed"
**Cause:** Railway network issue (rare)
**Solution:** Wait a few minutes and try again

### Issue 5: Emails sent but not received
**Cause:** Emails in spam folder
**Solution:** 
- Check spam/junk folder
- Add `no-reply@enromatics.com` to contacts
- Check ZeptoMail dashboard for delivery status

---

## 📊 Expected Log Flow (When Working)

```bash
# Server Startup
📧 Email Configuration:
- API Token: SET
- From: no-reply@enromatics.com

# Demo Request Submitted
✅ Demo request created: 6932dee3fd52c14c57baf3d1
📤 Attempting to send email to: user@example.com
📧 Subject: Demo Request Received - Enromatics
📨 Sending to ZeptoMail API...
✅ Email sent successfully to: user@example.com

📤 Attempting to send email to: mpiyush2727@gmail.com
📧 Subject: 🎯 New Demo Request: Company Name
📨 Sending to ZeptoMail API...
✅ Email sent successfully to: mpiyush2727@gmail.com
```

---

## 🎯 Quick Test Checklist

After Railway deployment completes:

- [ ] Check Railway logs show "API Token: SET"
- [ ] Check Railway logs show "From: no-reply@enromatics.com"
- [ ] Submit a demo request on website
- [ ] Check Railway logs for "Email sent successfully"
- [ ] Check recipient inbox (and spam folder)
- [ ] Check super admin inbox: mpiyush2727@gmail.com

---

## 📞 Still Not Working?

If emails still don't work after following all steps:

1. **Share Railway logs** with the exact error message
2. **Verify API token** is correctly copied (no extra characters)
3. **Test API directly** using the curl command above
4. **Check ZeptoMail dashboard** for sending limits or account status
5. **Temporarily use a different email service** (e.g., Resend, SendGrid) to isolate the issue

---

## 🔐 Security Note

Remember: **NEVER commit `.env` file to git**. Always use Railway's Variables tab for production credentials.

---

Last Updated: December 5, 2025
