# WhatsApp Contacts - Platform Response Structure

**Status:** ✅ TESTED - Real API Response Captured
**Date:** January 8, 2026
**Endpoint:** `GET /api/integrations/contacts?limit=50&offset=0`

---

## Actual Platform Response

```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "_id": "695a15a6c526dbe7c085ecf6",
        "name": "Piyush Magar",
        "phone": "+918087131777",
        "whatsappNumber": "918087131777",
        "email": "test@example.com",
        "type": "customer",
        "isOptedIn": true,
        "optInDate": "2026-01-04T07:24:22.198Z",
        "messageCount": 84,
        "tags": [],
        "metadata": {},
        "accountId": "pixels_internal",
        "createdAt": "2026-01-04T07:24:22.199Z",
        "updatedAt": "2026-01-08T09:28:36.027Z",
        "lastMessageAt": "2026-01-08T09:28:36.027Z",
        "__v": 0
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 50,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

---

## Platform Field → Frontend Field Mapping

| Platform Field | Frontend Expects | Value Example | Status |
|---|---|---|---|
| `_id` | `_id` or `contactId` | "695a15a6c526dbe7c085ecf6" | ✅ Use `_id` |
| `name` | `name` | "Piyush Magar" | ✅ Direct map |
| `phone` | `phone` | "+918087131777" | ✅ Direct map |
| `whatsappNumber` | `whatsappNumber` | "918087131777" | ✅ Keep extra |
| `email` | `email` | "test@example.com" | ✅ Direct map |
| `type` | `type` | "customer" | ✅ Direct map |
| `isOptedIn` | N/A | true | ℹ️ Bonus info |
| `messageCount` | `conversationCount` | 84 | ✅ Rename |
| `tags` | `tags` | [] | ✅ Direct map |
| `createdAt` | `createdAt` | ISO8601 | ✅ Direct map |
| `lastMessageAt` | `lastMessageAt` | ISO8601 | ✅ Direct map |
| `accountId` | N/A | "pixels_internal" | ℹ️ Extra |
| `metadata` | `metadata` | {} | ℹ️ Extra |
| `optInDate` | N/A | ISO8601 | ℹ️ Extra |
| `updatedAt` | N/A | ISO8601 | ℹ️ Extra |

---

## Frontend Contacts Page Expects

```typescript
interface Contact {
  _id: string
  contactId: string
  phone: string
  name?: string
  email?: string
  tags?: string[]
  notes?: string
  createdAt: string
  conversationCount?: number
  lastMessageAt?: string
}
```

---

## Backend Route Fix Needed

**Current Issue:** Returns raw Platform response without transformation

**What to Transform:**
1. Unwrap `response.data.contacts`
2. Map `conversationCount` from `messageCount`
3. Add `contactId` as alias for `_id`
4. Ensure all fields match frontend expectations

**Implementation:**
```javascript
const transformed = response.data.contacts.map(contact => ({
  _id: contact._id,
  contactId: contact._id,                      // Alias for _id
  name: contact.name,
  phone: contact.phone,
  whatsappNumber: contact.whatsappNumber,      // Keep original
  email: contact.email,
  type: contact.type,
  tags: contact.tags || [],
  isOptedIn: contact.isOptedIn,
  messageCount: contact.messageCount,
  conversationCount: contact.messageCount,     // Rename for frontend
  lastMessageAt: contact.lastMessageAt,
  createdAt: contact.createdAt,
  metadata: contact.metadata || {},
  notes: null                                  // Not provided by Platform
}));
```

---

## Files to Update

1. **Backend:** `/backend/src/routes/whatsappRoutes.js` - Add transformation to contacts route
2. **Frontend BFF:** `/frontend/app/api/whatsapp/contacts/route.ts` - Create if doesn't exist
3. **Frontend:** `/frontend/app/dashboard/client/[tenantId]/whatsapp/contacts/page.tsx` - Update fetchContacts
