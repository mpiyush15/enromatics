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
  status: string;
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

  useEffect(() => {
    if (user?.tenantId) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch(`/api/subscriptions/${user?.tenantId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success) {
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
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

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Plan */}
        <Card className={subscription?.planType === 'premium' ? 'border-green-500 bg-green-50' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                Current Plan
                <Badge variant={subscription?.planType === 'premium' ? 'default' : 'secondary'}>
                  {subscription?.planType?.toUpperCase()}
                </Badge>
              </CardTitle>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${subscription?.pricing.monthlyPrice}
                </div>
                <div className="text-sm text-gray-600">per month</div>
              </div>
            </div>
            <CardDescription>
              {subscription?.planType === 'premium' 
                ? 'You have access to all premium features including mobile app!'
                : 'Basic plan with web dashboard access'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {planFeatures[subscription?.planType || 'basic'].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={feature.included ? '' : 'text-gray-400 line-through'}>
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
              <div className="text-3xl font-bold text-gray-600 mb-4">$29/month</div>
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
              <div className="text-3xl font-bold text-blue-600 mb-4">$49/month</div>
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