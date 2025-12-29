# WhatsApp Template Sending - Debugging Guide

## 🔍 Troubleshooting Checklist for Template Sending Failure

When you try to send a template to `918087131777` and it fails, here's how to diagnose:

---

## **Step 1: Check Backend Logs**

When you try to send a template, look for these logs in your backend console:

```
📋 ========== SENDING TEMPLATE MESSAGE ==========
Template Name: [name]
Recipient Phone: [cleaned_phone]
Parameters: []
Campaign: inbox_reply
Tenant Config: { phoneNumberId: ..., wabaId: ... }

📝 Template Components: []

📤 Sending to Meta API:
{
  url: https://graph.instagram.com/v18.0/[phoneNumberId]/messages
  payload: { ... }
}
```

**If you see this**, the request was sent to Meta. Look for the next log:

- ✅ `✅ Meta API Response: { messages: [{ id: "..." }] }` → **SUCCESS**
- ❌ `🚨 ========== TEMPLATE SEND ERROR ==========` → **FAILURE** (details below)

---

## **Step 2: Common Error Codes & Fixes**

### **Error Code 131008 (Recipient Number Not Valid)**
```
"error": {
  "message": "Invalid recipient",
  "code": 131008
}
```
**Fix:**
- Phone number format must be: `918087131777` (country code + number, no `+`)
- Our code cleans it with: `recipientPhone.replace(/[\s+()-]/g, '')`
- Try: `918087131777` ✅

---

### **Error Code 131000 (Invalid Request)**
```
"error": {
  "message": "Invalid request, invalid phone number",
  "code": 131000
}
```
**Fix:**
- Verify phone number exists and is in your WhatsApp contacts
- Phone must have sent you a message first (in 24hr window) OR you must use a template
- For this test, your template should work

---

### **Error Code 131026 (Rate Limited)**
```
"error": {
  "message": "Rate limit exceeded",
  "code": 131026
}
```
**Fix:**
- Wait 1 minute and try again
- Or send to a different number

---

### **Error Code 131023 (Template Not Approved)**
```
"error": {
  "message": "Invalid template_id or template is not approved",
  "code": 131023
}
```
**Fix:**
- Template name doesn't exist or is NOT approved
- Check in Meta Business Manager → WhatsApp → Message Templates
- Template status must be `APPROVED` (not pending, rejected, or disabled)

---

### **Error Code 401 (Unauthorized - Token Invalid)**
```
"error": {
  "message": "Invalid access token",
  "code": 401
}
```
**Fix:**
- Your WhatsApp API token is expired or invalid
- Go to WhatsApp Settings in dashboard
- Regenerate the access token from Meta Business Manager
- Save new token and try again

---

### **Error Code 400 (Bad Request - Missing Config)**
```
"error": {
  "message": "Param (phone_number_id) is required",
  "code": 400
}
```
**Fix:**
- Phone Number ID not configured in your tenant
- Go to WhatsApp Settings → Configure phone number
- Get Phone Number ID from Meta Business Manager
- Save and try again

---

## **Step 3: Verify Your WhatsApp Configuration**

Go to WhatsApp Settings page and check:

