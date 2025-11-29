# 🔴 DEBUG: Instagram Not Showing in Dashboard

**Situation:** You have Instagram linked to your Facebook page, but it's not showing in dashboard.

## ✅ What's Working (CONFIRMED):

1. **Backend Code** ✅
   - `getInstagramAccounts()` function exists
   - `getDashboardData()` includes Instagram fetching
   - Returns: `{ success: true, instagramAccounts: [...] }`

2. **Frontend BFF Route** ✅
   - `/app/api/social/instagram-accounts/route.ts` exists
   - Forwards to backend correctly
   - Implements caching

3. **Hook** ✅
   - Fetches from `/api/social/dashboard`
   - Falls back to `/api/social/instagram-accounts` if needed
   - Sets state: `instagramAccounts: data.dashboard.instagramAccounts || []`

4. **Dashboard Component** ✅
   - Gets `instagramAccounts` from context
   - Has UI to display them

---

## 🔍 Debugging Checklist (Do This Now):

### **Step 1: Check Backend Response**

Open browser DevTools → Network tab → Reconnect Facebook account

Look for request to `/api/social/instagram-accounts` or `/api/social/dashboard`

**Check the response:**
```json
{
  "success": true,
  "instagramAccounts": [
    {
      "id": "123...",
      "username": "@yourname",
      ...
    }
  ]
}
```

**Questions to answer:**
- [ ] Do you see the network request?
- [ ] What's the response status? (200 = good, 401 = auth error, 500 = backend error)
- [ ] Does response include `instagramAccounts` array?
- [ ] Is the array EMPTY `[]` or has DATA `[{...}]`?

---

### **Step 2: Check Backend Logs (Railway)**

1. Go to: https://railway.app
2. Find your "Pixels web dashboard" project
3. Click "Deployments" → Select latest
4. Click "Logs"
5. Look for these messages when you reconnect:

```
🔍 Fetching Instagram Business Accounts linked to Facebook pages...
✅ Personal pages fetched: X
✅ Found Instagram account: @username
```

**OR you should see:**
```
ℹ️ Page {ID} has no linked Instagram account
```

**Questions:**
- [ ] Does backend try to fetch Instagram accounts?
- [ ] Does it find any pages?
- [ ] Does it find Instagram linked to those pages?
- [ ] Any errors fetching Instagram?

---

### **Step 3: Check Browser Console**

Open DevTools → Console tab → Reconnect

Look for logs like:
```
✅ Dashboard data received: {success: true, dashboard: {...}}
```

**Questions:**
- [ ] Do you see "Dashboard data received"?
- [ ] Does it include `instagramAccounts` in the response?
- [ ] Are there any red errors?

---

### **Step 4: Check if Instagram is Linked to Page**

**Question:** Is your Instagram account actually linked to the Facebook page?

**How to verify:**
1. Go to: https://www.facebook.com/your-page/settings
2. Look for "Instagram Account" section
3. Do you see a linked Instagram account?

If NO → That's the problem! You need to link Instagram to the page first.

---

## 🔧 Possible Problems & Solutions:

### **Problem 1: Backend Returns Empty Array**
- ❌ Response: `"instagramAccounts": []`
- 🎯 **Cause:** Instagram not linked to your Facebook page
- ✅ **Fix:** Link Instagram to your Facebook page first

### **Problem 2: Backend Returns Error**
- ❌ Response: `"error": "..."`
- 🎯 **Cause:** Instagram Graph API endpoint failing
- ✅ **Fix:** Check if Instagram Graph API is enabled in your Meta app

### **Problem 3: Instagram Array Missing from Response**
- ❌ Response: `{"success": true, "dashboard": {"pages": [...], "adAccounts": [...]}}`
- 🎯 **Cause:** Backend code didn't include Instagram in response
- ✅ **Fix:** Check that line in `getDashboardData()` includes `instagramAccounts`

### **Problem 4: Hook Not Receiving Instagram**
- ❌ Dashboard shows: No Instagram accounts linked
- ❌ Console shows: `instagramAccounts: []`
- 🎯 **Cause:** Hook didn't destructure response correctly
- ✅ **Fix:** Check hook is reading `data.dashboard.instagramAccounts`

### **Problem 5: Component Not Rendering**
- ❌ Instagram section doesn't appear on dashboard
- ❌ But console shows Instagram data exists
- 🎯 **Cause:** Dashboard component not displaying
- ✅ **Fix:** Check `/app/dashboard/social/page.tsx` has Instagram section

---

## 🎯 Quick Action Plan:

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Reconnect Facebook**
4. **Find `/api/social/dashboard` request**
5. **Check response** - does it have Instagram accounts?

### If YES Instagram in response:
→ Problem is in frontend UI
→ Check dashboard component rendering

### If NO Instagram in response:
→ Problem is in backend
→ Check backend logs in Railway
→ Instagram might not be linked to page

---

## 🆘 Still Not Working?

Share this info:

1. **Backend logs** when you reconnect
2. **Network tab** response JSON
3. **Browser console** errors
4. **Is Instagram linked** to your Facebook page?

Then we can fix it! 🚀
