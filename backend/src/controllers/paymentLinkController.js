import PaymentSession from '../models/PaymentSession.js';
import Tenant from '../models/Tenant.js';
import { PLANS } from '../config/plans.js';
import { sendEmail } from '../services/emailService.js';
import crypto from 'crypto';
import axios from 'axios';

// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Use production FRONTEND_URL from environment, fallback to localhost for dev
const FRONTEND_URL = process.env.FRONTEND_URL 
  || process.env.NEXT_PUBLIC_FRONTEND_URL 
  || 'http://localhost:3000';

console.log(`🌐 Payment link generator using FRONTEND_URL: ${FRONTEND_URL}`);

/**
 * Generate a unique payment link for tenant upgrade
 * SuperAdmin selects plan and billing cycle
 */
export const generatePaymentLink = async (req, res) => {
  try {
    const { tenantId, planId, billingCycle } = req.body;
    const superAdminId = req.user._id;

    // Validate inputs
    if (!tenantId || !planId || !billingCycle) {
      return res.status(400).json({ 
        message: 'tenantId, planId, and billingCycle are required' 
      });
    }

    if (!['monthly', 'annual'].includes(billingCycle)) {
      return res.status(400).json({ 
        message: 'billingCycle must be "monthly" or "annual"' 
      });
    }

    // Find plan
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Get tenant details
    const tenant = await Tenant.findOne({ tenantId }).select('name email contactPhone');
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Calculate amount based on billing cycle
    const amount = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual;

    if (amount === 0) {
      return res.status(400).json({ 
        message: 'Cannot create payment link for free plan' 
      });
    }

    // Generate unique session ID
    const sessionId = crypto.randomBytes(16).toString('hex');

    // Create payment session (valid for 24 hours)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const paymentSession = await PaymentSession.create({
      sessionId,
      tenantId,
      planId,
      planName: plan.name,
      billingCycle,
      amount,
      email: tenant.email || '',
      phone: tenant.contact?.phone || '',  // Use tenant.contact.phone (not contactPhone)
      expiresAt,
      createdBy: superAdminId.toString(),
      status: 'pending'
    });

    // Generate payment link
    const paymentLink = `${FRONTEND_URL}/upgrade/checkout?session=${sessionId}`;

    console.log(`✅ Payment link generated for tenant ${tenantId}`);
    console.log(`   Plan: ${plan.name}, Amount: ₹${amount}`);
    console.log(`   Email: ${tenant.email}`);
    console.log(`   Phone: ${tenant.contact?.phone || '(no phone on file)'}`);
    console.log(`   Link: ${paymentLink}`);

    res.status(200).json({
      success: true,
      sessionId,
      paymentLink,
      amount,
      plan: plan.name,
      billingCycle,
      email: tenant.email,
      expiresAt: expiresAt.toISOString(),
      message: 'Payment link generated successfully'
    });

  } catch (error) {
    console.error('Error generating payment link:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Send payment link via email
 */
export const sendPaymentLinkEmail = async (req, res) => {
  try {
    const { sessionId, recipientEmail } = req.body;

    // Find payment session
    const session = await PaymentSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Payment session not found' });
    }

    // Check if session is expired
    if (new Date() > session.expiresAt) {
      return res.status(400).json({ message: 'Payment link has expired' });
    }

    const paymentLink = `${FRONTEND_URL}/upgrade/checkout?session=${sessionId}`;

    // Send email
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .plan-box { background: white; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .amount { font-size: 28px; color: #059669; font-weight: bold; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { color: #6b7280; font-size: 12px; text-align: center; margin-top: 20px; }
            .alert { background: #fef3c7; border: 1px solid #fcd34d; padding: 12px; border-radius: 4px; color: #92400e; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>💳 Complete Your Upgrade</h1>
              <p>Your payment link is ready!</p>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              
              <p>We're excited to help you upgrade your Enromatics subscription. Click the button below to complete your payment.</p>
              
              <div class="plan-box">
                <h3 style="margin-top: 0;">${session.planName}</h3>
                <p><strong>Billing:</strong> ${session.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}</p>
                <p><strong>Amount:</strong> <span class="amount">₹${session.amount.toLocaleString('en-IN')}</span></p>
              </div>
              
              <div style="text-align: center;">
                <a href="${paymentLink}" class="button">Complete Payment</a>
              </div>
              
              <div class="alert">
                <strong>⏰ Important:</strong> This payment link expires in 48 hours (${new Date(session.expiresAt).toLocaleString('en-IN')})
              </div>
              
              <h4>Can't click the button?</h4>
              <p>Copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; font-size: 12px;">
                ${paymentLink}
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <h4>Why upgrade?</h4>
              <ul>
                <li>✓ Access all premium features</li>
                <li>✓ Unlimited student management</li>
                <li>✓ Priority support</li>
                <li>✓ Advanced analytics</li>
              </ul>
              
              <div class="footer">
                <p>Questions? <a href="https://enromatics.com/support" style="color: #2563eb;">Contact our support team</a></p>
                <p>© 2026 Enromatics. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    console.log(`📧 Sending payment link to ${recipientEmail}`);

    // Send email using the email service
    await sendEmail({
      to: recipientEmail,
      subject: `Complete Your Payment - ${session.planName} Plan Upgrade`,
      html: emailContent,
      type: 'payment-link',
      tenantId: session.tenantId
    });

    console.log(`✅ Payment link email sent successfully to ${recipientEmail}`);

    res.status(200).json({
      success: true,
      message: 'Payment link email sent successfully',
      paymentLink
    });

  } catch (error) {
    console.error('Error sending payment email:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send payment email' 
    });
  }
};

/**
 * Get all plans for SuperAdmin to choose from
 */
export const getAllPlans = async (req, res) => {
  try {
    // Filter out trial and free plans
    const paidPlans = PLANS.filter(p => p.priceMonthly > 0);

    res.status(200).json({
      success: true,
      plans: paidPlans.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceAnnual: p.priceAnnual
      }))
    });

  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get payment session details (for verification)
 */
export const getPaymentSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await PaymentSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check expiry
    const isExpired = new Date() > session.expiresAt;

    res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      planName: session.planName,
      billingCycle: session.billingCycle,
      amount: session.amount,
      email: session.email,
      isExpired,
      expiresAt: session.expiresAt,
      status: session.status
    });

  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all payment sessions for a tenant
 */
