# 🔍 How to Find Your Correct Phone Number ID

## ❌ Current Error:
```
Object with ID '851822431354523' does not exist, cannot be loaded due to missing permissions
```

This means the **Phone Number ID in your .env is wrong or doesn't have permissions**.

---

## 📱 Method 1: Find Phone Number ID in Meta Developers Console

### Steps:
1. Go to: https://developers.facebook.com/apps/1184650313547957/

2. In left sidebar, click **WhatsApp** → **API Setup**

3. Look for **"From"** dropdown or **"Phone number"** section

4. You'll see something like:
   ```
   Test Number: +1 555 0323 808
   Phone Number ID: 123456789012345
   ```

5. **Copy the Phone Number ID** (NOT the phone number itself)

6. Update your `.env` file line 14:
   ```env
   WHATSAPP_PHONE_NUMBER_ID=YOUR_ACTUAL_PHONE_NUMBER_ID_HERE
   ```

---

## 📱 Method 2: Use Graph API Explorer

### Steps:
1. Go to: https://developers.facebook.com/tools/explorer/

2. Select your app: **Whatsapp App** (1184650313547957)

3. Click **"Get Token"** → Select your access token

4. In the API query field, enter:
   ```
   /784906591047221/phone_numbers
   ```
   (This uses your WABA ID from .env)

5. Click **Submit**

6. You'll see response like:
   ```json
   {
     "data": [
       {
         "verified_name": "Pixels Test",
         "display_phone_number": "+1 555-032-3808",
         "id": "123456789012345",  ← THIS IS YOUR PHONE NUMBER ID
         "quality_rating": "GREEN"
       }
     ]
   }
   ```

7. Copy the **"id"** value

---

## 📱 Method 3: Check Business Manager

### Steps:
1. Go to: https://business.facebook.com/settings/

2. In left sidebar, click **Accounts** → **WhatsApp Business Accounts**

3. Click on your WABA: **784906591047221**

4. Go to **Phone Numbers** tab

5. You'll see your test number with its ID below it

6. Copy the Phone Number ID

---

## 🔧 After Finding the Correct ID:

### Step 1: Update .env
```env
WHATSAPP_PHONE_NUMBER_ID=YOUR_NEW_PHONE_NUMBER_ID
```

### Step 2: Restart Backend
```bash
cd backend
npm run dev
```

### Step 3: Update Dashboard Config
1. Go to: http://localhost:3001/dashboard/client/2c7874d7/whatsapp/settings
2. Update **Phone Number ID** field with the new ID
3. Click **Save Configuration**

### Step 4: Test Again
Try sending a message - should work now!

---

## 🎯 Quick Check Script

Run this in your terminal to test the Phone Number ID:

```bash
curl -X GET \
  "https://graph.facebook.com/v21.0/YOUR_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Valid Response:**
```json
{
  "verified_name": "Your Business Name",
  "display_phone_number": "+1 555-032-3808",
  "id": "123456789012345"
}
```

**Invalid Response:**
```json
{
  "error": {
    "message": "Object does not exist",
    "code": 100
  }
}
```

---

## 📋 Your Current Credentials (from .env):

```
WABA ID: 784906591047221 ✅ (This is correct)
Phone Number ID: 851822431354523 ❌ (This is WRONG - needs to be updated)
Access Token: EAAQ1buUfQLUBP5i2Ok9... ✅ (This is updated)
```

---

## 🚨 Common Issues:

### Issue 1: Using Phone Number instead of Phone Number ID
❌ Wrong: `+15550323808`
✅ Correct: `123456789012345`

### Issue 2: Using WABA ID instead of Phone Number ID
❌ Wrong: `784906591047221` (this is WABA ID)
✅ Correct: `123456789012345` (this is Phone Number ID)

### Issue 3: Phone Number Not Added to App
- Go to Developers Console
- WhatsApp → API Setup
- Add phone number to your app
- Get the Phone Number ID

---

## ✅ Action Plan:

1. ✅ Go to developers.facebook.com/apps/1184650313547957/
2. ✅ Click WhatsApp → API Setup
3. ✅ Find the Phone Number ID (NOT the phone number itself)
4. ✅ Update line 14 in .env file
5. ✅ Restart backend server
6. ✅ Update config in dashboard
7. ✅ Test sending message

---

**The Phone Number ID is different from the phone number itself! It's a unique identifier that Meta assigns to each phone number registered in WhatsApp Business API.**
