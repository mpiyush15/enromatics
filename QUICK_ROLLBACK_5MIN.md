# ⚡ Quick Rollback Guide - 5 Minutes

## 🎯 Goal
Rollback production from MVP 2.5 → MVP 2.3.1 on Vercel & Railway

## ⏱️ Time: 10-15 minutes total

---

## 📋 What You Need
- [ ] Vercel account access
- [ ] Railway account access  
- [ ] Git commit hash: `fc5fcb8` (MVP 2.3.1)

---

## 🚀 QUICK STEPS

### Step 1: Rollback Backend (Railway) - 5 minutes

```
1. Go to https://railway.app
2. Click your project → Click service (backend)
3. Go to "Deployments" tab
4. Scroll down to find deployment from ~Nov 20, 2024
5. Look for commit fc5fcb8 or tag v2.3.1
6. Click the deployment
7. Click menu (⋮) → "Rollback to this deployment"
8. Wait for green checkmark ✓
9. Check logs - should say "Server running on port 5050"
```

⏱️ Expected time: **3-5 minutes**

---

### Step 2: Rollback Frontend (Vercel) - 5 minutes

```
1. Go to https://vercel.com
2. Click your project → Click "Deployments"
3. Scroll down to find deployment from ~Nov 20, 2024
4. Look for commit fc5fcb8 or tag v2.3.1
5. Click the deployment
6. Click "Promote to Production" button
7. Wait for green checkmark ✓
8. Check logs - should show successful build
```

⏱️ Expected time: **3-5 minutes**

---

### Step 3: Verify - 2 minutes

```
1. Wait 2 minutes for caching
2. Go to https://your-domain.com
3. Try to login
4. Check sidebar appears
5. Check no console errors (F12)
6. Test a few features
```

⏱️ Expected time: **2 minutes**

---

## ✅ How to Know It Worked

After rollback, you should see:
- ✅ MVP 2.3.1 version info (in footer or about page)
- ✅ Sidebar loads after login
- ✅ Dashboard works
- ✅ No CORS errors
- ✅ Database queries work

---

## 🎨 Visual Diagram

```
BEFORE (Current):
  Vercel (MVP 2.5)  →  Railway (MVP 2.5)
  ✓ Latest version

AFTER (Rollback):
  Vercel (MVP 2.3.1) → Railway (MVP 2.3.1)
  ✓ Stable version
```

---

## ⚠️ Important Notes

### Users Will Notice:
- Some features will disappear (from MVP 2.4/2.5)
- UI might look slightly different
- Some new endpoints won't exist

### What Won't Break:
- Database data is safe (no data deletion)
- User accounts still exist
- MongoDB continues working
- Session tokens still valid

### Can We Undo?
- Yes! Same process, select MVP 2.5 deployment instead

---

## 🔍 If You Can't Find Deployment

**Railway:**
1. Click "Deployments" tab
2. Sort by oldest first
3. Look for activity around Nov 20, 2024
4. Check commit message says "2.3.1"

**Vercel:**
1. Click "Deployments" tab
2. Scroll all the way down
3. Look for older deployments
4. Check build log mentions "2.3.1"

---

## 🚨 If Rollback Fails

**Try again:**
1. Click deployment again
2. Check status (should be "Ready")
3. Retry rollback
4. Wait longer (sometimes takes 5-10 min)

**Check logs:**
- Railway: "Logs" tab → look for errors
- Vercel: Click deployment → "Logs" → read errors

**Still stuck?**
- Try rolling back one more version before
- Or push to main and trigger new deploy
- Contact Vercel/Railway support if critical

---

## ✅ Confirmation

After successful rollback:
```
✓ Backend deployment shows fc5fcb8
✓ Frontend deployment shows fc5fcb8
✓ Both services are "Ready" (green)
✓ https://your-domain.com works
✓ Sidebar visible after login
✓ No errors in browser console
```

---

## 📞 Quick Reference

| Service | Where to Go | What to Do |
|---------|------------|-----------|
| Railway | https://railway.app | Find fc5fcb8 → Rollback |
| Vercel | https://vercel.com | Find fc5fcb8 → Promote to Production |
| Test | https://your-domain.com | Login and verify |
| Logs | Railway/Vercel dashboard | Check for errors |

---

## 🎉 Done!

You've successfully rolled back to MVP 2.3.1!

**Next steps:**
1. Notify your team
2. Monitor logs for issues
3. Test critical features
4. Document why you rolled back

---

## Questions?

See: `ROLLBACK_VERCEL_RAILWAY_MVP_2.3.1.md` for detailed guide
