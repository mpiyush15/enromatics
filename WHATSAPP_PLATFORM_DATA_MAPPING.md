# WhatsApp Platform Data Structure & Field Mapping Documentation

**Purpose:** Document the data structure coming from WhatsApp Platform API and identify field name/enum mismatches with Meta WhatsApp Cloud API expectations.

**Date:** January 8, 2026
**Status:** Investigation Report for Platform Team

---

## 1. CONVERSATIONS ENDPOINT

### WhatsApp Platform API Response Structure
**Endpoint:** `GET /api/integrations/conversations?limit=50&offset=0`

**Expected Response Format:**
```json
{
  "success": true,
  "conversations": [
    {
      "conversationId": "string",      // Unique conversation ID
      "phoneNumberId": "string",        // Phone number ID associated with conversation
      "userPhone": "string",            // Customer phone number (international format)
      "userName": "string",             // Customer name/contact name
      "lastMessagePreview": "string",   // Preview of last message
      "lastMessageAt": "ISO8601",       // Timestamp of last message
      "unreadCount": number,            // Count of unread messages
      "direction": "inbound|outbound",  // Direction of conversation
      "status": "string",               // Conversation status (open/closed/etc)
      "createdAt": "ISO8601"
    }
  ],
  "pagination": {
    "limit": number,
    "offset": number,
    "total": number,
    "hasMore": boolean
  }
}
```

### Frontend Inbox Page Expects:
```typescript
interface Contact {
  id: string                    // Maps from: conversationId or _id
  phone: string                 // Maps from: userPhone
  phoneNumberId: string         // Maps from: phoneNumberId
  name?: string                 // Maps from: userName
  lastMessage?: string          // Maps from: lastMessagePreview
  lastMessageTime?: string      // Maps from: lastMessageAt
  unreadCount?: number          // Maps from: unreadCount
  profilePic?: string           // NOT PROVIDED by Platform - missing field
}
```

### ⚠️ IDENTIFIED ISSUES:

| Field | Platform API | Frontend Expects | Status |
|-------|-------------|-----------------|--------|
| `conversationId` | ✅ Provided | Expected as `id` | ✅ Mapped |
| `userPhone` | ✅ Provided | Expected as `phone` | ✅ Mapped |
| `phoneNumberId` | ✅ Provided | Expected as `phoneNumberId` | ✅ Mapped |
| `userName` | ✅ Provided | Expected as `name` | ✅ Mapped |
| `lastMessagePreview` | ✅ Provided | Expected as `lastMessage` | ✅ Mapped |
| `lastMessageAt` | ✅ Provided | Expected as `lastMessageTime` | ✅ Mapped |
| `unreadCount` | ✅ Provided | Expected as `unreadCount` | ✅ Mapped |
| `profilePic` | ❌ NOT PROVIDED | Expected by frontend | ❌ **MISSING** |
| `_id` | ? Unknown | Used as fallback `id` | ⚠️ Unknown if provided |

---

## 2. MESSAGES ENDPOINT

### WhatsApp Platform API Response Structure
**Endpoint:** `GET /api/integrations/conversations/{conversationId}/messages?limit=50&offset=0`

**Expected Response Format:**
```json
{
  "success": true,
  "messages": [
    {
      "messageId": "string",           // Unique message ID
      "waMessageId": "string",         // WhatsApp message ID
      "conversationId": "string",      // Parent conversation ID
      "senderPhone": "string",         // Sender phone number
      "recipientPhone": "string",      // Recipient phone number
      "messageType": "text|image|document|audio|video|template|interactive|location",
      "content": {
        "text": "string",              // For text messages
        "url": "string",               // For media messages
        "mediaType": "image|video|audio|document",
        "caption": "string",           // Optional caption for media
        "templateName": "string",      // For template messages
        "templateParams": []           // For template messages
      },
      "status": "sent|delivered|read|failed|pending",
      "direction": "inbound|outbound",
      "timestamp": "ISO8601",          // When message was sent
      "createdAt": "ISO8601",          // When message was received/created in system
      "deliveredAt": "ISO8601",        // When message was delivered
      "readAt": "ISO8601"              // When message was read
    }
  ],
  "pagination": {
    "limit": number,
    "offset": number,
    "total": number,
    "hasMore": boolean
  }
}
```

### Frontend Inbox Expects:
```typescript
interface Message {
  _id: string                          // Maps from: messageId
  waMessageId?: string                 // Maps from: waMessageId
  recipientPhone?: string              // Maps from: recipientPhone
  senderPhone?: string                 // Maps from: senderPhone
  messageType: string                  // Maps from: messageType
  content: any                         // Maps from: content (structure varies)
  status: string                       // Maps from: status
  direction: "inbound" | "outbound"    // Maps from: direction
  createdAt: string                    // Maps from: createdAt or timestamp
  sentAt?: string                      // Maps from: timestamp
  deliveredAt?: string                 // Maps from: deliveredAt
  readAt?: string                      // Maps from: readAt
}
```

### ⚠️ IDENTIFIED ISSUES:

