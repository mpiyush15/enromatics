import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { PLANS } from '../config/plans.js';
import axios from 'axios';
import Tenant from '../models/Tenant.js';
import { sendEmail, sendCredentialsEmail, sendSubscriptionConfirmationEmail } from '../services/emailService.js';
import { generateInvoicePdf } from '../services/pdfService.js';
import crypto from 'crypto';
import { provisionTenant } from '../../lib/provisionTenant.js';

// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Generate random 6-digit password
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const CASHFREE_MODE = process.env.CASHFREE_MODE || 'production';

// Helper: Detect plan from payment amount (fallback when order_meta is missing)
const detectPlanFromAmount = (amount) => {
  // Check exact matches first (monthly prices)
  for (const plan of PLANS) {
    if (plan.priceMonthly === amount || plan.priceAnnual === amount) {
      return plan.id;
    }
  }
  // If no exact match, return null
  return null;
};

/**
 * Initiate payment for a subscription plan
 */
export const initiateSubscriptionPayment = async (req, res) => {
  try {
    const { tenantId, planId, email, phone: reqPhone, billingCycle, instituteName, name } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });

    // Generate a unique tenantId if not provided
    const finalTenantId = tenantId || `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Determine billing cycle
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    // Check if tenant exists, if not create one
    let tenant = await Tenant.findOne({ 
      $or: [
        { tenantId: finalTenantId },
        { email: email }
      ]
    });

    if (!tenant) {
      // Create new tenant record - this is a new signup
      tenant = await Tenant.create({
        tenantId: finalTenantId,
        name: name || instituteName || email.split('@')[0],
        instituteName: instituteName || null,
        email: email,
        plan: 'trial', // Start with trial, upgrade after payment success
        active: true,
        contact: {
          phone: reqPhone,
          country: 'India'
        },
        subscription: {
          status: 'pending', // Pending until payment confirmed
          paymentId: null,
          startDate: null,
          endDate: null,
          billingCycle: cycle,
          pendingPlan: planId // Store the plan they're trying to upgrade to
        }
      });
      console.log('Created new tenant:', tenant.tenantId, 'Pending plan:', planId);
    } else {
      // Existing tenant - DON'T change plan yet, just mark as pending upgrade
      // Store the pending plan in subscription metadata
      tenant.subscription.billingCycle = cycle;
      tenant.subscription.pendingPlan = planId; // Store pending plan, don't change current plan
      // Only set to pending if not already active
      if (tenant.subscription.status !== 'active') {
        tenant.subscription.status = 'pending';
      }
      await tenant.save();
      console.log('Tenant upgrade initiated:', tenant.tenantId, 'Current:', tenant.plan, 'Pending:', planId);
    }

    // Use the tenant's actual tenantId
    const customerTenantId = tenant.tenantId;

    // Get phone - try request, then tenant contact, then fallback
    const phone = reqPhone || tenant?.contact?.phone || '9999999999';
    console.log('Using phone for payment:', phone);

    // Determine price based on billing cycle
    let orderAmount = plan.priceMonthly;
    if (cycle === 'annual') {
      orderAmount = plan.priceAnnual;
    }

    // Create order in Cashfree
    const orderPayload = {
      order_id: `sub_${customerTenantId}_${Date.now()}`,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerTenantId,
        customer_email: email,
        customer_phone: phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id={order_id}`,
        plan_id: plan.id,
        billing_cycle: cycle
      }
    };

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

    // Store the order ID in tenant for tracking
    tenant.subscription.paymentId = response.data.order_id;
    await tenant.save();

    // Log the payment as pending in SubscriptionPayment
    try {
      let duration = 30 * 24 * 60 * 60 * 1000; // monthly
      if (cycle === 'annual') {
        duration = 365 * 24 * 60 * 60 * 1000;
      }
      await SubscriptionPayment.create({
        tenantId: customerTenantId,
        amount: orderAmount,
        totalAmount: orderAmount,
        planName: plan.name,
        planKey: plan.id,
        billingCycle: cycle,
        periodStart: new Date(),
        periodEnd: new Date(Date.now() + duration),
        paymentMethod: 'cashfree',
        gatewayOrderId: response.data.order_id,
        status: 'pending',
        notes: `Payment initiated - ${new Date().toISOString()}`,
        tenantSnapshot: {
          instituteName: tenant.instituteName || tenant.name,
          email: tenant.email,
          phone: phone,
        }
      });
      console.log('Logged pending payment for order:', response.data.order_id);
    } catch (logErr) {
      console.error('Failed to log pending payment:', logErr?.message || logErr);
    }

    // Send email to tenant for payment initiation
    await sendEmail({
      to: email,
      subject: `Payment Initiated for ${plan.name} (${cycle})`,
      html: `<p>Your payment of ₹${orderAmount} for the ${plan.name} (${cycle}) plan has been initiated. Please complete the payment to activate your subscription.</p>`
    });

    // Cashfree returns payment_session_id for creating checkout
    const paymentSessionId = response.data.payment_session_id;
    const paymentLink = response.data.payment_link;
    
    console.log('Cashfree Response:', JSON.stringify(response.data, null, 2));

    res.status(200).json({
      success: true,
      paymentSessionId: paymentSessionId,
      paymentLink: paymentLink,
      orderId: response.data.order_id,
      tenantId: customerTenantId,
      plan,
      billingCycle: cycle
    });
  } catch (err) {
    console.error('Initiate Subscription Payment Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Verify subscription payment status
 */
export const verifySubscriptionPayment = async (req, res) => {
  try {
    const { orderId } = req.query;
    const response = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01'
        }
      }
    );
    const order = response.data;
    console.log('Verify order response:', JSON.stringify(order, null, 2));

    if (order.order_status === 'PAID') {
      // Find tenant by tenantId OR by email OR by paymentId
      let tenant = await Tenant.findOne({ 
        $or: [
          { tenantId: order.customer_details.customer_id },
          { email: order.customer_details.customer_email },
          { 'subscription.paymentId': order.order_id }
        ]
      });
      
      if (tenant) {
        // Safely get plan_id from order_meta (Cashfree may not return it)
        const orderMeta = order.order_meta || {};
        const orderAmount = order.order_amount || 0;
        
        // Priority for plan detection:
        // 1. order_meta.plan_id (from Cashfree - often missing)
        // 2. Detect from payment amount (most reliable!)
        // 3. Tenant's existing plan (set during order initiation)
        // 4. Default to 'free'
        let planId = orderMeta.plan_id;
        if (!planId) {
          planId = detectPlanFromAmount(orderAmount);
        }
        if (!planId) {
          planId = tenant.plan;
        }
        if (!planId || planId === 'professional') {
          // If still professional (old default), try to detect from amount
          const detected = detectPlanFromAmount(orderAmount);
          if (detected) planId = detected;
        }
        planId = planId || 'free';
        
        const billingCycle = orderMeta.billing_cycle || tenant.subscription?.billingCycle || 'monthly';
        
        console.log('Order meta:', JSON.stringify(orderMeta));
        console.log('Order amount:', orderAmount, 'Detected plan:', planId);
        
        const plan = PLANS.find(p => p.id === planId) || { id: planId, name: planId };
        tenant.plan = planId;
        
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (billingCycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        const startDate = new Date();
        const endDate = new Date(Date.now() + duration);
        
        // Generate invoice number (find max and increment)
        const maxInvoice = await Tenant.findOne({ 'subscription.invoiceNumber': { $exists: true, $ne: null } })
          .sort({ 'subscription.invoiceNumber': -1 })
          .select('subscription.invoiceNumber');
        const nextInvoiceNumber = (maxInvoice?.subscription?.invoiceNumber || 0) + 1;
        
        tenant.subscription = {
          status: 'active',
          paymentId: order.order_id,
          startDate: startDate,
          endDate: endDate,
          billingCycle: billingCycle,
          amount: orderAmount,
          currency: 'INR',
          invoiceNumber: nextInvoiceNumber
        };
        tenant.paid_status = true; // Mark as paid
        await tenant.save();
        console.log('Updated tenant subscription:', tenant.tenantId, 'Plan:', tenant.plan, 'Invoice:', nextInvoiceNumber);

        // Also update SubscriptionPayment record status to 'success' if it exists
        try {
          const existingPayment = await SubscriptionPayment.findOne({
            gatewayOrderId: order.order_id
          });
          
          if (existingPayment) {
            existingPayment.status = 'success';
            existingPayment.paidAt = new Date();
            existingPayment.planKey = planId;
            existingPayment.planName = plan.name || planId;
            existingPayment.notes = `Status updated via verify endpoint - ${new Date().toISOString()}`;
            await existingPayment.save();
            console.log('Updated payment record to success:', order.order_id);
          }
        } catch (paymentErr) {
          console.error('Failed to update payment record:', paymentErr?.message);
        }

        // Trigger provisioning after verify success as well
        try {
          await provisionTenant({
            tenantId: tenant.tenantId,
            instituteName: tenant.instituteName || tenant.name,
            branding: tenant.branding || {},
          });
        } catch (e) {
          console.error('Provisioning trigger (verify) failed:', e?.message || e);
        }

        // Check if user account exists, if not create one
        let user = await User.findOne({ email: tenant.email });
        let generatedPassword = null;
        
        if (!user) {
          // Generate random 6-digit password
          generatedPassword = generatePassword();
          
          user = await User.create({
            name: tenant.name,
            email: tenant.email,
            password: generatedPassword, // Will be hashed by pre-save hook
            phone: tenant.contact?.phone || null,
            tenantId: tenant.tenantId,
            role: 'tenantAdmin',
            status: 'active',
            plan: tenant.plan,
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate,
            requirePasswordReset: true, // Force password reset on first login
          });
          console.log('Created new user account:', user.email);
          
          // Send credentials email
          await sendCredentialsEmail({
            to: tenant.email,
            name: tenant.name,
            instituteName: tenant.instituteName || tenant.name,
            email: tenant.email,
            password: generatedPassword,
            loginUrl: `${process.env.FRONTEND_URL}/login`,
            tenantId: tenant.tenantId,
            userId: user._id
          });
          console.log('Sent credentials email to:', tenant.email);
        } else {
          // User exists, just update subscription status
          user.plan = tenant.plan;
          user.subscriptionStatus = 'active';
          user.subscriptionEndDate = endDate;
          await user.save();
        }

        // Send subscription confirmation email with receipt
        await sendSubscriptionConfirmationEmail({
          to: tenant.email,
          subscriptionDetails: {
            planName: plan.name || planId,
            amount: order.order_amount,
            billingCycle: billingCycle,
            startDate: startDate,
            endDate: endDate,
            instituteName: tenant.instituteName || tenant.name
          },
          tenantId: tenant.tenantId,
          userId: user?._id
        });
        console.log('Sent subscription confirmation email to:', tenant.email);

        // Notify portal ready (post-provisioning)
        try {
          await sendEmail({
            to: tenant.email,
            subject: 'Your EnroMatics portal is ready',
            html: `<p>Your portal is ready at <a href="https://${tenant.subdomain}">${tenant.subdomain}</a>. You can log in and start onboarding.</p>`
          });
        } catch (e) {
          console.error('Portal ready email failed:', e?.message || e);
        }
      }
    } else {
      // Send email for failed payment
      const tenant = await Tenant.findOne({ tenantId: order.customer_details.customer_id });
      if (tenant) {
        await sendEmail({
          to: tenant.email,
          subject: `Payment Failed for ${tenant.plan}`,
          html: `<p>Your payment for the ${tenant.plan} plan was not successful. Please try again.</p>`
        });
      }
    }
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error('Verify Subscription Payment Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Cashfree webhook for subscription payment status updates
 * Verifies order status via Cashfree API instead of signature
 */
export const cashfreeSubscriptionWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    const eventData = req.body.data;
    
    console.log(`=== WEBHOOK RECEIVED ===`);
    console.log(`Event: ${event}`);
    console.log(`Data:`, JSON.stringify(eventData, null, 2));
    console.log(`=======================`);
    
    // Handle payment success events
    if (['order.paid', 'payment_success', 'success_payment', 'transaction_wise_settlement_success'].includes(event)) {
      console.log(`Processing payment success event: ${event}`);
      const orderData = eventData.order || eventData;
      const orderId = orderData.order_id;
      const tenantId = orderData.customer_details?.customer_id || orderData.customerId;
      const customerEmail = orderData.customer_details?.customer_email || orderData.email;
      const orderMeta = orderData.order_meta || {};
      const orderAmount = orderData.order_amount || orderData.amount || 0;
      
      // Verify order status via Cashfree API (instead of signature)
      try {
        const apiResponse = await axios.get(`${CASHFREE_BASE_URL}/orders/${orderId}`, {
          headers: {
            'x-client-id': CASHFREE_CLIENT_ID,
            'x-client-secret': CASHFREE_CLIENT_SECRET,
          }
        });
        
        const apiOrder = apiResponse.data;
        console.log('Webhook: API verification - Order status:', apiOrder.order_status);
        
        // Only process if API confirms PAID status
        if (apiOrder.order_status !== 'PAID') {
          console.warn('Webhook: API verification failed - Order not PAID, status:', apiOrder.order_status);
          return res.status(200).json({ success: false, message: 'Order not verified as PAID' });
        }
      } catch (apiErr) {
        console.error('Webhook: Cashfree API verification failed:', apiErr?.message || apiErr);
        return res.status(200).json({ success: false, message: 'API verification failed' });
      }
      
      // Find tenant by tenantId or email
      let tenant = await Tenant.findOne({ 
        $or: [
          { tenantId },
          { email: customerEmail }
        ]
      });
      
      if (tenant) {
        // Priority for plan detection:
        // 1. order_meta.plan_id (from Cashfree - often missing)
        // 2. Detect from payment amount (most reliable!)
        // 3. Tenant's existing plan (set during order initiation)
        // 4. Default to 'free'
        let planId = orderMeta.plan_id;
        if (!planId) {
          planId = detectPlanFromAmount(orderAmount);
        }
        if (!planId) {
          planId = tenant.plan;
        }
        if (!planId || planId === 'professional') {
          // If still professional (old default), try to detect from amount
          const detected = detectPlanFromAmount(orderAmount);
          if (detected) planId = detected;
        }
        planId = planId || 'free';
        
        const billingCycle = orderMeta.billing_cycle || tenant.subscription?.billingCycle || 'monthly';
        
        console.log('Webhook: Order amount:', orderAmount, 'Detected plan:', planId);
        
        const plan = PLANS.find(p => p.id === planId) || { name: planId };
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (billingCycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        const startDate = new Date();
        const endDate = new Date(Date.now() + duration);
        
        // Generate invoice number (find max and increment)
        const maxInvoice = await Tenant.findOne({ 'subscription.invoiceNumber': { $exists: true, $ne: null } })
          .sort({ 'subscription.invoiceNumber': -1 })
          .select('subscription.invoiceNumber');
        const nextInvoiceNumber = (maxInvoice?.subscription?.invoiceNumber || 0) + 1;
        
        tenant.plan = planId;
        tenant.subscription = {
          status: 'active',
          paymentId: orderId,
          startDate: startDate,
          endDate: endDate,
          billingCycle,
          amount: orderAmount,
          currency: 'INR',
          invoiceNumber: nextInvoiceNumber,
          pendingPlan: null // Clear pending plan on success
        };
        tenant.paid_status = true; // Mark as paid user for white-label/onboarding flow
        await tenant.save();
        console.log('Webhook: Updated tenant subscription:', tenant.tenantId, 'Plan:', planId, 'Invoice:', nextInvoiceNumber, 'Paid status: true');

        // Update existing pending payment to success (or create if not found)
        try {
          const existingPayment = await SubscriptionPayment.findOne({ 
            gatewayOrderId: orderId, 
            status: 'pending' 
          });
          
          if (existingPayment) {
            existingPayment.status = 'success';
            existingPayment.paidAt = new Date();
            existingPayment.periodStart = startDate;
            existingPayment.periodEnd = endDate;
            existingPayment.planKey = planId;
            existingPayment.planName = plan.name || planId;
            existingPayment.notes = `Payment successful - ${new Date().toISOString()}`;
            await existingPayment.save();
            console.log('Webhook: Updated pending payment to success:', orderId);
          } else {
            // Create new if pending record not found
            await SubscriptionPayment.create({
              tenantId: tenant.tenantId,
              invoiceDate: new Date(),
              amount: orderAmount,
              totalAmount: orderAmount,
              planName: plan.name || planId,
              planKey: planId,
              billingCycle: billingCycle,
              periodStart: startDate,
              periodEnd: endDate,
              paymentMethod: 'cashfree',
              gatewayOrderId: orderId,
              gatewayPaymentId: orderId,
              status: 'success',
              paidAt: new Date(),
              tenantSnapshot: {
                instituteName: tenant.instituteName || tenant.name,
                email: tenant.email,
                phone: tenant.contact?.phone,
              }
            });
            console.log('Webhook: Created new success payment record:', orderId);
          }
        } catch (paymentLogErr) {
          console.error('Failed to log successful payment:', paymentLogErr?.message || paymentLogErr);
        }

        // Trigger post-payment provisioning (subdomain + branding seed)
        try {
          await provisionTenant({
            tenantId: tenant.tenantId,
            instituteName: tenant.instituteName || tenant.name,
            branding: tenant.branding || {},
          });
          console.log('Provisioning queued for tenant:', tenant.tenantId);
        } catch (e) {
          console.error('Provisioning trigger failed:', e?.message || e);
        }

        // Check if user account exists, if not create one
        let user = await User.findOne({ email: tenant.email });
        let generatedPassword = null;
        
        if (!user) {
          // Generate random 6-digit password
          generatedPassword = generatePassword();
          
          user = await User.create({
            name: tenant.name,
            email: tenant.email,
            password: generatedPassword,
            phone: tenant.contact?.phone || null,
            tenantId: tenant.tenantId,
            role: 'tenantAdmin',
            status: 'active',
            plan: tenant.plan,
            subscriptionStatus: 'active',
            subscriptionEndDate: endDate,
            requirePasswordReset: true,
          });
          console.log('Webhook: Created new user account:', user.email);
          
          // Send credentials email
          await sendCredentialsEmail({
            to: tenant.email,
            name: tenant.name,
            instituteName: tenant.instituteName || tenant.name,
            email: tenant.email,
            password: generatedPassword,
            loginUrl: `${process.env.FRONTEND_URL}/login`,
            tenantId: tenant.tenantId,
            userId: user._id
          });
        } else {
          // Update existing user
          user.plan = tenant.plan;
          user.subscriptionStatus = 'active';
          user.subscriptionEndDate = endDate;
          await user.save();
        }

        // Send subscription confirmation email
        await sendSubscriptionConfirmationEmail({
          to: tenant.email,
          subscriptionDetails: {
            planName: plan.name,
            amount: orderAmount,
            billingCycle: billingCycle,
            startDate: startDate,
            endDate: endDate,
            instituteName: tenant.instituteName || tenant.name
          },
          tenantId: tenant.tenantId,
          userId: user?._id
        });

        // Notify portal ready (post-provisioning)
        try {
          await sendEmail({
            to: tenant.email,
            subject: 'Your EnroMatics portal is ready',
            html: `<p>Your portal is ready at <a href="https://${tenant.subdomain}">${tenant.subdomain}</a>. You can log in and start onboarding.</p>`
          });
        } catch (e) {
          console.error('Portal ready email (webhook) failed:', e?.message || e);
        }
      }
    } else if (['order.failed', 'order.cancelled', 'payment_failed', 'failed_payment', 'settlement_failed', 'settlement_reversed'].includes(event)) {
      // Handle payment failure events
      console.log(`Processing payment failure event: ${event}`);
      const orderData = eventData.order || eventData;
      const orderId = orderData.order_id;
      const tenantId = orderData.customer_details?.customer_id || orderData.customerId;
      const orderAmount = orderData.order_amount || orderData.amount || 0;
      const orderMeta = orderData.order_meta || {};
      
      const tenant = await Tenant.findOne({ tenantId });
      if (tenant) {
        // Log the failed/cancelled payment
        try {
          const pendingPlan = tenant.subscription?.pendingPlan || orderMeta.plan_id || tenant.plan;
          const plan = PLANS.find(p => p.id === pendingPlan) || { name: pendingPlan, id: pendingPlan };
          
          // Update existing pending payment to failed (or create if not found)
          const existingPayment = await SubscriptionPayment.findOne({ 
            gatewayOrderId: orderId, 
            status: 'pending' 
          });
          
          if (existingPayment) {
            existingPayment.status = 'failed';
            existingPayment.notes = `Payment ${event === 'order.cancelled' ? 'cancelled' : 'failed'} - ${new Date().toISOString()}`;
            await existingPayment.save();
            console.log('Webhook: Updated pending payment to failed:', orderId);
          } else {
            // Create new failed record if pending not found
            await SubscriptionPayment.create({
              tenantId: tenant.tenantId,
              amount: orderAmount,
              totalAmount: orderAmount,
              planName: plan.name || 'Unknown',
              planKey: ['free', 'trial', 'test', 'basic', 'starter', 'professional', 'pro', 'enterprise'].includes(pendingPlan) ? pendingPlan : 'trial',
              billingCycle: orderMeta.billing_cycle || 'monthly',
              periodStart: new Date(),
              periodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              paymentMethod: 'cashfree',
              gatewayOrderId: orderId,
              status: 'failed',
              notes: `Payment ${event === 'order.cancelled' ? 'cancelled' : 'failed'} - ${new Date().toISOString()}`,
              tenantSnapshot: {
                instituteName: tenant.instituteName || tenant.name,
                email: tenant.email,
                phone: tenant.contact?.phone,
              }
            });
            console.log('Webhook: Created new failed payment record:', orderId);
          }
        } catch (logErr) {
          console.error('Failed to log failed payment:', logErr?.message || logErr);
        }
        
        // Reset tenant's pending status if they were trying to upgrade
        if (tenant.subscription?.pendingPlan) {
          tenant.subscription.pendingPlan = null;
          // Only reset status if it was set to pending for this upgrade
          if (tenant.subscription.status === 'pending') {
            // Restore to previous active status if they had an active subscription
            // Otherwise keep trial status
            tenant.subscription.status = tenant.subscription.startDate ? 'active' : 'trial';
          }
          await tenant.save();
          console.log('Webhook: Reset pending upgrade for tenant:', tenantId);
        }
        
        // Send notification email
        await sendEmail({
          to: tenant.email,
          subject: `Payment ${event === 'order.cancelled' ? 'Cancelled' : 'Failed'}`,
          html: `<p>Your payment for the upgrade was not successful. Your current subscription remains unchanged. Please try again when you're ready.</p>`
        });
      }
    } else {
      // Log all other webhook events for debugging
      console.log(`Webhook event not yet handled: ${event}`);
      console.log(`Event data:`, JSON.stringify(eventData, null, 2));
      // Still return 200 to acknowledge receipt
    }
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Cashfree Subscription Webhook Error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Dev helper: Mark an order as PAID (only when DEV_TEST_VERIFY env var is set)
 * This lets us simulate a successful PG payment during QA without calling Cashfree.
 */
export const devMarkOrderPaid = async (req, res) => {
  try {
    if (!process.env.DEV_TEST_VERIFY) return res.status(403).json({ message: 'Dev verify disabled' });
    const { orderId, tenantId, planId, billingCycle = 'monthly' } = req.body;
    if (!orderId || !tenantId || !planId) return res.status(400).json({ message: 'orderId, tenantId and planId required' });

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    let duration = 30 * 24 * 60 * 60 * 1000; // monthly
    if (billingCycle === 'annual') duration = 365 * 24 * 60 * 60 * 1000;

    tenant.plan = planId;
    tenant.subscription = {
      status: 'active',
      paymentId: orderId,
      startDate: new Date(),
      endDate: new Date(Date.now() + duration),
      billingCycle
    };
    await tenant.save();

    // send confirmation email (best-effort)
    sendEmail({
      to: tenant.email,
      subject: `DEV: Payment recorded for ${tenant.plan}`,
      html: `<p>DEV: Marked order ${orderId} as PAID for tenant ${tenant.name}.</p>`
    }).catch(() => {});

    return res.status(200).json({ success: true, tenantId: tenant.tenantId, subscription: tenant.subscription });
  } catch (err) {
    console.error('Dev mark paid error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * SuperAdmin: Get all subscription payments (invoices)
 */
export const getAllSubscriptionPayments = async (req, res) => {
  try {
    console.log('📋 getAllSubscriptionPayments called by user:', req.user?.id);
    
    // Get ALL tenants for billing/invoices
    const tenants = await Tenant.find({}).sort({ createdAt: -1 });

    console.log(`✅ Found ${tenants.length} tenants for invoices`);

    if (tenants.length > 0) {
      console.log('📊 Sample tenant data:', {
        tenantId: tenants[0].tenantId,
        name: tenants[0].name,
        plan: tenants[0].plan,
        subscription: tenants[0].subscription
      });
    }

    const payments = tenants.map(tenant => ({
      id: tenant.subscription?.paymentId || `tenant_${tenant.tenantId}`,
      tenantId: tenant.tenantId,
      tenantName: tenant.name,
      instituteName: tenant.instituteName || tenant.name,
      email: tenant.email,
      plan: tenant.plan || 'free',
      status: tenant.subscription?.status || (tenant.active ? 'active' : 'inactive'),
      billingCycle: tenant.subscription?.billingCycle || 'monthly',
      amount: tenant.subscription?.amount || 0,
      currency: tenant.subscription?.currency || 'INR',
      invoiceNumber: tenant.subscription?.invoiceNumber || null,
      startDate: tenant.subscription?.startDate || tenant.createdAt,
      endDate: tenant.subscription?.endDate || null,
      createdAt: tenant.subscription?.startDate || tenant.createdAt
    }));

    console.log(`✅ Returning ${payments.length} formatted payments`);
    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error('❌ Get all subscription payments error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * SuperAdmin: Get all subscribers (all tenants for billing purposes)
 */
export const getAllSubscribers = async (req, res) => {
  try {
    console.log('👥 getAllSubscribers called by user:', req.user?.id);
    
    // Get ALL tenants for billing module
    const subscribers = await Tenant.find({}).sort({ createdAt: -1 });

    console.log(`✅ Found ${subscribers.length} tenants for billing`);

    if (subscribers.length > 0) {
      console.log('📊 Sample subscriber data:', {
        tenantId: subscribers[0].tenantId,
        name: subscribers[0].name,
        plan: subscribers[0].plan,
        email: subscribers[0].email,
        createdAt: subscribers[0].createdAt
      });
    }

    // Transform to ensure consistent structure
    const transformedSubscribers = subscribers.map(sub => ({
      _id: sub._id,
      tenantId: sub.tenantId,
      name: sub.name,
      instituteName: sub.instituteName || sub.name,
      email: sub.email,
      plan: sub.plan || 'free',
      active: sub.active,
      contact: sub.contact || {},
      subscription: {
        status: sub.subscription?.status || (sub.active ? 'active' : 'inactive'),
        paymentId: sub.subscription?.paymentId || null,
        startDate: sub.subscription?.startDate || sub.createdAt,
        endDate: sub.subscription?.endDate || null,
        billingCycle: sub.subscription?.billingCycle || 'monthly',
        amount: sub.subscription?.amount || 0,
        currency: sub.subscription?.currency || 'INR'
      },
      createdAt: sub.createdAt
    }));

    console.log(`✅ Returning ${transformedSubscribers.length} formatted subscribers`);
    res.status(200).json({ success: true, subscribers: transformedSubscribers });
  } catch (err) {
    console.error('❌ Get all subscribers error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * SuperAdmin: Get subscription stats
 */
export const getSubscriptionStats = async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    
    // Count active subscriptions (either explicit status or just active tenants)
    const activeSubscriptions = await Tenant.countDocuments({
      $or: [
        { 'subscription.status': 'active' },
        { active: true }
      ]
    });
    
    // Count expired (endDate in past) or inactive tenants
    const expiredSubscriptions = await Tenant.countDocuments({ 
      $or: [
        { 'subscription.endDate': { $lt: new Date(), $ne: null } },
        { active: false }
      ]
    });
    
    // Get plan distribution - count all plans
    const planCounts = await Tenant.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    // Get recent signups (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentPayments = await Tenant.countDocuments({
      $or: [
        { 'subscription.startDate': { $gte: thirtyDaysAgo } },
        { createdAt: { $gte: thirtyDaysAgo } }
      ]
    });

    res.status(200).json({
      success: true,
      stats: {
        totalTenants,
        activeSubscriptions,
        expiredSubscriptions,
        recentPayments,
        planDistribution: planCounts.reduce((acc, item) => {
          acc[item._id || 'free'] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (err) {
    console.error('Get subscription stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const addPayment = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { studentId, amount, method = "cash", status = "success", date } = req.body;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
    if (!studentId || !amount) return res.status(400).json({ message: "studentId and amount are required" });

    const payment = await Payment.create({
      tenantId,
      studentId,
      amount: Number(amount),
      method,
      status,
      date: date ? new Date(date) : new Date(),
    });

    // Update student's balance (sum of payments made)
    // We'll increment balance by the amount paid
    await Student.findOneAndUpdate({ _id: studentId, tenantId }, { $inc: { balance: Number(amount) } });

    res.status(201).json({ success: true, payment });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deletePayment = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const payment = await Payment.findOne({ _id: id, tenantId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // If payment was successful, decrement student's balance
    if (payment.status === "success") {
      await Student.findOneAndUpdate({ _id: payment.studentId, tenantId }, { $inc: { balance: -Number(payment.amount) } });
    }

    await payment.remove();

    res.status(200).json({ success: true, message: "Payment deleted" });
  } catch (err) {
    console.error("Delete payment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceipt = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId || req.student?.tenantId;
    const { id } = req.params; // payment id

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const payment = await Payment.findOne({ _id: id, tenantId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // If called by student, ensure they own this payment
    if (req.student) {
      if (String(payment.studentId) !== String(req.student._id)) {
        return res.status(403).json({ message: "Not authorized to view this receipt" });
      }
    }

    const student = await Student.findById(payment.studentId);
    // tenant info
    const Tenant = await import("../models/Tenant.js");
    const tenant = await Tenant.default.findOne({ tenantId });

    const instituteName = tenant?.name || "Institute";

    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt ${payment._id}</title>
        <style>body{font-family: Arial, sans-serif; padding:20px} .header{display:flex;justify-content:space-between} .box{border:1px solid #ddd;padding:16px;border-radius:6px}</style>
      </head>
      <body>
        <div class="header">
          <div>
            <h2>${instituteName}</h2>
            <div>${tenant?.email || ""}</div>
            <div>${tenant?.address || ""}</div>
          </div>
          <div>
            <strong>Receipt</strong>
            <div>ID: ${payment._id}</div>
            <div>Date: ${new Date(payment.date).toLocaleString()}</div>
          </div>
        </div>
        <hr />
        <div class="box">
          <h3>Student</h3>
          <div>Name: ${student?.name || "-"}</div>
          <div>Email: ${student?.email || "-"}</div>
          <div>Roll Number: ${student?.rollNumber || "-"}</div>
        </div>
        <div class="box" style="margin-top:12px">
          <h3>Payment Details</h3>
          <div>Amount: ₹${payment.amount}</div>
          <div>Method: ${payment.method}</div>
          <div>Status: ${payment.status}</div>
        </div>
      </body>
    </html>`;

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${payment._id}.html`);
    res.send(html);
  } catch (err) {
    console.error("Get receipt error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Plan prices mapping (Testing at Rs 10 for all paid plans)
const PLAN_PRICES = {
  trial: { monthly: 0, annual: 0 },
  starter: { monthly: 10, annual: 10 },
  professional: { monthly: 10, annual: 10 },
  enterprise: { monthly: 10, annual: 10 },
};

const PLAN_NAMES = {
  trial: 'Trial',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
};

/**
 * SuperAdmin: Download invoice PDF for a tenant
 */
export const downloadInvoice = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Generate PDF and upload to S3
    const { pdfBuffer, s3Url, invoiceNumber } = await generateInvoicePdf(tenant);
    
    // Update tenant with S3 URL if successfully uploaded
    if (s3Url && tenant.subscription) {
      tenant.subscription.invoicePdfUrl = s3Url;
      await tenant.save();
      console.log(`Invoice PDF uploaded to S3: ${s3Url}`);
    }
    
    // Send PDF as download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoiceNumber || tenantId}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Download invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * SuperAdmin: Send invoice to tenant via email (with PDF attachment)
 */
export const sendInvoiceEmail = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    // Generate PDF and upload to S3
    const { pdfBuffer, s3Url, invoiceNumber: generatedInvoiceNumber } = await generateInvoicePdf(tenant);
    
    // Update tenant with S3 URL if successfully uploaded
    if (s3Url && tenant.subscription) {
      tenant.subscription.invoicePdfUrl = s3Url;
      await tenant.save();
    }

    const plan = tenant.plan || 'free';
    const billingCycle = tenant.subscription?.billingCycle || 'monthly';
    const amount = tenant.subscription?.amount || PLAN_PRICES[plan]?.[billingCycle] || 0;
    const startDate = tenant.subscription?.startDate || tenant.createdAt;
    const endDate = tenant.subscription?.endDate;
    
    // Format invoice number - clean format like INV-0001
    const invoiceNumber = generatedInvoiceNumber || (tenant.subscription?.invoiceNumber 
      ? `INV-${String(tenant.subscription.invoiceNumber).padStart(4, '0')}`
      : `INV-${tenantId.slice(-6).toUpperCase()}`);

    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
        .invoice-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .invoice-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
        .invoice-row:last-child { border-bottom: none; font-weight: bold; color: #3b82f6; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
        .attachment-note { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 15px 0; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📄 Your Invoice</h1>
        </div>
        <div class="content">
          <p>Hello ${tenant.name},</p>
          <p>Here is your subscription invoice for <strong>${tenant.instituteName || tenant.name}</strong>:</p>
          
          <div class="invoice-box">
            <div class="invoice-row">
              <span>Invoice #:</span>
              <span>${invoiceNumber}</span>
            </div>
            <div class="invoice-row">
              <span>Plan:</span>
              <span>${PLAN_NAMES[plan] || plan}</span>
            </div>
            <div class="invoice-row">
              <span>Billing Cycle:</span>
              <span style="text-transform: capitalize;">${billingCycle}</span>
            </div>
            <div class="invoice-row">
              <span>Period:</span>
              <span>${new Date(startDate).toLocaleDateString('en-IN')} - ${endDate ? new Date(endDate).toLocaleDateString('en-IN') : 'Ongoing'}</span>
            </div>
            <div class="invoice-row">
              <span>Amount:</span>
              <span>₹${amount.toLocaleString()}</span>
            </div>
          </div>

          <div class="attachment-note">
            📎 <strong>Invoice PDF attached</strong> - Please find your detailed invoice attached to this email.
          </div>

          <center>
            <a href="https://enromatics.com/dashboard" class="cta-button">Go to Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>Questions? Contact us at support@enromatics.com</p>
          <p>© ${new Date().getFullYear()} Enromatics. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`;

    await sendEmail({
      to: tenant.email,
      subject: `Your Enromatics Invoice - ${invoiceNumber}`,
      html: emailHtml,
      tenantId: tenant.tenantId,
      type: 'invoice',
      attachments: [
        {
          filename: `invoice-${invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    res.status(200).json({ success: true, message: 'Invoice sent successfully with PDF attachment' });
  } catch (err) {
    console.error('Send invoice error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Auto-cancel stale pending payments after timeout (default 10 minutes)
 * This can be called by a cron job or on app startup
 */
export const autoCancelStalePendingPayments = async (timeoutMinutes = 10) => {
  try {
    const cutoffTime = new Date(Date.now() - timeoutMinutes * 60 * 1000);
    
    // Find tenants with pending upgrades older than the timeout
    const staleTenants = await Tenant.find({
      'subscription.pendingPlan': { $ne: null },
      'subscription.status': 'pending',
      updatedAt: { $lt: cutoffTime }
    });
    
    let cancelledCount = 0;
    
    for (const tenant of staleTenants) {
      try {
        // Log the auto-cancelled payment
        const pendingPlan = tenant.subscription?.pendingPlan;
        const plan = PLANS.find(p => p.id === pendingPlan) || { name: pendingPlan, id: pendingPlan };
        
        await SubscriptionPayment.create({
          tenantId: tenant.tenantId,
          amount: 0,
          totalAmount: 0,
          planName: plan.name || 'Unknown',
          planKey: ['free', 'trial', 'test', 'basic', 'starter', 'professional', 'pro', 'enterprise'].includes(pendingPlan) ? pendingPlan : 'trial',
          billingCycle: tenant.subscription?.billingCycle || 'monthly',
          periodStart: new Date(),
          periodEnd: new Date(),
          paymentMethod: 'cashfree',
          status: 'failed',
          notes: `Auto-cancelled after ${timeoutMinutes} minutes timeout - ${new Date().toISOString()}`,
          tenantSnapshot: {
            instituteName: tenant.instituteName || tenant.name,
            email: tenant.email,
            phone: tenant.contact?.phone,
          }
        });
        
        // Reset tenant's pending status
        tenant.subscription.pendingPlan = null;
        tenant.subscription.status = tenant.subscription.startDate ? 'active' : 'trial';
        await tenant.save();
        
        cancelledCount++;
        console.log('Auto-cancelled stale pending payment for tenant:', tenant.tenantId);
      } catch (err) {
        console.error('Error auto-cancelling tenant:', tenant.tenantId, err?.message || err);
      }
    }
    
    console.log(`Auto-cancel job completed: ${cancelledCount} stale pending payments cancelled`);
    return { success: true, cancelledCount };
  } catch (err) {
    console.error('Auto-cancel stale payments error:', err);
    return { success: false, error: err.message };
  }
};

/**
 * Admin endpoint to manually trigger auto-cancel of stale pending payments
 */
export const triggerAutoCancelPendingPayments = async (req, res) => {
  try {
    const { timeoutMinutes = 30 } = req.query;
    const result = await autoCancelStalePendingPayments(parseInt(timeoutMinutes));
    res.status(200).json(result);
  } catch (err) {
    console.error('Trigger auto-cancel error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Payment Reconciliation: Auto-handle failed payments that deducted money
 * Rules:
 * 1. If payment failed BUT money was deducted - mark for refund
 * 2. If pending payment stays unresolved > 24 hours - auto-fail and refund
 * 3. Send notification to customer about refund/resolution
 */
export const reconcileFailedPayments = async (req, res) => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Find payments that are:
    // 1. FAILED but have no refund record (money deducted but payment failed)
    // 2. PENDING > 24 hours (never received webhook confirmation)
    const failedPayments = await SubscriptionPayment.find({
      $or: [
        { status: 'failed', refundInitiated: { $ne: true } },
        { status: 'pending', createdAt: { $lt: twentyFourHoursAgo } }
      ]
    });

    let processedCount = 0;
    let refundedAmount = 0;

    for (const payment of failedPayments) {
      try {
        const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
        
        // Mark for refund if money was deducted
        if (payment.amount > 0) {
          payment.refundInitiated = true;
          payment.refundNotes = `Auto-refund: Failed payment - ${new Date().toISOString()}`;
          payment.refundAmount = payment.amount;
          await payment.save();
          
          refundedAmount += payment.amount;
          processedCount++;
          
          // Send refund notification email
          if (tenant) {
            await sendEmail({
              to: tenant.email,
              subject: `Refund Initiated - Payment Failed`,
              html: `<p>We detected that Rs ${payment.amount} was deducted from your account for order ${payment.gatewayOrderId}, but the payment failed to process.</p>
                     <p>We have initiated an automatic refund of Rs ${payment.amount} to your original payment method.</p>
                     <p>The refund should appear in your account within 3-5 business days.</p>
                     <p>If you have any questions, please contact our support team.</p>`
            });
            console.log(`Refund notification sent to ${tenant.email} for order ${payment.gatewayOrderId}`);
          }
        }
        
        // If payment was pending for > 24 hours, mark as failed
        if (payment.status === 'pending' && payment.createdAt < twentyFourHoursAgo) {
          payment.status = 'failed';
          payment.notes = `Auto-failed: No confirmation after 24 hours - ${new Date().toISOString()}`;
          await payment.save();
          console.log(`Auto-failed pending payment: ${payment.gatewayOrderId}`);
        }
      } catch (err) {
        console.error(`Error processing payment ${payment._id}:`, err?.message);
      }
    }

    res.status(200).json({
      success: true,
      message: `Reconciled ${processedCount} failed payments`,
      totalRefunded: `₹${refundedAmount}`,
      processedPayments: processedCount
    });
  } catch (err) {
    console.error('Payment reconciliation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Sync Payment Status from Cashfree
 * Manually check Cashfree and update payment status in database
 * Useful if webhook wasn't received
 */
export const syncPaymentStatusFromCashfree = async (req, res) => {
  try {
    const { orderId } = req.query;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Find pending payment in database
    const payment = await SubscriptionPayment.findOne({
      gatewayOrderId: orderId
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Query Cashfree for actual status
    const axios = await import('axios').then(m => m.default);
    const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
    const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
    const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

    const apiResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${orderId}`,
      {
        headers: {
          'x-client-id': CASHFREE_CLIENT_ID,
          'x-client-secret': CASHFREE_CLIENT_SECRET,
          'x-api-version': '2023-08-01'
        }
      }
    );

    const cashfreeOrder = apiResponse.data;
    const orderStatus = cashfreeOrder.order_status;

    console.log(`Syncing payment status - Order: ${orderId}, Status from Cashfree: ${orderStatus}`);

    // Update payment status based on Cashfree response
    if (orderStatus === 'PAID') {
      payment.status = 'success';
      payment.paidAt = new Date();
      payment.notes = `Payment status synced from Cashfree - PAID on ${new Date().toISOString()}`;
      await payment.save();

      // Also update tenant subscription
      const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
      if (tenant && tenant.subscription) {
        tenant.subscription.status = 'active';
        tenant.paid_status = true;
        await tenant.save();
        console.log(`Tenant ${tenant.tenantId} subscription updated to active`);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment status updated to SUCCESS',
        orderStatus: 'PAID',
        paymentStatus: 'success',
        orderId,
        amount: payment.amount,
        tenantId: payment.tenantId
      });
    } else if (orderStatus === 'FAILED' || orderStatus === 'CANCELLED') {
      payment.status = 'failed';
      payment.notes = `Payment status synced from Cashfree - ${orderStatus} on ${new Date().toISOString()}`;
      await payment.save();

      // Reset tenant paid status
      const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
      if (tenant) {
        tenant.paid_status = false;
        if (tenant.subscription) {
          tenant.subscription.status = 'inactive';
          tenant.subscription.pendingPlan = null;
        }
        await tenant.save();
        console.log(`Tenant ${tenant.tenantId} paid_status reset to false`);
      }

      return res.status(200).json({
        success: true,
        message: 'Payment status updated to FAILED',
        orderStatus,
        paymentStatus: 'failed',
        orderId,
        amount: payment.amount,
        tenantId: payment.tenantId
      });
    } else if (orderStatus === 'ACTIVE' || orderStatus === 'PENDING') {
      // Still processing
      return res.status(200).json({
        success: true,
        message: 'Payment is still being processed',
        orderStatus,
        paymentStatus: 'pending',
        orderId,
        amount: payment.amount,
        tenantId: payment.tenantId
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payment status: ${orderStatus}`,
      orderStatus,
      orderId,
      paymentStatus: payment.status
    });
  } catch (err) {
    console.error('Sync payment status error:', err?.message || err);
    res.status(500).json({ 
      message: 'Failed to sync payment status',
      error: err?.message 
    });
  }
};

/**
 * Admin: Sync All Pending Payments from Cashfree
 * SuperAdmin only - Updates all pending payments from Cashfree
 */
export const syncAllPendingPayments = async (req, res) => {
  try {
    // Find all pending payments
    const pendingPayments = await SubscriptionPayment.find({
      status: 'pending'
    }).sort({ createdAt: -1 });

    if (pendingPayments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending payments to sync',
        totalProcessed: 0
      });
    }

    const axios = await import('axios').then(m => m.default);
    const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
    const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
    const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

    let successCount = 0;
    let failedCount = 0;
    const updates = [];

    for (const payment of pendingPayments) {
      try {
        const apiResponse = await axios.get(
          `${CASHFREE_BASE_URL}/orders/${payment.gatewayOrderId}`,
          {
            headers: {
              'x-client-id': CASHFREE_CLIENT_ID,
              'x-client-secret': CASHFREE_CLIENT_SECRET,
              'x-api-version': '2023-08-01'
            }
          }
        );

        const cashfreeOrder = apiResponse.data;
        const orderStatus = cashfreeOrder.order_status;

        console.log(`Processing payment ${payment.gatewayOrderId}: Status=${orderStatus}`);

        if (orderStatus === 'PAID') {
          payment.status = 'success';
          payment.paidAt = new Date();
          payment.notes = `Bulk synced from Cashfree - PAID on ${new Date().toISOString()}`;
          await payment.save();

          // Update tenant
          const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
          if (tenant) {
            tenant.paid_status = true;
            if (tenant.subscription) {
              tenant.subscription.status = 'active';
            }
            await tenant.save();
          }

          successCount++;
          updates.push({
            orderId: payment.gatewayOrderId,
            status: 'success',
            tenantId: payment.tenantId
          });
        } else if (orderStatus === 'FAILED' || orderStatus === 'CANCELLED') {
          payment.status = 'failed';
          payment.notes = `Bulk synced from Cashfree - ${orderStatus} on ${new Date().toISOString()}`;
          await payment.save();

          const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
          if (tenant) {
            tenant.paid_status = false;
            if (tenant.subscription) {
              tenant.subscription.status = 'inactive';
            }
            await tenant.save();
          }

          failedCount++;
          updates.push({
            orderId: payment.gatewayOrderId,
            status: 'failed',
            tenantId: payment.tenantId
          });
        }
        // else: still pending, don't update
      } catch (err) {
        console.error(`Error syncing ${payment.gatewayOrderId}:`, err?.message);
        failedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Synced ${successCount} successful and ${failedCount} failed payments`,
      totalProcessed: successCount + failedCount,
      successCount,
      failedCount,
      updates
    });
  } catch (err) {
    console.error('Sync all payments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: Sync ALL Pending Payments from Cashfree
 * Manually check all pending payments and update from Cashfree
 * Used when webhook wasn't received for pending orders
 */
export const syncAllPendingPaymentsFromCashfree = async (req, res) => {
  try {
    console.log('Starting sync of ALL pending payments from Cashfree...');

    // Find all pending payments
    const pendingPayments = await SubscriptionPayment.find({
      status: 'pending'
    }).sort({ createdAt: -1 });

    console.log(`Found ${pendingPayments.length} pending payments to sync`);

    let successCount = 0;
    let failedCount = 0;
    let updates = [];

    const axios = await import('axios').then(m => m.default);
    const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
    const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
    const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

    for (const payment of pendingPayments) {
      try {
        console.log(`Syncing payment: ${payment.gatewayOrderId}`);

        // Check status from Cashfree
        const apiResponse = await axios.get(
          `${CASHFREE_BASE_URL}/orders/${payment.gatewayOrderId}`,
          {
            headers: {
              'x-client-id': CASHFREE_CLIENT_ID,
              'x-client-secret': CASHFREE_CLIENT_SECRET,
              'x-api-version': '2023-08-01'
            }
          }
        );

        const cashfreeOrder = apiResponse.data;
        const orderStatus = cashfreeOrder.order_status;

        console.log(`Order ${payment.gatewayOrderId} status from Cashfree: ${orderStatus}`);

        // Handle PAID status
        if (orderStatus === 'PAID') {
          payment.status = 'success';
          payment.paidAt = new Date();
          payment.notes = `Auto-synced from Cashfree - PAID on ${new Date().toISOString()}`;
          await payment.save();

          // Update tenant
          const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
          if (tenant) {
            tenant.subscription.status = 'active';
            tenant.paid_status = true;
            await tenant.save();
            console.log(`✓ Tenant ${tenant.tenantId} updated: paid_status=true, subscription=active`);
          }

          successCount++;
          updates.push({
            orderId: payment.gatewayOrderId,
            status: 'success',
            tenantId: payment.tenantId,
            amount: payment.amount
          });
        }
        // Handle FAILED/CANCELLED status
        else if (orderStatus === 'FAILED' || orderStatus === 'CANCELLED') {
          payment.status = 'failed';
          payment.notes = `Auto-synced from Cashfree - ${orderStatus} on ${new Date().toISOString()}`;
          await payment.save();

          // Reset tenant paid status
          const tenant = await Tenant.findOne({ tenantId: payment.tenantId });
          if (tenant) {
            tenant.paid_status = false;
            if (tenant.subscription) {
              tenant.subscription.status = 'inactive';
            }
            await tenant.save();
            console.log(`✗ Tenant ${tenant.tenantId} updated: paid_status=false, subscription=inactive`);
          }

          failedCount++;
          updates.push({
            orderId: payment.gatewayOrderId,
            status: 'failed',
            tenantId: payment.tenantId,
            amount: payment.amount
          });
        }
        // Still pending
        else if (orderStatus === 'ACTIVE' || orderStatus === 'PENDING') {
          console.log(`⏳ Order ${payment.gatewayOrderId} still pending/active in Cashfree`);
        }
      } catch (itemErr) {
        console.error(`Error syncing payment ${payment.gatewayOrderId}:`, itemErr?.message);
        failedCount++;
      }
    }

    console.log(`Sync complete: ${successCount} successful, ${failedCount} failed`);

    res.status(200).json({
      success: true,
      message: `Synced ${successCount + failedCount} payments from Cashfree`,
      totalPending: pendingPayments.length,
      successCount,
      failedCount,
      updates
    });
  } catch (err) {
    console.error('Sync all pending payments error:', err);
    res.status(500).json({ 
      message: 'Server error',
      error: err?.message 
    });
  }
};

