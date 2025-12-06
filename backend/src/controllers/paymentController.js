import Payment from "../models/Payment.js";
import Student from "../models/Student.js";
import { PLANS } from '../config/plans.js';
import axios from 'axios';
import Tenant from '../models/Tenant.js';
import { sendEmail } from '../services/emailService.js';
// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;
const CASHFREE_MODE = process.env.CASHFREE_MODE || 'production';

/**
 * Initiate payment for a subscription plan
 */
export const initiateSubscriptionPayment = async (req, res) => {
  try {
    const { tenantId, planId, email, phone, billingCycle } = req.body;
    const plan = PLANS.find(p => p.id === planId);
    if (!plan) return res.status(400).json({ message: 'Invalid plan selected' });

    // Determine price based on billing cycle
    let orderAmount = plan.priceMonthly;
    let cycle = 'monthly';
    if (billingCycle === 'annual') {
      orderAmount = plan.priceAnnual;
      cycle = 'annual';
    }

    // Create order in Cashfree
    const orderPayload = {
      order_id: `sub_${tenantId}_${Date.now()}`,
      order_amount: orderAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: tenantId,
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
    if (order.order_status === 'PAID') {
      // Activate subscription for tenant
      const tenant = await Tenant.findOne({ tenantId: order.customer_details.customer_id });
      if (tenant) {
        tenant.plan = order.order_meta.plan_id;
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (order.order_meta.billing_cycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        tenant.subscription = {
          status: 'active',
          paymentId: order.order_id,
          startDate: new Date(),
          endDate: new Date(Date.now() + duration),
          billingCycle: order.order_meta.billing_cycle
        };
        await tenant.save();

        // Send email for successful payment
        await sendEmail({
          to: tenant.email,
          subject: `Payment Successful for ${tenant.plan} (${order.order_meta.billing_cycle})`,
          html: `<p>Your payment for the ${tenant.plan} (${order.order_meta.billing_cycle}) plan was successful. Subscription is now active.</p>`
        });
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
      const orderId = req.body.data.order.order_id;
      const tenantId = req.body.data.order.customer_details.customer_id;
      const planId = req.body.data.order.order_meta.plan_id;
      const billingCycle = req.body.data.order.order_meta.billing_cycle;
      const tenant = await Tenant.findOne({ tenantId });
      if (tenant) {
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (billingCycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        tenant.plan = planId;
        tenant.subscription = {
          status: 'active',
          paymentId: orderId,
          startDate: new Date(),
          endDate: new Date(Date.now() + duration),
          billingCycle
        };
        await tenant.save();

        // Send email for successful payment
        await sendEmail({
          to: tenant.email,
          subject: `Payment Successful for ${tenant.plan} (${billingCycle})`,
          html: `<p>Your payment for the ${tenant.plan} (${billingCycle}) plan was successful. Subscription is now active.</p>`
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
