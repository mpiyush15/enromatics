## 🔧 Payment Link Feature - Debugging Guide

### Issue 1: "Unexpected token '<', "<!DOCTYPE" is not valid JSON

**What it means:** The API returned HTML instead of JSON. This usually happens when:
- The API endpoint doesn't exist (404 error page)
- There's a server error (500 error page)
- Wrong content-type header

**How to fix:**

1. **Test the plans endpoint:**
```bash
node test-payment-plans.mjs
```

2. **Check backend is running:**
```bash
cd backend
npm run dev
```

3. **Verify the endpoint exists:**
- Go to `backend/src/routes/paymentLinkRoutes.js`
- Confirm `router.get('/plans', protect, getAllPlans)` exists
- Check `backend/src/server.js` has `app.use('/api/payment-links', paymentLinkRoutes)`

4. **Check in browser console:**
```javascript
// Open browser console and run:
fetch('/api/payment-links/plans', { credentials: 'include' })
  .then(r => r.text())
  .then(t => console.log(t.substring(0, 500)))
```

5. **Common issues:**
- ❌ Backend not running → `npm run dev` in backend folder
- ❌ Route not mounted → check server.js imports and app.use()
- ❌ Authentication error → Check if protect middleware is blocking unauthenticated requests
- ❌ Database connection → Check MongoDB is running

---

### Issue 2: PaymentLinkCard doesn't fetch plans

**Symptoms:**
- Loading spinner keeps spinning
- Error message shows "Failed to load available plans"
- Select dropdown is empty

**How to debug:**

1. **Check browser console (F12):**
```
Look for these messages:
✅ "📊 Fetching payment plans..."
✅ "📊 Plans API response status: 200"
✅ "✅ Plans fetched successfully:"
```

2. **If you see errors like:**
- `Failed to fetch plans: 401` → Authentication issue
- `Failed to fetch plans: 404` → Endpoint doesn't exist
- `Failed to fetch plans: 500` → Server error, check backend logs

3. **Test manually:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Test the endpoint
node test-payment-plans.mjs
```

4. **Fix Authentication:**
If getting 401, the protect middleware might be blocking. Check:
- Are you logged in as SuperAdmin?
- Is the auth token being sent? Check Network tab in DevTools
- Verify cookies are being sent: `{ credentials: 'include' }`

---

### Issue 3: Cashfree Payment Integration Error

**Error: "<!DOCTYPE" from payment initiation**

**Fixed by:**
- Updated to correct Cashfree v3 API endpoint: `/pg/orders`
- Proper error handling for invalid JSON responses
- Detailed logging of responses

**If still happening:**
1. Verify Cashfree credentials:
```bash
echo $CASHFREE_CLIENT_ID
echo $CASHFREE_SECRET_KEY
```

2. Check Cashfree API docs are v2023-08-01

3. Test with curl:
```bash
curl -X POST https://api.cashfree.com/pg/orders \
  -H "x-api-version: 2023-08-01" \
  -H "x-client-id: YOUR_ID" \
  -H "x-client-secret: YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "test_123",
    "order_amount": 100,
    "order_currency": "INR"
  }'
```

---

### Debug Checklist

- [ ] Backend is running (`npm run dev` in backend folder)
- [ ] Frontend is running (`npm run dev` in frontend folder)
- [ ] MongoDB is running and connected
- [ ] You're logged in as SuperAdmin
- [ ] Network tab shows `/api/payment-links/plans` request
- [ ] Response status is 200, not 404/500
- [ ] Response is valid JSON, not HTML
- [ ] Plans array has items
- [ ] PaymentLinkCard component is imported in tenant page
- [ ] tenantId prop is being passed to PaymentLinkCard
- [ ] Browser console has no errors
- [ ] Backend console shows no errors

---

### Quick Tests

**Test 1: Backend connectivity**
```bash
curl http://localhost:5000/api/health
```
Expected: `{"status":"ok"}` or similar

**Test 2: Plans endpoint**
```bash
node test-payment-plans.mjs
```
Expected: List of available plans with prices

**Test 3: Frontend API route**
```javascript
// In browser console
fetch('/api/payment/initiate-upgrade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'test123',
    amount: 5000,
    email: 'test@example.com',
    planName: 'Professional',
    billingCycle: 'monthly'
  })
}).then(r => r.json()).then(console.log)
```
Expected: Success with paymentSessionId

---

### Log Locations

**Frontend Browser Console:**
- Shows API requests and responses
- Error messages from PaymentLinkCard
- Plan fetching logs

**Backend Terminal:**
```
✅ Payment link generated for tenant
📧 Sending payment link to
💳 Creating Cashfree payment session
```

**To view detailed logs:**
```javascript
// In PaymentLinkCard, look for console.log with emoji prefixes:
console.log("📊 Fetching payment plans...")
console.log("❌ Error fetching plans:")
```

---

### Still stuck?

Check the files that were modified:

1. **Frontend Component:**
   - `frontend/components/PaymentLinkCard.tsx`
   - Look for `console.log()` statements

2. **API Routes:**
   - `frontend/app/api/payment/initiate-upgrade/route.ts`
   - `frontend/app/api/payment/verify-upgrade/route.ts`

3. **Backend:**
   - `backend/src/controllers/paymentLinkController.js`
   - `backend/src/routes/paymentLinkRoutes.js`

All have enhanced error logging and debugging info!

---

**Last Updated:** January 17, 2026
