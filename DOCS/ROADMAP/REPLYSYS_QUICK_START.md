# ⚡ ReplySys Integration Quick Reference

## 🎯 Configuration Checklist

### ✅ Already Done:
- [x] Fresh API token obtained: `wpk_live_7cb9fc93475...`
- [x] Environment variables configured
- [x] Integration service created
- [x] Webhook routes created
- [x] Routes registered in Express
- [x] Health check test PASSED

### 📋 What You Need to Do:

#### 1. **Deploy Backend**
```bash
cd backend
npm install
npm start
```
**Expected Output:** `Server running on port 5050`

---

#### 2. **Verify Webhook is Live** (after backend starts)
```bash
curl http://localhost:5050/webhook/replysys/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "service": "Enromatics ReplySys Webhook",
  "timestamp": "2026-03-13T..."
}
```

---

#### 3. **Configure on ReplySys Dashboard**

**Login:** https://whatsapp-platform-production-e48b.up.railway.app

**Find:** Settings → Webhooks (or Integration Settings)

**Set these values:**

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://api.enromatics.com/webhook/replysys` |
| **Webhook Secret** | `enromatics_replysys_webhook_secret_2d9c8e7f5a3b4e6c1d8f9a2b3c4d5e6f` |
| **Events** | ✓ new_message ✓ delivery_status ✓ contact_update ✓ message_read |

---

#### 4. **Test Integration** (after webhook configured)
```bash
# Run full test suite
bash test-replysys-integration.sh
```

---

## 🔧 Environment Variables

Already in `backend/.env`:

```env
REPLYSYS_PLATFORM_URL=https://whatsapp-platform-production-e48b.up.railway.app
REPLYSYS_INTEGRATION_TOKEN=wpk_live_7cb9fc93475998657cbfc81abdd83cec3af87020140cac297c17cd41e27bab02
REPLYSYS_API_VERSION=v1
REPLYSYS_WEBHOOK_URL=https://api.enromatics.com/webhook/replysys
REPLYSYS_WEBHOOK_SECRET=enromatics_replysys_webhook_secret_2d9c8e7f5a3b4e6c1d8f9a2b3c4d5e6f
```

---

## 🧪 Testing Endpoints

Once backend is running on localhost:5050:

### Health Check
```bash
curl http://localhost:5050/webhook/replysys/health
```

### Simulate Message Webhook
```bash
PAYLOAD='{"conversationId":"test-123","messageId":"msg-456","message":"Test","sender":"+918087131777","senderName":"User"}'
SECRET='enromatics_replysys_webhook_secret_2d9c8e7f5a3b4e6c1d8f9a2b3c4d5e6f'
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" -hex | awk '{print $2}')

curl -X POST http://localhost:5050/webhook/replysys/message \
  -H "Content-Type: application/json" \
  -H "X-Signature: $SIGNATURE" \
  -d "$PAYLOAD"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received and logged",
  "messageId": "msg-456"
}
```

---

## 📊 Available API Methods

Once configured, you can use these in your code:

```javascript
import replysysIntegration from './services/replysysIntegration.js';

// Get conversations
const convs = await replysysIntegration.getConversations(50, 0);

// Get messages from a conversation
const messages = await replysysIntegration.getConversationMessages('conv-123');

// Send a message
const result = await replysysIntegration.sendMessage(
  '+918087131777',
  'Hello from Enromatics!'
);

// Send template
const template = await replysysIntegration.sendTemplate(
  '+918087131777',
  'welcome_template',
  ['John', 'Doe']
);

// Send broadcast
const broadcast = await replysysIntegration.sendBroadcast(
  ['+918087131777', '+919876543210'],
  'Broadcast message'
);

// Check health
const health = await replysysIntegration.getHealth();
```

---

## 🔐 Security Notes

✅ **Webhook Signature Verification**
- All webhooks are validated using HMAC-SHA256
- Secret: `enromatics_replysys_webhook_secret_2d9c8e7f5a3b4e6c1d8f9a2b3c4d5e6f`
- Invalid signatures are rejected with 401

✅ **API Token Security**
- Token stored only in `.env`
- Never commit `.env` to git
- Use Railway/deployment platform secrets management

✅ **Event Logging**
- All webhook events logged to MongoDB
- Useful for debugging and audit
- Check `WhatsAppEventLog` collection

---

## 🚨 Troubleshooting

### Webhook not being called
1. Check ReplySys dashboard webhook URL is correct
2. Verify backend is accessible from internet (not localhost!)
3. Check webhook secret matches in ReplySys and .env
4. Look at backend logs for webhook requests

### API token returns 401
1. Verify token in .env is correct
2. Check token hasn't expired
3. Regenerate token from ReplySys if needed

### Signature verification failing
1. Ensure webhook secret is identical in:
   - `backend/.env` as `REPLYSYS_WEBHOOK_SECRET`
   - ReplySys dashboard webhook configuration
2. Signature is calculated on raw JSON payload
3. Check for any whitespace differences

---

## 📞 Support Resources

- **ReplySys Doc:** Check whatsapp-config.md in project root
- **Integration Status:** See REPLYSYS_INTEGRATION_STATUS.md
- **Backend Logs:** Check console output when running `npm start`
- **Database:** Query `WhatsAppEventLog` collection for webhook events

---

**Status:** 🟢 Ready for Deployment  
**Last Updated:** March 13, 2026
