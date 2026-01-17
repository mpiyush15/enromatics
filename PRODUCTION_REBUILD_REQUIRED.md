# URGENT: Frontend Rebuild Required for Production

## Problem
The payment checkout page is showing JavaScript errors because the production server is running an **old build** of the frontend code.

## Solution
You must rebuild the frontend on the production server with the latest code.

### Quick Fix (SSH into production server)

```bash
# 1. Navigate to frontend directory
cd /path/to/Pixels_web_dashboard/frontend

# 2. Pull latest code from git
git pull origin main

# 3. Install dependencies (if needed)
npm install

# 4. Build production
npm run build

# 5. Restart the frontend service
pm2 restart enromatics-frontend
# OR if using systemd:
sudo systemctl restart enromatics-frontend
# OR if using Docker:
docker-compose up -d --build

# 6. Verify build completed
pm2 logs enromatics-frontend | tail -20
# Look for: "✓ compiled successfully" or similar
```

### Verify Build Succeeded

```bash
# Check if .next directory was created
ls -la .next/

# Should show:
# total XXX
# drwxr-xr-x  ...  .next
# -rw-r-r-  ...  BUILD_ID
# -rw-r-r-  ...  build-manifest.json
# etc.
```

### Test After Rebuild

```bash
# 1. Check frontend is running
curl https://enromatics.com/ | head -20
# Should return HTML, not error

# 2. Test payment session API
curl https://enromatics.com/api/payment-links/session/26e88cdbac0c85a07f6d3bbfcbacae30
# Should return JSON with session details

# 3. Open payment link in browser
# https://enromatics.com/upgrade/checkout?session=26e88cdbac0c85a07f6d3bbfcbacae30
# Should load checkout page with plan details
```

---

## Why This Happens

The latest git commits include bug fixes for the checkout page:
- Better error handling
- More defensive null checks
- Improved logging for debugging

These fixes are only in the code, not in the compiled `.next/` build directory.

**Production server has:**
- ❌ Old compiled code in `.next/`
- ❌ Old Node.js modules
- ✅ Latest code in git

**Rebuilding does:**
- ✅ Pull latest code from git
- ✅ Recompile TypeScript → JavaScript
- ✅ Generate new `.next/` directory
- ✅ Load latest bug fixes

---

## Deployment Checklist

- [ ] SSH into production server
- [ ] Navigate to frontend directory
- [ ] `git pull origin main`
- [ ] `npm run build` (takes 2-3 minutes)
- [ ] `pm2 restart enromatics-frontend`
- [ ] Wait 30 seconds
- [ ] Test: `curl https://enromatics.com/`
- [ ] Test payment link in browser
- [ ] Verify no console errors (F12)

---

## If Build Fails

**Error: "Cannot find module X"**
```bash
npm install
npm run build
```

**Error: "ENOSPC: no space left on device"**
```bash
# Clear npm cache
npm cache clean --force
# Clear .next cache
rm -rf .next/
npm run build
```

**Error: "Port already in use"**
```bash
# Kill existing process
pm2 kill
# Restart
npm run dev
# OR pm2 start
```

---

## Monitoring After Rebuild

```bash
# Watch logs
pm2 logs enromatics-frontend

# Should see:
# ✓ compiled successfully
# Server running on port 3000
# (No error messages)
```

---

## Latest Commits to Deploy

These bug fixes are waiting to be deployed:

1. **ad4c34c** - Better error handling and logging
2. **aa3d1bb** - Missing BFF route for payment session
3. **8851185** - Production deployment configuration
4. **cfcbc87** - Payment link generation feature

All these are in git but not in the production build.

---

## Do This Now

```bash
ssh user@enromatics.com
cd /path/to/frontend
git pull origin main
npm run build
pm2 restart enromatics-frontend
# Done! Test the link again
```

Once done, the payment checkout page will work! 🚀