1. ✅ **Phone Number ID** - Should be filled and valid
2. ✅ **Access Token** - Should be filled (we won't show the value for security)
3. ✅ **WABA ID** - Should be filled
4. ✅ **Business Name** - Should match your Meta account

If any are missing:
```
Click "Test Connection" → It will verify all settings
```

---

## **Step 4: Check Template Approval Status**

1. Open WhatsApp Settings page
2. Scroll to "Message Templates" section
3. Click "🔄 Sync Templates from Meta"
4. Wait for sync to complete
5. Look at the list of synced templates
6. Find your template and check if status is `APPROVED`

If template is not in the list:
- Go to Meta Business Manager → WhatsApp → Message Templates
- Create a new template if needed
- Wait for approval (usually instant, sometimes up to 24 hours)
- Then re-sync from dashboard

---

## **Step 5: Frontend Side - What's Being Sent?**

When you select a template in the inbox and try to send:

**Open Browser DevTools (F12) → Network tab → Filter "reply"**

You should see a POST request to:
```
POST /api/whatsapp/inbox/conversation/[conversationId]/reply
```

**Request body should be:**
```json
{
  "messageType": "template",
  "templateName": "your_template_name",
  "templateParams": [],
  "message": "Template: your_template_name"
}
```

If this doesn't match, the issue is in the **frontend code**.

---

## **Step 6: Backend Route Verification**

The backend route that receives this is:
```
POST /api/whatsapp/inbox/conversation/:conversationId/reply
```

Check the backend logs when you send:
1. Does it log the incoming request?
2. Does it call `replyToConversation()` controller?
3. Does it reach the `sendTemplateMessage()` service?

If it stops before reaching the service, the issue is in the **controller logic**.

---

## **Step 7: Full Request Trace**

To see the FULL trace, enable debug logging. Add this to your backend service:

```javascript
// In whatsappService.js - sendTemplateMessage()
console.log('🔍 FULL REQUEST PAYLOAD:');
console.log(JSON.stringify({
  messaging_product: 'whatsapp',
  to: cleanPhone,
  type: 'template',
  template: {
    name: templateName,
    language: { code: 'en' },
    components
  }
}, null, 2));
```

---

## **Test Script: Manual Template Send**

To test template sending **without the UI**, you can manually call the backend:

```bash
# Save this as test-template.sh and run it

TENANT_ID="your_tenant_id"
RECIPIENT_PHONE="918087131777"
TEMPLATE_NAME="hello_world"
AUTH_TOKEN="your_jwt_token"

curl -X POST http://localhost:5050/api/whatsapp/send-template \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"recipientPhone\": \"$RECIPIENT_PHONE\",
    \"templateName\": \"$TEMPLATE_NAME\",
    \"templateParams\": []
  }"
```

This bypasses the UI and tests the backend directly.

---

## **Quick Decision Tree**

```
Can't send template?
│
├─ No templates showing in dropdown?
│  └─ Run "Sync Templates from Meta" in settings
│
├─ Template shows but fails when clicked?
│  ├─ Check browser console (F12)
│  │  ├─ Network error? → Backend unreachable
│  │  └─ API error response? → Go to backend logs
│  │
│  └─ Check backend logs
│     ├─ No "SENDING TEMPLATE" log? → Frontend not sending properly
│     ├─ Got error response? → Meta API rejected it
│     │  ├─ Error 131023? → Template not approved
│     │  ├─ Error 131008? → Invalid phone format
│     │  └─ Error 401? → Invalid token
│     │
│     └─ Got success response? → Message saved, check inbox
│
└─ Template sent but not appearing in chat?
   ├─ Check message in database
   ├─ Check if status is "sent" or "failed"
   └─ If "sent", maybe still processing in WhatsApp
```

---

## **Things to Verify for 918087131777**

Before sending, ensure:

1. ✅ Phone number `918087131777` is a valid WhatsApp account
2. ✅ Number has sent you a message before (or use template to bypass 24hr rule)
3. ✅ Your template (`hello_world` or whatever name) is APPROVED in Meta
4. ✅ Your WhatsApp Business Account is in good standing (no billing issues)
5. ✅ Your Phone Number ID is correct in settings
6. ✅ Your Access Token is valid and not expired

---

## **Final Test Instructions**

1. **Open WhatsApp Inbox page**
2. **Click on a conversation or select a recipient**
3. **Look for the "📋 Templates" dropdown**
4. **Select any template from the list**
5. **Open browser DevTools (F12)**
6. **Watch Console tab for logs**
7. **Try sending**
8. **Check Console for:**
   - Network request sent? (Network tab)
   - Backend response? (Console + Network)
   - Error message if failed?

---

## **Report Template**

If it's still not working, gather and share:

```
1. Backend logs when you try to send
2. Browser Console error (if any)
3. Network tab response (POST request details)
4. Your WhatsApp Settings page screenshot (without token)
5. The exact error message shown to user
6. Phone number you're trying to send to
7. Template name you're trying to use
```

This will help identify the exact issue! 🚀

---

**Last Updated:** 29 December 2025
**Status:** Troubleshooting Guide
