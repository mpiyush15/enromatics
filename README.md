# Enromatics Dashboard - MVP v1.1

A comprehensive institute management system for coaching institutes with student management, attendance tracking, academics, WhatsApp integration, and accounting features.

## 🚀 Production URLs

- **Frontend**: https://enromatics.com
- **Backend API**: https://endearing-blessing-production-c61f.up.railway.app
- **GitHub**: https://github.com/mpiyush15/enromatics

## 📦 Tech Stack

### Frontend
- **Framework**: Next.js 15.3.2 (React 19)
- **Styling**: Tailwind CSS 4.1.7
- **UI Components**: Radix UI, Lucide Icons, Framer Motion
- **Type Safety**: TypeScript 5.8.3
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT with httpOnly cookies
- **Deployment**: Railway (Port 8080)

## 🏗️ Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database & configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth & role protection
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── scripts/        # Utility scripts
│   │   └── server.js       # Entry point
│   └── package.json
│
├── frontend/
│   ├── app/               # Next.js app router
│   │   ├── dashboard/     # Admin dashboards
│   │   ├── student/       # Student portal
│   │   ├── login/         # Authentication
│   │   └── api/           # (Deleted - using Express backend)
│   ├── components/        # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities & configs
│   ├── types/             # TypeScript definitions
│   └── package.json
│
└── DEPLOYMENT.md          # Deployment guide
```

## ✨ Features

### Authentication & Authorization
- Multi-role system: SuperAdmin, Admin, TenantAdmin, Employee, AdsManager, Student
- JWT-based authentication with httpOnly cookies
- Role-based access control (RBAC)
- Separate student authentication portal

### Student Management
- Student registration with auto-generated roll numbers
- Profile management with course/batch tracking
- Fee management and payment tracking
- Student portal with dashboard

### Attendance System
- Date-based attendance marking
- Bulk operations (mark all present/absent)
- Monthly attendance reports
- Student attendance history with calendar view
- Filtering by course and batch

### Academics Module
- Test scheduling and management
- Marks entry with automatic grade calculation
- Test reports and analytics
- Subject-wise performance tracking
- Student test history

### Accounting Features
- Fee receipts generation
- Payment tracking (cash, online, cheque)
- Expense management by category
- Refund processing with approval workflow
- Financial overview and reports

### WhatsApp Integration
- Template-based messaging
- Contact management
- Campaign creation and tracking
- Bulk messaging to students/leads
- Message status tracking

### Tenant Management (Multi-tenancy)
- Institute/tenant creation
- Staff management within tenants
- Tenant-specific data isolation
- Subscription and plan management

## 🔧 Environment Variables

### Backend (Railway)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
FRONTEND_URL=https://enromatics.com
PORT=8080

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_VERIFY_TOKEN=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```

### Frontend (Vercel)
```env
NEXT_PUBLIC_API_URL=https://endearing-blessing-production-c61f.up.railway.app
```

## 🚀 Local Development

### Backend
```bash
cd backend
npm install
npm run dev  # Runs on port 8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # Runs on port 3000
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/date` - Get attendance by date
- `GET /api/student-auth/attendance` - Student attendance history

### Academics
- `GET /api/academics/tests` - List tests
- `POST /api/academics/tests` - Create test
- `POST /api/academics/tests/:id/marks` - Enter marks
- `GET /api/academics/reports` - Get analytics

### Accounts
- `POST /api/accounts/receipts/create` - Generate fee receipt
- `GET /api/accounts/receipts/search` - Search receipts
- `POST /api/accounts/expenses` - Record expense
- `POST /api/accounts/refunds` - Process refund

## 🎯 MVP v1.1 Features

### ✅ Completed
- Full authentication system with role-based access
- Student management with CRUD operations
- Attendance tracking with calendar view
- Test management and marks entry
- Fee receipts and payment tracking
- Expense management
- Refund processing
- WhatsApp integration
- Tenant management
- Production deployment on Vercel + Railway
- Environment-based API configuration
- Optimized build configuration
- Removed debug logs from production

### 🔄 Optimizations (v1.1)
- Removed unused documentation files (12 markdown files)
- Deleted backup files and test artifacts
- Cleaned up empty folders
- Removed debug console.logs
- Added Next.js compiler optimizations
- Enabled package import optimizations
- Configured automatic console removal in production
- Optimized image formats (AVIF, WebP)

## 📊 Performance Optimizations

- **Code Splitting**: Automatic route-based splitting by Next.js
- **Tree Shaking**: Unused code elimination in production
- **Console Removal**: Debug logs removed in production builds
- **Package Optimization**: Optimized imports for lucide-react, framer-motion, react-icons
- **Image Optimization**: Automatic AVIF/WebP conversion
- **Caching**: Configured 60s minimum cache TTL for images

## 🔐 Security

- httpOnly cookies for JWT storage
- CORS configured for production domain
- Environment variables for sensitive data
- Password hashing with bcrypt
- Role-based middleware protection
- MongoDB injection prevention

## 📈 Future Enhancements

- Email notifications
- SMS integration
- Advanced analytics dashboard
- Mobile app
- Report exports (PDF/Excel)
- Payment gateway integration
- Online exam module
- Library management

## 👥 Team

Developed by Pixels Agency for Enromatics

## 📄 License

Proprietary - All rights reserved

---

**Version**: 1.1.0  
**Last Updated**: November 16, 2025
