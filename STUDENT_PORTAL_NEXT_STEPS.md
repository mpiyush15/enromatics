# 🎯 Student Portal - What's Next?

## ✅ Completed (Frontend)

### Pages Created
- [x] `/student/login` - Subdomain-based login with tenant detection
- [x] `/student/home` - Student dashboard with navigation
- [x] `/student/academics` - Course progress tracking
- [x] `/student/assignments` - Assignment list with filtering
- [x] `/student/payments` - Fees and payment history
- [x] `/student/profile` - Student information and editing

### Infrastructure
- [x] Subdomain detection middleware
- [x] Next.js routing middleware
- [x] Tenant context utilities
- [x] Authentication flow UI
- [x] Responsive Tailwind CSS styling
- [x] Error handling and loading states

### Documentation
- [x] Architecture guide (`STUDENT_PORTAL_SETUP.md`)
- [x] Testing instructions (`STUDENT_PORTAL_TESTING.md`)
- [x] Implementation summary (`STUDENT_PORTAL_IMPLEMENTATION.md`)
- [x] Project structure (`STUDENT_PORTAL_STRUCTURE.md`)

---

## 🔴 Pending (Backend Implementation)

### Priority 1 - Authentication (Critical)
```
Task: Implement /api/auth/login endpoint

Details:
- Accept email & password in request body
- Query Students collection by email
- Verify password against stored hash (bcrypt)
- Generate JWT token if valid
- Return token & user data
- Return 401 if invalid credentials

File to create: /backend/src/routes/auth.js
Database: Students collection
Schema: { email, password (hashed), tenantId, role, ... }

Example Response:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIs...",
  user: { _id, name, email, role }
}
```

### Priority 2 - Student Data APIs
```
Task: Implement student information endpoints

1. GET /api/student/profile
   - Fetch student record by ID
   - Include: name, email, phone, enrolledBatches, totalPaid, balance
   - Validate: JWT token, student's tenantId matches request

2. PUT /api/student/profile
   - Update student information
   - Allow editing: name, phone, address
   - Prevent editing: email, role, tenantId

3. GET /api/student/academics
   - Fetch enrolled batches and courses
   - Calculate progress, attendance, average score
   - Return: batchName, courses[], averageScore, totalClasses, attended

4. GET /api/student/assignments
   - Fetch assignments for student's batches
   - Include: title, subject, dueDate, status, score
   - Filter by batch

5. GET /api/student/payments
   - Calculate total fees and paid amount
   - Fetch payment history
   - Return: totalFees, totalPaid, balance, payments[]

All endpoints:
- Require JWT token (Authorization header)
- Validate student's tenantId
- Return 401 if unauthorized
- Return 404 if not found
```

### Priority 3 - Database Setup
```
Task: Ensure correct database collections and indexes

Students Collection:
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed with bcrypt),
  phone: String,
  tenantId: ObjectId (indexed),
  enrolledBatches: [ObjectId],
  role: "student" (indexed),
  status: "active" | "inactive",
  totalPaid: Number,
  balance: Number,
  createdAt: Date,
  updatedAt: Date
}

Required Indexes:
- email (unique)
- tenantId + email (compound, for auth queries)
- role (for role-based queries)
- status (for active student queries)

Test Data Created:
- Email: pixelsadvertise@gmail.com
- Password: test123 (needs bcrypt hash)
- TenantId: 4b778ad5...
- Status: active
```

### Priority 4 - Security Setup
```
Task: Configure JWT and password security

1. JWT Configuration
   - Install: npm install jsonwebtoken
   - Secret key in .env: JWT_SECRET=...
   - Expiry: 7 days recommended
   - Sign with: { _id, email, role, tenantId }

2. Password Hashing
   - Install: npm install bcrypt
   - Hash rounds: 10
   - Hash password on: registration, password reset
   - Verify on: login

3. Environment Variables
   JWT_SECRET=your-secret-key
   JWT_EXPIRY=7d
   BCRYPT_ROUNDS=10
   MONGODB_URI=mongodb://...
```

---

## 📋 Implementation Order

### Phase 1: Core Auth (Day 1)
1. Setup MongoDB indexes for Students collection
2. Implement `/api/auth/login` endpoint
3. Test login with curl:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"pixelsadvertise@gmail.com","password":"test123"}'
   ```
4. Test frontend login: `http://prasanagar.lvh.me:3000/student/login`

### Phase 2: Student Data (Day 2)
5. Implement `/api/student/profile` endpoints (GET/PUT)
6. Implement `/api/student/academics`
7. Test with Postman/curl with Bearer token
8. Test frontend pages load data

