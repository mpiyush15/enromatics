# Facebook Marketing API App Setup Guide

## 🎯 App Configuration for Social Media Analytics Module

### Your Domain Information
- **Frontend Domain**: `enromatics.com`
- **Backend Domain**: `endearing-blessing-production-c61f.up.railway.app`

---

## 📱 Step 1: Create Facebook Marketing App

1. **Go to Meta Developer Console**
   - Visit: https://developers.facebook.com/
   - Click "My Apps" → "Create App"

2. **Select App Type**
   - Choose: **"Business"** (for Marketing API access)
   - Click "Next"

3. **App Details**
   - **App Name**: `Enromatics Social Analytics` (or your preferred name)
   - **App Contact Email**: Your business email
   - **Business Manager Account**: Select your business account
   - Click "Create App"

---

## 🔧 Step 2: Configure App Products

### Add Required Products:
1. **Facebook Login**
   - Go to App Dashboard → Add Product
   - Find "Facebook Login" → Click "Set Up"

2. **Marketing API**
   - Add Product → Find "Marketing API" → Click "Set Up"
   - This gives you access to ad accounts, campaigns, insights

---

## 🌐 Step 3: Configure OAuth Settings

### Facebook Login Settings:
1. **Go to**: App Dashboard → Facebook Login → Settings

2. **Valid OAuth Redirect URIs** (Add all these):
   ```
   https://enromatics.com/dashboard/settings/facebook
   https://www.enromatics.com/dashboard/settings/facebook
   https://endearing-blessing-production-c61f.up.railway.app/api/facebook/callback
   http://localhost:3000/dashboard/settings/facebook
   http://localhost:5050/api/facebook/callback
   ```

3. **Client OAuth Login**: ✅ Enable
4. **Web OAuth Login**: ✅ Enable
5. **Enforce HTTPS**: ✅ Enable (for production)

---

## 🔒 Step 4: App Domain Configuration

### Basic Settings:
1. **Go to**: App Dashboard → Settings → Basic

2. **App Domains** (Add these):
   ```
   enromatics.com
   www.enromatics.com
   endearing-blessing-production-c61f.up.railway.app
   localhost
   ```

3. **Privacy Policy URL**:
   ```
   https://enromatics.com/privacy-policy
   ```

4. **Terms of Service URL**:
   ```
   https://enromatics.com/terms-of-service
   ```

---

## 🎯 Step 5: Marketing API Permissions

### Required Permissions:
1. **Go to**: App Dashboard → App Review → Permissions and Features

2. **Request These Permissions**:
   - `ads_management` - Manage ad accounts and campaigns
   - `ads_read` - Read ad account data and insights
   - `pages_read_engagement` - Read page insights
   - `pages_show_list` - Access list of pages
   - `business_management` - Access Business Manager data

3. **For Each Permission**:
   - Click "Request Advanced Access"
   - Provide business verification documents
   - Explain use case: "Social media analytics dashboard for business clients"

---

## 🔑 Step 6: Get App Credentials

### Copy These Values:
1. **Go to**: App Dashboard → Settings → Basic

2. **App ID**: Copy this → This is your `FACEBOOK_MARKETING_APP_ID`
3. **App Secret**: Click "Show" → Copy this → This is your `FACEBOOK_MARKETING_APP_SECRET`

---

## ⚙️ Step 7: Railway Environment Variables

Add these to your Railway backend deployment:

```env
# Facebook Marketing API (separate from WhatsApp)
FACEBOOK_MARKETING_APP_ID=your_app_id_here
FACEBOOK_MARKETING_APP_SECRET=your_app_secret_here

# OAuth Redirect URL
FACEBOOK_MARKETING_REDIRECT_URI=https://endearing-blessing-production-c61f.up.railway.app/api/facebook/callback

# Frontend URL for redirects
FRONTEND_URL=https://enromatics.com
```

---

## 🧪 Step 8: Testing Configuration

### Test Endpoints:
1. **Connection Status**:
   ```
   GET https://endearing-blessing-production-c61f.up.railway.app/api/facebook/status
   ```

2. **OAuth Connection**:
   ```
   GET https://endearing-blessing-production-c61f.up.railway.app/api/facebook/connect
   ```

3. **Dashboard Data**:
   ```
   GET https://endearing-blessing-production-c61f.up.railway.app/api/facebook/dashboard
   ```

---

## 🚀 Step 9: Go Live

### Switch to Production:
1. **App Review**: Submit for review if using advanced permissions
2. **App Mode**: Switch from "Development" to "Live"
3. **Business Verification**: Complete if required for Marketing API

---

## 🔍 Troubleshooting

### Common Issues:
1. **"App Not Approved"**
   - Ensure app domains are correctly configured
   - Business verification may be required

2. **"Invalid Redirect URI"**
   - Double-check OAuth redirect URIs match exactly
   - Ensure HTTPS for production URLs

3. **"Permission Denied"**
   - Some permissions require business verification
   - Start with basic permissions and add more gradually

---

## 📞 Support

If you encounter issues:
- Check Meta Developer Documentation
- Facebook Developer Community
- Contact Meta Support for business verification

---

## ✅ Checklist

- [ ] Created Facebook Marketing App
- [ ] Added Facebook Login product
- [ ] Added Marketing API product
- [ ] Configured OAuth redirect URIs
- [ ] Set app domains
- [ ] Added privacy policy URL
- [ ] Requested required permissions
- [ ] Copied app credentials
- [ ] Added environment variables to Railway
- [ ] Tested connection flow
- [ ] Submitted for app review (if needed)
- [ ] Switched to live mode

---

**Next Steps**: Once configured, users can connect their Facebook accounts and access comprehensive social media analytics!