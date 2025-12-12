# 🎯 Exact Rollback Instructions for Your Project

## 📌 Your Project Details

### MVP 2.3.1 Information
- **Commit Hash:** `fc5fcb8`
- **Commit Message:** "release: MVP 2.3.1 - SWR Complete + BFF Auth Fixes + Quota System Fixes"
- **Tag:** `v2.3.1`
- **Released:** November 20, 2024 (approximately)

### Your Deployment URLs
- **Frontend (Vercel):** https://pixels-web-dashboard.vercel.app (or your custom domain)
- **Backend (Railway):** https://endearing-blessing-production-c61f.up.railway.app (approximately)
- **GitHub Repo:** https://github.com/mpiyush15/enromatics

---

## 📋 Step-by-Step Rollback

### STEP 1: Rollback Backend on Railway

#### Method 1: Using Railway Dashboard (Recommended)

```
1. Go to https://railway.app/dashboard
2. Log in if needed
3. Click "enromatics" project (or your project name)
4. Click the service (backend)
5. Click "Deployments" tab at the top
```

**Finding the deployment:**
```
6. Look at the list of deployments
7. Find one with commit starting with "fc5fcb8"
8. Or look at the commit message for "2.3.1"
9. Approximate date: Nov 20, 2024
```

**Performing the rollback:**
```
10. Hover over the deployment (with fc5fcb8)
11. Click the three dots menu (⋮)
12. Select "Rollback to this deployment"
13. Confirm when asked
14. Wait for deployment to complete (2-3 minutes)
15. Look for green checkmark ✓ next to deployment
```

**Verify:**
```
16. Click the deployment
17. Check "Logs" tab - should show "Server running on port 5050"
18. Status should show "Deployed"
```

#### Method 2: Using Git (Alternative)

```bash
# If you have Railway CLI installed
cd backend
railway link  # Link to your Railway service
git push railway fc5fcb8:main --force
```

---

### STEP 2: Rollback Frontend on Vercel

#### Method 1: Using Vercel Dashboard (Recommended)

```
1. Go to https://vercel.com/dashboard
2. Log in if needed
3. Click your project "pixels-web-dashboard" (or your project name)
4. Click "Deployments" at the top
```

**Finding the deployment:**
```
5. Scroll down through deployments
6. Find one with commit "fc5fcb8"
7. Or look at the preview/commit message for "2.3.1"
8. Approximate date: Nov 20, 2024
```

**Performing the rollback:**
```
9. Click on the MVP 2.3.1 deployment
10. Click "Promote to Production" button
11. Confirm when asked
12. Wait for deployment to complete (3-5 minutes)
13. Look for "Ready" status with green checkmark ✓
```

**Verify:**
```
14. Check the "Logs" tab - should show successful build
15. Wait 2-3 minutes for cache to clear
16. Visit https://your-domain.com
```

#### Method 2: Using Git (Alternative)

```bash
cd frontend
vercel env list  # Check environment is set
git push vercel fc5fcb8:main --force
```

---

### STEP 3: Verify Rollback Success

Visit your frontend URL and test:

```
1. Open https://your-domain.com
2. You should see the login page
3. Login with your credentials
4. Verify sidebar appears on left
5. Check dashboard loads
6. Open F12 browser console - no red errors
7. Check Network tab - no failed requests
```

**Success indicators:**
- ✅ Page loads without errors
- ✅ Sidebar is visible after login
- ✅ Dashboard analytics display
- ✅ No CORS errors in console
- ✅ All API calls return 200/success

---

## 🔍 Finding Deployments in Dashboards

### In Railway:

**What you're looking for:**
```
Commit: fc5fcb8... (or message contains "2.3.1")
Date: Around Nov 20, 2024
Status: Should show "Deployed"
```

**If you see many deployments:**
- Scroll down to find older ones
- Look at the timestamps
- Deploy history goes top (newest) to bottom (oldest)

### In Vercel:

**What you're looking for:**
```
Commit: fc5fcb8 (show in deployment details)
Message: "2.3.1" visible in the commit
Date: Around Nov 20, 2024
Status: Shows as "Ready"
```