### Phase 3: Payment & Assignment Data (Day 3)
9. Implement `/api/student/payments`
10. Implement `/api/student/assignments`
11. Create sample data in database
12. Test all endpoints

### Phase 4: Testing & Deployment (Day 4)
13. Full end-to-end testing
14. Deploy frontend
15. Deploy backend
16. Configure DNS for subdomains
17. Final production testing

---

## 🛠 Backend File Structure (To Create)

```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.js             ← NEW: Login endpoint
│   │   ├── student.js          ← NEW: Student data endpoints
│   │   └── ... (existing)
│   │
│   ├── middleware/
│   │   ├── authenticate.js     ← NEW: JWT verification
│   │   └── validateTenant.js   ← NEW: Tenant isolation
│   │
│   ├── models/
│   │   ├── Student.js          ← EXISTING: Use this
│   │   └── ... (existing)
│   │
│   ├── utils/
│   │   ├── jwt.js              ← NEW: Token generation
│   │   └── password.js         ← NEW: Bcrypt utilities
│   │
│   ├── config/
│   │   └── database.js         ← EXISTING: MongoDB connection
│   │
│   └── index.js                ← EXISTING: Main server file
│
├── .env                        ← UPDATE: Add JWT_SECRET, etc.
└── package.json               ← UPDATE: Add bcrypt, jsonwebtoken
```

---

## 📝 Code Examples

### Example: Login Endpoint
```javascript
// /backend/src/routes/auth.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Student = require('../models/Student');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(password, student.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        _id: student._id,
        email: student.email,
        role: student.role,
        tenantId: student.tenantId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
    
    return res.json({
      success: true,
      token,
      user: {
        _id: student._id,
        name: student.name,
        email: student.email,
        role: student.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

### Example: Authentication Middleware
```javascript
// /backend/src/middleware/authenticate.js

const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
```

### Example: Student Profile Endpoint
```javascript
// /backend/src/routes/student.js

const authenticate = require('../middleware/authenticate');
const Student = require('../models/Student');

router.get('/profile', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({
      _id: req.user._id,
      tenantId: req.user.tenantId
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      _id: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      enrolledBatches: student.enrolledBatches,
      totalPaid: student.totalPaid,
      balance: student.balance
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
```

---

## 🧪 Testing Commands

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pixelsadvertise@gmail.com",
    "password": "test123"
  }'
```

### Test Student Profile (with token)
```bash
curl -X GET http://localhost:3001/api/student/profile \
  -H "Authorization: Bearer {your-token-here}"
```

### Test Frontend Login
1. Start backend: `npm run dev` (on port 3001)
2. Start frontend: `cd frontend && npm run dev` (on port 3000)
3. Visit: `http://prasanagar.lvh.me:3000/student/login`
4. Login with: pixelsadvertise@gmail.com / test123
5. Should redirect to `/student/home`

---

## 📦 Dependencies to Install

### Backend
```bash
npm install express
npm install mongoose
npm install jsonwebtoken
npm install bcrypt
npm install dotenv
npm install cors
```

### Frontend
```bash
# Already installed, but verify:
npm install next react react-dom
npm install tailwindcss
```

---

## 🚀 Deployment Checklist

### Before Production
- [ ] JWT_SECRET configured (strong, random)
- [ ] CORS configured correctly
- [ ] Database indexes created
- [ ] Password hashing working
- [ ] Token validation tested
- [ ] Tenant isolation verified
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Rate limiting added
- [ ] HTTPS enabled

### Frontend Deployment
- [ ] Environment variables set
- [ ] Build succeeds: `npm run build`
- [ ] Test pages load
- [ ] Mobile responsive works

### Backend Deployment
- [ ] Environment variables set
- [ ] Database connection verified
- [ ] All APIs respond correctly
- [ ] Error responses clear

### DNS/Domain
- [ ] Subdomain DNS records created
- [ ] SSL certificate installed
- [ ] CORS headers allow frontend origin

---

## 📞 Support Resources

- JWT: https://jwt.io
- Bcrypt: https://www.npmjs.com/package/bcrypt
- Next.js: https://nextjs.org/docs
- MongoDB: https://www.mongodb.com/docs/

---

## Summary

**Frontend Status:** ✅ Complete & Ready for Testing
**Backend Status:** 🔴 Not Started - Ready for Implementation
**Next Action:** Implement `/api/auth/login` endpoint

**Estimated Backend Work:** 2-3 days for full implementation

---

**Ready to begin backend implementation?**

Start with: `/backend/src/routes/auth.js` for login endpoint
