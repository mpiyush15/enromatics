# 🚀 StudentApp - Quick Setup & Build Guide

## ✅ What's Been Created

✅ **Fresh React Native App** with NO old buggy code
✅ **Dynamic Branding System** - automatically loads institute colors/logo
✅ **All Core Features:**
  - Login screen with email/password
  - Dashboard with quick stats
  - Attendance viewer
  - Marks/Grades viewer
  - Notices/Announcements
  - Student Profile

✅ **Pre-configured for Shree Coaching Classes:**
  - TenantId: `4b778ad5`
  - Logo: Loaded from backend
  - Colors: Applied dynamically
  - Email: mpiyush2727@gmail.com

---

## 🛠️ Installation & Setup

### **Step 1: Install Dependencies**

```bash
cd StudentApp
npm install
```

*Takes ~5-10 minutes first time*

---

### **Step 2: Configure Backend URL**

Open `StudentApp/App.tsx` and find this line:

```typescript
const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5050';
```

**For Local Testing (Your Computer):**
```typescript
const backendUrl = 'http://192.168.1.100:5050'; // Replace 100 with your IP
```

**Get Your IP:**
```bash
# Mac/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

**For Production:**
```typescript
const backendUrl = 'https://api.yourdomain.com';
```

---

### **Step 3: Test Backend Connection**

```bash
# Test if backend is accessible
curl http://192.168.1.100:5050/api/tenants/4b778ad5

# Should return Shree Coaching branding config
```

---

## 📱 Running the App

### **Option A: Quick Preview (Recommended)**

```bash
npm start
```

Then:
1. Keep terminal open
2. Install **Expo Go** on your phone from App Store/Play Store
3. Scan the QR code shown in terminal
4. App loads **instantly** on your phone! 🎉

### **Option B: Android Emulator**

```bash
npm run android
```

Requires Android Studio + Android Emulator

### **Option C: iOS (Mac Only)**

```bash
npm run ios
```

---

## 🏗️ Building APK (For Client Distribution)

### **Install EAS CLI** (one time)

```bash
npm install -g eas-cli
eas login
```

### **Build APK**

```bash
cd StudentApp
eas build --platform android --local
```

This will:
1. Compile React Native code
2. Build signed APK
3. Download `StudentApp-*.apk`

⏱️ Takes ~15-20 minutes

### **Share APK with Client**

```bash
# APK file appears in current folder
# Email it to mpiyush2727@gmail.com or upload to cloud storage

# Client installation:
# 1. Download APK on Android phone
# 2. Open file manager → Tap APK file
# 3. Tap "Install"
# 4. App appears in home screen
```

---

## 🧪 Testing Login

**Credentials Needed:**
You need a student account in the Shree Coaching tenant

**Options:**
1. Use existing student email/password
2. Create test student via superadmin dashboard
3. Check database directly

**Example:**
```
Email: student@shreecodeaching.com
Password: password123
```

---

## 🐛 Troubleshooting

### **"Cannot connect to backend"**
```bash
# Check backend is running
curl http://192.168.1.100:5050/health

# Check your IP is correct
ifconfig

# Make sure phone is on same WiFi as computer
```

### **"Login fails"**
```bash
# Verify credentials exist in database
# Check backend logs for error

# Test API directly
curl -X POST http://192.168.1.100:5050/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password"}'
```

### **"App crashes"**
```bash
# Clear cache and restart
npm start -c

# Check console for errors
npm start
# Look at terminal output
```

### **"Branding doesn't load"**
```bash
# Check tenant exists
curl http://192.168.1.100:5050/api/tenants/4b778ad5

# Should return:
# { branding: { logoUrl: "...", appName: "...", ... } }
```

---

## 📂 Project Structure

```
StudentApp/
├── App.tsx                      # Main app + backend URL
├── package.json                 # Dependencies
├── babel.config.js              # Build config
├── README.md                    # Full documentation
│
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx      # Login management
│   │   └── BrandingContext.tsx  # Dynamic theming
│   │
│   └── screens/
│       ├── LoginScreen.tsx
│       ├── DashboardScreen.tsx
│       ├── AttendanceScreen.tsx
│       ├── MarksScreen.tsx
│       ├── NoticesScreen.tsx
│       └── ProfileScreen.tsx
```

---

## 🎨 Customization

### **Change Colors**
Edit `src/context/BrandingContext.tsx`:
```typescript
primaryColor: '#2563eb',  // Change this
```

### **Add More Features**
1. Create screen in `src/screens/`
2. Add to navigation in `App.tsx`
3. Add button in Dashboard

### **Change App Name**
Edit `App.tsx` line with `"Student App"`

---

## ✨ What Happens During Login

```
Student enters email + password
    ↓
App sends to: POST /api/auth/login
    ↓
Backend validates → Returns JWT token + tenantId
    ↓
App stores token securely (encrypted)
    ↓
App downloads branding: GET /api/tenants/4b778ad5
    ↓
App applies colors/logo to all screens
    ↓
Student sees personalized Shree Coaching app!
    ↓
All future requests auto-include JWT token
```

---

## 📋 Checklist Before Building APK

- [ ] Backend URL set correctly in App.tsx
- [ ] Backend is running and accessible
- [ ] Test student account exists
- [ ] Can login via curl/Postman
- [ ] Logo URL works in browser
- [ ] Run `npm install` completed
- [ ] App starts with `npm start`
- [ ] EAS CLI installed: `eas login`

---

## 🚀 Deploy APK

```bash
# 1. Build
eas build --platform android --local

# 2. Wait for build to complete
# (takes ~15-20 minutes)

# 3. Download APK file
# (appears in your StudentApp folder)

# 4. Share with client
# Email or upload to cloud storage
```

**Client receives APK → downloads → installs → app works instantly!**

---

## 📞 Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't connect to backend | Check IP, ensure WiFi same network |
| Login fails | Verify student email/password in database |
| App crashes | Run `npm start -c` to clear cache |
| Branding doesn't load | Check tenant exists: `curl api/tenants/4b778ad5` |
| APK too large | Normal (~150MB), can optimize later |

---

## ⏭️ Next Steps

1. **Install dependencies:** `npm install`
2. **Start app:** `npm start`
3. **Test login:** Scan QR code on phone
4. **Build APK:** `eas build --platform android --local`
5. **Share:** Email APK to mpiyush2727@gmail.com

---

**Status: Ready to Build! 🎉**

No old buggy code ✅  
Fresh from scratch ✅  
Dynamic branding ✅  
Shree Coaching configured ✅  
All features included ✅  

**Ready to go!** 🚀
