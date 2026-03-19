'use client'

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Smartphone, Globe, Headphones, Download, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SubscriptionDetails {
  tenantId: string;
  planType: 'basic' | 'premium';
  features: {
    webDashboard: boolean;
    mobileApp: boolean;
    prioritySupport: boolean;
    offlineAccess: boolean;
  };
  pricing: {
    monthlyPrice: number;
    currency: string;
  };
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  startDate?: string;
  endDate: string;
  hasCustomApp: boolean;
  canAccessMobileApp: boolean;
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [requestingApp, setRequestingApp] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    if (user?.tenantId) {
      console.log('[SUBSCRIPTION PAGE] Fetching subscription for tenant:', user.tenantId);
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      console.log('[SUBSCRIPTION PAGE] Calling /api/subscriptions/', user?.tenantId);
      const response = await fetch(`/api/subscriptions/${user?.tenantId}`, {
        credentials: 'include'
      });
      
      console.log('[SUBSCRIPTION PAGE] Response status:', response.status);
      
      const data = await response.json();
      console.log('[SUBSCRIPTION PAGE] Response data:', data);
      
      if (data.success) {
        console.log('[SUBSCRIPTION PAGE] Setting subscription:', data.subscription);
        setSubscription(data.subscription);
      } else {
        console.error('[SUBSCRIPTION PAGE] Error from API:', data.message);
        toast.error(data.message || 'Failed to load subscription details');
      }
    } catch (error) {
      console.error('[SUBSCRIPTION PAGE] Fetch error:', error);
      toast.error('Failed to load subscription details');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const response = await fetch(`/api/subscriptions/${user?.tenantId}/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          paymentDetails: {
            // In real implementation, integrate with payment gateway
            method: 'card',
            amount: 49
          }
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('🎉 Successfully upgraded to Premium Plan!');
        fetchSubscription(); // Refresh subscription details
      } else {
        toast.error(data.message || 'Failed to upgrade subscription');
      }
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      toast.error('Failed to upgrade subscription');
    } finally {
      setUpgrading(false);
    }
  };

  const handleRequestMobileApp = async () => {
    setRequestingApp(true);
    try {
      const response = await fetch(`/api/subscriptions/${user?.tenantId}/mobile-app`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.status === 'ready') {
          toast.success('🎉 Your mobile app is ready for download!');
        } else if (data.status === 'building') {
          toast.info('📱 Mobile app generation started! We\'ll notify you when it\'s ready (30-45 minutes)');
        }
        fetchSubscription(); // Refresh subscription details
      } else {
        toast.error(data.message || 'Failed to request mobile app');
      }
    } catch (error) {
      console.error('Error requesting mobile app:', error);
      toast.error('Failed to request mobile app');
    } finally {
      setRequestingApp(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const planFeatures = {
    basic: [
      { icon: Globe, text: 'Web Dashboard Access', included: true },
      { icon: Smartphone, text: 'Mobile App Access', included: false },
      { icon: Headphones, text: 'Priority Support', included: false },
      { icon: Download, text: 'Offline Access', included: false }
    ],
    premium: [
      { icon: Globe, text: 'Web Dashboard Access', included: true },
      { icon: Smartphone, text: 'Mobile App Access', included: true },
      { icon: Headphones, text: 'Priority Support', included: true },
      { icon: Download, text: 'Offline Access', included: true }
    ]
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-gray-600 mt-2">Manage your plan and access premium features</p>
      </div>

      {/* Annual Discount Banner */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl border-2 border-green-400">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">🎉 Save 50% with Annual Billing</h2>
            <p className="text-green-100">Switch to annual billing and get half off your subscription</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">50% OFF</div>
            <div className="text-sm text-green-100">Annual Plan</div>
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center items-center gap-4 bg-gray-100 rounded-xl p-4 w-fit mx-auto">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all ${
            billingCycle === 'monthly'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`px-6 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
            billingCycle === 'annual'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-200'
          }`}
        >
          Annual
          <span className="text-xs bg-red-500 px-2 py-1 rounded-full">50% SAVE</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card className={subscription?.planType === 'premium' ? 'border-green-500 bg-green-50' : 'border-blue-500 bg-blue-50'}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Current Plan
                <Badge variant={subscription?.planType === 'premium' ? 'default' : 'secondary'}>
                  {subscription?.planType?.toUpperCase() || 'BASIC'}
                </Badge>
              </CardTitle>
              <div className="text-right">
                <div className={`text-sm font-semibold px-3 py-1 rounded-full ${
                  subscription?.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {subscription?.status?.toUpperCase() || 'ACTIVE'}
                </div>
              </div>
            </div>
            <CardDescription>
              {subscription?.planType === 'premium' 
                ? '✅ Premium plan - Full access to all features'
                : '✅ Basic plan - Web dashboard access'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Subscription Status */}
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Subscription Period:</span>
                <span className="font-semibold">
                  {subscription?.startDate 
                    ? new Date(subscription.startDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Expires:</span>
                <span className={`font-semibold ${
                  subscription?.endDate && new Date(subscription.endDate) < new Date()
                    ? 'text-red-600'
                    : 'text-green-600'
                }`}>
                  {subscription?.endDate 
                    ? new Date(subscription.endDate).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              {subscription?.endDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Days Remaining:</span>
                  <span className="font-semibold">
                    {Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days
                  </span>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Features:</h4>
              {planFeatures[subscription?.planType || 'basic'].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={feature.included ? 'text-gray-900' : 'text-gray-400 line-through'}>
                    {feature.text}
                  </span>
                  {feature.included && <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Plan Offer */}
        {subscription?.planType === 'basic' && (
          <Card className="border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Premium Plan
                <Badge variant="outline" className="bg-blue-100 text-blue-700">
                  UPGRADE
                </Badge>
              </CardTitle>
              <CardDescription>
                Unlock mobile app access and premium features
              </CardDescription>
              <div className="text-3xl font-bold text-blue-600">$49/month</div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {planFeatures.premium.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <feature.icon className="w-5 h-5 text-green-500" />
                    <span>{feature.text}</span>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleUpgrade} 
                disabled={upgrading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {upgrading ? 'Processing...' : 'Upgrade to Premium'}
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Mobile App Management */}
        {subscription?.planType === 'premium' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Mobile App
              </CardTitle>
              <CardDescription>
                Your custom branded mobile application
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!subscription.hasCustomApp ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Mobile App Not Generated</h3>
                  <p className="text-gray-600 mb-4">
                    Request your custom branded mobile app. Generation takes 30-45 minutes.
                  </p>
                  <Button 
                    onClick={handleRequestMobileApp}
                    disabled={requestingApp}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {requestingApp ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Generate Mobile App'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Mobile App Ready!</h3>
                  <p className="text-gray-600 mb-4">
                    Your custom mobile app has been generated and is ready for download.
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download APK
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Comparison</CardTitle>
          <CardDescription>
            Choose the plan that best fits your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center p-6 border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Basic Plan</h3>
              <div className="text-3xl font-bold text-gray-600 mb-1">
                ${billingCycle === 'monthly' ? '29' : '174'}
                <span className="text-sm text-gray-500">/
                  {billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <div className="text-sm text-green-600 font-semibold mb-4">
                  50% OFF with annual billing
                </div>
              )}
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Web Dashboard Access
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Student Management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Basic Support
                </li>
              </ul>
            </div>
            
            <div className="text-center p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
              <h3 className="text-xl font-bold mb-2">Premium Plan</h3>
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ${billingCycle === 'monthly' ? '49' : '294'}
                <span className="text-sm text-gray-500">/
                  {billingCycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingCycle === 'annual' && (
                <div className="text-sm text-green-600 font-semibold mb-4">
                  50% OFF with annual billing
                </div>
              )}
              <ul className="space-y-2 text-left">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Everything in Basic
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Custom Mobile App
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Priority Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Offline Access
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}