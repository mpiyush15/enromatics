# Student Portal - Complete Project Structure

## Frontend Directory Layout

```
frontend/
├── app/
│   ├── student/                           # Student Portal Routes
│   │   ├── login/
│   │   │   └── page.tsx                   # Student login (subdomain-based)
│   │   │       ├── Tenant detection
│   │   │       ├── Email/password form
│   │   │       ├── Demo credentials display
│   │   │       └── Redirects to /student/home
│   │   │
│   │   ├── home/
│   │   │   └── page.tsx                   # Student dashboard
│   │   │       ├── Student greeting
│   │   │       ├── Quick navigation cards
│   │   │       ├── Profile fetch
│   │   │       └── Logout button
│   │   │
│   │   ├── academics/
│   │   │   └── page.tsx                   # Academics module
│   │   │       ├── Course progress
│   │   │       ├── Average score
│   │   │       ├── Attendance tracking
│   │   │       └── Responsive layout
│   │   │
│   │   ├── assignments/
│   │   │   └── page.tsx                   # Assignments list
│   │   │       ├── Status filtering
│   │   │       ├── Color-coded badges
│   │   │       ├── Due date display
│   │   │       └── Score information
│   │   │
│   │   ├── payments/
│   │   │   └── page.tsx                   # Payments & fees
│   │   │       ├── Summary cards
│   │   │       ├── Payment history
│   │   │       ├── Invoice downloads
│   │   │       └── Pay now button
│   │   │
│   │   └── profile/
│   │       └── page.tsx                   # Student profile
│   │           ├── View profile info
│   │           ├── Edit capabilities
│   │           ├── Enrolled batches
│   │           └── Payment summary
│   │
│   ├── tenant/                            # Tenant Admin Routes (existing)
│   │   ├── login/
│   │   ├── dashboard/
│   │   └── ...
│   │
│   ├── dashboard/                         # Admin Routes (existing)
│   │   ├── admin/
│   │   ├── client/
│   │   └── ...
│   │
│   └── page.tsx                           # Home page
│
├── lib/
│   ├── middleware/
│   │   └── tenantContext.ts               # Subdomain extraction utility
│   │       ├── extractTenantFromHost()
│   │       └── getTenantFromBrowser()
│   │
│   └── ... (existing)
│
├── middleware.ts                          # Next.js middleware
│   ├── getSubdomain()
│   ├── handleTenantSubdomain()
│   ├── getCookieDomain()
│   └── Tenant isolation & routing
│
├── components/                            # React components (existing)
│   └── dashboard/
│
├── public/                                # Static assets
│
├── styles/                                # CSS/Tailwind
│
├── .env.local                             # Environment variables
│   └── NEXT_PUBLIC_API_URL=...
│
├── package.json                           # Dependencies
│
├── tsconfig.json                          # TypeScript config
│
├── next.config.js                         # Next.js config
│
└── README.md                              # Project documentation


Documentation Files (Root Directory)
├── STUDENT_PORTAL_SETUP.md                # Architecture & implementation guide
├── STUDENT_PORTAL_TESTING.md              # Testing instructions
└── STUDENT_PORTAL_IMPLEMENTATION.md       # Complete implementation summary
```

---

## Database Schema

