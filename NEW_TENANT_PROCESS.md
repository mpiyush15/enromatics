# 🆕 NEW TENANT CREATION PROCESS

**Current Setup:**
- Subdomain: `shreecoaching` → Tenant ID: `EN260301`
- User: `mpiyush2727@gmail.com` → Tenant ID: `EN260301`

---

## For New Tenants (Going Forward)

**Format:** `EN + YYMM + Serial`

### Example: Registering 3 new tenants today (March 22, 2026)

| Tenant | Subdomain | Tenant ID | User Email |
|--------|-----------|-----------|------------|
| 1st | `coaching-center-1` | `EN260301` | admin1@example.com |
| 2nd | `coaching-center-2` | `EN260302` | admin2@example.com |
| 3rd | `coaching-center-3` | `EN260303` | admin3@example.com |

### Next Month (April 2026)

| Tenant | Subdomain | Tenant ID | User Email |
|--------|-----------|-----------|------------|
| 1st | `new-institute` | `EN260401` | admin@newinstitute.com |
| 2nd | `another-center` | `EN260402` | admin@anothercentre.com |

---

## Creation Steps for New Tenant

```bash
# 1. Generate Tenant ID
YYMM = Current Year + Month (2603 = Mar 2026, 2604 = Apr 2026)
Serial = Get next serial for that month (01, 02, 03...)
TenantID = EN + YYMM + Serial
# Example: EN260304

# 2. Create in Database
institutions.insertOne({
  name: "Institute Name",
  subdomain: "institute-subdomain",
  tenantId: "EN260304",
  adminEmail: "admin@institute.com",
  createdAt: new Date()
})

# 3. Create User
users.insertOne({
  name: "Admin Name",
  email: "admin@institute.com",
  tenantId: "EN260304",
  role: "tenantAdmin",
  createdAt: new Date()
})

# 4. Create Batches, Settings, etc. linked to EN260304
```

---

## Key Points

✅ **Tenant ID format:** `EN + YYMM + Serial`
✅ **Serial resets monthly** (01-99 per month)
✅ **Subdomain** can be anything (no connection to tenant ID)
✅ **User email** maps to one tenant only
✅ **Data isolation** by tenantId in all collections

---

## Your Current Status

✅ Subdomain: `shreecoaching`
✅ Tenant ID: `EN260301` 
✅ User: `mpiyush2727@gmail.com`
✅ Data: 14 records synced (Leads, Students, Payments, Tests)
✅ Sync: 4/4 modules ready

**Ready to use!** 🎉
