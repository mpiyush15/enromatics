# WhatsApp Message Delivery Troubleshooting Guide

## Current Situation
Messages show as "Sent" but not "Delivered" - this typically indicates an issue with Meta's WhatsApp Business API or webhook configuration.

## Your Code Status: ✅ CORRECT

Your implementation is proper:
- Messages are correctly sent via Meta API
- Webhook endpoint is configured: `/api/whatsapp/webhook`
- Status update handler is working correctly
- Database tracking is in place

## Possible Issues & Solutions

### 1. ⚠️ Webhook Not Configured in Meta Business Manager

**Most Common Issue** - Meta is not sending delivery updates to your webhook.

**How to Fix:**
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your WhatsApp Business App
3. Go to **Configuration** → **Webhooks**
4. Add your webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
5. Verify Token: `pixels_webhook_secret_2025` (matches your `META_VERIFY_TOKEN` in env)
6. Subscribe to these webhook fields:
   - `messages` ✓
   - `message_status` ✓ (CRITICAL for delivery updates)
   - `messaging_handovers` ✓

**Verify Webhook:**
```bash
# Test webhook verification
curl "https://yourdomain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=pixels_webhook_secret_2025&hub.challenge=test123"
# Should return: test123
```

### 2. 📱 Recipient Phone Number Issues

**Check if the issue is:**
- ✓ Phone numbers are in international format (e.g., 919876543210, no + sign)
- ✗ Phone number not on WhatsApp
- ✗ Phone number blocked your business account
- ✗ Recipient has uninstalled WhatsApp
- ✗ Recipient's phone is off or has no internet

**Test with your own number:**
```javascript
// Use the test endpoint with your WhatsApp number
POST /api/whatsapp/test-connection
{
  "phoneNumberId": "your_phone_number_id",
  "accessToken": "your_token",
  "testPhone": "919876543210" // Your own number
}
```

### 3. 🔑 WhatsApp Business Account Status

