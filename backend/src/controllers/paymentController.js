import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import { PLANS } from '../config/plans.js';
import axios from 'axios';
import Tenant from '../models/Tenant.js';
import { sendEmail, sendCredentialsEmail, sendSubscriptionConfirmationEmail } from '../services/emailService.js';

// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Generate random 6-digit password
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const CASHFREE_MODE = process.env.CASHFREE_MODE || 'production';

/**
 * Initiate payment for a subscription plan
 */
export const initiateSubscriptionPayment = async (req, res) => {
  try {
    const { tenantId, planId, email, phone, billingCycle, instituteName, name } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });

    // Generate a unique tenantId if not provided
    const finalTenantId = tenantId || `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if tenant exists, if not create one
    let tenant = await Tenant.findOne({ 
      $or: [
        { tenantId: finalTenantId },
        { email: email }
      ]
    });

    if (!tenant) {
      // Create new tenant record
      tenant = await Tenant.create({
        tenantId: finalTenantId,
        name: name || instituteName || email.split('@')[0],
        instituteName: instituteName || null,
        email: email,
        plan: 'free', // Will be updated after payment
        active: true,
        contact: {
          phone: phone,
          country: 'India'
        },
        subscription: {
          status: 'inactive',
          paymentId: null,
          startDate: null,
          endDate: null
        }
      });
      console.log('Created new tenant:', tenant.tenantId);
    }

    // Use the tenant's actual tenantId
    const customerTenantId = tenant.tenantId;

    // Determine price based on billing cycle
    let orderAmount = plan.priceMonthly;
    let cycle = 'monthly';
    if (billingCycle === 'annual') {
      orderAmount = plan.priceAnnual;
      cycle = 'annual';
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
        const plan = PLANS.find(p => p.id === order.order_meta.plan_id) || { name: order.order_meta.plan_id };
        tenant.plan = order.order_meta.plan_id;
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (order.order_meta.billing_cycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        const startDate = new Date();
        const endDate = new Date(Date.now() + duration);
        
        tenant.subscription = {
          status: 'active',
          paymentId: order.order_id,
          startDate: startDate,
          endDate: endDate,
          billingCycle: order.order_meta.billing_cycle
        };
        await tenant.save();
        console.log('Updated tenant subscription:', tenant.tenantId);

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
            planName: plan.name,
            amount: order.order_amount,
            billingCycle: order.order_meta.billing_cycle,
            startDate: startDate,
            endDate: endDate,
            instituteName: tenant.instituteName || tenant.name
          },
          tenantId: tenant.tenantId,
          userId: user?._id
        });
        console.log('Sent subscription confirmation email to:', tenant.email);
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
 */
export const cashfreeSubscriptionWebhook = async (req, res) => {
  try {
    const event = req.body.event;
    if (event === 'order.paid') {
      const orderData = req.body.data.order;
      const orderId = orderData.order_id;
      const tenantId = orderData.customer_details.customer_id;
      const customerEmail = orderData.customer_details.customer_email;
      const planId = orderData.order_meta.plan_id;
      const billingCycle = orderData.order_meta.billing_cycle;
      const orderAmount = orderData.order_amount;
      
      // Find tenant by tenantId or email
      let tenant = await Tenant.findOne({ 
        $or: [
          { tenantId },
          { email: customerEmail }
        ]
      });
      
      if (tenant) {
        const plan = PLANS.find(p => p.id === planId) || { name: planId };
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (billingCycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        const startDate = new Date();
        const endDate = new Date(Date.now() + duration);
        
        tenant.plan = planId;
        tenant.subscription = {
          status: 'active',
          paymentId: orderId,
          startDate: startDate,
          endDate: endDate,
          billingCycle
        };
        await tenant.save();
        console.log('Webhook: Updated tenant subscription:', tenant.tenantId);

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
      }
    } else if (event === 'order.failed') {
      const orderId = req.body.data.order.order_id;
      const tenantId = req.body.data.order.customer_details.customer_id;
      const tenant = await Tenant.findOne({ tenantId });
      if (tenant) {
        await sendEmail({
          to: tenant.email,
          subject: `Payment Failed for ${tenant.plan}`,
          html: `<p>Your payment for the ${tenant.plan} plan was not successful. Please try again.</p>`
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
    // Get all tenants with any subscription data or paid plans (non-free)
    const tenants = await Tenant.find({
      $or: [
        { 'subscription.paymentId': { $exists: true, $ne: null } },
        { 'subscription.status': 'active' },
        { plan: { $nin: ['free', null, ''] } } // Any plan that's not free
      ]
    }).sort({ createdAt: -1 });

    const payments = tenants.map(tenant => ({
      id: tenant.subscription?.paymentId || `legacy_${tenant.tenantId}`,
      tenantId: tenant.tenantId,
      tenantName: tenant.name,
      instituteName: tenant.instituteName,
      email: tenant.email,
      plan: tenant.plan,
      status: tenant.subscription?.status || (tenant.active ? 'active' : 'inactive'),
      billingCycle: tenant.subscription?.billingCycle || 'monthly',
      startDate: tenant.subscription?.startDate || tenant.createdAt,
      endDate: tenant.subscription?.endDate || null,
      createdAt: tenant.subscription?.startDate || tenant.createdAt
    }));

    res.status(200).json({ success: true, payments });
  } catch (err) {
    console.error('Get all subscription payments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * SuperAdmin: Get all subscribers (tenants with active subscriptions)
 */
export const getAllSubscribers = async (req, res) => {
  try {
    // Get all tenants with active status or paid plans (non-free)
    const subscribers = await Tenant.find({
      $or: [
        { 'subscription.status': 'active' },
        { plan: { $nin: ['free', null, ''] } }, // Any plan that's not free
        { active: true }
      ]
    }).sort({ createdAt: -1 });

    // Transform to ensure consistent structure
    const transformedSubscribers = subscribers.map(sub => ({
      ...sub.toObject(),
      subscription: {
        status: sub.subscription?.status || (sub.active ? 'active' : 'inactive'),
        paymentId: sub.subscription?.paymentId || null,
        startDate: sub.subscription?.startDate || sub.createdAt,
        endDate: sub.subscription?.endDate || null,
        billingCycle: sub.subscription?.billingCycle || 'monthly'
      }
    }));

    res.status(200).json({ success: true, subscribers: transformedSubscribers });
  } catch (err) {
    console.error('Get all subscribers error:', err);
    res.status(500).json({ message: 'Server error' });
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