### Students Collection
```mongodb
{
  _id: ObjectId("65xyz..."),
  name: "Vivek Khanna",
  email: "pixelsadvertise@gmail.com",
  password: "$2b$10$...",                  // Hashed with bcrypt
  phone: "+91-98765-43210",
  tenantId: ObjectId("4b778ad5..."),
  enrolledBatches: [
    ObjectId("batch1..."),
    ObjectId("batch2...")
  ],
  role: "student",
  status: "active",
  metadata: {
    lastLogin: ISODate("2024-01-15T10:30:00Z"),
    loginCount: 42,
    firstEnrollmentDate: ISODate("2023-06-01T00:00:00Z"),
    totalPaid: 15000,
    balance: 5000
  },
  createdAt: ISODate("2023-06-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

### Tenants Collection
```mongodb
{
  _id: ObjectId("4b778ad5..."),
  name: "Prasanagar Coaching Classes",
  subdomain: "prasanagar",
  email: "info@prasanagar.com",
  phone: "+91-98765-00000",
  logo: "https://...",
  status: "active",
  subscription: {
    plan: "premium",
    startDate: ISODate("2023-01-01T00:00:00Z"),
    endDate: ISODate("2025-01-01T00:00:00Z")
  },
  createdAt: ISODate("2023-01-01T00:00:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

## API Endpoints Required

### Authentication
```
POST /api/auth/login
Request: {
  email: "pixelsadvertise@gmail.com",
  password: "test123"
}
Response: {
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: {
    _id: "65xyz...",
    name: "Vivek Khanna",
    email: "pixelsadvertise@gmail.com",
    role: "student"
  }
}
```

### Student Profile
```
GET /api/student/profile
Headers: Authorization: Bearer {token}
Response: {
  _id: "65xyz...",
  name: "Vivek Khanna",
  email: "pixelsadvertise@gmail.com",
  phone: "+91-98765-43210",
  enrolledBatches: ["Batch A", "Batch B"],
  totalPaid: 15000,
  balance: 5000
}
```

### Academics
```
GET /api/student/academics
Response: {
  batchName: "IIT-JEE 2024",
  averageScore: 82.5,
  totalClasses: 120,
  classesAttended: 95,
  courses: [
    { name: "Mathematics", progress: 85 },
    { name: "Physics", progress: 75 },
    { name: "Chemistry", progress: 90 }
  ]
}
```

### Assignments
```
GET /api/student/assignments
Response: {
  assignments: [
    {
      _id: "assign1...",
      title: "Calculus Problem Set 5",
      subject: "Mathematics",
      dueDate: "2024-01-20T23:59:59Z",
      status: "pending",
      score: null,
      totalMarks: 50
    },
    {
      _id: "assign2...",
      title: "Newton's Laws Exercise",
      subject: "Physics",
      dueDate: "2024-01-18T23:59:59Z",
      status: "submitted",
      score: 45,
      totalMarks: 50
    }
  ]
}
```

### Payments
```
GET /api/student/payments
Response: {
  totalFees: 50000,
  totalPaid: 35000,
  balance: 15000,
  payments: [
    {
      _id: "pay1...",
      amount: 15000,
      date: "2023-12-15T10:30:00Z",
      status: "completed",
      method: "bank_transfer",
      invoiceUrl: "https://..."
    },
    {
      _id: "pay2...",
      amount: 20000,
      date: "2023-11-01T10:30:00Z",
      status: "completed",
      method: "cashfree",
      invoiceUrl: "https://..."
    }
  ]
}
```

---

## Component Hierarchy

```
StudentPortal
├── /student/login
│   ├── TenantDetection
│   ├── LoginForm
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   └── SubmitButton
│   ├── DemoCredentials
│   └── StatusMessage
│
├── /student/home
│   ├── Header
│   │   ├── TenantBranding
│   │   ├── StudentGreeting
│   │   └── LogoutButton
│   ├── StudentInfo
│   │   └── ProfileCard
│   └── NavigationGrid
│       ├── Card (Academics)
│       ├── Card (Assignments)
│       ├── Card (Payments)
│       └── Card (Profile)
│
├── /student/academics
│   ├── Header
│   ├── BatchInfo
│   └── CourseList
│       └── CourseCard[]
│
├── /student/assignments
│   ├── Header
│   ├── FilterButtons
│   └── AssignmentList
│       └── AssignmentCard[]
│
├── /student/payments
│   ├── Header
│   ├── SummaryCards
│   │   ├── TotalFeesCard
│   │   ├── PaidCard
│   │   └── BalanceCard
│   ├── PayButton
│   └── PaymentHistory
│       └── TransactionCard[]
│
└── /student/profile
    ├── Header
    ├── ProfileInfo
    │   ├── NameField
    │   ├── EmailField
    │   ├── PhoneField
    │   └── RollNumberField
    ├── EnrolledBatches
    ├── PaymentSummary
    └── EditButton
```

---

## Middleware Flow

```
User Request to /student/home
        ↓
Next.js Middleware (middleware.ts)
        ↓
Extract Host Header
        ↓
getSubdomain(host)
        ↓
Subdomain Found? (prasanagar)
        ↓ Yes
handleTenantSubdomain()
        ↓
Check Token Cookie
        ↓
Token Valid?
        ├─ Yes → Next()
        └─ No  → Redirect to /student/login
        ↓
Request reaches /student/home page
        ↓
TenantContext Hook
        ↓
getTenantFromBrowser()
        ↓
Display tenant-branded content
```

---

## Authentication Flow

```
User visits prasanagar.lvh.me:3000/student/login
        ↓
Page loads, getTenantFromBrowser() returns "prasanagar"
        ↓
Display login form with tenant branding
        ↓
User enters: pixelsadvertise@gmail.com / test123
        ↓
POST /api/auth/login
        ↓
Backend validates credentials against Students collection
        ↓
Valid?
├─ Yes → Generate JWT token
│         ↓
│         Return token & user data
│         ↓
│         Save token to localStorage
│         ↓
│         Redirect to /student/home
│
└─ No  → Return "Invalid credentials" error
         ↓
         Display error message
```

---

## Data Flow Diagram

```
Frontend App
├── /student/login
│   └── POST /api/auth/login ──→ Backend
│       │                            └─ Validate Student
│       └─ Token Received ────┘
│
├── /student/home
│   └── GET /api/student/profile ──→ Backend
│       │                             └─ Query Students Collection
│       └─ Student Data ──────┘
│
├── /student/academics
│   └── GET /api/student/academics ──→ Backend
│       │                               └─ Aggregate Course Data
│       └─ Course Progress ────┘
│
├── /student/assignments
│   └── GET /api/student/assignments ──→ Backend
│       │                                └─ Query Assignments
│       └─ Assignment List ────┘
│
└── /student/payments
    └── GET /api/student/payments ──→ Backend
        │                            └─ Calculate Fees & Payments
        └─ Payment Data ──────┘
```

---

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Enromatics Student Portal
```

### Backend (.env)
```
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/enromatics
DB_NAME=enromatics

# Authentication
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=7d
BCRYPT_ROUNDS=10

# CORS
CORS_ORIGIN=http://localhost:3000

# Payment Gateway
CASHFREE_API_KEY=xxx
CASHFREE_SECRET=xxx
```

---

## Key Implementation Details

### Subdomain Extraction
```typescript
// Extract "prasanagar" from "prasanagar.lvh.me:3000"
extractTenantFromHost("prasanagar.lvh.me:3000") → "prasanagar"

// Works with multiple domain patterns
"prasanagar.lvh.me:3000" → "prasanagar"
"prasanagar.enromatics.co" → "prasanagar"
"localhost:3000" → null (fallback)
```

### Token Management
```typescript
// Save token after login
localStorage.setItem('authToken', token)

// Use token in API requests
fetch('/api/student/profile', {
  headers: { Authorization: `Bearer ${token}` }
})

// Clear on logout
localStorage.removeItem('authToken')
```

### Tenant Isolation (Backend Responsibility)
```javascript
// Every API must validate tenantId
app.get('/api/student/profile', authenticateToken, (req, res) => {
  const tenantId = req.user.tenantId;
  const studentId = req.user._id;
  
  // Query only this student's data for this tenant
  Student.findOne({ _id: studentId, tenantId })
});
```

---

## Testing Checklist

- [ ] Login page displays subdomain branding
- [ ] Demo credentials visible
- [ ] Login with test credentials works
- [ ] Redirect to /student/home successful
- [ ] Student name displays
- [ ] Navigation cards clickable
- [ ] Each sub-page loads
- [ ] Logout clears localStorage
- [ ] Cannot access pages without token
- [ ] Mobile responsive design works

---

## Deployment Steps

1. **Frontend**
   - Build: `npm run build`
   - Deploy to Vercel/Railway
   - Configure environment variables

2. **Backend**
   - Implement APIs
   - Configure database
   - Set up authentication
   - Deploy to Railway/Heroku

3. **DNS**
   - Configure subdomain records
   - Point to deployment URL
   - Enable SSL certificates

4. **Testing**
   - Test login flow
   - Test all sub-pages
   - Verify data display
   - Test logout

---

**Version:** 1.0  
**Last Updated:** January 2024  
**Status:** Ready for Backend Implementation
