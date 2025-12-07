# Deployment Checklist – Phase 1 Ready to Deploy

## ✅ Code Integration Complete
- [x] Storage routes wired to `backend/src/server.js`
- [x] Video routes wired to `backend/src/server.js`
- [x] Onboarding routes wired to `backend/src/server.js`
- [x] Tenant model updated with subdomain + branding fields
- [x] Trial lock middleware created and ready to apply
- [x] Storage cap middleware created and ready to apply
- [x] Student cap gating integrated into studentController.js
- [x] Cashfree webhook signature verification added

## 📋 Environment Variables – Add to Railway

Required (critical):
```
CASHFREE_CLIENT_ID=<your-cashfree-client-id>
CASHFREE_CLIENT_SECRET=<your-cashfree-client-secret>
CASHFREE_WEBHOOK_SECRET=<your-cashfree-webhook-secret>
AWS_ACCESS_KEY_ID=<your-aws-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret>
AWS_REGION=us-east-1
AWS_S3_BUCKET=enromatics-materials
VIDEO_ACCESS_SECRET=<generate-random-string-for-token-signing>
FRONTEND_URL=https://enromatics.com
BACKEND_URL=https://api.enromatics.com
```

Optional (has defaults):
```
CASHFREE_MODE=production (or 'sandbox' for testing)
```

## 🔧 Post-Deployment Setup

1. **Ensure Cashfree webhook is configured**
   - URL: `https://api.enromatics.com/api/payments/webhook/cashfree`
   - Method: POST
   - Check "Order Paid" and "Order Failed" events
   - Signature header: `x-webhook-signature` or `x-cashfree-signature`

2. **Ensure S3 bucket exists and is private**
   - Bucket name: (value of `AWS_S3_BUCKET` env var)
   - Disable public access
   - Ensure IAM user has permissions: `s3:GetObject`, `s3:PutObject`, `s3:ListBucket`

3. **Configure wildcard DNS (when ready)**
   - Record: `*.enromatics.com` → your Railway backend domain
   - TTL: 3600
   - Test: `nslookup test.enromatics.com`

4. **Optional: Set up SSL for wildcard**
   - Use Cloudflare for auto-renewal, or
   - Manual cert via Let's Encrypt with wildcard support

## 🧪 Quick Post-Deploy Tests

### Test 1: Routes are accessible
```bash
curl https://api.enromatics.com/api/storage/report \
  -H "Authorization: Bearer <admin-token>"
# Should return: { success: true, report: [...], summary: {...} }
```

### Test 2: Onboarding status
```bash
curl https://api.enromatics.com/api/onboarding/status \
  -H "Authorization: Bearer <tenant-token>"
# Should return: { success: true, isComplete: false, steps: {...} }
```

### Test 3: Video access token (requires auth)
```bash
curl -X POST https://api.enromatics.com/api/videos/access \
  -H "Authorization: Bearer <student-token>" \
  -H "Content-Type: application/json" \
  -d '{"videoKey":"tenants/test/materials/video.mp4"}'
# Should return: { success: true, accessToken: "...", signature: "...", signedUrl: "...", watermark: {...} }
```

### Test 4: Cashfree webhook signature (manually)
```bash
# Simulate webhook call
PAYLOAD='{"event":"order.paid","data":{"order":{"order_id":"test_123","order_status":"PAID"}}}'
SECRET="<CASHFREE_WEBHOOK_SECRET>"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

curl -X POST https://api.enromatics.com/api/payments/webhook/cashfree \
  -H "x-cashfree-signature: $SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"
# Should return: { success: true }
```

## 🚀 Deployment Steps (via Railway)

1. Push code to main branch (or your deploy branch):
   ```bash
   git add .
   git commit -m "Phase 1: Plans, gating, storage, video, onboarding"
   git push origin main
   ```

2. Railway auto-deploys on push (if configured)
3. Monitor logs: `railway logs` or Railway dashboard
4. Check for errors in: trial lock, storage cap, video access, Cashfree webhooks

## 📝 What's NOT included yet (Phase 2+)

- AI question generator
- Notes → question converter
- Online test engine V2
- YouTube Live integration
- Student app panel
- Multi-branch support
- Teacher analytics

## ⚠️ Known Limitations

- Storage computation runs live per request (no caching). For scale (100K+ tenants), add nightly aggregation job
- Video watermark is simple text overlay; no DRM yet (Widevine/FairPlay for next phase)
- Onboarding enforces minimum (1 class); student import is manual (can bulk-upload via API)
- Trial lock checks tenant.createdAt; if backdating tenants, adjust manually

## 🔗 Links & Docs

- Features overview: `features.md`
- Implementation guide: `GATING_IMPLEMENTATION_GUIDE.md`
- Phase 1 complete: `PHASE1_IMPLEMENTATION_COMPLETE.md`
- Plan matrix: `backend/config/planMatrix.json`

---

**Ready to deploy?** Confirm these env vars are on Railway, then push!
