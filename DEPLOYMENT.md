# Deployment Guide - Pixels Web Dashboard

This guide will walk you through deploying both the frontend (Next.js) and backend (Express) applications to production.

## 📋 Prerequisites

- GitHub repository with your code
- [Vercel Account](https://vercel.com) (for frontend)
- [Railway Account](https://railway.app) or [Render Account](https://render.com) (for backend)
- MongoDB Atlas database (already configured)
- Meta WhatsApp Business Account (approved)

---

## 🚀 Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy Backend
1. Click "Deploy from GitHub repo"
2. Select your repository: `enromatics`
3. Railway will detect it's a Node.js project
4. Click "Add variables" to configure environment

### Step 3: Configure Environment Variables
Add all these variables in Railway dashboard:

```env
NODE_ENV=production
PORT=5050
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/enromatics
JWT_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
NEXTAUTH_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
NEXTAUTH_URL=https://your-frontend-url.vercel.app
SUPER_ADMIN_EMAIL=piyush@pixelsdigital.tech

# Facebook
FACEBOOK_APP_ID=1193384345994095
FACEBOOK_APP_SECRET=e80034de1f0bc9013b3b7c2fbe5f3ec7

# WhatsApp Cloud API
WHASTAPPAPP_ID=2094709584392829
WHATSAPP_PHONE_NUMBER_ID=835322316337446
WHATSAPP_BUSINESS_ACCOUNT_ID=2103078623833174
WHATSAPP_ACCESS_TOKEN=your-permanent-token-here
META_APP_SECRET=b74799186bb64571487423a924d1a3ca
META_API_VERSION=v21.0

# Frontend URL (will be updated after deploying frontend)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Step 4: Configure Build Settings
Railway should auto-detect these, but verify:
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Step 5: Deploy
1. Click "Deploy"
2. Wait for deployment to complete
3. Copy your Railway URL (e.g., `https://your-app.railway.app`)
4. **Save this URL** - you'll need it for frontend configuration

---

## 🌐 Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click "Add New Project"

### Step 2: Import Repository
1. Select your GitHub repository: `enromatics`
2. Click "Import"

### Step 3: Configure Project Settings
1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### Step 4: Configure Environment Variables
Click "Environment Variables" and add:

```env
NEXTAUTH_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
MONGODB_URI=mongodb+srv://pixelsagency:Pm02072023@pixelsagency.664wxw1.mongodb.net/enromatics

# Backend API URL (use your Railway URL from Step 1)
NEXT_PUBLIC_API_URL=https://your-app.railway.app

# Facebook
FACEBOOK_APP_ID=1193384345994095
FACEBOOK_APP_SECRET=e80034de1f0bc9013b3b7c2fbe5f3ec7

# WhatsApp Cloud API
WHASTAPPAPP_ID=2094709584392829
WHATSAPP_PHONE_NUMBER_ID=835322316337446
WHATSAPP_BUSINESS_ACCOUNT_ID=2103078623833174
WHATSAPP_ACCESS_TOKEN=your-permanent-token-here

# Meta Ads
META_API_VERSION=v21.0

# Payload CMS (if using)
DATABASE_URI=mongodb+srv://pixelsagency:Pm%4002072023@pixelsagency.664wxw1.mongodb.net/forteStudioz
PAYLOAD_SECRET=IH/GtXtyaojNZMl+ArYnvzOWy42PrOQeYCC8mOcZNO4=
```

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build and deployment (3-5 minutes)
3. Copy your Vercel URL (e.g., `https://your-app.vercel.app`)

---

## 🔄 Part 3: Update Backend CORS

After deploying frontend, you need to update backend to allow your production frontend URL:

### Option A: Via Railway Dashboard
1. Go to Railway dashboard
2. Select your backend project
3. Click "Variables"
4. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Backend will automatically redeploy

### Option B: Via Code (Recommended)
1. Already configured in `backend/src/server.js`
2. Just set `FRONTEND_URL` environment variable in Railway

---

## 🔐 Part 4: Generate Permanent WhatsApp Access Token

The temporary token expires in 1-2 hours. For production, create a permanent token:

### Steps:
1. Go to [Facebook Business Settings](https://business.facebook.com/settings)
2. Click "System Users" (left sidebar)
3. Click "Add" to create a new system user
4. Name: "WhatsApp API Production"
5. Role: Admin
6. Click "Generate New Token"
7. Select your WhatsApp app: **2094709584392829**
8. Permissions needed:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
9. Token Expiration: **Never**
10. Copy the token and save it securely
11. Update both Railway and Vercel environment variables with this token

---

## ✅ Part 5: Verify Deployment

### Test Backend:
```bash
curl https://your-app.railway.app/api/test
```

### Test Frontend:
1. Visit `https://your-app.vercel.app`
2. Try logging in
3. Check WhatsApp dashboard

### Common Issues:

**1. CORS Errors**
- Verify `FRONTEND_URL` is set correctly in Railway
- Check Railway logs for CORS errors

**2. Database Connection Failed**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access (allow all IPs: `0.0.0.0/0`)

**3. WhatsApp Not Working**
- Ensure WABA account is approved (not PENDING)
- Verify permanent access token is set
- Check Phone Number ID is correct

**4. Authentication Issues**
- Verify `NEXTAUTH_SECRET` is the same in both deployments
- Check cookies are being set (must use HTTPS in production)

---

## 📊 Part 6: Post-Deployment

### Monitor Logs
**Railway:**
- Dashboard → Your Project → "Logs" tab
- Check for errors

**Vercel:**
- Dashboard → Your Project → "Logs" tab
- Check build and runtime logs

### Set Up Custom Domain (Optional)
**Frontend (Vercel):**
1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `dashboard.pixelsdigital.tech`)
3. Follow DNS configuration steps
4. Update `NEXTAUTH_URL` to your custom domain

**Backend (Railway):**
1. Go to Settings → Networking
2. Add custom domain
3. Update `FRONTEND_URL` in environment variables

### Database Backups
1. Go to MongoDB Atlas
2. Set up automated backups
3. Configure backup schedule (daily recommended)

---

## 🔄 Updating Your Deployment

### To Update Backend:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Railway will auto-deploy on push.

### To Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel will auto-deploy on push.

---

## 📝 Environment Variables Checklist

### Backend (Railway):
- [x] NODE_ENV
- [x] PORT
- [x] MONGODB_URI
- [x] JWT_SECRET
- [x] NEXTAUTH_SECRET
- [x] SUPER_ADMIN_EMAIL
- [x] FACEBOOK_APP_ID
- [x] FACEBOOK_APP_SECRET
- [x] WHASTAPPAPP_ID
- [x] WHATSAPP_PHONE_NUMBER_ID
- [x] WHATSAPP_BUSINESS_ACCOUNT_ID
- [x] WHATSAPP_ACCESS_TOKEN (permanent)
- [x] META_APP_SECRET
- [x] FRONTEND_URL

### Frontend (Vercel):
- [x] NEXTAUTH_SECRET
- [x] NEXTAUTH_URL
- [x] MONGODB_URI
- [x] NEXT_PUBLIC_API_URL
- [x] FACEBOOK_APP_ID
- [x] FACEBOOK_APP_SECRET
- [x] WHASTAPPAPP_ID
- [x] WHATSAPP_PHONE_NUMBER_ID
- [x] WHATSAPP_BUSINESS_ACCOUNT_ID
- [x] WHATSAPP_ACCESS_TOKEN (permanent)

---

## 🆘 Getting Help

**Railway Issues:**
- [Railway Docs](https://docs.railway.app)
- Railway Discord

**Vercel Issues:**
- [Vercel Docs](https://vercel.com/docs)
- Vercel Support Chat

**WhatsApp API Issues:**
- [Meta Developer Docs](https://developers.facebook.com/docs/whatsapp)
- Meta Support Portal

---

## 🎉 You're Live!

Your dashboard should now be accessible at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend API**: `https://your-app.railway.app`

Share your production URL and start using the dashboard! 🚀
