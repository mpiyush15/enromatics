// Script to sync recent Cashfree payments to database
import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

// Define Tenant schema
const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  name: String,
  instituteName: String,
  email: String,
  plan: { type: String, default: 'free' },
  active: { type: Boolean, default: true },
  contact: {
    phone: String,
    address: String,
    city: String,
    state: String,
    country: String,
  },
  subscription: {
    status: String,
    paymentId: String,
    startDate: Date,
    endDate: Date,
    billingCycle: String,
  },
}, { timestamps: true, strict: false });

const Tenant = mongoose.model('Tenant', tenantSchema);

async function fetchCashfreeOrders() {
  try {
    // This endpoint gets recent orders - we'll try to get orders from last 7 days
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const toDate = new Date().toISOString();
    
    console.log('Fetching orders from Cashfree...');
    console.log('From:', fromDate);
    console.log('To:', toDate);
    
    // Cashfree doesn't have a list orders endpoint easily, so we'll need to know order IDs
    // Let's check if we have any order IDs stored already
    return null;
  } catch (err) {
    console.error('Error fetching Cashfree orders:', err.message);
    return null;
  }
}

async function verifyAndSyncOrder(orderId) {
  try {
    console.log(`\nVerifying order: ${orderId}`);
    
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
    console.log('Order status:', order.order_status);
    console.log('Order amount:', order.order_amount);
    console.log('Customer email:', order.customer_details?.customer_email);
    console.log('Plan:', order.order_meta?.plan_id);
    console.log('Billing cycle:', order.order_meta?.billing_cycle);
    
    if (order.order_status === 'PAID') {
      // Find or create tenant
      let tenant = await Tenant.findOne({
        $or: [
          { tenantId: order.customer_details.customer_id },
          { email: order.customer_details.customer_email },
          { 'subscription.paymentId': order.order_id }
        ]
      });
      
      if (!tenant) {
        // Create new tenant
        tenant = new Tenant({
          tenantId: order.customer_details.customer_id,
          name: order.customer_details.customer_id,
          email: order.customer_details.customer_email,
          plan: order.order_meta?.plan_id || 'test',
          active: true,
          contact: {
            phone: order.customer_details.customer_phone,
            country: 'India'
          }
        });
        console.log('Creating new tenant...');
      } else {
        console.log('Found existing tenant:', tenant.tenantId);
      }
      
      // Update subscription
      let duration = 30 * 24 * 60 * 60 * 1000; // monthly
      if (order.order_meta?.billing_cycle === 'annual') {
        duration = 365 * 24 * 60 * 60 * 1000;
      }
      
      tenant.plan = order.order_meta?.plan_id || tenant.plan;
      tenant.subscription = {
        status: 'active',
        paymentId: order.order_id,
        startDate: new Date(order.created_at || Date.now()),
        endDate: new Date(Date.now() + duration),
        billingCycle: order.order_meta?.billing_cycle || 'monthly'
      };
      
      await tenant.save();
      console.log('✅ Tenant subscription updated:', tenant.tenantId);
      return tenant;
    } else {
      console.log('⚠️ Order not paid:', order.order_status);
      return null;
    }
  } catch (err) {
    console.error('Error verifying order:', err.message);
    return null;
  }
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!\n');
    
    // Check command line arguments for order IDs
    const orderIds = process.argv.slice(2);
    
    if (orderIds.length === 0) {
      console.log('Usage: node sync-payments.js <order_id1> [order_id2] ...');
      console.log('\nExample: node sync-payments.js sub_mpiyush15_1733486400000');
      console.log('\nNo order IDs provided. Listing current tenants with subscriptions:\n');
      
      const tenants = await Tenant.find({}).lean();
      console.log('=== ALL TENANTS ===\n');
      tenants.forEach((t, i) => {
        console.log(`${i + 1}. ${t.name} (${t.email})`);
        console.log(`   TenantId: ${t.tenantId}`);
        console.log(`   Plan: ${t.plan}`);
        console.log(`   Subscription:`, JSON.stringify(t.subscription, null, 2));
        console.log('');
      });
      console.log(`Total: ${tenants.length} tenants`);
    } else {
      // Verify and sync each order
      for (const orderId of orderIds) {
        await verifyAndSyncOrder(orderId);
      }
    }
    
    await mongoose.disconnect();
    console.log('\nDone!');
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
