import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { PLANS } from '../config/plans.js';
import axios from 'axios';
import Tenant from '../models/Tenant.js';
import { sendEmail, sendCredentialsEmail, sendSubscriptionConfirmationEmail } from '../services/emailService.js';
import { notifyNewSubscription } from '../services/superadminNotificationService.js';
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
    const { tenantId, planId, email, phone: reqPhone, billingCycle, instituteName, name, amount } = req.body;
    
    // Find plan in static config first, then try database
    let plan = PLANS.find(p => p.id === planId || p.id === planId?.toLowerCase());
    
    // If not found in static config and we have dynamic amount, create a dynamic plan object
    if (!plan && amount && amount > 0) {
      console.log('💰 Plan not in static config, using dynamic pricing. planId:', planId, 'amount:', amount);
      plan = {
        id: planId,
        name: planId.charAt(0).toUpperCase() + planId.slice(1), // Capitalize
        priceMonthly: billingCycle === 'monthly' ? amount : 0,
        priceAnnual: billingCycle === 'annual' ? amount : 0,
        description: 'Dynamic plan from database'
      };
    }
    
    if (!plan) {
      console.error('❌ Plan not found:', planId, 'Available plans:', PLANS.map(p => p.id));
      return res.status(400).json({ message: 'Invalid plan selected', planId, availablePlans: PLANS.map(p => p.id) });
    }

    // Generate a clean subdomain from institute name or email
    const generateSubdomain = (instituteName, email) => {
      // Use institute name if provided, otherwise use email prefix
      const baseName = instituteName || email?.split('@')[0] || 'tenant';
      
      // Clean up: lowercase, remove special chars, replace spaces with nothing
      let subdomain = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
        .substring(0, 30); // Max 30 chars
      
      // Add random suffix to ensure uniqueness
      const suffix = Math.random().toString(36).substr(2, 4);
      return `${subdomain}${suffix}`;
    };

    // Generate subdomain if not provided
    const generatedSubdomain = generateSubdomain(instituteName, email);
    const finalTenantId = tenantId || generatedSubdomain;

    // Determine billing cycle
    const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    console.log('💰 Payment request:', { planId, cycle, frontendAmount: amount });

    // Check if tenant exists, if not create one
    let tenant = await Tenant.findOne({ 
      $or: [
        { tenantId: finalTenantId },
        { email: email }
      ]
    });

    if (!tenant) {
      // Create new tenant record - this is a new signup
      
      // ✅ Auto-generate user-friendly subdomain (same as free trial does)
      const baseName = instituteName || name || email.split('@')[0];
      const cleanSubdomain = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
        .substring(0, 20); // Limit to 20 chars
      const suffix = Math.random().toString(36).substr(2, 5); // 5 char random suffix
      const generatedSubdomain = cleanSubdomain + suffix;
      
      tenant = await Tenant.create({
        tenantId: finalTenantId,
        subdomain: generatedSubdomain, // ✅ Use auto-generated user-friendly subdomain
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
      console.log('Created new tenant:', tenant.tenantId, 'Subdomain:', generatedSubdomain, 'Pending plan:', planId);
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

    // ✅ Determine price: Use frontend amount (from DB) OR fallback to static config
    let orderAmount;
    if (amount && amount > 0) {
      // Frontend sent the dynamic price from database
      orderAmount = Number(amount);
      console.log('💰 Using frontend dynamic price:', orderAmount);
    } else {
      // Fallback to static config
      orderAmount = cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;
      console.log('💰 Using static config price:', orderAmount);
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
        
        // Case-insensitive plan lookup
        const plan = PLANS.find(p => p.id.toLowerCase() === planId?.toLowerCase()) || { id: planId, name: planId };
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
        await tenant.save();
        console.log('Updated tenant subscription:', tenant.tenantId, 'Plan:', tenant.plan, 'Invoice:', nextInvoiceNumber);

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
        // Get the plan they were trying to purchase (from pendingPlan or order_meta)
        const orderMeta = order.order_meta || {};
        const attemptedPlanId = tenant.subscription?.pendingPlan || orderMeta.plan_id || tenant.plan;
        const attemptedPlan = PLANS.find(p => p.id === attemptedPlanId) || { name: attemptedPlanId, id: attemptedPlanId };
        const billingCycle = orderMeta.billing_cycle || tenant.subscription?.billingCycle || 'monthly';
        const orderAmount = order.order_amount || 0;
        
        await sendEmail({
          to: tenant.email,
          subject: `Payment Failed for ${attemptedPlan.name} Plan (${billingCycle})`,
          html: `<p>Your payment of ₹${orderAmount} for the <strong>${attemptedPlan.name}</strong> plan (${billingCycle}) was not successful.</p>
                 <p>Your current subscription remains unchanged. Please try again when you're ready.</p>
                 <p>If you continue to face issues, please contact support.</p>`
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
    if (event === 'order.paid') {
      const orderData = req.body.data.order;
      const orderId = orderData.order_id;
      const tenantId = orderData.customer_details.customer_id;
      const customerEmail = orderData.customer_details.customer_email;
      const orderMeta = orderData.order_meta || {};
      const orderAmount = orderData.order_amount || 0;
      
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
        
        // Case-insensitive plan lookup
        const plan = PLANS.find(p => p.id.toLowerCase() === planId?.toLowerCase()) || { name: planId, id: planId };
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
        await tenant.save();
        console.log('Webhook: Updated tenant subscription:', tenant.tenantId, 'Plan:', planId, 'Invoice:', nextInvoiceNumber);

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
          // ✅ Build institute URL from subdomain
          const baseDomain = process.env.FRONTEND_URL?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'enromatics.com';
          const instituteUrl = `https://${tenant.subdomain}.${baseDomain}`;
          const loginUrl = `${instituteUrl}/login`;
          
          await sendCredentialsEmail({
            to: tenant.email,
            name: tenant.name,
            instituteName: tenant.instituteName || tenant.name,
            email: tenant.email,
            password: generatedPassword,
            instituteUrl: instituteUrl, // ✅ Include institute URL in green box
            loginUrl: loginUrl,
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

        // Notify superadmin about new subscription (non-blocking)
        notifyNewSubscription({
          tenantId: tenant.tenantId,
          tenantName: tenant.instituteName || tenant.name,
          email: tenant.email,
          planId: planId,
          planName: plan.name || planId,
          amount: orderAmount,
          billingCycle: billingCycle,
          startDate: startDate,
          endDate: endDate
        }).catch(err => {
          console.error('❌ Failed to send superadmin subscription notification:', err.message);
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
    } else if (event === 'order.failed' || event === 'order.cancelled') {
      const orderData = req.body.data.order;
      const orderId = orderData.order_id;
      const tenantId = orderData.customer_details.customer_id;
      const orderAmount = orderData.order_amount || 0;
      const orderMeta = orderData.order_meta || {};
      
      const tenant = await Tenant.findOne({ tenantId });
      if (tenant) {
        // Log the failed/cancelled payment
        try {
          const pendingPlan = tenant.subscription?.pendingPlan || orderMeta.plan_id || tenant.plan;
          // Case-insensitive plan lookup
          const plan = PLANS.find(p => p.id.toLowerCase() === pendingPlan?.toLowerCase()) || { name: pendingPlan, id: pendingPlan };
          
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
        
        // Send notification email with dynamic plan details
        const billingCycle = orderMeta.billing_cycle || tenant.subscription?.billingCycle || 'monthly';
        const eventType = event === 'order.cancelled' ? 'Cancelled' : 'Failed';
        
        await sendEmail({
          to: tenant.email,
          subject: `Payment ${eventType} for ${plan.name} Plan (${billingCycle})`,
          html: `<p>Your payment of ₹${orderAmount} for the <strong>${plan.name}</strong> plan (${billingCycle}) was ${eventType.toLowerCase()}.</p>
                 <p>Your current subscription remains unchanged. Please try again when you're ready.</p>
                 <p>If you continue to face issues, please contact support at support@enromatics.com</p>`
        });
      }
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

    // Calculate Total Revenue from SubscriptionPayment (successful payments only)
    const revenueResult = await SubscriptionPayment.aggregate([
      { $match: { status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Calculate Monthly Recurring Revenue (MRR) - active monthly subscriptions
    // Get tenants with active monthly subscriptions and sum their amounts
    const mrrResult = await Tenant.aggregate([
      { 
        $match: { 
          'subscription.status': 'active',
          'subscription.billingCycle': 'monthly',
          plan: { $nin: ['trial', 'free'] }
        } 
      },
      { $group: { _id: null, total: { $sum: '$subscription.amount' } } }
    ]);
    
    // For yearly subscriptions, divide by 12 to get monthly equivalent
    const yearlyMrrResult = await Tenant.aggregate([
      { 
        $match: { 
          'subscription.status': 'active',
          'subscription.billingCycle': { $in: ['yearly', 'annual'] },
          plan: { $nin: ['trial', 'free'] }
        } 
      },
      { $group: { _id: null, total: { $sum: { $divide: ['$subscription.amount', 12] } } } }
    ]);
    
    const monthlyRecurringRevenue = Math.round(
      (mrrResult[0]?.total || 0) + (yearlyMrrResult[0]?.total || 0)
    );

    res.status(200).json({
      success: true,
      stats: {
        totalTenants,
        activeSubscriptions,
        expiredSubscriptions,
        recentPayments,
        totalRevenue,
        monthlyRecurringRevenue,
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
    const { studentId, amount, method = "cash", status = "success", date, remarks } = req.body;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
    if (!studentId || !amount) return res.status(400).json({ message: "studentId and amount are required" });

    const payment = await Payment.create({
      tenantId,
      studentId,
      amount: Number(amount),
      method,
      status,
      date: date ? new Date(date) : new Date(),
      remarks: remarks || "",
    });

    // Update student's balance (reduce pending fees by payment amount)
    await Student.findOneAndUpdate({ _id: studentId, tenantId }, { $inc: { balance: -Number(amount) } });

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
    const PDFDocument = (await import("pdfkit")).default;
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
    
    // Generate standard receipt number format: YYYYMMDD-SEQUENCE
    const paymentDate = new Date(payment.date);
    const year = paymentDate.getFullYear();
    const month = String(paymentDate.getMonth() + 1).padStart(2, "0");
    const day = String(paymentDate.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;
    
    // Get sequence number for this date (count payments from this date)
    const paymentCount = await Payment.countDocuments({ 
      tenantId, 
      date: { $gte: new Date(year, paymentDate.getMonth(), paymentDate.getDate()), $lt: new Date(year, paymentDate.getMonth(), paymentDate.getDate() + 1) }
    });
    const receiptNumber = `${datePrefix}-${String(paymentCount).padStart(3, "0")}`;

    // Create PDF
    const doc = new PDFDocument({
      margin: 40,
      size: "A4"
    });

    // Set response headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Receipt-${receiptNumber}.pdf`);
    
    // Pipe to response
    doc.pipe(res);

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text(instituteName, { align: "center" });
    doc.fontSize(10).font("Helvetica").text(tenant?.email || "", { align: "center" });
    doc.fontSize(10).font("Helvetica").text(tenant?.address || "", { align: "center" });
    
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Receipt title and number
    doc.fontSize(16).font("Helvetica-Bold").text("RECEIPT", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(`Receipt No: ${receiptNumber}`, { align: "right" });
    doc.fontSize(11).font("Helvetica").text(`Date: ${paymentDate.toLocaleDateString("en-IN")}`, { align: "right" });
    
    doc.moveDown(1);

    // Student Details Section
    doc.fontSize(12).font("Helvetica-Bold").text("Student Details", { underline: true });
    doc.fontSize(10).font("Helvetica");
    doc.text(`Name: ${student?.name || "-"}`, { width: 250 });
    doc.text(`Email: ${student?.email || "-"}`, { width: 250 });
    doc.text(`Roll Number: ${student?.rollNumber || "-"}`, { width: 250 });
    doc.text(`Batch: ${student?.batchName || "-"}`, { width: 250 });
    
    doc.moveDown(1);

    // Payment Details Section
    doc.fontSize(12).font("Helvetica-Bold").text("Payment Details", { underline: true });
    doc.fontSize(10).font("Helvetica");
    
    // Create table for payment details
    const tableTop = doc.y;
    doc.text("Description", 60, tableTop);
    doc.text("Amount", 400, tableTop, { align: "right" });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    
    doc.fontSize(10).font("Helvetica");
    const itemY = tableTop + 25;
    doc.text("Payment Amount", 60, itemY);
    doc.text(`₹${payment.amount.toLocaleString()}`, 400, itemY, { align: "right" });
    
    doc.moveDown(2);
    
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    const totalY = doc.y + 10;
    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Total Amount:", 60, totalY);
    doc.text(`₹${payment.amount.toLocaleString()}`, 400, totalY, { align: "right" });
    
    doc.moveDown(2);

    // Payment method and status
    doc.fontSize(10).font("Helvetica");
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Payment Status: ${payment.status}`);
    
    doc.moveDown(2);

    // Footer
    doc.fontSize(9).font("Helvetica").text("This is a computer-generated receipt. No signature is required.", { align: "center", color: "#666" });
    doc.fontSize(8).font("Helvetica").text(`Generated on ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST`, { align: "center", color: "#999" });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error("Get receipt error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get payment details with student and institute info for receipt generation
 */
export const getPaymentDetails = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params; // payment id

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const payment = await Payment.findOne({ _id: id, tenantId }).lean();
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    const student = await Student.findById(payment.studentId).lean();
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Get tenant/institute info
    const Tenant = await import("../models/Tenant.js");
    const institute = await Tenant.default.findOne({ tenantId }).lean();

    res.json({
      success: true,
      payment,
      student,
      institute: {
        name: institute?.name || "Educational Institute",
        email: institute?.email || "",
        phone: institute?.phone || "",
        address: institute?.address || "",
      }
    });
  } catch (err) {
    console.error("Get payment details error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Upload receipt PDF to S3 and update payment record
 */
export const uploadReceiptToS3 = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const { id } = req.params; // payment id
    const { pdfBase64, filename, studentId } = req.body;

    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });
    if (!pdfBase64 || !filename) {
      return res.status(400).json({ message: "PDF data and filename are required" });
    }

    const payment = await Payment.findOne({ _id: id, tenantId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');

    // Upload to S3
    const s3Helper = await import("../utils/s3Helper.js");
    const s3Key = `receipts/${tenantId}/${studentId}/${filename}`;
    const contentType = 'application/pdf';

    const uploadResult = await s3Helper.uploadToS3(pdfBuffer, s3Key, contentType);
    
    if (!uploadResult.success) {
      return res.status(500).json({ message: "Failed to upload receipt to S3" });
    }

    // Update payment with receipt URL
    payment.receiptUrl = uploadResult.url;
    await payment.save();

    res.json({
      success: true,
      receiptUrl: uploadResult.url,
      message: "Receipt uploaded successfully"
    });
  } catch (err) {
    console.error("Upload receipt error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Plan prices mapping
const PLAN_PRICES = {
  free: { monthly: 0, annual: 0 },
  trial: { monthly: 0, annual: 0 },
  test: { monthly: 10, annual: 10 },
  starter: { monthly: 1999, annual: 16790 },
  professional: { monthly: 2999, annual: 25190 },
  pro: { monthly: 2999, annual: 25190 },
  enterprise: { monthly: 4999, annual: 41990 },
};

const PLAN_NAMES = {
  free: 'Free',
  trial: 'Trial',
  test: 'Test Plan',
  starter: 'Starter',
  professional: 'Professional',
  pro: 'Pro',
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
 * SuperAdmin: Manually log payment (cash/bank transfer) and activate account
 * @route   POST /api/payment/admin/manual-payment
 * @access  Private – SuperAdmin only
 * @body    { tenantId, planId, amount, paymentMethod, billingCycle, remarks }
 */
export const logManualPayment = async (req, res) => {
  try {
    const { tenantId, planId, amount, paymentMethod, billingCycle = 'monthly', remarks } = req.body;
    const superadminId = req.user?._id;

    // Validation
    if (!tenantId || !planId || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'tenantId, planId, and amount are required' 
      });
    }

    if (!['cash', 'bank_transfer', 'cheque', 'online_transfer'].includes(paymentMethod)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment method' 
      });
    }

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Tenant not found' 
      });
    }

    // Find plan
    const plan = PLANS.find(p => p.id === planId || p.id === planId?.toLowerCase());
    if (!plan) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid plan selected' 
      });
    }

    console.log('💳 Manual payment logging:', {
      tenantId,
      planId,
      amount,
      paymentMethod,
      superadminId
    });

    // Calculate subscription period
    const startDate = new Date();
    let duration = 30 * 24 * 60 * 60 * 1000; // 30 days for monthly
    if (billingCycle === 'annual' || billingCycle === 'yearly') {
      duration = 365 * 24 * 60 * 60 * 1000;
    }
    const endDate = new Date(Date.now() + duration);

    // Generate invoice number
    const maxInvoice = await Tenant.findOne({ 'subscription.invoiceNumber': { $exists: true, $ne: null } })
      .sort({ 'subscription.invoiceNumber': -1 })
      .select('subscription.invoiceNumber');
    const nextInvoiceNumber = (maxInvoice?.subscription?.invoiceNumber || 0) + 1;

    // Update tenant subscription to active
    tenant.plan = planId;
    tenant.subscription = {
      status: 'active',
      paymentId: `manual_${tenantId}_${Date.now()}`,
      startDate: startDate,
      endDate: endDate,
      billingCycle: billingCycle === 'annual' ? 'annual' : 'monthly',
      amount: amount,
      currency: 'INR',
      invoiceNumber: nextInvoiceNumber,
      pendingPlan: null
    };
    
    await tenant.save();
    console.log('✅ Tenant subscription activated:', tenantId);

    // Create subscription payment record
    const paymentRecord = await SubscriptionPayment.create({
      tenantId,
      amount,
      currency: 'INR',
      totalAmount: amount,
      planName: plan.name,
      planKey: planId,
      billingCycle: billingCycle === 'annual' ? 'annual' : 'monthly',
      periodStart: startDate,
      periodEnd: endDate,
      paymentMethod: paymentMethod,
      status: 'success',
      paidAt: new Date(),
      notes: `Manual payment logged by superadmin. Method: ${paymentMethod}. ${remarks ? 'Remarks: ' + remarks : ''}`,
      tenantSnapshot: {
        instituteName: tenant.instituteName || tenant.name,
        email: tenant.email,
        phone: tenant.contact?.phone || 'N/A',
        address: tenant.address || 'N/A'
      }
    });

    console.log('✅ Payment record created:', paymentRecord._id);

    // Generate invoice PDF
    try {
      const pdfBuffer = await generateInvoicePdf(paymentRecord, tenant);
      
      // TODO: Upload to S3 if needed
      // const s3Key = getInvoiceS3Key(tenantId, nextInvoiceNumber);
      // await uploadToS3(pdfBuffer, s3Key, 'application/pdf');
      // paymentRecord.invoiceS3Key = s3Key;
      // paymentRecord.invoiceGenerated = true;
      // await paymentRecord.save();

      console.log('✅ Invoice PDF generated for tenant:', tenantId);
    } catch (pdfErr) {
      console.error('⚠️ Invoice PDF generation failed:', pdfErr.message);
      // Don't fail the entire operation if PDF fails
    }

    // Send activation email to tenant
    try {
      await sendEmail({
        to: tenant.email,
        subject: `✅ Your Account Upgraded to ${plan.name} Plan`,
        html: `
          <h2>Welcome! Your Account is Now Active</h2>
          <p>Dear ${tenant.name || 'Valued Customer'},</p>
          <p>Your subscription has been successfully activated!</p>
          <hr>
          <h3>Subscription Details</h3>
          <ul>
            <li><strong>Plan:</strong> ${plan.name}</li>
            <li><strong>Amount Paid:</strong> ₹${amount}</li>
            <li><strong>Billing Cycle:</strong> ${billingCycle === 'annual' ? 'Annual' : 'Monthly'}</li>
            <li><strong>Valid From:</strong> ${startDate.toLocaleDateString('en-IN')}</li>
            <li><strong>Valid Until:</strong> ${endDate.toLocaleDateString('en-IN')}</li>
            <li><strong>Invoice Number:</strong> ${paymentRecord.invoiceNumber}</li>
          </ul>
          <p>You can now log in to your dashboard and start using all features of the ${plan.name} plan.</p>
          <p>If you have any questions, please contact our support team.</p>
          <br>
          <p>Best regards,<br>Enromatics Team</p>
        `
      });
      console.log('✅ Activation email sent to:', tenant.email);
    } catch (emailErr) {
      console.error('⚠️ Email sending failed:', emailErr.message);
      // Don't fail if email fails
    }

    // Notify superadmin
    try {
      await notifyNewSubscription({
        tenantId,
        instituteName: tenant.instituteName || tenant.name,
        email: tenant.email,
        plan: plan.name,
        amount,
        paymentMethod: 'manual'
      });
    } catch (notifyErr) {
      console.error('⚠️ Superadmin notification failed:', notifyErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Payment logged successfully. Account activated.',
      data: {
        tenantId,
        planName: plan.name,
        amount,
        invoiceNumber: paymentRecord.invoiceNumber,
        activatedAt: startDate,
        expiresAt: endDate
      }
    });

  } catch (err) {
    console.error('❌ Manual payment logging error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
