# WhatsApp API Response Format Documentation

## Backend Data Transformation

All backend endpoints transform WhatsApp Platform API responses into a consistent frontend format.

---

## 1. Conversations Endpoint

### Backend Route
```javascript
GET /api/whatsapp/conversations?tenantId={tenantId}&limit=20&offset=0
```

### Response Format
```json
{
  "conversations": [
    {
      "id": "507f1f77bcf86cd799439011",
      "phone": "+1234567890",
      "phoneNumberId": "12345678901234567",
      "name": "John Doe",
      "lastMessage": "Thanks for the help!",
      "lastMessageTime": "2024-02-15T10:30:00.000Z",
      "unreadCount": 2,
      "profilePic": "https://..."
    }
  ],
  "count": 45,
  "total": 200
}
```

### Field Mapping (Platform → Frontend)
| Platform Field | Frontend Field | Type | Notes |
|---|---|---|---|
| `wa_id` or `id` | `phone` | string | Customer's WhatsApp phone number |
| `phone_number_id` | `phoneNumberId` | string | Business phone number ID |
| `profile.name` | `name` | string | Contact's name (optional) |
| `last_message_body` | `lastMessage` | string | Preview of last message |
| `last_message_timestamp` | `lastMessageTime` | ISO string | Timestamp of last message |
| `unread_count` | `unreadCount` | number | Number of unread messages |
| - | `id` | string | MongoDB _id for frontend routing |

---

## 2. Conversation Messages Endpoint

### Backend Route
```javascript
GET /api/whatsapp/conversation/{conversationId}?tenantId={tenantId}
```

### Response Format
```json
{
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "waMessageId": "wamid.xxx",
      "senderPhone": "+1234567890",
      "recipientPhone": "+0987654321",
      "messageType": "text",
      "content": {
        "text": "Hello, how can I help?"
      },
      "status": "read",
      "direction": "inbound",
      "createdAt": "2024-02-15T10:15:00.000Z",
      "sentAt": null,
      "deliveredAt": null,
      "readAt": "2024-02-15T10:16:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "waMessageId": "wamid.yyy",
      "senderPhone": "+0987654321",
      "recipientPhone": "+1234567890",
      "messageType": "image",
      "content": {
        "url": "https://platform.api/media/xxx",
        "mimeType": "image/jpeg",
        "caption": "Product image"
      },
      "mediaUrl": "https://platform.api/media/xxx",
      "mediaType": "image",
      "status": "delivered",
      "direction": "outbound",
      "createdAt": "2024-02-15T10:20:00.000Z",
      "sentAt": "2024-02-15T10:20:00.000Z",
      "deliveredAt": "2024-02-15T10:20:05.000Z",
      "readAt": null
    }
  ],
  "conversation": {
    "id": "507f1f77bcf86cd799439011",
    "phone": "+1234567890",
    "name": "John Doe"
  }
}
```

### Message Type Structures

#### Text Message
```json
{
  "messageType": "text",
  "content": {
    "text": "Hello world"
  }
}
```

#### Image Message
```json
{
  "messageType": "image",
  "content": {
    "url": "https://...",
    "mimeType": "image/jpeg",
    "caption": "Optional caption"
  },
  "mediaUrl": "https://...",
  "mediaType": "image"
}
```

#### Video Message
```json
{
  "messageType": "video",
  "content": {
    "url": "https://...",
    "mimeType": "video/mp4",
    "caption": "Video caption"
  },
  "mediaUrl": "https://...",
  "mediaType": "video"
}
```

#### Document Message
```json
{
  "messageType": "document",
  "content": {
    "url": "https://...",
    "mimeType": "application/pdf",
    "fileName": "Invoice.pdf",
    "size": 245000
  },
  "mediaUrl": "https://...",
  "mediaType": "document",
  "fileName": "Invoice.pdf",
  "fileSize": 245000
}
```