export const getTenantPaymentSessions = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;

    const query = { tenantId };
    if (status) query.status = status;

    const sessions = await PaymentSession.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PaymentSession.countDocuments(query);

    res.status(200).json({
      success: true,
      sessions,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching payment sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Initiate Cashfree payment session for a payment link (sessionId-based)
 * Called from frontend when customer clicks "Proceed to Payment"
 */
export const initiatePaymentLinkPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'sessionId is required' 
      });
    }

    // Fetch the payment session details
    const session = await PaymentSession.findOne({ sessionId });
    if (!session) {
      return res.status(404).json({ 
        success: false,
        message: 'Payment session not found' 
      });
    }

    // Check if session is expired
    const isExpired = new Date() > session.expiresAt;
    if (isExpired) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment session has expired' 
      });
    }

    // Check Cashfree credentials
    if (!CASHFREE_CLIENT_ID || !CASHFREE_CLIENT_SECRET) {
      console.error('❌ Cashfree credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    console.log('💳 Creating Cashfree payment session for payment link:', {
      sessionId,
      tenantId: session.tenantId,
      amount: session.amount,
      email: session.email
    });

    // Create Cashfree order using same approach as subscriptionCheckoutController
    const orderId = `paylink_${sessionId.substring(0, 12)}_${Date.now()}`;
    
    const orderPayload = {
      order_id: orderId,
      order_amount: session.amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: session.tenantId,
        customer_email: session.email,
        customer_phone: session.phone || '9999999999'
      },
      order_meta: {
        return_url: `${FRONTEND_URL}/upgrade/status?session=${sessionId}`,
        sessionId: sessionId,
        tenantId: session.tenantId
      },
      order_note: `${session.planName} - ${session.billingCycle} - Session: ${sessionId}`
    };

    console.log('📤 Sending to Cashfree:', {
      orderId,
      amount: session.amount,
      email: session.email,
      phone: session.phone || '(fallback: 9999999999)',
      returnUrl: orderPayload.order_meta.return_url
    });

    const response = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      orderPayload,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01',
          'Content-Type': 'application/json'
        }
      }
    );

    // Update session status to processing
    session.status = 'pending';  // Keep as pending, will update to completed when payment succeeds
    session.orderId = orderId;
    session.cashfreeOrderId = response.data.order_id;
    await session.save();

    console.log('✅ Cashfree payment session created:', {
      orderId: response.data.order_id,
      paymentSessionId: response.data.payment_session_id
    });

    return res.status(200).json({
      success: true,
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      message: 'Payment session created successfully'
    });

  } catch (error) {
    console.error('❌ Error initiating payment link payment:', error.message);
    if (error.response?.data) {
      console.error('Cashfree error details:', error.response.data);
    }
    return res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to initiate payment'
    });
  }
};

