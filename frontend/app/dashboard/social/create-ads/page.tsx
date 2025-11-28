'use client';

import { useState, useEffect } from 'react';
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
  Send
} from 'lucide-react';

interface AdAccount {
  id: string;
  name: string;
  currency: string;
}

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

export default function SuperAdminCreateAdsPage() {
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
      genders: [] as string[],
      locations: [] as string[],
      interests: [] as string[],
      behaviors: [] as string[]
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
    images: [] as string[],
    videos: [] as string[]
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
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/social/ad-accounts/${selectedAdAccount}/payment-methods`, {
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
      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/social/templates`, {
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
        adAccountId: selectedAdAccount,
        campaign: campaignData,
        adSet: adSetData,
        ad: adData
      };

      // ✅ Use BFF route instead of direct backend call
      const response = await fetch(`/api/social/campaigns/create`, {
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
          <div className="text-center py-16">
            <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-2">Create Facebook Ads</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your Facebook account to start creating ads
            </p>
            <Button variant="outline" asChild>
              <a href="/dashboard/social/settings">Connect Facebook</a>
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
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">🎯 Create Facebook Ad Campaign</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">SuperAdmin Platform Ad Creation</p>
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

        {/* Step Content */}
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

        {currentStep === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Audience Targeting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    AdSet Name
                  </label>
                  <Input
                    placeholder="e.g., Young Adults - Tech Interests"
                    value={adSetData.name}
                    onChange={(e) => setAdSetData({ ...adSetData, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Min Age
                    </label>
                    <Input
                      type="number"
                      min="13"
                      max="65"
                      value={adSetData.targeting.ageMin}
                      onChange={(e) => setAdSetData({
                        ...adSetData,
                        targeting: { ...adSetData.targeting, ageMin: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Max Age
                    </label>
                    <Input
                      type="number"
                      min="13"
                      max="65"
                      value={adSetData.targeting.ageMax}
                      onChange={(e) => setAdSetData({
                        ...adSetData,
                        targeting: { ...adSetData.targeting, ageMax: parseInt(e.target.value) }
                      })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Locations (comma-separated)
                  </label>
                  <Input
                    placeholder="United States, Canada, United Kingdom"
                    value={adSetData.targeting.locations.join(', ')}
                    onChange={(e) => setAdSetData({
                      ...adSetData,
                      targeting: { 
                        ...adSetData.targeting, 
                        locations: e.target.value.split(',').map(loc => loc.trim()).filter(loc => loc)
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Interests (comma-separated)
                  </label>
                  <Input
                    placeholder="Technology, Marketing, Online shopping"
                    value={adSetData.targeting.interests.join(', ')}
                    onChange={(e) => setAdSetData({
                      ...adSetData,
                      targeting: { 
                        ...adSetData.targeting, 
                        interests: e.target.value.split(',').map(int => int.trim()).filter(int => int)
                      }
                    })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Ad Placement
                  </label>
                  <Select 
                    value={adSetData.placement} 
                    onValueChange={(value) => setAdSetData({ ...adSetData, placement: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="automatic">🔄 Automatic Placements</SelectItem>
                      <SelectItem value="facebook_feeds">📱 Facebook Feed</SelectItem>
                      <SelectItem value="instagram_feeds">📸 Instagram Feed</SelectItem>
                      <SelectItem value="facebook_stories">📖 Facebook Stories</SelectItem>
                      <SelectItem value="instagram_stories">📖 Instagram Stories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget & Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Budget Type
                  </label>
                  <Select 
                    value={campaignData.budgetType} 
                    onValueChange={(value) => setCampaignData({ ...campaignData, budgetType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">📅 Daily Budget</SelectItem>
                      <SelectItem value="lifetime">⏰ Lifetime Budget</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Budget Amount ($)
                  </label>
                  <Input
                    type="number"
                    placeholder="50.00"
                    value={campaignData.budget}
                    onChange={(e) => setCampaignData({ ...campaignData, budget: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={campaignData.startDate}
                      onChange={(e) => setCampaignData({ ...campaignData, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      End Date (Optional)
                    </label>
                    <Input
                      type="date"
                      value={campaignData.endDate}
                      onChange={(e) => setCampaignData({ ...campaignData, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Budget Estimate</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-blue-800 dark:text-blue-300">
                      {campaignData.budgetType === 'daily' ? 'Daily' : 'Total'} Spend: ${campaignData.budget || '0.00'}
                    </p>
                    <p className="text-blue-700 dark:text-blue-400">
                      Estimated Reach: {campaignData.budget ? Math.floor(parseFloat(campaignData.budget) * 100) : '0'} - {campaignData.budget ? Math.floor(parseFloat(campaignData.budget) * 200) : '0'} people
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    disabled={!adSetData.name || !campaignData.budget}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Continue to Creative
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Ad Creative & Launch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Ad Name
                  </label>
                  <Input
                    placeholder="e.g., Holiday Sale - Image Ad"
                    value={adData.name}
                    onChange={(e) => setAdData({ ...adData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Ad Format
                  </label>
                  <Select 
                    value={adData.format} 
                    onValueChange={(value) => setAdData({ ...adData, format: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_image">🖼️ Single Image</SelectItem>
                      <SelectItem value="single_video">🎥 Single Video</SelectItem>
                      <SelectItem value="carousel">🎠 Carousel</SelectItem>
                      <SelectItem value="collection">📱 Collection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Headline
                </label>
                <Input
                  placeholder="Grab attention with a compelling headline"
                  value={adData.headline}
                  onChange={(e) => setAdData({ ...adData, headline: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Description
                </label>
                <Textarea
                  placeholder="Tell your story and explain the value proposition..."
                  value={adData.description}
                  onChange={(e) => setAdData({ ...adData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Call to Action
                  </label>
                  <Select 
                    value={adData.callToAction} 
                    onValueChange={(value) => setAdData({ ...adData, callToAction: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {callToActions.map((cta) => (
                        <SelectItem key={cta} value={cta}>
                          {cta.replace('_', ' ').toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://your-website.com"
                    value={adData.linkUrl}
                    onChange={(e) => setAdData({ ...adData, linkUrl: e.target.value })}
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  {adData.format === 'single_video' ? (
                    <Video className="h-12 w-12 text-gray-400 mx-auto" />
                  ) : (
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  )}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Upload your {adData.format === 'single_video' ? 'video' : 'image'}
                    </p>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Choose File
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Recommended: {adData.format === 'single_video' ? 'MP4, MOV (max 4GB)' : 'JPG, PNG (1080x1080px)'}
                  </p>
                </div>
              </div>

              {/* Preview Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Ad Preview
                </h4>
                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 max-w-md mx-auto border">
                  <div className="space-y-3">
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500 text-sm">
                        {adData.format === 'single_video' ? '🎥 Video Preview' : '🖼️ Image Preview'}
                      </span>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 dark:text-white">
                        {adData.headline || 'Your Headline Here'}
                      </h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {adData.description || 'Your description will appear here...'}
                      </p>
                    </div>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      {adData.callToAction.replace('_', ' ').toUpperCase()}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Launch Options */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Ready to Launch?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your campaign will start {campaignData.status === 'active' ? 'immediately' : 'in paused state'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setCampaignData({ ...campaignData, status: 'paused' });
                      handleSubmitCampaign();
                    }}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button 
                    onClick={() => {
                      setCampaignData({ ...campaignData, status: 'active' });
                      handleSubmitCampaign();
                    }}
                    disabled={isSubmitting || !adData.name || !adData.headline}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Launch Campaign
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}