**Check Account Health:**
1. Go to [Meta Business Suite](https://business.facebook.com/)
2. Open your WhatsApp Business Account
3. Check for:
   - ⚠️ Quality Rating: Should be **Green/Medium** (not Red)
   - ⚠️ Message Limits: Check if you've hit daily limits
   - ⚠️ Account Status: Should be **Active** (not Restricted/Disabled)

**Common Restrictions:**
- Sending too many messages to users who haven't replied
- High block rate from recipients
- Template violations
- Spam complaints

### 4. 📊 Message Template Requirements

**For Template Messages:**
- Template must be **APPROVED** by Meta
- Template must match exactly (no modifications)
- Variables must be properly filled

**Check Template Status:**
```bash
# Sync templates from Meta
POST /api/whatsapp/templates/sync
```

### 5. 🔍 Debug Your Current Setup

**Step 1: Check Meta API Connection**
```bash
GET /api/whatsapp/debug-api
```
This will verify your credentials are working with Meta.

**Step 2: Check Message Database**
```bash
GET /api/whatsapp/debug-messages
```
Review recent messages and their status updates.

**Step 3: Check Recent Messages**
```bash
GET /api/whatsapp/messages?limit=20
```
Look for:
- `status`: Should progress from `sent` → `delivered` → `read`
- `statusUpdates[]`: Should have multiple entries
- `errorMessage`: Any error details

### 6. 🌐 24-Hour Window Limitation

**WhatsApp Rule:** You can only send messages to users within 24 hours of their last message to you, unless using approved templates.

**Check:**
- Are you sending to new contacts who never messaged you? → Use **Approved Templates**
- Are you sending after 24 hours? → Use **Approved Templates**
- Freeform text messages only work within 24-hour window

### 7. 🔒 Access Token Issues

**Symptoms:**
- Messages send successfully
- But webhook doesn't receive updates

**Fix:**
1. Ensure your access token has these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
2. Generate a **System User Token** (not temporary token)
3. Token should never expire

**Regenerate Token:**
Go to [Meta Developers](https://developers.facebook.com/) → Your App → System Users → Generate New Token

## Immediate Action Plan

### Step 1: Verify Webhook (MOST IMPORTANT)
```bash
# Check if Meta can reach your webhook
1. Open Meta Business Manager
2. WhatsApp Business Account → Configuration → Webhooks
3. Click "Test" button next to your webhook
4. You should see a test event arrive in your logs
```

### Step 2: Check Server Logs
Look for webhook calls in your backend logs:
```bash
cd backend
npm run dev

# Watch for incoming webhook POST requests:
# "Webhook handler" logs should appear when messages are delivered
```

### Step 3: Test with Debug Endpoints

**A. Check Meta API:**
```bash
curl -X GET https://yourdomain.com/api/whatsapp/debug-api \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**B. Check Messages:**
```bash
curl -X GET https://yourdomain.com/api/whatsapp/debug-messages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**C. Send Test Message:**
```bash
curl -X POST https://yourdomain.com/api/whatsapp/send \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientPhone": "919876543210",
    "message": "Test message",
    "tenantId": "your_tenant_id"
  }'
```

### Step 4: Check Webhook Logs in Meta

1. Meta Business Manager → WhatsApp → Configuration → Webhooks
2. Click on your webhook URL
3. Check **Recent Deliveries** section
4. Look for:
   - ✅ 200 OK responses → Webhook working
   - ❌ 4xx/5xx errors → Webhook failing
   - ⚠️ No requests → Webhook not called (configuration issue)

## Expected Behavior

**Normal Flow:**
1. You call `/api/whatsapp/send` → Message sent to Meta → Status: `sent` ✓
2. Meta sends to recipient → Meta calls your webhook → Status: `delivered` ✓
3. Recipient opens message → Meta calls your webhook → Status: `read` ✓

**Your Database Records:**
```javascript
{
  status: "read",
  sentAt: "2025-11-18T10:00:00Z",
  deliveredAt: "2025-11-18T10:00:05Z",
  readAt: "2025-11-18T10:05:30Z",
  statusUpdates: [
    { status: "sent", timestamp: "2025-11-18T10:00:00Z" },
    { status: "delivered", timestamp: "2025-11-18T10:00:05Z" },
    { status: "read", timestamp: "2025-11-18T10:05:30Z" }
  ]
}
```

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `131026` | Message undeliverable | Phone number invalid or not on WhatsApp |
| `131047` | Re-engagement message | User hasn't replied in 24hrs, need template |
| `131051` | Unsupported message type | Check message format |
| `133016` | Messaging limit reached | Wait or request limit increase |
| `131056` | Account restricted | Review quality issues |

## Contact Meta Support

If webhook is configured correctly but still no delivery updates:

1. **WhatsApp Business API Support:**
   - https://business.facebook.com/direct-support
   - Select: WhatsApp Business Platform → Technical Issue

2. **Provide These Details:**
   - WABA ID: Your WhatsApp Business Account ID
   - Phone Number ID: Your sending phone number ID
   - Sample Message ID: A specific message not delivered
   - Timestamp: When the issue occurred

## Environment Variables Checklist

Ensure these are set in your `.env`:

```env
# WhatsApp Cloud API
WHATSAPP_PHONE_NUMBER_ID=835322316337446
WHATSAPP_BUSINESS_ACCOUNT_ID=2103078623833174
WHATSAPP_ACCESS_TOKEN=your-permanent-system-user-token

# Webhook Verification
META_VERIFY_TOKEN=pixels_webhook_secret_2025

# Your domain (for webhook URL)
FRONTEND_URL=https://yourdomain.com
```

## Summary

**99% of the time, "sent but not delivered" means:**
1. 🚨 **Webhook not configured in Meta** (check this first!)
2. Phone number issues (not on WhatsApp, blocked, offline)
3. Account quality/limits
4. 24-hour window expired (need approved template)

**Your code is correct** - the issue is on Meta's side or configuration.

Run the debug endpoints and check Meta Business Manager webhooks section to identify the exact issue.
