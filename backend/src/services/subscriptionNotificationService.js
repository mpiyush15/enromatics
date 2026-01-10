import { PLANS } from '../config/plans.js';

/**
 * Generate subscription expiry notification HTML email
 */
export const generateSubscriptionExpiryEmail = ({
  tenantName,
  currentPlan,
  expiryDate,
  daysRemaining,
  subscriptionType,
  dashboardLink,
  supportEmail = 'support@pixelsdigital.tech'
}) => {
  // Get upgrade plans (exclude current plan)
  const upgradePlans = PLANS.filter(p => p.id !== currentPlan.id);

  const formattedExpiryDate = new Date(expiryDate).toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const isTrialExpiring = subscriptionType === 'trial';
  const headlineText = isTrialExpiring 
    ? `Your Free Trial expires in ${daysRemaining} days!`
    : `Your subscription renewal is due in ${daysRemaining} days`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #f9f9f9;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: bold;
    }
    .header p {
      margin: 8px 0 0 0;
      font-size: 14px;
      opacity: 0.9;
    }
    .content {
      padding: 30px 20px;
      background: white;
    }
    .greeting {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .info-box {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-box strong {
      color: #667eea;
    }
    .plan-details {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .plan-details h3 {
      margin: 0 0 15px 0;
      color: #333;
    }
    .plan-details ul {
      margin: 0;
      padding-left: 20px;
      list-style: none;
    }
    .plan-details li {
      padding: 6px 0;
      color: #555;
    }
    .plan-details li:before {
      content: "✓ ";
      color: #667eea;
      font-weight: bold;
      margin-right: 8px;
    }
    .upgrade-section {
      margin: 30px 0;
    }
    .upgrade-section h3 {
      margin: 0 0 20px 0;
      color: #333;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    .plan-card {
      border: 1px solid #ddd;
      padding: 15px;
      border-radius: 8px;
      background: #fafafa;
    }
    .plan-card h4 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 16px;
    }
    .plan-card .price {
      color: #667eea;
      font-weight: bold;
      font-size: 18px;
      margin-bottom: 10px;
    }
    .plan-card ul {
      margin: 0;
      padding-left: 15px;
      font-size: 13px;
      color: #555;
    }
    .plan-card li {
      margin-bottom: 5px;
    }
    .cta-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    .cta-section h3 {
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .cta-section p {
      margin: 0 0 20px 0;
    }
    .dashboard-link {
      display: inline-block;
      background: white;
      color: #667eea;
      padding: 12px 30px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin: 10px 5px;
      font-size: 14px;
    }
    .dashboard-link:hover {
      background: #f0f0f0;
    }
    .dashboard-url {
      display: block;
      margin-top: 15px;
      font-size: 13px;
      word-break: break-all;
      opacity: 0.9;
    }
    .footer {
      background: #f5f5f5;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #666;
      border-top: 1px solid #ddd;
    }
    .footer p {
      margin: 5px 0;
    }
    @media (max-width: 600px) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
      .header h1 {
        font-size: 22px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>${headlineText}</h1>
      <p>Action required • Don't miss out on your service</p>
    </div>

    <!-- Content -->
    <div class="content">
      <div class="greeting">Hi ${tenantName},</div>
      
      <p>Your current subscription plan will <strong>expire on ${formattedExpiryDate}</strong>.</p>
      
      <!-- Days Remaining Alert -->
      <div class="info-box">
        <strong>⏰ Time Remaining: ${daysRemaining} days</strong>
        <br>Plan Type: <strong>${isTrialExpiring ? 'Free Trial' : 'Paid Subscription'}</strong>
      </div>

      <!-- Current Plan Details -->
      <div class="plan-details">
        <h3>📊 Your Current Plan</h3>
        <p><strong>${currentPlan.name}</strong></p>
        <ul>
          ${(currentPlan.features || []).map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>

      <!-- Upgrade Section -->
      <div class="upgrade-section">
        <h3>🚀 Upgrade Your Plan</h3>
        <p>Get more features and unlock advanced capabilities:</p>
        
        <div class="plans-grid">
          ${upgradePlans.slice(0, 2).map(plan => `
            <div class="plan-card">
              <h4>${plan.name}</h4>
              <div class="price">₹${plan.priceMonthly}/month</div>
              <ul>
                ${(plan.features || []).slice(0, 3).map(f => `<li>${f}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTA Section -->
      <div class="cta-section">
        <h3>Ready to Upgrade?</h3>
        <p>Log in to your dashboard and navigate to "My Subscription" to upgrade your plan.</p>
        <a href="${dashboardLink}" class="dashboard-link">Go to Dashboard</a>
        <div class="dashboard-url">${dashboardLink}</div>
      </div>

      <!-- Support -->
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        <strong>Need Help?</strong><br>
        Have questions about upgrading? Reply to this email or contact us at <strong>${supportEmail}</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>Pixels Dashboard</strong></p>
      <p>© 2026 Pixels Digital. All rights reserved.</p>
      <p style="color: #999;">This is an automated notification. Please do not reply with sensitive information.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate trial expiring banner notification (for topbar)
 */
export const getTrialExpiryNotification = (daysRemaining, tenantId) => {
  if (daysRemaining <= 0) {
    return {
      type: 'error',
      icon: '🚨',
      title: 'Trial Expired',
      message: 'Your free trial has ended. Upgrade now to continue using your dashboard.',
      cta: 'Upgrade Now',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'critical'
    };
  } else if (daysRemaining <= 3) {
    return {
      type: 'error',
      icon: '⏰',
      title: `Trial Expiring in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`,
      message: 'Your free trial is ending soon. Upgrade to keep your service active.',
      cta: 'Upgrade Now',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'high'
    };
  } else if (daysRemaining <= 7) {
    return {
      type: 'warning',
      icon: '⚠️',
      title: `Trial Expiring in ${daysRemaining} days`,
      message: 'Don\'t lose access. Upgrade your plan to continue.',
      cta: 'View Plans',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'medium'
    };
  } else if (daysRemaining <= 30) {
    return {
      type: 'info',
      icon: 'ℹ️',
      title: `Trial Expiring in ${daysRemaining} days`,
      message: 'Explore upgrade options to continue your service.',
      cta: 'Explore Plans',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'low'
    };
  }
  
  return null;
};

/**
 * Generate subscription renewal notification (for topbar)
 */
export const getSubscriptionRenewalNotification = (daysUntilRenewal, tenantId) => {
  if (daysUntilRenewal <= 0) {
    return {
      type: 'error',
      icon: '🔴',
      title: 'Subscription Expired',
      message: 'Your subscription has expired. Renew now to restore access.',
      cta: 'Renew Subscription',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'critical'
    };
  } else if (daysUntilRenewal <= 3) {
    return {
      type: 'error',
      icon: '⏰',
      title: `Subscription Renews in ${daysUntilRenewal} day${daysUntilRenewal === 1 ? '' : 's'}`,
      message: 'Ensure uninterrupted service. Review your subscription.',
      cta: 'Manage Subscription',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'high'
    };
  } else if (daysUntilRenewal <= 7) {
    return {
      type: 'warning',
      icon: '⚠️',
      title: `Subscription Renews in ${daysUntilRenewal} days`,
      message: 'Your plan will renew soon.',
      cta: 'View Details',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'medium'
    };
  } else if (daysUntilRenewal <= 30) {
    return {
      type: 'info',
      icon: 'ℹ️',
      title: `Subscription Renews in ${daysUntilRenewal} days`,
      message: 'Your subscription will renew soon.',
      cta: 'Manage Plan',
      url: `/dashboard/client/${tenantId}/my-subscription`,
      priority: 'low'
    };
  }
  
  return null;
};