| Field | Platform API | Frontend Expects | Status | Notes |
|-------|-------------|-----------------|--------|-------|
| `messageId` | ✅ Provided | Expected as `_id` | ✅ Mapped | |
| `waMessageId` | ✅ Provided | Expected as `waMessageId` | ✅ Mapped | |
| `conversationId` | ✅ Provided | Not used | ℹ️ Extra field | |
| `senderPhone` | ✅ Provided | Expected as `senderPhone` | ✅ Mapped | |
| `recipientPhone` | ✅ Provided | Expected as `recipientPhone` | ✅ Mapped | |
| `messageType` | ✅ Provided | Expected as `messageType` | ✅ Mapped | Enum mismatch possible |
| `content` | ✅ Provided | Expected as `content` | ✅ Mapped | Structure varies by type |
| `status` | ✅ Provided | Expected as `status` | ✅ Mapped | Enum values differ |
| `direction` | ✅ Provided | Expected as `direction` | ✅ Mapped | |
| `timestamp` | ✅ Provided | Used as `sentAt` | ✅ Mapped | Also used for `createdAt` |
| `createdAt` | ✅ Provided | Expected as `createdAt` | ✅ Mapped | Duplicate of `timestamp`? |
| `deliveredAt` | ✅ Provided | Expected as `deliveredAt` | ✅ Mapped | |
| `readAt` | ✅ Provided | Expected as `readAt` | ✅ Mapped | |

---

## 3. ENUM VALUE MISMATCHES

### Message Type Enums

**Platform API Provides:**
```
- text
- image
- document
- audio
- video
- template
- interactive
- location
```

**Check if frontend matches these values or expects different ones**

### Message Status Enums

**Platform API Provides:**
```
- sent
- delivered
- read
- failed
- pending
```

**Meta Cloud API Status Values (for reference):**
```
- sent
- delivered
- read
- failed
```

**⚠️ Question:** Does Platform use `pending` status? Does frontend expect it?

### Direction Enums

**Both should use:**
```
- inbound (message from customer)
- outbound (message from business)
```

---

## 4. DATA TRANSFORMATION IN BFF ROUTE

**File:** `/frontend/app/api/whatsapp/conversations/route.ts`

**Current Implementation:**
```typescript
// GET handler calls backend directly
const response = await fetch(
  `${BACKEND_URL}/api/whatsapp/conversations?tenantId=${tenantId}&limit=${limit}&offset=${offset}`
);
```

**What Should Happen:**
1. Platform returns raw data with field names
2. BFF route should map Platform field names to frontend field names
3. Frontend receives normalized data

**Mapping Transformation Needed:**
```javascript
const transformed = data.conversations.map(conv => ({
  id: conv.conversationId,                    // Rename field
  phone: conv.userPhone,                      // Rename field
  phoneNumberId: conv.phoneNumberId,          // Keep as-is
  name: conv.userName,                        // Rename field
  lastMessage: conv.lastMessagePreview,       // Rename field
  lastMessageTime: conv.lastMessageAt,        // Rename field
  unreadCount: conv.unreadCount,              // Keep as-is
  profilePic: null,                           // Not provided - use fallback
  // Add any other derived fields
}));
```

---

## 5. CURRENT BACKEND ROUTE IMPLEMENTATION

**File:** `/backend/src/routes/whatsappRoutes.js`

**Current GET /api/whatsapp/conversations:**
```javascript
router.get('/conversations', async (req, res) => {
  const { tenantId, limit = 50, offset = 0 } = req.query;
  
  // Gets config from MongoDB
  const config = await getWhatsAppConfig(tenantId);
  
  // Calls Platform
  const conversations = await whatsappClient.getAllConversations(limit, offset, config.apiKey);
  
  // Returns Platform response directly - NO TRANSFORMATION
  return res.json(conversations);
});
```

**Issue:** ⚠️ No field transformation between Platform response and frontend expectations!

---

## 6. QUESTIONS FOR PLATFORM TEAM

Please provide clarification on:

1. **Conversation ID Field:**
   - Is it `conversationId` or `_id`?
   - What is the format/pattern?

2. **Profile Picture:**
   - How do we get customer profile picture?
   - Is there a separate endpoint?
   - What field should we query?

3. **Message Status:**
   - Do you return `pending` status or only `sent/delivered/read/failed`?
   - When does status transition happen?

4. **Timestamp Fields:**
   - What's the difference between `timestamp` and `createdAt`?
   - Which one should we use for display?
   - Are both always provided?

5. **Content Structure:**
   - How is `content` structured for different message types?
   - Examples for: image, document, template, interactive, location

6. **Pagination:**
   - Should we use `limit` + `offset` (current) or `limit` + `skip`?
   - Does Platform return `hasMore` flag?
   - How many total conversations are there?

7. **Contact Information:**
   - Can we get customer display name from somewhere?
   - Is there a separate contacts endpoint?
   - What if `userName` is null/empty?

---

## 7. IMPLEMENTATION CHECKLIST

- [ ] Confirm all field names with Platform team
- [ ] Confirm all enum values with Platform team
- [ ] Create transformation layer in BFF route
- [ ] Handle missing/optional fields gracefully
- [ ] Add error handling for unexpected field structures
- [ ] Test with real Platform data
- [ ] Document any fallback/default values
- [ ] Update frontend types if needed

---

## 8. SAMPLE TEST REQUESTS

### Get Conversations
```bash
curl -X GET 'https://whatsapp-platform-production-e48b.up.railway.app/api/integrations/conversations?limit=50&offset=0' \
  -H "Authorization: Bearer wpi_int_8358b5574a9e76cf9175af383bbe419df3e7be79b3bedabd40f049a7d5b47b11" \
  -H "Content-Type: application/json"
```

### Get Messages for Conversation
```bash
curl -X GET 'https://whatsapp-platform-production-e48b.up.railway.app/api/integrations/conversations/{conversationId}/messages?limit=50&offset=0' \
  -H "Authorization: Bearer wpi_int_8358b5574a9e76cf9175af383bbe419df3e7be79b3bedabd40f049a7d5b47b11" \
  -H "Content-Type: application/json"
```

---

## 9. NEXT STEPS

1. **Run test requests** against WhatsApp Platform
2. **Compare actual response** with documentation above
3. **Send this document** to Platform team with questions
4. **Implement transformation layer** once field names confirmed
5. **Test end-to-end** with real data
