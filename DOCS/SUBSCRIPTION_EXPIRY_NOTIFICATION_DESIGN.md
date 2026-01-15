# Subscription Expiry Notification System - Design Document

## 📋 System Overview
Send email notifications to tenants when their subscription/trial is expiring, with options to upgrade directly from the dashboard.

---

## 🛣️ API Routes

### 1. Get Expiring Subscriptions
```
GET /api/admin/subscriptions/expiring-soon
Headers: Authorization: Bearer <token>
Response: List of tenants with subscription expiry dates
```

**Filters:**
- `daysUntilExpiry`: 30 (show subscriptions expiring within 30 days)
- `status`: "active" | "trial" | "all"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "tenantId": "tenant_123",
      "tenantName": "ABC Institute",
      "email": "admin@abcinstitute.com",
      "currentPlan": {
        "id": "professional",
        "name": "Professional Plan",
        "price": 9999,
        "duration": "monthly"
      },
      "expiryDate": "2026-02-10",
      "daysRemaining": 31,
      "type": "trial" | "subscription"
    }
  ]
}
```

---

### 2. Send Expiry Notification
```
POST /api/admin/subscriptions/send-expiry-notification
Headers: Authorization: Bearer <token>
Body: {
  "tenantId": "tenant_123",
  "emailType": "trial-expiring" | "subscription-expiring",
  "customMessage": "optional message"
}
Response: Success confirmation
```

---

## 📧 Email Template Structure

### Email Template: `subscription-expiry-notification.html`

```html
<table>
  <tr>
    <td style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <h1>Your Subscription is Expiring Soon!</h1>
    </td>
  </tr>
  <tr>
    <td style="padding: 30px;">
      <h2>Hi [Tenant Name],</h2>
      
      <p>Your current plan <strong>[Plan Name]</strong> will expire on <strong>[Expiry Date]</strong>.</p>
      <p><strong>Days Remaining: [Days Count]</strong></p>
      
      <!-- Current Plan Details -->
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Your Current Plan</h3>
        <p><strong>Plan:</strong> [Plan Name]</p>
        <p><strong>Features Included:</strong></p>
        <ul>
          <li>[Feature 1]</li>
          <li>[Feature 2]</li>
          <li>[Feature 3]</li>
        </ul>
      </div>
      
      <!-- Available Upgrades -->
      <div style="margin: 30px 0;">
        <h3>Explore Upgrade Options</h3>
        <p>Upgrade your plan to get more features and better performance:</p>
        
        <div style="margin-top: 20px;">
          <!-- Upgrade Plan 1 -->
          <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h4>[Plan Name 1] - ₹[Price]/month</h4>
            <ul style="font-size: 14px;">
              <li>[Feature A]</li>
              <li>[Feature B]</li>
            </ul>
          </div>
          
          <!-- Upgrade Plan 2 -->
          <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h4>[Plan Name 2] - ₹[Price]/month</h4>
            <ul style="font-size: 14px;">
              <li>[Feature X]</li>
              <li>[Feature Y]</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h3>Ready to Upgrade?</h3>
        <p>Log in to your dashboard and navigate to "Subscription → Plans" to upgrade your plan.</p>
        <p style="margin-top: 15px;">
          <strong>Your Dashboard:</strong> [Dashboard URL]
        </p>
      </div>
      
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        <strong>Need Help?</strong> Reply to this email or contact our support team.
      </p>
    </td>
  </tr>
  <tr>
    <td style="padding: 20px; background: #f5f5f5; text-align: center; color: #666; font-size: 12px;">
      <p>© 2026 Pixels Dashboard. All rights reserved.</p>
    </td>
  </tr>
</table>
```

---

## 🔄 System Flow

### Trigger Points:
1. **Manual Trigger (from Superadmin)**
   - Superadmin opens Tenants page → Click "Send Expiry Notification" button on a tenant
   - System fetches tenant subscription + available plans
   - Composes email with personalized data
   - Sends via email service

2. **Automatic Trigger (optional, future)**
   - Cron job runs daily, checks subscriptions expiring within 7, 3, 1 days
   - Sends automated notifications

### Data Flow:
```
Superadmin clicks "Send Notification"
    ↓
API validates tenant and subscription
    ↓
Fetch: Tenant info + Current plan + Available plans
    ↓
Compose email with personalized template
    ↓
Send via emailService.sendEmail()
    ↓
Return success/error response
```

---

## 📝 Email Composition Steps

1. **Fetch Tenant Data:**
   - Tenant name, email
   - Current subscription plan (name, features, price)
   - Expiry date, days remaining

2. **Fetch Available Plans:**
   - List all plans from PLANS config
   - Exclude current plan
   - Show benefits of upgrade

3. **Generate Dashboard Link:**
   - Format: `{FRONTEND_URL}/dashboard/[tenantId]/subscription/plans`
   - Include redirect parameter for direct navigation

4. **Compose HTML Template:**
   - Replace placeholders with actual data
   - Include personalized greeting
   - List current plan features
   - Show upgrade options
   - Add dashboard link for easy access

5. **Send Email:**
   - Use existing `emailService.sendEmail()`
   - Subject: "Your subscription expires in X days - Upgrade now!"

---

## 🗄️ Database Models (No Changes Required)
- Use existing `SubscriptionPayment` model to get expiry dates
- Use existing `Tenant` model for contact info
- Use existing `PLANS` config for upgrade options

---

## 🎨 Frontend Changes (Superadmin Tenant View)

### Add Button in Tenant Row:
```
[Tenant Name] | [Status] | [Expiry Date] | [Send Notification] [View]
```

**On Click:**
- Open modal / side panel
- Show tenant subscription info
- Show email preview
- Optional: Add custom message field
- Confirm & Send button

---

## ✉️ Email Service Integration

**Method:** Use existing `sendEmail()` from `emailService.js`

```javascript
await sendEmail({
  to: tenantEmail,
  subject: `Your subscription expires on ${expiryDate}`,
  html: generatedTemplate,
  replyTo: supportEmail
});
```

---

## 🔒 Security & Permissions

- Only **Superadmin** can access this feature
- Validate tenantId belongs to superadmin
- Log all notifications sent for audit trail

---

## 📊 What's NOT included (by your requirement)
- ❌ Direct upgrade links in email
- ❌ One-click upgrade buttons
- User must login to dashboard to upgrade (intentional - for security & tracking)

---

## 🚀 Implementation Order

1. ✅ Create email template composer function
2. ✅ Create API routes (GET expiring + POST send notification)
3. ✅ Add backend controller logic
4. ✅ Create frontend modal/panel for superadmin
5. ✅ Add "Send Notification" button to tenant list
6. ✅ Test end-to-end

---

**Ready to implement? Confirm and I'll code it up!** ✨