#### Audio Message
```json
{
  "messageType": "audio",
  "content": {
    "url": "https://...",
    "mimeType": "audio/mpeg"
  },
  "mediaUrl": "https://...",
  "mediaType": "audio"
}
```

#### Template Message
```json
{
  "messageType": "template",
  "content": {
    "template": "order_confirmation",
    "parameters": {
      "1": "Order #12345",
      "2": "$99.99"
    }
  }
}
```

---

## 3. Message Status Values

### Status Enum
```typescript
type MessageStatus = "sent" | "delivered" | "read" | "failed"
```

### Status Timeline (Outbound Messages)
```
[Created] → sent → [5 seconds] → delivered → [5 minutes] → read
```

### Status Details
- **sent** - Message sent to WhatsApp servers successfully
  - `sentAt` timestamp is populated
  - Icon: ✓ (single check, gray)
  
- **delivered** - Message delivered to recipient's phone
  - `deliveredAt` timestamp is populated
  - Icon: ✓✓ (double check, gray)
  
- **read** - Message opened/read by recipient
  - `readAt` timestamp is populated
  - Icon: ✓✓ (double check, blue #53bdeb)
  
- **failed** - Message failed to send
  - No timestamp updates
  - Icon: ⚠️ (warning, red)

### Inbound Messages
- Always have `direction: "inbound"`
- Status is typically `"received"` or not shown
- `sentAt` contains sender's timestamp

---

## 4. Message Statistics Endpoint (NEW)

### Backend Route
```javascript
GET /api/whatsapp/messages/stats?tenantId={tenantId}&days=30&conversationId={optional}
```

### Response Format
```json
{
  "stats": {
    "totalMessages": 2145,
    "sentCount": 1245,
    "deliveredCount": 1150,
    "readCount": 980,
    "failedCount": 65,
    "inboundCount": 900,
    "outboundCount": 1245
  },
  "dateRange": {
    "from": "2024-01-15T00:00:00.000Z",
    "to": "2024-02-15T00:00:00.000Z",
    "days": 30
  }
}
```

### Calculations
```javascript
deliveryRate = (deliveredCount / sentCount) * 100
readRate = (readCount / deliveredCount) * 100
failureRate = (failedCount / sentCount) * 100
```

---

## 5. Templates Endpoint

### Backend Route
```javascript
GET /api/whatsapp/templates?tenantId={tenantId}&status=approved&language=en
```

### Response Format
```json
{
  "templates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "order_confirmation",
      "language": "en",
      "category": "TRANSACTIONAL",
      "status": "approved",
      "content": "Your order {{order_id}} has been confirmed. Total: {{amount}}",
      "variables": ["order_id", "amount"],
      "usageCount": 145,
      "lastUsedAt": "2024-02-15T14:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-02-10T10:00:00.000Z"
    }
  ],
  "total": 23,
  "approved": 15,
  "pending": 5,
  "rejected": 2,
  "draft": 1
}
```

### Status Values
```typescript
type TemplateStatus = "draft" | "pending" | "approved" | "rejected"
```

---

## 6. Broadcasts Endpoint

### Backend Route
```javascript
GET /api/whatsapp/broadcasts?tenantId={tenantId}&status=all
```

### Response Format
```json
{
  "broadcasts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Valentine Sale",
      "template": "sale_announcement",
      "message": "Special Valentine offer - 50% off all items!",
      "recipients": 1500,
      "sentCount": 1480,
      "deliveredCount": 1425,
      "readCount": 890,
      "failedCount": 20,
      "status": "completed",
      "scheduledFor": null,
      "startedAt": "2024-02-14T09:00:00.000Z",
      "completedAt": "2024-02-14T09:15:00.000Z",
      "createdAt": "2024-02-13T15:00:00.000Z"
    }
  ],
  "total": 45,
  "summary": {
    "totalSent": 67890,
    "totalDelivered": 65432,
    "totalRead": 54210,
    "totalFailed": 1458
  }
}
```

### Status Values
```typescript
type BroadcastStatus = "draft" | "scheduled" | "in_progress" | "completed" | "failed"
```

---

## 7. Contacts Endpoint

### Backend Route
```javascript
GET /api/whatsapp/contacts?tenantId={tenantId}&limit=50&offset=0
```

### Response Format
```json
{
  "contacts": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "phone": "+1234567890",
      "whatsappNumber": "+1234567890",
      "email": "john@example.com",
      "name": "John Doe",
      "type": "customer",
      "tags": ["vip", "frequent-buyer"],
      "messageCount": 42,
      "isOptedIn": true,
      "lastMessageAt": "2024-02-15T10:30:00.000Z",
      "createdAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "total": 523,
  "count": 50
}
```

---

## 8. WhatsApp Config Endpoint

### Backend Route
```javascript
GET /api/whatsapp/config?tenantId={tenantId}
```

### Response Format
```json
{
  "businessAccountId": "123456789",
  "phoneNumberId": "123456789",
  "phoneNumber": "+1234567890",
  "displayName": "My Business",
  "connectionStatus": "connected",
  "isGlobal": false,
  "source": "database"
}
```

### Status Values
```typescript
type ConnectionStatus = "connected" | "disconnected" | "error"
```

---

## Error Response Format

### Standard Error Response
```json
{
  "error": "Error message describing what went wrong",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common Error Codes
- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid API key)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Frontend Data Flow

```
Platform API
    ↓
Backend Transformation
    ↓
BFF Routes (/api/whatsapp/*)
    ↓
Frontend State Management
    ↓
UI Components
```

### Example: Message Flow
```
Platform API Response:
{
  "messages": [
    {
      "id": "wamid.xxx",
      "from": "1234567890",
      "timestamp": "1708074600",
      "type": "text",
      "text": { "body": "Hello" },
      "status": "read"
    }
  ]
}
    ↓ (Transform)
{
  "messages": [
    {
      "_id": "507f...",
      "waMessageId": "wamid.xxx",
      "senderPhone": "+1234567890",
      "messageType": "text",
      "content": { "text": "Hello" },
      "status": "read",
      "createdAt": "2024-02-15T10:30:00.000Z",
      "readAt": "2024-02-15T10:35:00.000Z"
    }
  ]
}
    ↓ (Frontend)
<MessageBubble status="read" text="Hello" readTime="10:35 AM" />
```

---

## Real-Time Update Format (Socket.io Ready)

### New Message Event
```json
{
  "type": "message:new",
  "data": {
    "_id": "507f...",
    "waMessageId": "wamid.xxx",
    "messageType": "text",
    "content": { "text": "Hello" },
    "status": "sent",
    "direction": "inbound",
    "createdAt": "2024-02-15T10:30:00.000Z"
  }
}
```

### Message Status Update Event
```json
{
  "type": "message:status",
  "data": {
    "messageId": "wamid.xxx",
    "status": "delivered",
    "deliveredAt": "2024-02-15T10:30:05.000Z"
  }
}
```

### Typing Indicator Event
```json
{
  "type": "contact:typing",
  "data": {
    "contactId": "+1234567890",
    "isTyping": true
  }
}
```

---

## Rate Limiting & Quotas

### Current Limits
- Messages: 1,000 per day (standard tier)
- Conversations: Unlimited read
- Templates: Unlimited read, 100 creates/day
- Broadcasts: 100 per day

### Response Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1708074600
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-02-15 | Initial implementation with date separators, typing indicators, and status tracking |
| 1.1 | Upcoming | Socket.io real-time integration |
| 1.2 | Upcoming | Message search and advanced filters |
| 1.3 | Upcoming | Media upload and chunking support |

---

This documentation represents the current API contract between frontend and backend.
Any changes to response format should be coordinated between both teams.
