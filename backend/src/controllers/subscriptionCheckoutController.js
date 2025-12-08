import axios from 'axios';
import { PLANS } from '../config/plans.js';
import Tenant from '../models/Tenant.js';
import { sendEmail } from '../services/emailService.js';

// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Define trial and free plans (not in paid PLANS config)
const FREE_PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial',
    description: 'Start exploring for 14 days - No credit card required',
    price: 0,
    billingCycle: 'monthly',
    features: ['14 days free access'],
    maxStudents: 10,
    maxStaff: 2,
    isFree: true
  },
  free: {
    id: 'free',
    name: 'Free',
    description: 'Free plan for testing',
    price: 0,
    billingCycle: 'monthly',
    features: ['Free access'],
    maxStudents: 5,
    maxStaff: 1,
    isFree: true
  }
};

/**
 * Get all subscription plans
 */
export const getPlans = async (req, res) => {
  try {
    // Combine paid plans and free plans
    const allPlans = [
      ...Object.values(FREE_PLANS),
      ...PLANS.map(p => ({
        ...p,
        billingCycle: 'monthly',
        features: p.description ? [p.description] : [],
        maxStudents: 100,
        maxStaff: 50,
        isFree: false
      }))
    ];
    
    res.status(200).json({
      success: true,
      plans: allPlans
    });
  } catch (error) {
    console.error('Get Plans Error:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
};

/**
 * Get specific plan by ID
 */
export const getPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    
    // Check free plans first
    if (FREE_PLANS[planId]) {
      return res.status(200).json({
        success: true,
        plan: FREE_PLANS[planId]
      });
    }
    
    // Then check paid plans
    const paidPlan = PLANS.find(p => p.id === planId);
    if (paidPlan) {
      return res.status(200).json({
        success: true,
        plan: {
          ...paidPlan,
          _id: paidPlan.id,
          billingCycle: 'monthly',
          features: paidPlan.description ? [paidPlan.description] : [],
          maxStudents: 100,
          maxStaff: 50,
          isFree: false,
          price: paidPlan.priceMonthly
        }
      });
    }
    
    res.status(404).json({ error: 'Plan not found' });
  } catch (error) {
    console.error('Get Plan Error:', error);
    res.status(500).json({ error: 'Failed to fetch plan' });
  }
};

/**
 * Initiate checkout for subscription
 * Handles both free (trial) and paid plans
 */
export const checkoutInitiate = async (req, res) => {
  try {
    const { planId, email, phone, name, instituteName, isNewTenant, tenantId: clientProvidedTenantId } = req.body;
    
    // Validate required fields
    if (!planId || !email || !phone || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: planId, email, phone, name' 
      });
    }

    // Check if plan exists
    const isFree = FREE_PLANS[planId] ? true : false;
    const plan = FREE_PLANS[planId] || PLANS.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    console.log(`Checkout initiated for ${isFree ? 'FREE' : 'PAID'} plan: ${planId}`);

    // For FREE plans, don't create payment - just return success
    if (isFree) {
      return res.status(200).json({
        success: true,
        isFree: true,
        plan: {
          _id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          billingCycle: plan.billingCycle,
          features: plan.features,
          maxStudents: plan.maxStudents,
          maxStaff: plan.maxStaff
        },
        message: 'Free plan - no payment required. Proceed to account creation.'
      });
    }

    // For PAID plans, initiate Cashfree payment
    // Generate a unique tenantId if not provided
    const finalTenantId = clientProvidedTenantId || `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if tenant exists
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
        plan: planId,
        active: true,
        contact: {
          phone: phone,
          country: 'India'
        },
        subscription: {
          status: 'pending',
          paymentId: null,
          startDate: null,
          endDate: null,
          billingCycle: 'monthly'
        }
      });
      console.log('Created new tenant:', tenant.tenantId, 'Plan:', planId);
    } else {
      // Update existing tenant with selected plan
      tenant.plan = planId;
      tenant.subscription.billingCycle = 'monthly';
      tenant.subscription.status = 'pending';
      await tenant.save();
      console.log('Updated tenant plan:', tenant.tenantId, 'Plan:', planId);
    }

    // Use the tenant's actual tenantId
    const customerTenantId = tenant.tenantId;

    // Create order in Cashfree
    const orderPayload = {
      order_id: `sub_${customerTenantId}_${Date.now()}`,
      order_amount: plan.priceMonthly,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerTenantId,
        customer_email: email,
        customer_phone: phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id={order_id}`,
        plan_id: plan.id,
        billing_cycle: 'monthly'
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
      subject: `Payment Initiated for ${plan.name}`,
      html: `<p>Your payment of ₹${plan.priceMonthly} for the ${plan.name} plan has been initiated. Please complete the payment to activate your subscription.</p>`
    });

    // Cashfree returns payment_session_id for creating checkout
    const paymentSessionId = response.data.payment_session_id;
    
    console.log('Cashfree Response:', JSON.stringify(response.data, null, 2));

    res.status(200).json({
      success: true,
      isFree: false,
      paymentSessionId: paymentSessionId,
      paymentLink: response.data.payment_link,
      orderId: response.data.order_id,
      tenantId: customerTenantId,
      plan: {
        _id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.priceMonthly,
        billingCycle: 'monthly',
        features: plan.description ? [plan.description] : [],
        maxStudents: 100,
        maxStaff: 50
      }
    });

  } catch (error) {
    console.error('Checkout Initiate Error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to initiate checkout'
    });
  }
};