**If you see many deployments:**
- They're listed newest first
- Scroll down for older deployments
- Click each one to see full details

---

## ⚠️ Common Issues & Solutions

### Issue 1: Can't Find fc5fcb8 Deployment

**Solution:**
1. Try searching for "2.3.1" in commit messages
2. Try looking around Nov 20-25, 2024
3. If many deployments, scroll down more slowly
4. Check the full commit hash/message in details

### Issue 2: Rollback Says "Failed"

**Solution:**
1. Wait a minute and try again
2. Check Railway/Vercel status page (might be down)
3. Try refreshing the page and retrying
4. Check logs for specific error message

### Issue 3: After Rollback, Site Shows Error

**Solution:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh page (Ctrl+Shift+R)
3. Check backend is running (check Railway logs)
4. Check frontend can reach backend (check browser Network tab)
5. Verify environment variables are correct

### Issue 4: Sidebar Still Doesn't Appear

**Solution:**
1. Make sure you're logged in (not on login page)
2. Open browser F12 → Console tab
3. Look for error messages about `/api/ui/sidebar`
4. Check backend /api/ui/sidebar endpoint in logs
5. Verify user has proper role in database

---

## 📊 Rollback Checklist

Before starting:
- [ ] You have Vercel account access
- [ ] You have Railway account access
- [ ] You know your frontend URL
- [ ] You know your backend URL
- [ ] You have time to monitor (15-30 min)

During rollback:
- [ ] Rolled back backend to fc5fcb8
- [ ] Backend shows green ✓ after deployment
- [ ] Rolled back frontend to fc5fcb8
- [ ] Frontend shows green ✓ after deployment
- [ ] Waited 2-3 minutes for cache clear

After rollback:
- [ ] Visited your site - it loads
- [ ] Logged in successfully
- [ ] Sidebar appears in dashboard
- [ ] No red errors in console (F12)
- [ ] API calls working (check Network tab)
- [ ] Notified your team

---

## 🎉 Success Criteria

After rollback is complete:

```
✓ Railway deployment: fc5fcb8 is deployed and running
✓ Vercel deployment: fc5fcb8 is promoted to production
✓ Your site loads at https://your-domain.com
✓ Login works correctly
✓ Sidebar visible after login
✓ Dashboard shows data
✓ Console shows no CORS errors
✓ All API calls respond with 200 OK
```

---

## 📞 Need Help?

### If something goes wrong:

1. **Check the logs:**
   - Railway: Dashboard → Service → Logs tab
   - Vercel: Dashboard → Project → Deployments → Click → Logs

2. **Read error messages carefully**
   - They usually tell you exactly what's wrong
   - Common: env variables, MongoDB connection, CORS

3. **Contact support:**
   - Railway: https://railway.app/support
   - Vercel: https://vercel.com/support
   - GitHub: Your repo issues

---

## 🔄 If You Need to Undo the Rollback

Same process, but:
1. Find the MVP 2.5 deployment instead
2. Do the same rollback steps
3. Select the newer version (6 commits newer)
4. This will upgrade back to MVP 2.5

---

## Time Estimates

| Step | Duration |
|------|----------|
| Backend rollback | 3-5 minutes |
| Frontend rollback | 3-5 minutes |
| Cache clear + verification | 2-3 minutes |
| Testing | 5-10 minutes |
| **Total** | **15-25 minutes** |

---

## Summary Commands (If Using CLI)

```bash
# If you have Railway/Vercel CLI

# Rollback backend
cd backend
railway link <YOUR_SERVICE_ID>
git push railway fc5fcb8:main --force

# Rollback frontend (in new terminal)
cd frontend
vercel --prod

# Or just use the web dashboards - easier!
```

---

## Questions?

See detailed guide: `ROLLBACK_VERCEL_RAILWAY_MVP_2.3.1.md`

Ready to rollback? Follow the steps above and you'll be on MVP 2.3.1 in 15-25 minutes! ✅
