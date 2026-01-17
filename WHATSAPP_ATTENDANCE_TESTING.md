# 🧪 WhatsApp Attendance Notifications - Testing Checklist

**Phase**: 1 (Backend Infrastructure)  
**Date**: 16 January 2026  
**Status**: Ready for Testing

---

## ✅ Pre-Testing Checks

- [ ] All files created/modified saved
- [ ] No git commit yet (waiting for full development)
- [ ] Backend running without errors
- [ ] MongoDB connected
- [ ] Development documentation created

---

## 🧪 TEST 1: Models & Database

**Objective**: Verify WhatsAppEventLog model works

**Steps**:
```javascript
// In MongoDB CLI or Compass:

// Check if collection created
db.getCollectionNames()
// Should include: whatsappevventlogs

// Check schema
db.whatsappevventlogs.findOne()
// Should return null (empty collection) or first document

// Check indexes
db.whatsappevventlogs.getIndexes()
// Should show indexes created
```

**Expected Result**: ✅ Collection exists with proper indexes

---

## 🧪 TEST 2: Tenant Configuration

**Objective**: Verify eventTriggers field added to Tenant model

**Steps**:
```javascript
// Get a test tenant
db.tenants.findOne({ tenantId: "test-tenant" }, { eventTriggers: 1 })

// Check structure
{
  eventTriggers: {
    absenceNotifications: { enabled: false, template: "..." },
    paymentReceipts: { enabled: false, template: "..." },
    testResults: { enabled: false, template: "..." }
  }
}
```

**Expected Result**: ✅ Field exists with correct structure

---

## 🧪 TEST 3: API Endpoints Accessible

**Objective**: Verify routes registered and endpoints available

**Steps**:
```bash
# Test each endpoint with curl

# 1. GET settings
curl -X GET http://localhost:5000/api/whatsapp/events/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected: 200 OK with eventTriggers

# 2. GET logs (empty initially)
curl -X GET http://localhost:5000/api/whatsapp/events/logs \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 200 OK with empty logs array

# 3. PUT settings
curl -X PUT http://localhost:5000/api/whatsapp/events/settings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "absenceNotifications",
    "enabled": true,
    "template": "Test: {studentName}"
  }'

# Expected: 200 OK with updated settings
```

**Expected Result**: ✅ All endpoints return 200 OK

---

## 🧪 TEST 4: Mark Attendance (Main Test)

**Objective**: Mark student absent and check if log created

**Prerequisites**:
- Have a test student with phone number
- Know student ID
- Know tenant ID

**Steps**:

1. **Mark student absent** (as admin):
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "studentId": "STUDENT_ID",
        "date": "2026-01-16",
        "status": "absent",
        "remarks": "Test absence"
      }
    ]
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "modified": 1,
  "upserted": 0
}
```

2. **Check if log was created** (wait 2-3 seconds):
```javascript
// In MongoDB:
db.whatsappevventlogs.findOne({
  studentId: ObjectId("STUDENT_ID"),
  eventType: "absence"
}, { _id: 0, tenantId: 1, studentName: 1, message: 1, status: 1 })

// Should return:
{
  tenantId: "...",
  studentName: "John Doe",
  message: "Hi John Doe, you were marked absent on 16 Jan 2026",
  status: "pending" or "sent" or "failed"
}
```

3. **Check backend console** for logs:
```
✅ 📱 Sending absence notification to student [ID]
✅ 📤 Sending WhatsApp to +91XXXXXXXXXX...
✅ ✅ WhatsApp sent to +91XXXXXXXXXX
```

**Expected Result**: ✅ Log created with message and status

---

## 🧪 TEST 5: WhatsApp Error Handling

**Objective**: Verify errors don't break attendance marking

**Steps**:

1. **Temporarily disable WhatsApp config**:
```javascript
// In MongoDB:
db.tenants.updateOne(
  { tenantId: "test-tenant" },
  { $set: { "whatsappConfig.isConfigured": false } }
)
```

2. **Mark attendance again**:
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {
        "studentId": "STUDENT_ID",
        "date": "2026-01-16",
        "status": "absent"
      }
    ]
  }'
```

3. **Check result**:
- ✅ Attendance still marked (response: success: true)
- ✅ No log created (WhatsApp disabled)
- ✅ No errors in response

**Expected Result**: ✅ Attendance marked even without WhatsApp

---

## 🧪 TEST 6: Settings Update

**Objective**: Verify admin can toggle features on/off

