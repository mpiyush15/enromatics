# WhatsApp Webhook Subscription Fix Guide

## 🚨 Error: "messaging_handovers" Subscription Issue

### **Current Webhook URL:**
```
https://endearing-blessing-production-c61f.up.railway.app/api/whatsapp/webhook
```

### **Verify Token:**
```
pixels_webhook_secret_2025
```

---

## 🔧 **Step-by-Step Fix Instructions:**

### **Step 1: Access Meta Business Manager**
1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Select your **WhatsApp Business Account**
3. Go to **WhatsApp Business Platform** → **Configuration**

### **Step 2: Webhook Configuration**
1. Click on **"Webhooks"** in the left sidebar
2. Click **"Edit"** or **"Configure"** next to your webhook URL

### **Step 3: Update Webhook URL (if needed)**
- **Webhook URL**: `https://endearing-blessing-production-c61f.up.railway.app/api/whatsapp/webhook`
- **Verify Token**: `pixels_webhook_secret_2025`

### **Step 4: Critical - Webhook Field Subscriptions**
**Make sure these fields are checked/subscribed:**

✅ **messages** (REQUIRED for message delivery)
✅ **message_status** (CRITICAL for delivery/read status)
✅ **messaging_handovers** (For handover events - might be optional)

**Note:** If `messaging_handovers` is causing errors, you can **uncheck it temporarily** and only keep:
- ✅ `messages`
- ✅ `message_status`

### **Step 5: Test Webhook**
1. Click **"Test"** button in Meta webhook settings
2. Should return: `200 OK` status
3. Check if webhook receives test payload

---

## 🛠️ **Alternative Solution: Remove messaging_handovers**

If `messaging_handovers` keeps causing subscription errors:

### **Option 1: Essential Fields Only**
Subscribe to only the essential fields:
- ✅ `messages` - For receiving messages  
- ✅ `message_status` - For delivery status updates

### **Option 2: Check App Permissions**
1. Go to **App Dashboard** → **App Review** → **Permissions and Features**
2. Ensure your app has these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

---

## 🧪 **Test Your Webhook Setup:**

### **1. Webhook Verification Test**
```bash
curl "https://endearing-blessing-production-c61f.up.railway.app/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=pixels_webhook_secret_2025&hub.challenge=test123"
```
**Expected Response:** `test123`

### **2. Webhook POST Test**
```bash
curl -X POST "https://endearing-blessing-production-c61f.up.railway.app/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "test_entry",
      "changes": [{
        "field": "messages",
        "value": {
          "statuses": [{
            "id": "wamid.test123",
            "status": "delivered",
            "timestamp": "1700000000",
            "recipient_id": "919876543210"
          }]
        }
      }]
    }]
  }'
```
**Expected Response:** `OK`

---

## 🚨 **Common Issues & Solutions:**

### **Issue 1: "messaging_handovers" Subscription Failed**
**Solution:** Uncheck `messaging_handovers` and only use:
- `messages`
- `message_status`

### **Issue 2: Webhook URL Not Accessible**
**Solution:** Ensure Railway app is running and publicly accessible.

### **Issue 3: Wrong Verify Token**
**Solution:** Double-check token matches: `pixels_webhook_secret_2025`

### **Issue 4: App Permissions Missing**
**Solution:** Request additional permissions from Meta App Review.

---

## ✅ **Minimal Working Configuration:**

**Webhook URL:** `https://endearing-blessing-production-c61f.up.railway.app/api/whatsapp/webhook`
**Verify Token:** `pixels_webhook_secret_2025`
**Required Fields:** 
- ✅ `messages`
- ✅ `message_status`

**Optional Fields (can skip if causing errors):**
- ⚠️ `messaging_handovers` 

---

## 🎯 **Quick Fix Steps:**

1. **Go to Meta Business Manager**
2. **WhatsApp** → **Configuration** → **Webhooks**
3. **Edit your webhook**
4. **UNCHECK "messaging_handovers"** if it's causing errors
5. **Keep only "messages" and "message_status" checked**
6. **Save configuration**
7. **Test webhook**

This should resolve the subscription error! The `messaging_handovers` field is not essential for basic message delivery tracking.