"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

interface AdAccount {
  id: string;
  name: string;
  currency: string;
}

interface CampaignTemplate {
  id: string;
  name: string;
  objective: string;
  description: string;
  targetAudience: string;
  suggestedBudget: string;
  duration: string;
  icon: string;
}

const campaignTemplates: CampaignTemplate[] = [
  {
    id: 'awareness',
    name: 'Brand Awareness',
    objective: 'REACH',
    description: 'Increase awareness of your brand and reach new potential customers',
    targetAudience: 'Lookalike audiences, interests-based targeting',
    suggestedBudget: '$20-50/day',
    duration: '1-2 weeks',
    icon: '📢'
  },
  {
    id: 'traffic',
    name: 'Website Traffic',
    objective: 'LINK_CLICKS',
    description: 'Drive more people to visit your website or landing page',
    targetAudience: 'Website visitors, interests, demographics',
    suggestedBudget: '$15-40/day',
    duration: '1-4 weeks',
    icon: '🌐'
  },
  {
    id: 'engagement',
    name: 'Post Engagement',
    objective: 'ENGAGEMENT',
    description: 'Get more likes, comments, and shares on your posts',
    targetAudience: 'People who engage with your page, lookalikes',
    suggestedBudget: '$10-30/day',
    duration: '3-7 days',
    icon: '👍'
  },
  {
    id: 'leads',
    name: 'Lead Generation',
    objective: 'LEAD_GENERATION',
    description: 'Collect leads and contact information from potential customers',
    targetAudience: 'Custom audiences, interests, behaviors',
    suggestedBudget: '$25-75/day',
    duration: '2-4 weeks',
    icon: '📋'
  }
];

export default function AdCreationPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { isConnected, connect } = useFacebookConnection();

  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [campaignName, setCampaignName] = useState('');
  const [dailyBudget, setDailyBudget] = useState('20');
  const [duration, setDuration] = useState('7');

  useEffect(() => {
    if (isConnected) {
      fetchAdAccounts();
    }
  }, [isConnected]);

  const fetchAdAccounts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.adAccounts) {
        setAdAccounts(data.adAccounts);
        if (data.adAccounts.length > 0) {
          setSelectedAccount(data.adAccounts[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch ad accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!selectedTemplate || !campaignName || !selectedAccount) {
      alert('Please fill in all required fields');
      return;
    }

    const template = campaignTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/create-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          accountId: selectedAccount,
          name: campaignName,
          objective: template.objective,
          dailyBudget: parseFloat(dailyBudget),
          duration: parseInt(duration),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Campaign created successfully!');
        // Redirect to campaigns page
        window.location.href = `/dashboard/client/${tenantId}/social/campaigns`;
      } else {
        alert('Failed to create campaign: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Failed to create campaign:', err);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">🔗</div>
          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">
            Connect Facebook First
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">
            You need to connect your Facebook Business account to create campaigns
          </p>
          <button
            onClick={connect}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Connect Facebook
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link
                href={`/dashboard/client/${tenantId}/social`}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"
              >
                ← Back to Social
              </Link>
            </div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Create Campaign</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Create a new Facebook advertising campaign</p>
          </div>
        </div>

        {/* Campaign Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-light text-gray-900 dark:text-white mb-4">Choose Campaign Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaignTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-2xl">{template.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{template.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-light">{template.objective}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-light mb-3">
                  {template.description}
                </p>
                <div className="text-xs space-y-1">
                  <div><span className="font-medium">Budget:</span> {template.suggestedBudget}</div>
                  <div><span className="font-medium">Duration:</span> {template.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Details */}
        {selectedTemplate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-light text-gray-900 dark:text-white mb-4">Campaign Details</h2>
            <div className="space-y-4">
              {/* Ad Account Selection */}
              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Ad Account
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {adAccounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name..."
                  className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Budget and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    Daily Budget ($)
                  </label>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(e.target.value)}
                    min="5"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">
                    Duration (days)
                  </label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2">Campaign Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Type:</span> {campaignTemplates.find(t => t.id === selectedTemplate)?.name}
                  </div>
                  <div>
                    <span className="font-medium">Objective:</span> {campaignTemplates.find(t => t.id === selectedTemplate)?.objective}
                  </div>
                  <div>
                    <span className="font-medium">Total Budget:</span> ${(parseFloat(dailyBudget) * parseInt(duration)).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Estimated Reach:</span> {(parseFloat(dailyBudget) * 100).toLocaleString()} - {(parseFloat(dailyBudget) * 300).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Link
                  href={`/dashboard/client/${tenantId}/social/campaigns`}
                  className="px-4 py-2 text-sm font-light text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleCreateCampaign}
                  disabled={loading || !campaignName}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : '✨ Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}