# Instagram Graph API Setup - CRITICAL CHECKLIST

## Current Status
- ✅ Backend code: `getInstagramAccounts()` function implemented correctly
- ✅ Frontend: Instagram accounts UI and hooks ready
- ✅ BFF Routes: `/api/social/instagram-accounts` configured
- ✅ OAuth Scopes: Instagram scopes NOT explicitly required (inherited from Facebook)

## PROBLEM: Instagram Graph API NOT CONFIRMED

Your current setup uses the **Facebook Graph API v19.0** to fetch Instagram Business Accounts, but you need to ensure:

### 1. Facebook App Configuration (https://developers.facebook.com/apps)

**App ID:** `1193384345994095`

**Required Steps in Meta Dashboard:**

1. Go to App Roles → Basic Settings
   - Verify: App is set to "Live Mode" ✓

2. Add Instagram Product
   - Click "Add Product"
   - Search for "Instagram Graph API"
   - Click "Add"

3. Verify Permissions (Products → Instagram Graph API → Instagram Basic Display)
   - Permissions needed:
     - `instagram_business_content_published`
     - `instagram_business_manage_comments`
     - `read:instagram_business_account`

4. Go to Settings → Basic
   - Note your **App ID**: `1193384345994095`
   - Note your **App Secret**: `e80034de1f0bc9013b3b7c2fbe5f3ec7`

### 2. Required OAuth Scopes

Your current scopes in `facebookController.js`:
```javascript
scope: [
  'public_profile',
  'email',
  'business_management',
  'ads_management',
  'ads_read',
  'pages_show_list',           // ← Required for pages
  'pages_read_engagement',     // ← Required for page data
  'pages_read_user_content',   // ← Required for page content
  'pages_manage_metadata',     // ← Required for page management
  'whatsapp_business_management',
  'whatsapp_business_messaging',
]
```

**Instagram doesn't need separate scopes** - it uses the `instagram_business_account` field accessible through Facebook pages with `pages_read_user_content` scope.

### 3. Test the Connection

**Via cURL:**
```bash
curl -X GET \
  "https://graph.facebook.com/v19.0/{PAGE_ID}?fields=instagram_business_account&access_token={YOUR_ACCESS_TOKEN}"
```

**Expected Response:**
```json
{
  "instagram_business_account": {
    "id": "123456789"
  }
}
```

If you get:
- ✅ Instagram ID → Success! API is working
- ❌ Empty `instagram_business_account` → User/page has no linked Instagram
- ❌ Error about permissions → Add Instagram Graph API to your app

### 4. Verify Your Backend Can Access It

**Check Backend Logs:**
1. Reconnect Facebook account
2. Watch for logs in your Railway backend:
   - `🔍 Fetching Instagram Business Accounts linked to Facebook pages...`
   - `✅ Personal pages fetched: X`
   - `✅ Found Instagram account: @username`

### 5. If Instagram Accounts Don't Show

**Debug Steps:**
1. Check if the Facebook page has an Instagram account linked
2. Verify the access token has expired (reconnect)
3. Check backend logs for errors
4. Ensure the user has a Facebook page with Instagram linked

## Action Items

- [ ] Go to https://developers.facebook.com/apps/1193384345994095
- [ ] Verify Instagram Graph API is added as a product
- [ ] Verify permissions are set correctly
- [ ] Test with cURL using a real access token
- [ ] Reconnect Facebook account in dashboard
- [ ] Check backend logs for Instagram account fetching
- [ ] Verify Instagram accounts appear in dashboard

## API Endpoint Reference

```
GET https://graph.facebook.com/v19.0/{page_id}?fields=instagram_business_account
```

This returns the Instagram Business Account ID linked to a Facebook page.

```
GET https://graph.facebook.com/v19.0/{instagram_business_account_id}?fields=id,username,name,biography,followers_count,follows_count,profile_pic_url,ig_username,website
```

This returns full Instagram account details.

---

**Note:** Your implementation is correct. This just confirms the Meta/Facebook app has the Instagram Graph API enabled and properly configured.
