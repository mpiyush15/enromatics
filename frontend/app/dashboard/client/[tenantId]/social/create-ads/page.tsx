'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSocialMediaContext } from '@/components/dashboard/SocialMediaWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  DollarSign, 
  Calendar, 
  Users, 
  MapPin, 
  Image as ImageIcon,
  Video,
  FileText,
  CreditCard,
  Plus,
  Settings,
  Eye,
  Play,
  Save,
  Send,
  ArrowLeft
} from 'lucide-react';

const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

interface PaymentMethod {
  id: string;
  lastFour: string;
  type: string;
  expiry: string;
  status: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
  objective: string;
}

export default function TenantCreateAdsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { isConnected, adAccounts } = useSocialMediaContext();
  
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [campaignTemplates, setCampaignTemplates] = useState<CampaignTemplate[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Campaign Form Data
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    budget: '',
    budgetType: 'daily', // daily or lifetime
    startDate: '',
    endDate: '',
    status: 'paused'
  });

  // Ad Set Form Data  
  const [adSetData, setAdSetData] = useState({
    name: '',
    targeting: {
      ageMin: 18,
      ageMax: 65,
      genders: [],
      locations: [],
      interests: [],
      behaviors: []
    },
    placement: 'automatic',
    optimization: 'link_clicks'
  });

  // Ad Creative Form Data
  const [adData, setAdData] = useState({
    name: '',
    format: 'single_image',
    headline: '',
    description: '',
    callToAction: 'learn_more',
    linkUrl: '',
    images: [],
    videos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedAdAccount) {
      fetchPaymentMethods();
      fetchCampaignTemplates();
    }
  }, [selectedAdAccount]);

  const fetchPaymentMethods = async () => {
    setLoadingPaymentMethods(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts/${selectedAdAccount}/payment-methods?tenantId=${tenantId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setPaymentMethods(data.paymentMethods || []);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchCampaignTemplates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/campaign-templates?tenantId=${tenantId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setCampaignTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching campaign templates:', error);
    }
  };

  const handleSubmitCampaign = async () => {
    setIsSubmitting(true);
    try {
      const campaignPayload = {
        tenantId,
        adAccountId: selectedAdAccount,
        campaign: campaignData,
        adSet: adSetData,
        ad: adData
      };

      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(campaignPayload)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('🎉 Campaign created successfully!');
        // Reset form or redirect
        setCurrentStep(1);
        setCampaignData({
          name: '',
          objective: '',
          budget: '',
          budgetType: 'daily',
          startDate: '',
          endDate: '',
          status: 'paused'
        });
      } else {
        alert(`❌ Failed to create campaign: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('❌ Error creating campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href={`/dashboard/client/${tenantId}/social`}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-white">Create Facebook Ads</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Design and launch targeted campaigns</p>
            </div>
          </div>

          <div className="text-center py-16">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">Facebook Not Connected</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your Facebook account to start creating ads
            </p>
            <Button variant="outline" asChild>
              <Link href={`/dashboard/client/${tenantId}/social/settings`}>Connect Facebook</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const campaignObjectives = [
    { value: 'awareness', label: '📢 Brand Awareness', description: 'Increase awareness of your brand' },
    { value: 'traffic', label: '🔗 Traffic', description: 'Drive people to your website' },
    { value: 'engagement', label: '👍 Engagement', description: 'Get more likes, comments, and shares' },
    { value: 'leads', label: '📋 Lead Generation', description: 'Collect leads for your business' },
    { value: 'app_installs', label: '📱 App Installs', description: 'Get people to install your app' },
    { value: 'video_views', label: '🎥 Video Views', description: 'Get more people to watch your videos' },
    { value: 'messages', label: '💬 Messages', description: 'Get more people to message your business' },
    { value: 'conversions', label: '🎯 Conversions', description: 'Drive valuable actions on your website' }
  ];

  const callToActions = [
    'learn_more', 'shop_now', 'sign_up', 'download', 'book_now', 'contact_us', 
    'get_quote', 'call_now', 'apply_now', 'watch_more', 'play_game', 'install_now'
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/dashboard/client/${tenantId}/social`}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-light text-gray-900 dark:text-white">🎯 Create Facebook Ad Campaign</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Design and launch targeted campaigns for your audience</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Step {currentStep} of 4
            </Badge>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: 'Setup', icon: Settings },
              { step: 2, title: 'Campaign', icon: Target },
              { step: 3, title: 'Audience & Budget', icon: Users },
              { step: 4, title: 'Creative & Launch', icon: ImageIcon }
            ].map(({ step, title, icon: Icon }, index) => (
              <div key={step} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 text-gray-400'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {title}
                </span>
                {index < 3 && (
                  <div className={`mx-4 h-px w-16 ${
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content - Same as SuperAdmin but with tenant context */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Setup & Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Ad Account Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Select Ad Account
                </label>
                <Select value={selectedAdAccount} onValueChange={setSelectedAdAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an ad account" />
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          <span>{account.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {account.currency || 'USD'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Methods */}
              {selectedAdAccount && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Payment Methods
                  </label>
                  <div className="space-y-3">
                    {loadingPaymentMethods ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      paymentMethods.map((method, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                **** {method.lastFour || '****'}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {method.type || 'Credit Card'} • Expires {method.expiry || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                            {method.status || 'Active'}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No payment methods found</p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Payment Method
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedAdAccount}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Campaign Setup
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps 2, 3, and 4 are identical to SuperAdmin version, just maintaining tenant context */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Templates */}
              {campaignTemplates.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                    Use Template (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {campaignTemplates.slice(0, 4).map((template, index) => (
                      <div 
                        key={index}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                        onClick={() => {
                          setCampaignData({
                            ...campaignData,
                            objective: template.objective,
                            name: template.name
                          });
                        }}
                      >
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Campaign Name
                  </label>
                  <Input
                    placeholder="e.g., Holiday Sale 2024"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Campaign Objective
                  </label>
                  <Select 
                    value={campaignData.objective} 
                    onValueChange={(value) => setCampaignData({ ...campaignData, objective: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose objective" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignObjectives.map((obj) => (
                        <SelectItem key={obj.value} value={obj.value}>
                          <div>
                            <div className="font-medium">{obj.label}</div>
                            <div className="text-xs text-gray-500">{obj.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  disabled={!campaignData.name || !campaignData.objective}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue to Audience
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Steps 3 and 4 follow the same pattern as SuperAdmin version but with tenant context */}
        {currentStep === 3 && (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Step 3: Audience & Budget configuration will be identical to SuperAdmin version</p>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back
              </Button>
              <Button 
                onClick={() => setCurrentStep(4)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Continue to Creative
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">Step 4: Creative & Launch will be identical to SuperAdmin version</p>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                Back
              </Button>
              <Button 
                onClick={handleSubmitCampaign}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? 'Launching...' : 'Launch Campaign'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}