"use client";"use client";"use client";"use client";"use client";"use client";



import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import Link from "next/link";import { useEffect, useState } from "react";

import { useFacebookConnection } from "@/hooks/useFacebookConnection";

import { useParams } from "next/navigation";

const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

import Link from "next/link";import { useEffect, useState } from "react";

interface Campaign {

  id: string;import { useFacebookConnection } from "@/hooks/useFacebookConnection";

  name: string;

  status: string;import { useParams } from "next/navigation";

  objective: string;

  spend: number;const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

  impressions: number;

  clicks: number;import Link from "next/link";import { useEffect, useState } from "react";

  created_time: string;

}interface Campaign {



interface AdAccount {  id: string;import { useFacebookConnection } from "@/hooks/useFacebookConnection";

  id: string;

  name: string;  name: string;

  campaigns: Campaign[];

}  status: string;import { useParams } from "next/navigation";



export default function CampaignsPage() {  objective: string;

  const params = useParams();

  const tenantId = params.tenantId as string;  spend: number;const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

  const { isConnected, connect } = useFacebookConnection();

  impressions: number;

  const [campaigns, setCampaigns] = useState<AdAccount[]>([]);

  const [loading, setLoading] = useState(false);  clicks: number;import Link from "next/link";import { useEffect, useState } from "react";import { useEffect, useState } from "react";



  useEffect(() => {  created_time: string;

    if (isConnected) {

      fetchCampaigns();}interface Campaign {

    }

  }, [isConnected]);



  const fetchCampaigns = async () => {interface AdAccount {  id: string;import { useFacebookConnection } from "@/hooks/useFacebookConnection";

    setLoading(true);

    try {  id: string;

      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns`, {

        credentials: 'include',  name: string;  name: string;

      });

      const data = await response.json();  campaigns: Campaign[];

      

      if (data.success && data.campaigns) {}  status: string;import { useParams } from "next/navigation";import { useParams } from "next/navigation";

        setCampaigns(data.campaigns);

      }

    } catch (err) {

      console.error('Failed to fetch campaigns:', err);export default function CampaignsPage() {  objective: string;

    } finally {

      setLoading(false);  const params = useParams();

    }

  };  const tenantId = params.tenantId as string;  spend: number;const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';



  if (!isConnected) {  const { isConnected, connect } = useFacebookConnection();

    return (

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">  impressions: number;

        <div className="text-center max-w-md">

          <div className="text-4xl mb-4">🔗</div>  const [campaigns, setCampaigns] = useState<AdAccount[]>([]);

          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">

            Connect Facebook First  const [loading, setLoading] = useState(false);  clicks: number;import Link from "next/link";import Link from "next/link";

          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">

            You need to connect your Facebook Business account to view campaigns

          </p>  useEffect(() => {  created_time: string;

          <button

            onClick={connect}    if (isConnected) {

            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"

          >      fetchCampaigns();}interface Campaign {

            Connect Facebook

          </button>    }

        </div>

      </div>  }, [isConnected]);

    );

  }



  return (  const fetchCampaigns = async () => {interface AdAccount {  id: string;import { useFacebookConnection } from "@/hooks/useFacebookConnection";import { useFacebookConnection } from "@/hooks/useFacebookConnection";

    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">

      <div className="max-w-7xl mx-auto space-y-6">    setLoading(true);

        <div className="flex items-center justify-between">

          <div>    try {  id: string;

            <div className="flex items-center gap-3 mb-2">

              <Link      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns`, {

                href={`/dashboard/client/${tenantId}/social`}

                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"        credentials: 'include',  name: string;  name: string;

              >

                ← Back to Social      });

              </Link>

            </div>      const data = await response.json();  campaigns: Campaign[];

            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Campaigns</h1>

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>      

          </div>

          <div className="flex gap-3">      if (data.success && data.campaigns) {}  status: string;

            <button

              onClick={fetchCampaigns}        setCampaigns(data.campaigns);

              disabled={loading}

              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"      }

            >

              <span className={loading ? "animate-spin" : ""}>🔄</span>    } catch (err) {

              Refresh

            </button>      console.error('Failed to fetch campaigns:', err);export default function CampaignsPage() {  objective: string;

            <Link

              href={`/dashboard/client/${tenantId}/social/ads`}    } finally {

              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

            >      setLoading(false);  const params = useParams();

              ✨ Create Campaign

            </Link>    }

          </div>

        </div>  };  const tenantId = params.tenantId as string;  spend: number;const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';



        {loading ? (

          <div className="text-center py-12">

            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>  if (!isConnected) {  const { isConnected, connect } = useFacebookConnection();

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading campaigns...</p>

          </div>    return (

        ) : campaigns.length === 0 ? (

          <div className="text-center py-12">      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">  impressions: number;

            <div className="text-4xl mb-4">🎯</div>

            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">No Campaigns Yet</h2>        <div className="text-center max-w-md">

            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">

              Create your first Facebook ad campaign to get started          <div className="text-4xl mb-4">🔗</div>  const [campaigns, setCampaigns] = useState<AdAccount[]>([]);

            </p>

            <Link          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">

              href={`/dashboard/client/${tenantId}/social/ads`}

              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"            Connect Facebook First  const [loading, setLoading] = useState(false);  clicks: number;

            >

              ✨ Create Your First Campaign          </h1>

            </Link>

          </div>          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">  const [selectedAccount, setSelectedAccount] = useState<string>('');

        ) : (

          <div className="space-y-6">            You need to connect your Facebook Business account to view campaigns

            {campaigns.map((account) => (

              <div key={account.id} className="space-y-4">          </p>  created_time: string;

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>          <button

                  <h2 className="text-lg font-light text-gray-900 dark:text-white">{account.name}</h2>

                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-light">            onClick={connect}  useEffect(() => {

                    {account.campaigns.length} campaigns

                  </span>            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"

                </div>

          >    if (isConnected) {}interface Campaign {interface AdAccount {

                <div className="grid gap-3">

                  {account.campaigns.map((campaign) => (            Connect Facebook

                    <div

                      key={campaign.id}          </button>      fetchCampaigns();

                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"

                    >        </div>

                      <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-3">      </div>    }

                          <div className="w-9 h-9 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg">

                            🎯    );

                          </div>

                          <div>  }  }, [isConnected]);

                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</h3>

                            <p className="text-xs text-gray-600 dark:text-gray-400 font-light">

                              {campaign.objective} • Created {new Date(campaign.created_time).toLocaleDateString()}

                            </p>  return (interface AdAccount {  id: string;  id: string;

                          </div>

                        </div>    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">

                        <div className="flex items-center gap-2">

                          <span className={`px-2 py-1 rounded-full text-xs font-light ${      <div className="max-w-7xl mx-auto space-y-6">  const fetchCampaigns = async () => {

                            campaign.status === 'ACTIVE' 

                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'        <div className="flex items-center justify-between">

                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'

                          }`}>          <div>    setLoading(true);  id: string;

                            {campaign.status}

                          </span>            <div className="flex items-center gap-3 mb-2">

                        </div>

                      </div>              <Link    try {



                      <div className="grid grid-cols-3 gap-4 mt-4">                href={`/dashboard/client/${tenantId}/social`}

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns`, {  name: string;  name: string;  name: string;

                            ${campaign.spend.toFixed(2)}

                          </div>              >

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Spend</div>

                        </div>                ← Back to Social        credentials: 'include',

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">              </Link>

                            {campaign.impressions.toLocaleString()}

                          </div>            </div>      });  campaigns: Campaign[];

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>

                        </div>            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Campaigns</h1>

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>      const data = await response.json();

                            {campaign.clicks.toLocaleString()}

                          </div>          </div>

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Clicks</div>

                        </div>          <div className="flex gap-3">      }  status: string;  currency: string;

                      </div>

                    </div>            <button

                  ))}

                </div>              onClick={fetchCampaigns}      if (data.success && data.campaigns) {

              </div>

            ))}              disabled={loading}

          </div>

        )}              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"        setCampaigns(data.campaigns);

      </div>

    </div>            >

  );

}              <span className={loading ? "animate-spin" : ""}>🔄</span>        if (data.campaigns.length > 0) {

              Refresh

            </button>          setSelectedAccount(data.campaigns[0].id);export default function CampaignsPage() {  objective: string;  account_status: number;

            <Link

              href={`/dashboard/client/${tenantId}/social/ads`}        }

              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

            >      }  const params = useParams();

              ✨ Create Campaign

            </Link>    } catch (err) {

          </div>

        </div>      console.error('Failed to fetch campaigns:', err);  const tenantId = params.tenantId as string;  spend: number;  spend_cap?: string;



        {loading ? (    } finally {

          <div className="text-center py-12">

            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>      setLoading(false);  const { isConnected, connect } = useFacebookConnection();

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading campaigns...</p>

          </div>    }

        ) : campaigns.length === 0 ? (

          <div className="text-center py-12">  };  impressions: number;}

            <div className="text-4xl mb-4">🎯</div>

            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">No Campaigns Yet</h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">

              Create your first Facebook ad campaign to get started  if (!isConnected) {  const [campaigns, setCampaigns] = useState<AdAccount[]>([]);

            </p>

            <Link    return (

              href={`/dashboard/client/${tenantId}/social/ads`}

              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">  const [loading, setLoading] = useState(false);  clicks: number;

            >

              ✨ Create Your First Campaign        <div className="text-center max-w-md">

            </Link>

          </div>          <div className="text-4xl mb-4">🔗</div>  const [selectedAccount, setSelectedAccount] = useState<string>('');

        ) : (

          <div className="space-y-6">          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">

            {campaigns.map((account) => (

              <div key={account.id} className="space-y-4">            Connect Facebook First  created_time: string;interface Campaign {

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>          </h1>

                  <h2 className="text-lg font-light text-gray-900 dark:text-white">{account.name}</h2>

                  <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-light">          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">  useEffect(() => {

                    {account.campaigns.length} campaigns

                  </span>            You need to connect your Facebook Business account to view campaigns

                </div>

          </p>    if (isConnected) {}  id: string;

                <div className="grid gap-3">

                  {account.campaigns.map((campaign) => (          <button

                    <div

                      key={campaign.id}            onClick={connect}      fetchCampaigns();

                      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"

                    >            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"

                      <div className="flex items-center justify-between mb-3">

                        <div className="flex items-center gap-3">          >    }  name: string;

                          <div className="w-9 h-9 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg">

                            🎯            Connect Facebook

                          </div>

                          <div>          </button>  }, [isConnected]);

                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</h3>

                            <p className="text-xs text-gray-600 dark:text-gray-400 font-light">        </div>

                              {campaign.objective} • Created {new Date(campaign.created_time).toLocaleDateString()}

                            </p>      </div>interface AdAccount {  status: string;

                          </div>

                        </div>    );

                        <div className="flex items-center gap-2">

                          <span className={`px-2 py-1 rounded-full text-xs font-light ${  }  const fetchCampaigns = async () => {

                            campaign.status === 'ACTIVE' 

                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

                              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'

                          }`}>  return (    setLoading(true);  id: string;  objective: string;

                            {campaign.status}

                          </span>    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">

                        </div>

                      </div>      <div className="max-w-7xl mx-auto space-y-6">    try {



                      <div className="grid grid-cols-3 gap-4 mt-4">        <div className="flex items-center justify-between">

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">          <div>      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns`, {  name: string;  created_time: string;

                            ${campaign.spend.toFixed(2)}

                          </div>            <div className="flex items-center gap-3 mb-2">

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Spend</div>

                        </div>              <Link        credentials: 'include',

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">                href={`/dashboard/client/${tenantId}/social`}

                            {campaign.impressions.toLocaleString()}

                          </div>                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"      });  campaigns: Campaign[];  start_time?: string;

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>

                        </div>              >

                        <div className="text-center">

                          <div className="text-sm font-light text-gray-900 dark:text-white">                ← Back to Social      const data = await response.json();

                            {campaign.clicks.toLocaleString()}

                          </div>              </Link>

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Clicks</div>

                        </div>            </div>      }  stop_time?: string;

                      </div>

                    </div>            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Campaigns</h1>

                  ))}

                </div>            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>      if (data.success && data.campaigns) {

              </div>

            ))}          </div>

          </div>

        )}          <div className="flex gap-3">        setCampaigns(data.campaigns);  budget_remaining?: string;

      </div>

    </div>            <button

  );

}              onClick={fetchCampaigns}        if (data.campaigns.length > 0) {

              disabled={loading}

              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"          setSelectedAccount(data.campaigns[0].id);export default function CampaignsPage() {  daily_budget?: string;

            >

              <span className={loading ? "animate-spin" : ""}>🔄</span>        }

              Refresh

            </button>      }  const params = useParams();  lifetime_budget?: string;

            <Link

              href={`/dashboard/client/${tenantId}/social/ads`}    } catch (err) {

              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"

            >      console.error('Failed to fetch campaigns:', err);  const tenantId = params.tenantId as string;}

              ✨ Create Campaign

            </Link>    } finally {

          </div>

        </div>      setLoading(false);  const { isConnected, connect } = useFacebookConnection();



        {loading ? (    }

          <div className="text-center py-12">

            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>  };interface CampaignTemplate {

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading campaigns...</p>

          </div>

        ) : campaigns.length === 0 ? (

          <div className="text-center py-12">  if (!isConnected) {  const [campaigns, setCampaigns] = useState<AdAccount[]>([]);  id: string;

            <div className="text-4xl mb-4">🎯</div>

            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">No Campaigns Yet</h2>    return (

            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">

              Create your first Facebook ad campaign to get started      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">  const [loading, setLoading] = useState(false);  name: string;

            </p>

            <Link        <div className="text-center max-w-md">

              href={`/dashboard/client/${tenantId}/social/ads`}

              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"          <div className="text-4xl mb-4">🔗</div>  const [selectedAccount, setSelectedAccount] = useState<string>('');  objective: string;

            >

              ✨ Create Your First Campaign          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">

            </Link>

          </div>            Connect Facebook First  description: string;

        ) : (

          <div className="space-y-6">          </h1>

            {campaigns.length > 1 && (

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">  useEffect(() => {  targetAudience: string;

                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">

                  Select Ad Account            You need to connect your Facebook Business account to view campaigns

                </label>

                <select          </p>    if (isConnected) {  suggestedBudget: string;

                  value={selectedAccount}

                  onChange={(e) => setSelectedAccount(e.target.value)}          <button

                  className="w-full md:w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"

                >            onClick={connect}      fetchCampaigns();  duration: string;

                  {campaigns.map((account) => (

                    <option key={account.id} value={account.id}>            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"

                      {account.name}

                    </option>          >    }  icon: string;

                  ))}

                </select>            Connect Facebook

              </div>

            )}          </button>  }, [isConnected]);}



            {campaigns        </div>

              .filter(account => !selectedAccount || account.id === selectedAccount)

              .map((account) => (      </div>

                <div key={account.id} className="space-y-4">

                  <div className="flex items-center gap-3">    );

                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>

                    <h2 className="text-lg font-light text-gray-900 dark:text-white">{account.name}</h2>  }  const fetchCampaigns = async () => {const campaignTemplates: CampaignTemplate[] = [

                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-light">

                      {account.campaigns.length} campaigns

                    </span>

                  </div>  return (    setLoading(true);  {



                  <div className="grid gap-3">    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">

                    {account.campaigns.map((campaign) => (

                      <div      <div className="max-w-7xl mx-auto space-y-6">    try {    id: 'awareness',

                        key={campaign.id}

                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"        {/* Header */}

                      >

                        <div className="flex items-center justify-between mb-3">        <div className="flex items-center justify-between">      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns`, {    name: 'Brand Awareness',

                          <div className="flex items-center gap-3">

                            <div className="w-9 h-9 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg">          <div>

                              🎯

                            </div>            <div className="flex items-center gap-3 mb-2">        credentials: 'include',    objective: 'REACH',

                            <div>

                              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</h3>              <Link

                              <p className="text-xs text-gray-600 dark:text-gray-400 font-light">

                                {campaign.objective} • Created {new Date(campaign.created_time).toLocaleDateString()}                href={`/dashboard/client/${tenantId}/social`}      });    description: 'Increase awareness of your brand and reach new potential customers',

                              </p>

                            </div>                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"

                          </div>

                          <div className="flex items-center gap-2">              >      const data = await response.json();    targetAudience: 'Lookalike audiences, interests-based targeting',

                            <span className={`px-2 py-1 rounded-full text-xs font-light ${

                              campaign.status === 'ACTIVE'                 ← Back to Social

                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'

                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'              </Link>          suggestedBudget: '$20-50/day',

                            }`}>

                              {campaign.status}            </div>

                            </span>

                          </div>            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Campaigns</h1>      if (data.success && data.campaigns) {    duration: '1-2 weeks',

                        </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>

                        <div className="grid grid-cols-3 gap-4 mt-4">

                          <div className="text-center">          </div>        setCampaigns(data.campaigns);    icon: '📢'

                            <div className="text-sm font-light text-gray-900 dark:text-white">

                              ${campaign.spend.toFixed(2)}          <div className="flex gap-3">

                            </div>

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Spend</div>            <button        if (data.campaigns.length > 0) {  },

                          </div>

                          <div className="text-center">              onClick={fetchCampaigns}

                            <div className="text-sm font-light text-gray-900 dark:text-white">

                              {campaign.impressions.toLocaleString()}              disabled={loading}          setSelectedAccount(data.campaigns[0].id);  {

                            </div>

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"

                          </div>

                          <div className="text-center">            >        }    id: 'traffic',

                            <div className="text-sm font-light text-gray-900 dark:text-white">

                              {campaign.clicks.toLocaleString()}              <span className={loading ? "animate-spin" : ""}>🔄</span>

                            </div>

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Clicks</div>              Refresh      }    name: 'Website Traffic',

                          </div>

                        </div>            </button>

                      </div>

                    ))}            <Link    } catch (err) {    objective: 'LINK_CLICKS',

                  </div>

                </div>              href={`/dashboard/client/${tenantId}/social/ads`}

              ))}

          </div>              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"      console.error('Failed to fetch campaigns:', err);    description: 'Drive more people to visit your website or landing page',

        )}

      </div>            >

    </div>

  );              ✨ Create Campaign    } finally {    targetAudience: 'Website visitors, interests, demographics',

}
            </Link>

          </div>      setLoading(false);    suggestedBudget: '$15-40/day',

        </div>

    }    duration: '1-4 weeks',

        {loading ? (

          <div className="text-center py-12">  };    icon: '🌐'

            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading campaigns...</p>  },

          </div>

        ) : campaigns.length === 0 ? (  if (!isConnected) {  {

          <div className="text-center py-12">

            <div className="text-4xl mb-4">🎯</div>    return (    id: 'engagement',

            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">No Campaigns Yet</h2>

            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">    name: 'Post Engagement',

              Create your first Facebook ad campaign to get started

            </p>        <div className="text-center max-w-md">    objective: 'ENGAGEMENT',

            <Link

              href={`/dashboard/client/${tenantId}/social/ads`}          <div className="text-4xl mb-4">🔗</div>    description: 'Get more likes, comments, and shares on your posts',

              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"

            >          <h1 className="text-xl font-light text-gray-900 dark:text-white mb-2">    targetAudience: 'People who engage with your page, lookalikes',

              ✨ Create Your First Campaign

            </Link>            Connect Facebook First    suggestedBudget: '$10-30/day',

          </div>

        ) : (          </h1>    duration: '3-7 days',

          <div className="space-y-6">

            {/* Account Selector */}          <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">    icon: '👍'

            {campaigns.length > 1 && (

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">            You need to connect your Facebook Business account to view campaigns  },

                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">

                  Select Ad Account          </p>  {

                </label>

                <select          <button    id: 'leads',

                  value={selectedAccount}

                  onChange={(e) => setSelectedAccount(e.target.value)}            onClick={connect}    name: 'Lead Generation',

                  className="w-full md:w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"

                >            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"    objective: 'LEAD_GENERATION',

                  {campaigns.map((account) => (

                    <option key={account.id} value={account.id}>          >    description: 'Collect leads and contact information from potential customers',

                      {account.name}

                    </option>            Connect Facebook    targetAudience: 'Custom audiences, interests, behaviors',

                  ))}

                </select>          </button>    suggestedBudget: '$25-75/day',

              </div>

            )}        </div>    duration: '2-4 weeks',



            {/* Campaigns Grid */}      </div>    icon: '📋'

            {campaigns

              .filter(account => !selectedAccount || account.id === selectedAccount)    );  },

              .map((account) => (

                <div key={account.id} className="space-y-4">  }  {

                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>    id: 'conversions',

                    <h2 className="text-lg font-light text-gray-900 dark:text-white">{account.name}</h2>

                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-light">  return (    name: 'Conversions',

                      {account.campaigns.length} campaigns

                    </span>    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">    objective: 'CONVERSIONS',

                  </div>

      <div className="max-w-7xl mx-auto space-y-6">    description: 'Drive specific actions on your website like purchases or sign-ups',

                  <div className="grid gap-3">

                    {account.campaigns.map((campaign) => (        {/* Header */}    targetAudience: 'Website visitors, custom audiences, lookalikes',

                      <div

                        key={campaign.id}        <div className="flex items-center justify-between">    suggestedBudget: '$30-100/day',

                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"

                      >          <div>    duration: '2-8 weeks',

                        <div className="flex items-center justify-between mb-3">

                          <div className="flex items-center gap-3">            <div className="flex items-center gap-3 mb-2">    icon: '🎯'

                            <div className="w-9 h-9 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg">

                              🎯              <Link  },

                            </div>

                            <div>                href={`/dashboard/client/${tenantId}/social`}  {

                              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</h3>

                              <p className="text-xs text-gray-600 dark:text-gray-400 font-light">                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-light"    id: 'messages',

                                {campaign.objective} • Created {new Date(campaign.created_time).toLocaleDateString()}

                              </p>              >    name: 'Messages',

                            </div>

                          </div>                ← Back to Social    objective: 'MESSAGES',

                          <div className="flex items-center gap-2">

                            <span className={`px-2 py-1 rounded-full text-xs font-light ${              </Link>    description: 'Get people to send messages to your business',

                              campaign.status === 'ACTIVE' 

                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'            </div>    targetAudience: 'Local audiences, interests, behaviors',

                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'

                            }`}>            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Campaigns</h1>    suggestedBudget: '$15-45/day',

                              {campaign.status}

                            </span>            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>    duration: '1-3 weeks',

                          </div>

                        </div>          </div>    icon: '💬'



                        <div className="grid grid-cols-3 gap-4 mt-4">          <div className="flex gap-3">  }

                          <div className="text-center">

                            <div className="text-sm font-light text-gray-900 dark:text-white">            <button];

                              ${campaign.spend.toFixed(2)}

                            </div>              onClick={fetchCampaigns}

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Spend</div>

                          </div>              disabled={loading}export default function CampaignPlanningPage() {

                          <div className="text-center">

                            <div className="text-sm font-light text-gray-900 dark:text-white">              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"  const params = useParams();

                              {campaign.impressions.toLocaleString()}

                            </div>            >  const tenantId = params.tenantId as string;

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>

                          </div>              <span className={loading ? "animate-spin" : ""}>🔄</span>

                          <div className="text-center">

                            <div className="text-sm font-light text-gray-900 dark:text-white">              Refresh  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);

                              {campaign.clicks.toLocaleString()}

                            </div>            </button>  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Clicks</div>

                          </div>            <Link  const [selectedAccount, setSelectedAccount] = useState<string>("");

                        </div>

                      </div>              href={`/dashboard/client/${tenantId}/social/ads`}  const [selectedTemplate, setSelectedTemplate] = useState<CampaignTemplate | null>(null);

                    ))}

                  </div>              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"  const [loading, setLoading] = useState(true);

                </div>

              ))}            >  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

          </div>

        )}              ✨ Create Campaign  const [connected, setConnected] = useState(false);

      </div>

    </div>            </Link>  const [showCreateModal, setShowCreateModal] = useState(false);

  );

}          </div>

        </div>  useEffect(() => {

    checkConnection();

        {loading ? (  }, []);

          <div className="text-center py-12">

            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>  useEffect(() => {

            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading campaigns...</p>    if (connected) {

          </div>      fetchAdAccounts();

        ) : campaigns.length === 0 ? (    }

          <div className="text-center py-12">  }, [connected]);

            <div className="text-4xl mb-4">🎯</div>

            <h2 className="text-xl font-light text-gray-900 dark:text-white mb-2">No Campaigns Yet</h2>  useEffect(() => {

            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">    if (selectedAccount) {

              Create your first Facebook ad campaign to get started      fetchCampaigns();

            </p>    }

            <Link  }, [selectedAccount]);

              href={`/dashboard/client/${tenantId}/social/ads`}

              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors"  const checkConnection = async () => {

            >    try {

              ✨ Create Your First Campaign      const response = await fetch(`${API_BASE_URL}/api/facebook/status`, {

            </Link>        credentials: 'include',

          </div>      });

        ) : (      const data = await response.json();

          <div className="space-y-6">      setConnected(data.connected);

            {/* Account Selector */}      setLoading(false);

            {campaigns.length > 1 && (    } catch (err) {

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">      console.error('Connection check failed:', err);

                <label className="block text-sm font-light text-gray-700 dark:text-gray-300 mb-2">      setLoading(false);

                  Select Ad Account    }

                </label>  };

                <select

                  value={selectedAccount}  const fetchAdAccounts = async () => {

                  onChange={(e) => setSelectedAccount(e.target.value)}    try {

                  className="w-full md:w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:ring-2 focus:ring-blue-500"      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts`, {

                >        credentials: 'include',

                  {campaigns.map((account) => (      });

                    <option key={account.id} value={account.id}>      const data = await response.json();

                      {account.name}      

                    </option>      if (data.success) {

                  ))}        setAdAccounts(data.adAccounts);

                </select>        if (data.adAccounts.length > 0) {

              </div>          setSelectedAccount(data.adAccounts[0].id);

            )}        }

      }

            {/* Campaigns Grid */}    } catch (err: any) {

            {campaigns      console.error('Fetch ad accounts failed:', err);

              .filter(account => !selectedAccount || account.id === selectedAccount)    }

              .map((account) => (  };

                <div key={account.id} className="space-y-4">

                  <div className="flex items-center gap-3">  const fetchCampaigns = async () => {

                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>    if (!selectedAccount) return;

                    <h2 className="text-lg font-light text-gray-900 dark:text-white">{account.name}</h2>    

                    <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-light">    setLoadingCampaigns(true);

                      {account.campaigns.length} campaigns    try {

                    </span>      const response = await fetch(

                  </div>        `${API_BASE_URL}/api/facebook/ad-accounts/${selectedAccount}/campaigns`,

        { credentials: 'include' }

                  <div className="grid gap-3">      );

                    {account.campaigns.map((campaign) => (      const data = await response.json();

                      <div      

                        key={campaign.id}      if (data.success) {

                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"        setCampaigns(data.campaigns);

                      >      }

                        <div className="flex items-center justify-between mb-3">    } catch (err: any) {

                          <div className="flex items-center gap-3">      console.error('Fetch campaigns failed:', err);

                            <div className="w-9 h-9 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg flex items-center justify-center text-lg">    } finally {

                              🎯      setLoadingCampaigns(false);

                            </div>    }

                            <div>  };

                              <h3 className="font-medium text-gray-900 dark:text-white text-sm">{campaign.name}</h3>

                              <p className="text-xs text-gray-600 dark:text-gray-400 font-light">  const getStatusColor = (status: string) => {

                                {campaign.objective} • Created {new Date(campaign.created_time).toLocaleDateString()}    switch (status.toUpperCase()) {

                              </p>      case 'ACTIVE': return 'text-green-600 bg-green-100';

                            </div>      case 'PAUSED': return 'text-yellow-600 bg-yellow-100';

                          </div>      case 'DELETED': return 'text-red-600 bg-red-100';

                          <div className="flex items-center gap-2">      case 'ARCHIVED': return 'text-gray-600 bg-gray-100';

                            <span className={`px-2 py-1 rounded-full text-xs font-light ${      default: return 'text-blue-600 bg-blue-100';

                              campaign.status === 'ACTIVE'     }

                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'  };

                                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'

                            }`}>  if (loading) {

                              {campaign.status}    return (

                            </span>      <div className="min-h-screen flex items-center justify-center">

                          </div>        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>

                        </div>      </div>

    );

                        <div className="grid grid-cols-3 gap-4 mt-4">  }

                          <div className="text-center">

                            <div className="text-sm font-light text-gray-900 dark:text-white">  if (!connected) {

                              ${campaign.spend.toFixed(2)}    return (

                            </div>      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Spend</div>        <div className="max-w-2xl mx-auto text-center">

                          </div>          <div className="text-6xl mb-4">🔗</div>

                          <div className="text-center">          <h1 className="text-3xl font-bold mb-4">Connect Facebook Account</h1>

                            <div className="text-sm font-light text-gray-900 dark:text-white">          <p className="text-gray-600 dark:text-gray-300 mb-6">

                              {campaign.impressions.toLocaleString()}            Please connect your Facebook account to access campaign planning tools.

                            </div>          </p>

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>          <a

                          </div>            href={`/dashboard/client/${tenantId}/social`}

                          <div className="text-center">            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"

                            <div className="text-sm font-light text-gray-900 dark:text-white">          >

                              {campaign.clicks.toLocaleString()}            Go to Social Dashboard

                            </div>          </a>

                            <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Clicks</div>        </div>

                          </div>      </div>

                        </div>    );

                      </div>  }

                    ))}

                  </div>  return (

                </div>    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">

              ))}      <div className="max-w-7xl mx-auto space-y-6">

          </div>        {/* Header */}

        )}        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white">

      </div>          <h1 className="text-4xl font-bold mb-2">📊 Campaign Planning</h1>

    </div>          <p className="text-purple-100">Plan, create, and manage your Facebook advertising campaigns</p>

  );        </div>

}
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