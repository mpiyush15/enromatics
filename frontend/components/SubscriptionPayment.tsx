import React, { useState } from 'react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 1999,
    priceAnnual: Math.round(1999 * 12 * 0.7),
    description: 'Basic features for small teams',
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 2999,
    priceAnnual: Math.round(2999 * 12 * 0.7),
    description: 'Advanced features for growing businesses',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 4999,
    priceAnnual: Math.round(4999 * 12 * 0.7),
    description: 'Full features for large organizations',
  }
];

type SubscriptionPaymentProps = {
  tenantId: string;
  email: string;
  phone: string;
};

export default function SubscriptionPayment({ tenantId, email, phone }: SubscriptionPaymentProps) {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0].id);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [status, setStatus] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setStatus('');
    try {
      const res = await fetch('/api/payment/initiate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          planId: selectedPlan,
          email,
          phone,
          billingCycle
        })
      });
      const data = await res.json();
      if (data.success) {
        setPaymentUrl(`https://payments.cashfree.com/checkout/${data.paymentSessionId}`);
        setStatus('Payment initiated. Please complete the payment. You will receive an email for all transaction updates.');
      } else {
        setStatus('Failed to initiate payment.');
      }
    } catch (err) {
      setStatus('Error initiating payment.');
    }
    setLoading(false);
  };

  const planObj = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Choose Your Subscription Plan</h2>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Plan:</label>
        <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="border p-2 rounded w-full">
          {PLANS.map(plan => (
            <option key={plan.id} value={plan.id}>{plan.name} - ₹{billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual} / {billingCycle}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Billing Cycle:</label>
        <select value={billingCycle} onChange={e => setBillingCycle(e.target.value)} className="border p-2 rounded w-full">
          <option value="monthly">Monthly</option>
          <option value="annual">Annual (30% off)</option>
        </select>
      </div>
      <div className="mb-4">
        <p className="text-gray-700">{planObj ? planObj.description : ''}</p>
      </div>
      <button onClick={handlePayment} disabled={loading || !planObj} className="bg-blue-600 text-white px-4 py-2 rounded">
        {loading
          ? 'Processing...'
          : planObj
            ? `Pay ₹${billingCycle === 'monthly' ? planObj.priceMonthly : planObj.priceAnnual}`
            : 'Select a plan'}
      </button>
      {paymentUrl && (
        <div className="mt-4">
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">Proceed to Payment</a>
        </div>
      )}
      {status && <div className="mt-2 text-green-700">{status}</div>}
      <div className="mt-4 text-sm text-gray-500">You will receive email notifications for all payment transactions.</div>
    </div>
  );
}
