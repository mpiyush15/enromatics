"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import Link from "next/link";

interface AdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  spend_cap?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  start_time?: string;
  stop_time?: string;
  budget_remaining?: string;
  daily_budget?: string;
  lifetime_budget?: string;
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
  },
  {
    id: 'conversions',
    name: 'Conversions',
    objective: 'CONVERSIONS',
    description: 'Drive specific actions on your website like purchases or sign-ups',
    targetAudience: 'Website visitors, custom audiences, lookalikes',
    suggestedBudget: '$30-100/day',
    duration: '2-8 weeks',
    icon: '🎯'
  },
  {
    id: 'messages',
    name: 'Messages',
    objective: 'MESSAGES',
    description: 'Get people to send messages to your business',
    targetAudience: 'Local audiences, interests, behaviors',
    suggestedBudget: '$15-45/day',
    duration: '1-3 weeks',
    icon: '💬'
  }
];

export default function CampaignPlanningPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchAdAccounts();
    }
  }, [connected]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns();
    }
  }, [selectedAccount]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      setConnected(data.connected);
      setLoading(false);
    } catch (err) {
      console.error('Connection check failed:', err);
      setLoading(false);
    }
  };

  const fetchAdAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setAdAccounts(data.adAccounts);
        if (data.adAccounts.length > 0) {
          setSelectedAccount(data.adAccounts[0].id);
        }
      }
    } catch (err: any) {
      console.error('Fetch ad accounts failed:', err);
    }
  };

  const fetchCampaigns = async () => {
    if (!selectedAccount) return;
    
    setLoadingCampaigns(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/facebook/ad-accounts/${selectedAccount}/campaigns`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (err: any) {
      console.error('Fetch campaigns failed:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';
      case 'DELETED': return 'text-red-600 bg-red-100';
      case 'ARCHIVED': return 'text-gray-600 bg-gray-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold mb-4">Connect Facebook Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your Facebook account to access campaign planning tools.
          </p>
          <a
            href={`/dashboard/client/${tenantId}/social`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Social Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">📊 Campaign Planning</h1>
          <p className="text-purple-100">Plan, create, and manage your Facebook advertising campaigns</p>
        </div>

        {/* Ad Account Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Ad Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {adAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              ✨ Create New Campaign
            </button>
          </div>
        </div>

        {/* Campaign Templates */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Campaign Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaignTemplates.map((template) => (
              <div 
                key={template.id}
                className="border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="text-4xl mb-3">{template.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{template.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Objective:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {template.objective}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Budget:</span>
                    <span className="ml-2 text-green-600">{template.suggestedBudget}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Duration:</span>
                    <span className="ml-2 text-orange-600">{template.duration}</span>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors">
                  Use Template
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Campaigns */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Campaigns</h2>
            <button
              onClick={fetchCampaigns}
              disabled={loadingCampaigns}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {loadingCampaigns ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-blue-600 mx-auto"></div>
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{campaign.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Objective:</span>
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {campaign.objective}
                      </span>
                    </div>
                    
                    {campaign.daily_budget && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Daily Budget:</span>
                        <span className="ml-2 text-green-600 font-semibold">
                          ${(parseFloat(campaign.daily_budget) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    {campaign.lifetime_budget && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Lifetime Budget:</span>
                        <span className="ml-2 text-green-600 font-semibold">
                          ${(parseFloat(campaign.lifetime_budget) / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(campaign.created_time).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                    <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                      Edit Campaign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">No Campaigns Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first advertising campaign to start reaching your target audience.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Create First Campaign
              </button>
            </div>
          )}
        </div>

        {/* Create Campaign Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Campaign</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold mb-2">Campaign Creation Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  This feature will allow you to create campaigns directly from the dashboard. 
                  For now, you can use Facebook Ads Manager to create campaigns.
                </p>
                <div className="flex gap-3 justify-center">
                  <a
                    href="https://www.facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Open Ads Manager
                  </a>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}