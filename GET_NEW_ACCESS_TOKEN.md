# 🔑 How to Get a New WhatsApp Access Token

## ⚠️ Your Current Issue:
```
Error: "The session is invalid because the user logged out"
Code: 190 (OAuthException)
```

Your WhatsApp access token has **expired** or is **invalid**. You need to generate a new one.

---

## 🎯 Two Options for Access Tokens

### **Option 1: Temporary Token (24 hours) - Quick Test**
✅ Fast and easy
❌ Expires in 24 hours
💡 Good for testing only

### **Option 2: Permanent Token (Never expires) - Production**
✅ Never expires
✅ Production ready
❌ Requires System User setup
💡 Recommended for live client accounts

---

## 📱 Option 1: Get Temporary Token (24 hours)

### Steps:
1. Go to **Meta Developers Console**
   - URL: https://developers.facebook.com/apps/

2. Select your WhatsApp app:
   - App ID: `1184650313547957`

3. In left sidebar, click **WhatsApp → API Setup**

4. Scroll to **"Temporary access token"** section

5. Click **"Generate Token"** button

6. Copy the token (starts with `EAAQ...`)

7. Update your `.env` file:
   ```env
   WHATSAPP_ACCESS_TOKEN=EAAQ1buUfQLU... (paste new token here)
   ```

8. Restart backend server:
   ```bash
   cd backend && npm run dev
   ```

9. Go to WhatsApp → Settings in dashboard and **Save Configuration** again

10. Test by sending a message

### ⚠️ Important:
- Token expires in **24 hours**
- You'll need to repeat this daily for testing
- NOT suitable for production/client accounts

---

## 🔐 Option 2: Get Permanent Token (Production)

### Steps:

#### Step 1: Create System User
1. Go to **Meta Business Suite**
   - URL: https://business.facebook.com/

2. Click **Business Settings** (gear icon)

3. In left sidebar, go to **Users → System Users**

4. Click **Add** button

5. Enter details:
   - **Name**: `WhatsApp API User` (or any name)
   - **Role**: Admin
   
6. Click **Create System User**

#### Step 2: Assign WhatsApp Asset
1. Click on the system user you just created

2. Click **Add Assets** button

3. Select **Apps** tab

4. Find your WhatsApp app: `Whatsapp App` (ID: 1184650313547957)

5. Enable **Full control** toggle

6. Click **Save Changes**

#### Step 3: Generate Permanent Token
1. Still on the System User page, scroll to **Generate New Token** section

2. Click **Generate New Token** button

3. Select your app: `Whatsapp App`

4. Select permissions (check these boxes):
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
   - ✅ `business_management`

5. Set token expiration: **Never expires** (select 60 days for temporary, or Never for permanent)

6. Click **Generate Token**

7. **IMPORTANT**: Copy the token immediately! You won't see it again.

#### Step 4: Update Your Config
1. Update `.env` file:
   ```env
   WHATSAPP_ACCESS_TOKEN=EAAQ... (paste permanent token here)
   ```

2. Restart backend:
   ```bash
   cd backend && npm run dev
   ```

3. Go to **WhatsApp → Settings** in dashboard

4. Click **Save Configuration** (token will be re-encrypted)

5. Test connection

---

## 🧪 Quick Test After Getting New Token

### Method 1: Test Connection in Settings
1. Go to **WhatsApp → Settings**
2. Enter test phone number (with country code): `919876543210`
3. Click **Send Test Message**
4. Check if you receive WhatsApp message

### Method 2: Test in Campaigns
1. Add a contact in **WhatsApp → Campaigns**
2. Select the contact
3. Type a message
4. Click **Send**

---

## 🔍 Verify Your Current Token

Check your `.env` file (line 16):
```env
WHATSAPP_ACCESS_TOKEN=EAAQ1buUfQLUBP8poogh...
```

### How to check if token is valid:
```bash
# Open terminal and run:
curl -X GET "https://graph.facebook.com/v21.0/debug_token?input_token=YOUR_TOKEN_HERE&access_token=YOUR_TOKEN_HERE"
```

**Valid Response:**
```json
{
  "data": {
    "is_valid": true,
    "expires_at": 1234567890
  }
}
```

**Invalid Response:**
```json
{
  "error": {
    "message": "Error validating access token",
    "code": 190
  }
}
```

---

## 📋 Your Current Config (from .env)

```
WHASTAPPAPP_ID=1184650313547957
WHATSAPP_PHONE_NUMBER_ID=851822431354523
WHATSAPP_BUSINESS_ACCOUNT_ID=784906591047221
WHATSAPP_ACCESS_TOKEN=EAAQ1buUfQLUBP8poogh... (EXPIRED)
```

You need to update the **WHATSAPP_ACCESS_TOKEN** with a new one.

---

## 🚨 Common Token Errors

### Error 190: Session Invalid
- **Cause**: Token expired or user logged out
- **Fix**: Generate new token (Option 1 or 2 above)

### Error 200: Missing Permissions
- **Cause**: Token doesn't have required permissions
- **Fix**: Regenerate with all permissions checked

### Error 100: Invalid Parameter
- **Cause**: Phone number format wrong
- **Fix**: Use format `919876543210` (country code + number, no +)

### Error 131030: Recipient not in test list
- **Cause**: Number not added to Meta test recipients
- **Fix**: Add number in Meta Business Suite → WhatsApp → Phone numbers

---

## ✅ Action Items for You

### Immediate (Testing):
1. ✅ Get temporary token from developers.facebook.com
2. ✅ Update `.env` file
3. ✅ Restart backend server
4. ✅ Save config in dashboard
5. ✅ Test message send

### Later (Production):
1. ⏳ Create System User in Business Suite
2. ⏳ Generate permanent token
3. ⏳ Update all tenant configs with permanent token
4. ⏳ Document token for safe keeping

---

## 🔗 Quick Links

- **Developers Console**: https://developers.facebook.com/apps/1184650313547957/
- **Business Suite**: https://business.facebook.com/settings/
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp/cloud-api/
- **Token Debugger**: https://developers.facebook.com/tools/debug/accesstoken/

---

## 💡 Pro Tips

1. **For Testing**: Use temporary token (24h) - quick and easy
2. **For Production**: Use permanent token (system user) - never expires
3. **Save Tokens Securely**: Never commit tokens to git
4. **Test Recipients**: Add your numbers in Meta before testing
5. **Token Rotation**: Even permanent tokens should be rotated periodically for security

---

## 📞 Need Help?

If you still face issues after getting new token:
1. Check server logs for detailed error
2. Verify phone number format
3. Ensure number is in test recipients list
4. Try with a different test number
5. Check Meta Business Suite status

---

**Next Steps**: Get your new access token (Option 1 for quick test) and update the `.env` file!
