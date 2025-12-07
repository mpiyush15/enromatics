# Cashfree Webhook Setup – Railway Deployment

## Your Webhook URL
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
     - `subscription.charged` (recurring payment)
     - `subscription.cancelled` (subscription cancellation)
   - **Signature Header Name**: `x-cashfree-signature` (or `x-webhook-signature` if available)

4. **Save Webhook**
   - Click **Save** or **Create**
   - Cashfree will provide you a **Webhook Secret/Token**
   - **Copy this secret and save it!**

5. **Update Your `.env` File**
   - Replace `your-webhook-secret-here` with the actual secret from Cashfree:
   ```
   CASHFREE_WEBHOOK_SECRET=<paste-your-secret-here>
   ```

6. **Add to Railway Environment Variables**
   - Go to Railway dashboard → Your EnroMatics project
   - Go to **Variables** tab
   - Add these:
     ```
     CASHFREE_WEBHOOK_SECRET=<paste-same-secret>
     CASHFREE_WEBHOOK_URL=https://endearing-blessing-production-c61f.up.railway.app/api/payments/webhook/cashfree
     ```

## Test the Webhook (Optional)

### Manual Test with curl
```bash
# Generate a test signature (requires your webhook secret)
PAYLOAD='{"event":"order.paid","data":{"order":{"order_id":"test_123","order_status":"PAID","customer_id":"cust_123"}}}'
SECRET="your-webhook-secret-here"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

# Send test webhook
curl -X POST https://endearing-blessing-production-c61f.up.railway.app/api/payments/webhook/cashfree \
  -H "x-cashfree-signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

# Should return: {"success":true}
```

### In Cashfree Dashboard
- Many webhook systems have a **Send Test** button
- Click it to verify your endpoint is reachable
- Check Railway logs to confirm the webhook was received

## Troubleshooting

### Webhook not triggering
- ✅ Verify URL is accessible: `curl https://endearing-blessing-production-c61f.up.railway.app/api/payments/webhook/cashfree`
- ✅ Check webhook is **Active** in Cashfree (not disabled)
- ✅ Verify **events** are subscribed
- ✅ Check Railway logs for errors: `railway logs`

### Signature verification fails
- ✅ Ensure `CASHFREE_WEBHOOK_SECRET` matches exactly (no extra spaces)
- ✅ Verify signature header name matches (`x-cashfree-signature` vs `x-webhook-signature`)
- ✅ Check `backend/src/controllers/paymentController.js` for correct verification logic

### Payment completes but provisioning doesn't happen
- ✅ Check webhook is being received (look for log: `Webhook received`)
- ✅ Verify signature verification passes
- ✅ Check MongoDB `Tenant` collection for `subdomain` and `branding` fields
- ✅ Review provisioning logic in `provisionTenant.js`

## Code Reference

The webhook handler is at:
```
backend/src/controllers/paymentController.js → cashfreeSubscriptionWebhook()
```

It:
1. ✅ Verifies HMAC-SHA256 signature
2. ✅ Checks for `order.paid` event
3. ✅ Updates Tenant subscription status
4. ✅ Calls `provisionTenant()` to generate subdomain
5. ✅ Seeds branding into Tenant document
6. ✅ Sends "Portal Ready" email

---

**Once webhook is live, new payments will auto-provision subdomains!** 🎉
