# Railway Environment Variables Configuration

## 🚂 Facebook Marketing API Environment Setup

### Current Environment Variables Needed:

```env
# Facebook Marketing API (New - separate from WhatsApp)
FACEBOOK_MARKETING_APP_ID=your_new_marketing_app_id
FACEBOOK_MARKETING_APP_SECRET=your_new_marketing_app_secret

# OAuth and Redirect Configuration
FACEBOOK_MARKETING_REDIRECT_URI=https://endearing-blessing-production-c61f.up.railway.app/api/facebook/callback
FRONTEND_URL=https://enromatics.com

# Existing WhatsApp Configuration (Keep These)
WHATSAPP_ACCESS_TOKEN=your_existing_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_existing_phone_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_existing_verify_token
FACEBOOK_APP_ID=your_existing_whatsapp_app_id
FACEBOOK_APP_SECRET=your_existing_whatsapp_app_secret

# Database and other existing vars
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
# ... other existing variables
```

## 🔧 How to Add Variables in Railway:

1. **Go to Railway Dashboard**
   - Visit: https://railway.app/dashboard
   - Select your project: `endearing-blessing-production-c61f`

2. **Navigate to Variables**
   - Click on your backend service
   - Go to "Variables" tab

3. **Add New Variables**
   - Click "New Variable"
   - Add each variable name and value
   - Click "Add" for each one

4. **Deploy Changes**
   - Variables are automatically applied
   - Your app will restart with new environment variables

## ⚠️ Important Notes:

- **Keep existing WhatsApp variables** - Don't remove them
- **Marketing API uses separate credentials** - Different from WhatsApp app
- **Test locally first** - Add to `.env` file for local development
- **Secure secrets** - Never commit app secrets to git

## 🧪 Test Configuration:

After adding variables, test the endpoint:
```bash
curl -X GET "https://endearing-blessing-production-c61f.up.railway.app/api/facebook/status" \
  -H "Authorization: Bearer your_jwt_token"
```

Expected response:
```json
{
  "success": true,
  "connected": false,
  "message": "Facebook account not connected"
}
```