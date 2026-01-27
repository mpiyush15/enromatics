# 📱 Student App - React Native

**Dynamic Branding Mobile App for Shree Coaching Classes**

A powerful yet simple React Native student portal that connects to your Enromatics backend. Automatic institute branding based on login tenant.

---

## ✨ Features

✅ **Dynamic Institute Branding**
- Logo, colors, and name load from backend
- Different institutes = different app appearance
- No need to rebuild for each institute

✅ **Student Features**
- 📋 **Attendance** - View attendance percentage, daily records
- 📊 **Marks** - Subject-wise scores, average, grades
- 📢 **Notices** - Announcements and important updates
- 👤 **Profile** - Student information and settings
- 🔐 **Secure Authentication** - JWT token storage

✅ **Powerful Yet Simple**
- Single codebase for all institutes
- JWT authentication
- Real-time data from backend
- Native app performance

---

## 🏗️ Architecture

```
StudentApp (React Native + Expo)
    ↓
Connects to existing backend:
- /api/auth/login
- /api/students/:id/attendance
- /api/students/:id/marks
- /api/notices
- /api/tenants/:id (for branding)
    ↓
MongoDB (same database as web)
```

---

## 🚀 Quick Start

### 1. **Install Dependencies**

```bash
cd StudentApp
npm install
# or
yarn install
```

### 2. **Configure Backend URL**

Edit `App.tsx` and set your backend URL:

```typescript
const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.x:5050';
setApiUrl(backendUrl);
```

**For Local Testing:**
- Replace `192.168.1.x` with your computer's IP
- Ensure Android device is on same network

**For Production:**
- Use your actual backend domain (e.g., `https://api.enromatics.com`)

### 3. **Start Dev Server**

```bash
# Using Expo Go (instant preview on phone)
npm start

# Or build for Android
npm run android

# Or build for iOS (Mac only)
npm run ios
```

---

## 📱 Testing with Expo Go

1. **Install Expo Go** on your Android/iOS phone
2. **Run:** `npm start`
3. **Scan QR code** shown in terminal
4. **App loads instantly** on your phone!

---

## 🏢 Shree Coaching Classes Setup