/**
 * Webhook handler for payment link payments
 * Called when payment is confirmed (from frontend verify-upgrade endpoint)
 * Updates tenant subscription to paid plan
 */
export const handlePaymentLinkWebhook = async (req, res) => {
  try {
    const { orderId, status, sessionId } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: 'orderId and status are required'
      });
    }

    console.log('🔔 Payment link webhook received:', {
      orderId,
      status,
      sessionId
    });

    // Find the payment session
    let session = null;
    if (sessionId) {
      session = await PaymentSession.findOne({ sessionId });
    } else {
      // Try to find by orderId
      session = await PaymentSession.findOne({ orderId });
    }

    if (!session) {
      console.warn('⚠️ Payment session not found for order:', orderId);
      // Don't fail - payment might still be valid
    }

    // If payment is confirmed, update tenant subscription
    if (status === 'PAID' || status === 'completed') {
      const tenantId = session?.tenantId;
      
      if (!tenantId) {
        console.error('❌ Cannot update tenant - tenantId not found');
        return res.status(400).json({
          success: false,
          message: 'tenantId not found in payment session'
        });
      }

      // Find tenant
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        console.error('❌ Tenant not found:', tenantId);
        return res.status(404).json({
          success: false,
          message: 'Tenant not found'
        });
      }

      // Get the pending plan from session
      const pendingPlan = session?.planId;
      if (!pendingPlan) {
        console.error('❌ No pending plan found in session');
        return res.status(400).json({
          success: false,
          message: 'No plan information in payment session'
        });
      }

      // Update tenant subscription to active with the new plan
      const today = new Date();
      const endDate = new Date(today);
      
      // Calculate end date based on billing cycle
      if (session.billingCycle === 'annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      tenant.plan = pendingPlan;
      tenant.subscription = {
        status: 'active',
        paymentId: orderId,
        startDate: today,
        endDate: endDate,
        billingCycle: session.billingCycle,
        pendingPlan: null  // Clear pending plan
      };
      
      await tenant.save();

      // Update payment session to completed
      if (session) {
        session.status = 'completed';
        session.completedAt = new Date();
        await session.save();
      }

      console.log('✅ Tenant subscription updated:', {
        tenantId,
        plan: pendingPlan,
        status: 'active',
        endDate: endDate
      });

      return res.status(200).json({
        success: true,
        message: 'Payment verified and tenant subscription upgraded successfully',
        details: {
          tenantId,
          plan: pendingPlan,
          subscriptionStatus: 'active',
          endDate: endDate
        }
      });
    }

    return res.status(200).json({
      success: false,
      message: `Payment status is ${status}, not confirmed yet`
    });

  } catch (error) {
    console.error('❌ Error processing payment link webhook:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment webhook'
    });
  }
};
