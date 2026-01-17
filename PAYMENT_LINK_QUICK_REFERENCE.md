# 🚀 Payment Link Generation - Quick Reference Guide

## Where Everything Is

### Frontend Components
```
frontend/components/PaymentLinkCard.tsx
├─ Plan selection dropdown
├─ Billing cycle options
├─ Amount calculator
├─ Generate button
├─ Copy to clipboard
├─ Email sender
├─ Payment history
└─ Status tracking
```

### Payment Pages
```
frontend/app/upgrade/
├─ checkout/page.tsx    ← Payment checkout
└─ status/page.tsx      ← Payment result

frontend/app/api/payment/
├─ initiate-upgrade/route.ts  ← Create Cashfree session
├─ verify-upgrade/route.ts    ← Verify payment
└─ webhook/route.ts           ← Payment callback
```

### Backend APIs
```
POST   /api/payment-links/generate       ← Create link
POST   /api/payment-links/send-email     ← Send email
GET    /api/payment-links/plans          ← Get plans
GET    /api/payment-links/session/:id    ← Get session
GET    /api/payment-links/tenant/:id     ← Get history
```

### Dashboard Integration
```
frontend/app/dashboard/tenants/[tenantId]/page.tsx
└─ <PaymentLinkCard tenantId={tenant.tenantId} />
```

---

## How to Use

### For SuperAdmin
1. Go to `/dashboard/tenants/[tenantId]`
2. Scroll to "💳 Payment Link" card
3. Select plan and billing cycle
4. Click "Generate Payment Link"
5. Copy link or send email
6. Share with tenant

### For Tenant
1. Click payment link
2. Review plan details
3. Click "Pay ₹Amount"
4. Complete Cashfree checkout
5. See success page
6. Redirect to dashboard

---

## Environment Variables
```
CASHFREE_CLIENT_ID
CASHFREE_SECRET_KEY
ZEPTO_API_TOKEN
ZEPTO_FROM
NEXT_PUBLIC_FRONTEND_URL
NEXT_PUBLIC_BACKEND_URL
```

---

## Testing
```bash
node test-payment-link-feature.mjs
```

---

## Key Dates & Info

**Session Duration:** 48 hours
**Payment Gateway:** Cashfree
**Email Service:** ZeptoMail (Zoho)
**Amount Discount:** 30% for annual
**Status Updates:** Real-time

---

## Files to Remember

| File | Purpose |
|------|---------|
| `PaymentLinkCard.tsx` | Main component |
| `upgrade/checkout/page.tsx` | Payment page |
| `upgrade/status/page.tsx` | Result page |
| `paymentLinkController.js` | API logic |
| `test-payment-link-feature.mjs` | Tests |
| `DOCS/PAYMENT_LINK_GENERATION_COMPLETE.md` | Full docs |

---

## Error Messages & Solutions

| Error | Fix |
|-------|-----|
| Plans not loading | Check API endpoint |
| Email not sending | Check ZEPTO vars |
| Payment fails | Check CASHFREE vars |
| Link expired | Generate new link |
| Session not found | Check session ID |

---

## Database Schema

**PaymentSession Collection:**
```javascript
{
  sessionId: String,           // Unique 32-char ID
  tenantId: String,            // Associated tenant
  planId: String,              // Selected plan
  planName: String,            // Display name
  billingCycle: String,        // "monthly" or "annual"
  amount: Number,              // In INR
  email: String,               // Tenant email
  status: String,              // pending/success/failed
  expiresAt: Date,             // 48-hour expiry
  createdBy: ObjectId,         // SuperAdmin ID
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Response Examples

### Generate Link Success
```json
{
  "success": true,
  "sessionId": "a1b2c3d4e5f6...",
  "paymentLink": "http://localhost:3000/upgrade/checkout?session=a1b2c3d4...",
  "amount": 5000,
  "plan": "Professional",
  "billingCycle": "monthly"
}
```

### Get Plans Success
```json
{
  "success": true,
  "plans": [
    {
      "id": "professional",
      "name": "Professional",
      "priceMonthly": 5000,
      "priceAnnual": 54000
    }
  ]
}
```

---

## Flow Diagram

```
SuperAdmin
   ↓
Dashboard
   ↓
PaymentLinkCard
   ↓
Generate Link
   ↓
Session Created (DB)
   ↓
URL Generated
   ↓
Send Email ← OR → Copy Link
   ↓              ↓
ZeptoMail   Manual Share
   ↓              ↓
Tenant Email ← ← ←
   ↓
Click Link
   ↓
/upgrade/checkout
   ↓
Validate Session
   ↓
Show Details
   ↓
Click Pay
   ↓
Cashfree Checkout
   ↓
Payment Processing
   ↓
Webhook Callback
   ↓
Update Subscription
   ↓
/upgrade/status
   ↓
Show Result
   ↓
Redirect Dashboard
```

---

## Features at a Glance

✅ Unique payment links (48h expiry)
✅ Plan selection with pricing
✅ Email integration (professional template)
✅ Payment history tracking
✅ Real-time status updates
✅ Secure Cashfree checkout
✅ Webhook verification
✅ Auto subscription update
✅ Confirmation email
✅ Error handling
✅ Mobile responsive
✅ Dark mode support

---

## Security Summary

- Unique session IDs (crypto-generated)
- 48-hour expiration
- PCI-DSS Level 1 (Cashfree)
- Encrypted transmission (HTTPS)
- No card data in backend
- Webhook verification
- Email DKIM/SPF
- Tenant isolation
- Amount validation

---

## Monitoring

Monitor these endpoints:
```
POST /api/payment-links/generate
POST /api/payment-links/send-email
POST /api/payment/initiate-upgrade
GET  /api/payment-links/tenant/:id
```

Check logs for:
- Failed email sends
- Expired sessions
- Cashfree errors
- Webhook failures

---

## Common Tasks

### Find a payment session
```javascript
db.paymentsessions.findOne({ sessionId: "..." })
```

### Get tenant payment history
```
GET /api/payment-links/tenant/{tenantId}
```

### Test payment link
- Generate link
- Click "Test Link" button
- Should load checkout page

### Resend payment email
- Go to payment history
- Find session
- Use "Send Email" button

---

## Support Contacts

**For technical issues:**
- Check console logs
- Review API responses
- Test with Postman

**For payment issues:**
- Verify Cashfree credentials
- Check Cashfree dashboard
- Review webhooks

**For email issues:**
- Verify ZeptoMail token
- Check domain verification
- Review email logs

---

## Last Updated
January 17, 2026

**Status: Production Ready ✅**