**Tenant Configuration (Already Set):**
- TenantId: `4b778ad5`
- Name: Shree Coaching Classes
- Logo: Already configured in backend
- Theme Color: Blue (#3b82f6)

**Test Login:**
```
Email: student@shreecodeaching.com (example)
Password: student_password
```

---

## 📱 Building APK for Android

### Option 1: **Fast Local Build** (Recommended)

```bash
npm install -g eas-cli
eas build --platform android --local
```

Creates `StudentApp.apk` file → share with client

### Option 2: **Cloud Build** (EAS Services)

```bash
eas build --platform android
```

Builds in Expo cloud → download APK link

### Option 3: **Share Expo Link** (Instant, No APK)

```bash
npm start
# Share QR code → Anyone with Expo Go scans → App runs instantly
```

---

## 📂 Project Structure

```
StudentApp/
├── App.tsx                           # Main entry point
├── package.json                      # Dependencies
├── babel.config.js                   # Babel config
├── index.js                          # App initialization
│
├── src/
│   ├── context/
│   │   ├── AuthContext.tsx           # Login & token management
│   │   └── BrandingContext.tsx       # Dynamic institute branding
│   │
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Email/Password login
│   │   ├── SplashScreen.tsx          # Loading screen
│   │   ├── DashboardScreen.tsx       # Home with quick stats
│   │   ├── AttendanceScreen.tsx      # Attendance view
│   │   ├── MarksScreen.tsx           # Marks & grades
│   │   ├── NoticesScreen.tsx         # Announcements
│   │   └── ProfileScreen.tsx         # Student profile
│   │
│   └── utils/
│       └── (add helpers if needed)
│
└── assets/                           # Icons, images
```

---

## 🔐 Authentication Flow

```
1. User enters email + password on LoginScreen
   ↓
2. POST /api/auth/login
   Backend validates → Returns JWT token + tenantId
   ↓
3. App stores token in SecureStore (encrypted device storage)
   ↓
4. Fetch institute branding from GET /api/tenants/:tenantId
   ↓
5. Apply branding to all screens dynamically
   ↓
6. Navigate to Dashboard
   ↓
7. All future requests include JWT in Authorization header
   ↓
8. On logout: Clear token + return to Login
```

---

## 🎨 Dynamic Branding

**What Gets Customized:**

```javascript
branding = {
  logoUrl: "https://...",      // Institute logo
  appName: "Shree Coaching",   // App title
  primaryColor: "#3b82f6",     // Header, buttons
  accentColor: "#10b981",      // Action buttons
  backgroundColor: "#f3f4f6",  // App background
  themeColor: "#3b82f6"        // Alternative color
}
```

**Applied to:**
- Header background color
- Button colors
- Text colors
- Border accent colors

---

## 📡 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Student login |
| `/api/tenants/:tenantId` | GET | Fetch institute branding |
| `/api/students/:id/dashboard` | GET | Dashboard stats |
| `/api/students/:id/attendance` | GET | Attendance records |
| `/api/students/:id/marks` | GET | Grades & scores |
| `/api/notices` | GET | Announcements |

---

## 🔧 Customization

### **Change Colors**
Edit `src/screens/LoginScreen.tsx` - change `#2563eb` to your color

### **Change App Name**
Edit `App.tsx` - change `"Student App"` in Expo config

### **Add More Screens**
1. Create new file in `src/screens/`
2. Add to navigation stack in `App.tsx`
3. Add button in `DashboardScreen.tsx`

### **Change Backend URL**
Edit line in `App.tsx`:
```typescript
const backendUrl = 'https://your-domain.com';
```

---

## ⚠️ Troubleshooting

### **"Connection Failed" Error**
- Check backend is running
- Verify IP address is correct
- Ensure phone is on same network

### **Login Not Working**
- Check email/password in backend database
- Verify tenantId is set correctly
- Check backend logs for errors

### **App Crashes on Startup**
- Clear Expo cache: `expo start -c`
- Check console logs: `npm start` shows errors
- Verify all dependencies installed: `npm install`

### **Branding Not Loading**
- Verify tenant exists: `GET /api/tenants/{tenantId}`
- Check logo URL is valid and accessible
- Add debug logs in BrandingContext

---

## 📦 Dependencies

- **react-native** - Native mobile app framework
- **expo** - Run without native code knowledge
- **@react-navigation** - Screen navigation
- **axios** - API calls
- **expo-secure-store** - Secure token storage
- **moment** - Date formatting

---

## 📤 Deployment

### **For Client Distribution:**

1. **Build APK:**
   ```bash
   eas build --platform android --local
   ```

2. **Share with Client:**
   - Email the `.apk` file
   - Or: Create shareable Expo link
   - Or: Upload to Google Play Store

3. **Client Installation:**
   - Android: Download APK → Install → Open
   - iOS: Share Expo link → Scan → Open

---

## 🐛 Debugging

### **View Console Logs**
```bash
npm start
# See all logs in terminal
```

### **Check Network Requests**
```javascript
// Add to any API call
console.log('📡 API Call:', url);
console.log('Response:', response.data);
```

### **Test Specific Screen**
Edit `App.tsx` initialRouteName:
```typescript
initialRouteName={initialRoute} // Change to 'Dashboard', 'Login', etc.
```

---

## 📞 Support

**Issues?**
1. Check backend is running
2. Verify network connectivity
3. Check console logs: `npm start`
4. Verify tenant configuration in database

---

## ✅ Next Steps

- [ ] Build APK: `eas build --platform android --local`
- [ ] Test on physical Android device
- [ ] Customize colors/branding if needed
- [ ] Share APK link with mpiyush2727@gmail.com
- [ ] Deploy production backend URL

---

**Created:** January 27, 2026  
**For:** Shree Coaching Classes  
**Backend:** Enromatics (Pixels Web Dashboard)  
**Status:** Ready for Testing ✅
