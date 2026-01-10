/**
 * Superadmin Notification Service
 * Sends emails to superadmin for key business events:
 * - New signups
 * - New demo requests
 * - New subscriptions
 */

import { sendEmail } from "./emailService.js";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL || 'mpiyush2727@gmail.com';

/**
 * Notify superadmin about new user signup
 */
export const notifyNewSignup = async (userData) => {
  try {
    const { name, email, phone, instituteName, plan, isTrial, tenantId } = userData;
    
    const planText = isTrial ? `Trial (${plan || 'Basic'})` : 'Free';
    const signupType = tenantId ? 'Staff Member' : 'New Account';

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .details { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .details p { margin: 10px 0; }
          .label { font-weight: 600; color: #1e40af; min-width: 120px; display: inline-block; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .badge-trial { background: #fef3c7; color: #92400e; }
          .badge-free { background: #dbeafe; color: #1e40af; }
          .badge-staff { background: #e0e7ff; color: #3730a3; }
          .cta { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 11px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🎉 New ${signupType}</h2>
          </div>
          <div class="content">
            <p>A new user has signed up for Enromatics!</p>
            
            <div class="details">
              <p><span class="label">Type:</span> <span class="badge ${isTrial ? 'badge-trial' : tenantId ? 'badge-staff' : 'badge-free'}">${signupType}</span></p>
              <p><span class="label">Name:</span> ${name}</p>
              <p><span class="label">Email:</span> ${email}</p>
              <p><span class="label">Phone:</span> ${phone || 'Not provided'}</p>
              ${instituteName ? `<p><span class="label">Institution:</span> ${instituteName}</p>` : ''}
              <p><span class="label">Plan:</span> <strong>${planText}</strong></p>
              <p><span class="label">Signup Time:</span> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>

            <p><strong>Quick Actions:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              ${tenantId ? `<li>New staff member added to existing tenant</li>` : `<li>New account created with ${isTrial ? 'trial access' : 'free plan'}</li>`}
              <li>${isTrial ? 'Trial expires in 14 days' : 'User can upgrade anytime'}</li>
              <li>Access their dashboard to manage settings</li>
            </ul>

            <a href="${process.env.FRONTEND_URL || 'https://enromatics.com'}/dashboard/admin/users?search=${email}" class="cta">View User in Dashboard →</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you're the superadmin of Enromatics</p>
            <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: SUPERADMIN_EMAIL,
      subject: `✨ New ${signupType}: ${name}`,
      html: emailContent,
      type: 'superadmin-notification'
    });

    console.log('✅ [SUPERADMIN] New signup notification sent to:', SUPERADMIN_EMAIL);
  } catch (err) {
    console.error('❌ [SUPERADMIN] Failed to send signup notification:', err.message);
    // Don't throw - don't block signup if email fails
  }
};

/**
 * Notify superadmin about new demo request
 */
export const notifyNewDemoRequest = async (demoData) => {
  try {
    const { name, email, phone, company, message, demoDateTime } = demoData;

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .details { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .details p { margin: 10px 0; }
          .label { font-weight: 600; color: #92400e; min-width: 120px; display: inline-block; }
          .status-badge { background: #fbbf24; color: #78350f; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .cta { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 11px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🎯 New Demo Request</h2>
          </div>
          <div class="content">
            <p>Someone has requested a demo of Enromatics!</p>
            
            <div class="details">
              <p><span class="label">Name:</span> ${name}</p>
              <p><span class="label">Company:</span> ${company}</p>
              <p><span class="label">Email:</span> ${email}</p>
              <p><span class="label">Phone:</span> ${phone}</p>
              <p><span class="label">Status:</span> <span class="status-badge">Pending</span></p>
              <p><span class="label">Requested Date:</span> ${new Date(demoDateTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
              ${message ? `<p><span class="label">Message:</span><br/>${message}</p>` : ''}
            </div>

            <p><strong>Next Steps:</strong></p>
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li>Review the demo request details</li>
              <li>Confirm the demo schedule with the requester</li>
              <li>Send meeting link before the demo</li>
            </ol>

            <a href="${process.env.FRONTEND_URL || 'https://enromatics.com'}/dashboard/admin/demo-requests" class="cta">View Demo Requests →</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you're the superadmin of Enromatics</p>
            <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: SUPERADMIN_EMAIL,
      subject: `🎯 New Demo Request from ${company}`,
      html: emailContent,
      type: 'superadmin-notification'
    });

    console.log('✅ [SUPERADMIN] New demo request notification sent to:', SUPERADMIN_EMAIL);
  } catch (err) {
    console.error('❌ [SUPERADMIN] Failed to send demo request notification:', err.message);
  }
};

/**
 * Notify superadmin about new subscription/payment
 */
export const notifyNewSubscription = async (subscriptionData) => {
  try {
    const { tenantId, tenantName, email, planId, planName, amount, billingCycle, startDate, endDate } = subscriptionData;

    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 25px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .details { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .details p { margin: 10px 0; }
          .label { font-weight: 600; color: #166534; min-width: 140px; display: inline-block; }
          .amount-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 5px; font-weight: 600; font-size: 14px; display: inline-block; }
          .cta { background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 15px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 11px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">💰 New Subscription Payment Confirmed</h2>
          </div>
          <div class="content">
            <p>A new subscription payment has been successfully processed!</p>
            
            <div class="details">
              <p><span class="label">Organization:</span> ${tenantName}</p>
              <p><span class="label">Email:</span> ${email}</p>
              <p><span class="label">Plan:</span> <strong>${planName || planId}</strong></p>
              <p><span class="label">Amount:</span> <span class="amount-badge">₹${amount?.toLocaleString('en-IN') || 'N/A'}</span></p>
              <p><span class="label">Billing Cycle:</span> ${billingCycle || 'Monthly'}</p>
              <p><span class="label">Start Date:</span> ${new Date(startDate).toLocaleDateString('en-IN')}</p>
              <p><span class="label">End Date:</span> ${new Date(endDate).toLocaleDateString('en-IN')}</p>
              <p><span class="label">Tenant ID:</span> <code style="background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px;">${tenantId}</code></p>
            </div>

            <p><strong>Revenue Summary:</strong></p>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Revenue: ₹${amount?.toLocaleString('en-IN') || 'N/A'}</li>
              <li>Plan: ${planName || planId}</li>
              <li>Billing: ${billingCycle || 'Monthly'}</li>
            </ul>

            <a href="${process.env.FRONTEND_URL || 'https://enromatics.com'}/dashboard/admin/subscriptions?tenantId=${tenantId}" class="cta">View Subscription →</a>
          </div>
          <div class="footer">
            <p>You're receiving this email because you're the superadmin of Enromatics</p>
            <p>&copy; ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail({
      to: SUPERADMIN_EMAIL,
      subject: `💰 New Subscription: ${planName || planId} - ₹${amount?.toLocaleString('en-IN') || 'N/A'}`,
      html: emailContent,
      type: 'superadmin-notification'
    });

    console.log('✅ [SUPERADMIN] New subscription notification sent to:', SUPERADMIN_EMAIL);
  } catch (err) {
    console.error('❌ [SUPERADMIN] Failed to send subscription notification:', err.message);
  }
};

export default {
  notifyNewSignup,
  notifyNewDemoRequest,
  notifyNewSubscription,
  SUPERADMIN_EMAIL
};
