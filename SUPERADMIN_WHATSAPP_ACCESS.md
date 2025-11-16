# SuperAdmin WhatsApp Access Implementation

## Issue
SuperAdmin users (piyush@pixelsdigital.tech) could not access the WhatsApp Business module despite it being added to the sidebar navigation.

## Root Cause
All WhatsApp controller functions were hardcoded to use `req.user.tenantId` directly, which caused issues when SuperAdmin needed to access WhatsApp configurations. SuperAdmin users have `tenantId: "global"` by design (as per createSuperAdmin.js script).

## Solution Implemented

### Backend Changes

#### 1. Helper Function (whatsappController.js)
Created a centralized `getTenantId()` helper function that:
- Checks if user has SuperAdmin role
- Allows SuperAdmin to optionally pass `tenantId` via query params or body
- Falls back to user's own tenantId if not SuperAdmin or no param provided

```javascript
const getTenantId = (req, source = 'query') => {
  if (req.user.role === 'SuperAdmin') {
    const paramTenantId = source === 'body' ? req.body.tenantId : req.query.tenantId;
    return paramTenantId || req.user.tenantId;
  }
  return req.user.tenantId;
};
```

#### 2. Updated All Controller Functions
Replaced all 20+ instances of:
```javascript
const tenantId = req.user.tenantId;
```

With:
```javascript
const tenantId = getTenantId(req);        // For GET requests
// OR
const tenantId = getTenantId(req, 'body'); // For POST requests
```

**Functions Updated:**
- `saveConfig()` - Save/update WhatsApp configuration (body)
- `getConfig()` - Get WhatsApp configuration (query)
- `testConnection()` - Test WhatsApp connection (body)
- `sendMessage()` - Send text message (body)
- `sendTemplate()` - Send template message (body)
- `sendBulkMessages()` - Send bulk campaigns (query)
- `getContacts()` - Get contact list (query)
- `createContact()` - Create manual contact (body)
- `updateContact()` - Update contact (query)
- `deleteContact()` - Delete contact (query)
- `syncContacts()` - Sync from students (query)
- `importContacts()` - Import from CSV (body)
- `getTemplates()` - Get template list (query)
- `createTemplate()` - Create template (body)
- `submitTemplateToMeta()` - Submit to Meta for approval (body)
- `syncTemplatesFromMeta()` - Sync templates from Meta (query)
- `deleteTemplate()` - Delete template (query)
- `getMessages()` - Get message history (query)
- `getMessageStats()` - Get statistics (query)
- `getDetailedStats()` - Get detailed statistics (query)

### Frontend Changes

#### 1. Sidebar Navigation (sidebarLinks.ts)
Added "SuperAdmin" to WhatsApp module roles:
```typescript
roles: ["subscriber", "admin", "tenantAdmin", "SuperAdmin"]
```

#### 2. WhatsApp Pages Structure
Copied entire WhatsApp module from `client/[tenantId]/whatsapp/` to `dashboard/whatsapp/` for SuperAdmin access:
- `page.tsx` - Main WhatsApp dashboard
- `settings/page.tsx` - Configuration & testing
- `campaigns/page.tsx` - Campaign management
- `contacts/page.tsx` - Contact management
- `reports/page.tsx` - Message reports

#### 3. Fixed Hardcoded API URLs
Replaced all instances of `http://localhost:5050` with `${API_BASE_URL}` in:
- `/dashboard/whatsapp/settings/page.tsx`
- `/dashboard/whatsapp/campaigns/page.tsx`
- `/dashboard/whatsapp/reports/page.tsx`
- `/dashboard/whatsapp/page.tsx` (already using API_BASE_URL)

## How It Works

### For Regular Users (tenantAdmin, subscriber, admin)
- User accesses `/dashboard/client/[tenantId]/whatsapp/`
- Backend uses their `req.user.tenantId` directly
- Only sees their own WhatsApp configuration and data

### For SuperAdmin
- User accesses `/dashboard/whatsapp/` (no tenantId in URL)
- Backend checks `req.user.role === 'SuperAdmin'`
- Uses SuperAdmin's own `tenantId: "global"` by default
- **Future Enhancement:** Can pass `?tenantId=TENANT_ID` to view specific tenant's data

## SuperAdmin Setup
According to `backend/src/scripts/createSuperAdmin.js`, SuperAdmin user is created with:
```javascript
{
  name: "Enro Matics Admin",
  email: process.env.SUPER_ADMIN_EMAIL, // piyush@pixelsdigital.tech
  password: "Pm@22442232",
  role: "SuperAdmin",
  tenantId: "global"
}
```

## Testing Checklist
- [x] Backend server starts without errors
- [x] No TypeScript compilation errors
- [x] SuperAdmin can see WhatsApp in sidebar
- [x] SuperAdmin can access `/dashboard/whatsapp/`
- [ ] SuperAdmin can configure WhatsApp settings
- [ ] SuperAdmin can view templates
- [ ] SuperAdmin can send campaigns
- [ ] SuperAdmin can view reports

## Future Enhancements

### Multi-Tenant Management for SuperAdmin
To allow SuperAdmin to manage multiple tenant WhatsApp accounts:

1. **Add Tenant Selector UI**
   ```tsx
   // In dashboard/whatsapp/page.tsx
   const [selectedTenant, setSelectedTenant] = useState<string>('');
   
   // Fetch tenants list
   useEffect(() => {
     if (userRole === 'SuperAdmin') {
       fetchTenants();
     }
   }, []);
   
   // Pass tenantId in API calls
   fetch(`${API_BASE_URL}/api/whatsapp/config?tenantId=${selectedTenant}`)
   ```

2. **Backend Already Supports This**
   - Helper function checks for `tenantId` in query/body params
   - Will use provided tenantId if SuperAdmin role
   - No additional backend changes needed

## Security Considerations
- SuperAdmin role is verified via JWT token in `protect` middleware
- Helper function only allows tenantId override for SuperAdmin role
- Regular users cannot access other tenants' data
- All API endpoints still protected with authentication

## Files Modified

### Backend
- `backend/src/controllers/whatsappController.js` - Added helper function, updated all 20+ functions

### Frontend
- `frontend/data/sidebarLinks.ts` - Added SuperAdmin to roles
- `frontend/app/dashboard/whatsapp/*` - Created all pages (copied from client path)
- `frontend/app/dashboard/whatsapp/settings/page.tsx` - Fixed API URLs, added import
- `frontend/app/dashboard/whatsapp/campaigns/page.tsx` - Fixed API URLs
- `frontend/app/dashboard/whatsapp/reports/page.tsx` - Fixed API URLs, added import

## Deployment Notes
1. Backend changes are backward compatible (existing functionality unchanged)
2. No database migrations required
3. SuperAdmin users must have `tenantId: "global"` in database
4. Frontend build will include new SuperAdmin WhatsApp routes
