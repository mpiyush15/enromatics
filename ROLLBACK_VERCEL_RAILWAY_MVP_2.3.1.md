# 🔄 Rollback to MVP 2.3.1 on Vercel & Railway

## ⚠️ IMPORTANT: What This Will Do

This will **revert** your production servers from MVP 2.5 → MVP 2.3.1:
- ✅ All users will see the MVP 2.3.1 version
- ✅ New features from MVP 2.4 & 2.5 will be gone
- ✅ This is a COMPLETE rollback

**Make sure this is what you want!**

---

## 📋 Prerequisites

You'll need:
- Vercel account access (for frontend)
- Railway account access (for backend)
- GitHub access (can be useful)

---

## 🚀 Part 1: Rollback Backend on Railway

### Option A: Using Railway UI (Easier)

1. **Go to Railway Dashboard**
   - Open https://railway.app
   - Log in with your account
   - Select your project (enromatics backend)

2. **Find Deployments**
   - Click "Deployments" tab
   - Look for a deployment around **November 2024** (when MVP 2.3.1 was released)
   - The commit should be: `fc5fcb8` or tagged as `v2.3.1`

3. **Rollback**
   - Find the MVP 2.3.1 deployment
   - Click the three dots menu (⋮)
   - Select "Rollback to this deployment"
   - Confirm the rollback

4. **Verify**
   - Wait 2-3 minutes for deployment
   - Check logs to confirm it's running
   - Backend should now be on MVP 2.3.1

### Option B: Using Git/CLI (If Option A Not Available)

```bash
# From your local machine
cd backend

# Push the MVP 2.3.1 version to Railway
git push railway fc5fcb8:main --force

# This will trigger a redeploy with MVP 2.3.1
```

---

## 🌐 Part 2: Rollback Frontend on Vercel

### Option A: Using Vercel UI (Easier)

1. **Go to Vercel Dashboard**
   - Open https://vercel.com
   - Log in with your account
   - Select your project (frontend)

2. **Find Deployments**
   - Click "Deployments" tab
   - Scroll down to find a deployment from **November 2024**
   - Look for commit: `fc5fcb8` or tag `v2.3.1`

3. **Rollback**
   - Click on the MVP 2.3.1 deployment
   - Click "Promote to Production"
   - Confirm when asked

4. **Verify**
   - Check that the URL shows the new deployment
   - Wait 2-3 minutes for caching to update
   - Visit your site and verify it's MVP 2.3.1

### Option B: Using Git/CLI

```bash
# From your local machine
cd frontend

# Push to trigger Vercel deployment of MVP 2.3.1
git push vercel fc5fcb8:main --force

# This will trigger a rebuild/deploy with MVP 2.3.1
```

---

## 🔧 Step-by-Step Instructions

### For Railway Backend:

**Step 1: Access Railway Dashboard**
```
1. Go to https://railway.app
2. Click on your project
3. Select the service (backend)
```

**Step 2: Find Deployment History**
```
1. Click "Deployments" tab
2. Scroll through the list
3. Look for oldest deployment (MVP 2.3.1)
```

**Step 3: Rollback**
```
1. Right-click the deployment
2. Select "Rollback to this deployment"
3. Confirm
```

**Step 4: Verify**
```
1. Check deployment status
2. Wait for "Success" indicator
3. Verify logs show MVP 2.3.1
```

---

### For Vercel Frontend:

**Step 1: Access Vercel Dashboard**
```
1. Go to https://vercel.com
2. Click on your project
3. Click "Deployments"
```

**Step 2: Find Deployment History**
```
1. Scroll through deployments
2. Find MVP 2.3.1 version
3. Click on it to view details
```

**Step 3: Promote to Production**
```
1. Click "Promote to Production" button
2. Confirm the action
3. Wait for it to complete
```

**Step 4: Verify**
```
1. Visit your site URL
2. Verify sidebar appears
3. Test login functionality
```

---

## 🔍 How to Find MVP 2.3.1 Deployment

### In Railway:
- Look for deployment around **Nov 20, 2024**
- Check commit message: should contain "2.3.1"
- Commit hash: `fc5fcb8`
- Tag: `v2.3.1`

### In Vercel:
- Look for deployment around **Nov 20, 2024**
- Check commit message: should contain "2.3.1" 
- Commit hash: `fc5fcb8`
- Tag: `v2.3.1`

---

## ⚠️ After Rollback - Important Tasks

### 1. Update Frontend .env Variables (if needed)
Make sure your production environment has:
```env
NEXT_PUBLIC_API_URL=https://your-railway-backend-url
NEXT_PUBLIC_BACKEND_URL=https://your-railway-backend-url
EXPRESS_BACKEND_URL=https://your-railway-backend-url
```

### 2. Update Backend .env Variables (if needed)
Make sure your production environment has:
```env
FRONTEND_URL=https://your-vercel-frontend-url
PORT=5050
```

### 3. Test Everything
- ✅ Login page works
- ✅ Sidebar appears after login
- ✅ Dashboard loads
- ✅ No CORS errors
- ✅ APIs respond correctly

### 4. Monitor Logs
- Check Railway logs for errors
- Check Vercel deployment logs
- Look for any unusual activity

---

## 🚨 If Something Goes Wrong

### Rollback Failed?
```bash
# Quickly rollback again to the previous version
# Same process, but select the version before MVP 2.3.1
```

### Need to Go Back to MVP 2.5?
```bash
# Same process, find MVP 2.5 deployment
# Rollback to that instead
```

### Connection Issues?
1. Check environment variables are correct
2. Verify MongoDB connection string
3. Check CORS settings in backend
4. Verify frontend can reach backend URL

---

## ✅ Verification Checklist

After rollback:

- [ ] Backend is running on Railway
- [ ] Frontend is deployed on Vercel
- [ ] Login page loads without CORS errors
- [ ] Can successfully login
- [ ] Sidebar appears in dashboard
- [ ] Dashboard analytics load
- [ ] No API errors in browser console
- [ ] Mobile responsive works
- [ ] Team is notified of rollback

---

## 📞 Need Help?

If you encounter issues during rollback:

1. **Check Deployment Logs**
   - Railway: Dashboard → Logs tab
   - Vercel: Deployments → Click deployment → Logs

2. **Check Error Messages**
   - Browser console (F12)
   - Backend logs
   - Vercel/Railway deployment logs

3. **Common Issues**
   - Wrong environment variables
   - MongoDB connection failed
   - Backend/frontend mismatch
   - CORS configuration

---

## Summary

**Time Required:** 10-15 minutes
**Risk Level:** Medium (affects all users)
**Rollback Time:** 2-5 minutes per service

**Process:**
1. Rollback backend on Railway → Wait for green ✓
2. Rollback frontend on Vercel → Wait for green ✓
3. Verify both services working
4. Test on https://your-domain.com
5. Notify team

**Questions?** Check the deployment logs or contact your DevOps team.