**Steps**:

1. **Get current settings**:
```bash
curl -X GET http://localhost:5000/api/whatsapp/events/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

2. **Enable absence notifications**:
```bash
curl -X PUT http://localhost:5000/api/whatsapp/events/settings \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "absenceNotifications",
    "enabled": true,
    "template": "Custom: {studentName} marked absent"
  }'
```

3. **Verify update**:
```bash
curl -X GET http://localhost:5000/api/whatsapp/events/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Should show enabled: true
```

**Expected Result**: ✅ Settings updated and persisted

---

## 🧪 TEST 7: Logs Retrieval

**Objective**: Verify admin can view sent messages

**Steps**:

1. **Get all logs**:
```bash
curl -X GET http://localhost:5000/api/whatsapp/events/logs \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

2. **Filter by event type**:
```bash
curl -X GET 'http://localhost:5000/api/whatsapp/events/logs?eventType=absence' \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

3. **Check pagination**:
```bash
curl -X GET 'http://localhost:5000/api/whatsapp/events/logs?limit=10&page=1' \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

**Expected Response**:
```json
{
  "success": true,
  "logs": [
    {
      "_id": "...",
      "tenantId": "...",
      "studentName": "John Doe",
      "message": "...",
      "status": "sent",
      "sentAt": "2026-01-16T10:30:00Z",
      "createdAt": "2026-01-16T10:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10
}
```

**Expected Result**: ✅ Logs retrieved with correct structure

---

## 🧪 TEST 8: Multiple Absences

**Objective**: Mark multiple students absent and verify all logs created

**Steps**:

1. **Prepare test data**:
```javascript
// Get 3 students with phone numbers
const students = db.students.find({ phone: { $exists: true, $ne: null } }).limit(3)
// Note their IDs
```

2. **Bulk mark absent**:
```bash
curl -X POST http://localhost:5000/api/attendance/mark \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      { "studentId": "STUDENT_1", "date": "2026-01-16", "status": "absent" },
      { "studentId": "STUDENT_2", "date": "2026-01-16", "status": "absent" },
      { "studentId": "STUDENT_3", "date": "2026-01-16", "status": "absent" }
    ]
  }'
```

3. **Verify 3 logs created**:
```javascript
// In MongoDB:
db.whatsappevventlogs.countDocuments({
  eventType: "absence",
  createdAt: { $gte: new Date(Date.now() - 60000) }  // Last 60 seconds
})

// Should return: 3
```

**Expected Result**: ✅ All 3 logs created and sent

---

## ❌ ERROR SCENARIOS

**If Test Fails - Check These**:

### Logs Not Created
- [ ] Student has phone number: `db.students.findOne(...).phone`
- [ ] Tenant WhatsApp configured: `db.tenants.findOne(...).whatsappConfig.isConfigured`
- [ ] Check backend console for errors
- [ ] Check MongoDB connection

### API Returns 403
- [ ] Token is valid
- [ ] Token has tenantId
- [ ] Authorization header format: `Bearer TOKEN`

### API Returns 404
- [ ] Route is registered: check server.js
- [ ] Endpoint URL is correct: `/api/whatsapp/events/...`
- [ ] Backend restarted after code changes

### Attendance Not Marked
- [ ] Should never happen (WhatsApp errors are caught)
- [ ] Check attendance table: `db.attendances.find(...)`
- [ ] Check backend console for errors

---

## ✅ SUCCESS CRITERIA

All tests pass when:
- ✅ Models load without errors
- ✅ Tenant config has eventTriggers field
- ✅ All API endpoints return 200 OK
- ✅ Attendance marked successfully
- ✅ Log created after marking absent
- ✅ Settings can be updated
- ✅ Logs can be retrieved
- ✅ Multiple absences work correctly
- ✅ Errors handled gracefully

---

## 📋 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| Models & Database | ⬜ PENDING | |
| Tenant Configuration | ⬜ PENDING | |
| API Endpoints | ⬜ PENDING | |
| Mark Attendance | ⬜ PENDING | |
| Error Handling | ⬜ PENDING | |
| Settings Update | ⬜ PENDING | |
| Logs Retrieval | ⬜ PENDING | |
| Multiple Absences | ⬜ PENDING | |

---

**Note**: Fill in status as you test:
- ⬜ = Not started
- 🟡 = In progress
- ✅ = Passed
- ❌ = Failed

**When All Tests Pass**: Ready to move to Phase 2 (Frontend)
