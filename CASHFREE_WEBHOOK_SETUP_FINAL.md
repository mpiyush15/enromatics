# Cashfree Webhook Setup – Updated (No Signature Required)

## ✅ Updated Approach: API Verification Instead of Signature

**What changed:**
- ❌ Removed webhook signature verification requirement
- ✅ Added **Cashfree API verification** for order status
- ✅ Webhook handler now calls Cashfree API to confirm `order_status === PAID`

This is **more secure** because:
1. Any payload can claim to be from Cashfree, but
2. We verify directly with Cashfree's servers using your credentials
3. Prevents fake webhook attacks

---

## Your Webhook URL for Cashfree Dashboard

```
https://endearing-blessing-production-c61f.up.railway.app/api/payments/webhook/cashfree
```

## Steps to Configure in Cashfree Dashboard

1. **Log in to Cashfree Dashboard**
   - Go to https://dashboard.cashfree.com/merchants
   - Use your merchant account credentials

2. **Navigate to Webhooks Settings**
   - Go to **Settings** → **Webhooks** (or Developer Tools → Webhooks)
   - Click **Add Webhook** or **Create New Webhook**

3. **Configure Webhook Details**
   - **Webhook URL**: `https://endearing-blessing-production-c61f.up.railway.app/api/payments/webhook/cashfree`
   - **Events to Subscribe**: Select these:
     - `order.paid` (payment success)
     - `order.failed` (payment failure)
   - **No signature header needed** (we verify via API)

4. **Save Webhook**
   - Click **Save** or **Create**
   - You're done! No secret key needed.

---

## How It Works

### When a payment happens:

1. **Customer completes payment** on Cashfree gateway
2. **Cashfree sends webhook** to your endpoint with `order.paid` event
3. **Your backend extracts order ID** from webhook payload
4. **Your backend calls Cashfree API** with your credentials:
   ```
   GET /pg/orders/{orderId}
   x-client-id: CASHFREE_CLIENT_ID
   x-client-secret: CASHFREE_CLIENT_SECRET
   ```
5. **Cashfree API responds** with order details including `order_status`
6. **Your backend verifies** `order_status === 'PAID'`
7. **If verified**: Activate subscription, provision subdomain, send emails
8. **If not verified**: Reject and log error

---

## Webhook Handler Code

The updated handler in `backend/src/controllers/paymentController.js`:

```javascript
export const cashfreeSubscriptionWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    if (event === 'order.paid') {
      const orderId = req.body.data.order.order_id;
      
      // Verify via Cashfree API
      const apiResponse = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
        }
      });
      
      // Only process if API confirms PAID
      if (apiResponse.data.order_status !== 'PAID') {
        return res.status(200).json({ success: false });
      }
      
      // Process payment (activate subscription, provision subdomain, etc.)
      // ...
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    res.status(500).json({ message: err.message });
  }
};
```

---

## Test the Webhook (Optional)

### Simulate a real payment:
1. Go to your frontend
2. Initiate a test subscription payment
3. Complete payment on Cashfree test gateway
4. Check Railway logs to confirm:
   ```
   Webhook received
   Webhook: API verification - Order status: PAID
   Webhook: Updated tenant subscription...
   Provisioning queued for tenant...
   ```

### Monitor logs on Railway:
```bash
railway logs
```

---

## Environment Variables Needed

On Railway, add these (they should already be set):

```
CASHFREE_CLIENT_ID=<your-cashfree-client-id>
CASHFREE_CLIENT_SECRET=<your-cashfree-client-secret>
CASHFREE_MODE=production
```

**NO webhook secret needed!** ✅

---

## Troubleshooting

### Webhook received but no subscription activated

**Check Railway logs for:**
```
Webhook: API verification - Order status: PAID
```

If you see:
- ❌ `API verification failed` → Check CASHFREE_CLIENT_ID and SECRET
- ❌ `Order not verified as PAID` → Order was received but payment not confirmed

### API call fails

**Verify credentials:**
- CASHFREE_CLIENT_ID and SECRET should be from your Cashfree dashboard
- They should be set on Railway (not just local .env)

**Check API endpoint:**
- We're using: `https://api.cashfree.com/pg/orders/{orderId}`
- Should work for Cashfree v2 API

---

## What Happens After Webhook Confirms Payment

1. ✅ Tenant subscription activated
2. ✅ Subdomain provisioned (e.g., `utkarsh.enromatics.com`)
3. ✅ Branding seeded into Tenant document
4. ✅ User account created (if new tenant)
5. ✅ Login credentials emailed
6. ✅ Subscription confirmation email sent
7. ✅ Portal ready notification sent

---

**Ready to add the webhook in Cashfree?** Just use the URL above, no secret needed! 🚀
