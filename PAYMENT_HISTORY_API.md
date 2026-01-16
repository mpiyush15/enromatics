# Student Payment History API

## Endpoint
```
GET /api/students/:id
```

## Authentication
- Requires: `protect` middleware (JWT token)
- Roles: tenantAdmin, teacher, staff, manager, counsellor
- Permission: `canAccessStudents`

## Response
```json
{
  "success": true,
  "student": {
    "_id": "ObjectId",
    "name": "Student Name",
    "email": "student@example.com",
    "rollNumber": "2025NE011",
    "course": "Course Name",
    "batchName": "Batch Name",
    "fees": 50000,
    "balance": 10000,
    "status": "active",
    ... other student fields
  },
  "payments": [
    {
      "_id": "ObjectId",
      "studentId": "ObjectId",
      "tenantId": "ObjectId",
      "amount": 5000,
      "method": "cash",
      "date": "2024-01-15T10:30:00Z",
      "status": "success",
      "receiptUrl": "url/to/receipt"
    },
    ... more payments
  ]
}
```

## Usage Examples

### Frontend (React/Next.js)
```typescript
// Fetch student with payment history
const response = await fetch(
  `http://localhost:5050/api/students/${studentId}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
);

const { student, payments } = await response.json();

// Display payment history
payments.map(payment => (
  <tr key={payment._id}>
    <td>{new Date(payment.date).toLocaleDateString()}</td>
    <td>₹{payment.amount}</td>
    <td>{payment.method}</td>
    <td>{payment.status}</td>
  </tr>
))
```

## Filtering by Roll Number

If you need to fetch by roll number instead of ID:

1. **First get student by roll number:**
```
GET /api/students?rollNumber=2025NE011
```

2. **Then use the student _id to get details and payments:**
```
GET /api/students/{_id}
```

Or add a new endpoint like:
```
GET /api/students/roll/:rollNumber
```

## Current Status
✅ Payment history already fetched
✅ Properly filtered by tenantId
✅ Sorted by date (newest first)
✅ Ready to use in student details page
