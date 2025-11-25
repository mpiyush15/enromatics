import User from '../models/User.js';

// Helper function to make Facebook API requests with error handling
const facebookApiRequest = async (endpoint, accessToken) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `Facebook API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Facebook API request failed:', error);
    throw error;
  }
};

// Redirect the user to Facebook OAuth consent screen
export const connectFacebook = async (req, res) => {
  try {
    // ensure user is logged in
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const redirectUri = `${process.env.BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app'}/api/facebook/callback`;

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_MARKETING_APP_ID || process.env.FACEBOOK_APP_ID,
      redirect_uri: redirectUri,
      scope: [
        'public_profile',
        'email',
        'business_management',
        'ads_management',
        'ads_read',
        'whatsapp_business_management',
        'whatsapp_business_messaging',
      ].join(','),
      response_type: 'code',
      auth_type: 'rerequest',
      state: req.user.tenantId || '',
    });

    return res.redirect(`https://www.facebook.com/v17.0/dialog/oauth?${params.toString()}`);
  } catch (err) {
    console.error('Facebook connect error:', err);
    return res.status(500).json({ message: err.message });
  }
};

// Handle callback from Facebook, exchange code for access token and store
export const facebookCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) return res.status(400).json({ message: 'Missing code from Facebook' });

    const redirectUri = `${process.env.BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app'}/api/facebook/callback`;

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${process.env.FACEBOOK_MARKETING_APP_ID || process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${process.env.FACEBOOK_MARKETING_APP_SECRET || process.env.FACEBOOK_APP_SECRET}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error('Facebook token error:', tokenData);
      return res.status(500).json({ message: 'Failed to obtain access token' });
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in || null;

    // Fetch user info
    const meRes = await fetch(`https://graph.facebook.com/me?fields=id,name&access_token=${accessToken}`);
    const me = await meRes.json();

    // Fetch permissions
    const permsRes = await fetch(`https://graph.facebook.com/me/permissions?access_token=${accessToken}`);
    const permsData = await permsRes.json();
    const granted = (permsData.data || []).filter((p) => p.status === 'granted').map((p) => p.permission);

    // At this point, we expect the user to be logged in (cookie present)
    // If not, we'll attempt to use state (tenantId) to find user — but prefer cookie
    let user = null;
    if (req.user) {
      user = await User.findById(req.user._id);
    } else if (req.query.state) {
      user = await User.findOne({ tenantId: req.query.state });
    }

    if (!user) {
      console.error('No logged-in user found during Facebook callback');
      // Redirect back to login page with error
      return res.redirect(`${process.env.FRONTEND_URL || 'https://enromatics.com'}/login?error=no_user`);
    }

    // Update user record with facebook business info
    user.facebookBusiness = user.facebookBusiness || {};
    user.facebookBusiness.connected = true;
    user.facebookBusiness.facebookUserId = me.id;
    user.facebookBusiness.accessToken = accessToken;
    user.facebookBusiness.tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
    user.facebookBusiness.permissions = granted;
    user.facebookBusiness.connectedAt = new Date();

    await user.save();

    // Redirect back to appropriate social media dashboard based on user role
    const redirectUrl = user.role === 'SuperAdmin' 
      ? `${process.env.FRONTEND_URL || 'https://enromatics.com'}/dashboard/social?connected=1`
      : `${process.env.FRONTEND_URL || 'https://enromatics.com'}/dashboard/client/${user.tenantId}/social?connected=1`;
      
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error('Facebook callback error:', err);
    return res.redirect(`${process.env.FRONTEND_URL || 'https://enromatics.com'}/login?error=${encodeURIComponent(err.message)}`);
  }
};

// Get user's Facebook connection status
export const getConnectionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected) {
      return res.json({
        success: true,
        connected: false
      });
    }

    // Check if token is still valid by making a test request
    try {
      await facebookApiRequest('me', user.facebookBusiness.accessToken);
      
      return res.json({
        success: true,
        connected: true,
        facebookUserId: user.facebookBusiness.facebookUserId,
        permissions: user.facebookBusiness.permissions,
        connectedAt: user.facebookBusiness.connectedAt
      });
    } catch (error) {
      // Token is invalid, mark as disconnected
      user.facebookBusiness.connected = false;
      await user.save();
      
      return res.json({
        success: true,
        connected: false,
        error: 'Token expired or invalid'
      });
    }
  } catch (error) {
    console.error('Get connection status error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's Facebook Ad Accounts
export const getAdAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const data = await facebookApiRequest(
      'me/adaccounts?fields=id,name,account_status,balance,currency,timezone_name,created_time,account_id',
      user.facebookBusiness.accessToken
    );

    res.json({
      success: true,
      adAccounts: data.data || []
    });
  } catch (error) {
    console.error('Get ad accounts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get campaigns for a specific ad account
export const getCampaigns = async (req, res) => {
  try {
    const { adAccountId } = req.params;
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const data = await facebookApiRequest(
      `act_${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget`,
      user.facebookBusiness.accessToken
    );

    res.json({
      success: true,
      campaigns: data.data || []
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get ad insights for a campaign or ad account
export const getAdInsights = async (req, res) => {
  try {
    const { adAccountId, campaignId } = req.params;
    const { dateRange = '7d' } = req.query;
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    // Set date range
    let datePreset = 'last_7d';
    switch (dateRange) {
      case '1d': datePreset = 'yesterday'; break;
      case '7d': datePreset = 'last_7d'; break;
      case '30d': datePreset = 'last_30d'; break;
      case '90d': datePreset = 'last_90d'; break;
    }

    const endpoint = campaignId 
      ? `${campaignId}/insights`
      : `act_${adAccountId}/insights`;
      
    const fields = [
      'impressions',
      'clicks', 
      'ctr',
      'spend',
      'cpm',
      'cpp',
      'reach',
      'frequency',
      'actions',
      'cost_per_action_type',
      'date_start',
      'date_stop'
    ].join(',');

    const data = await facebookApiRequest(
      `${endpoint}?fields=${fields}&date_preset=${datePreset}&breakdowns=publisher_platform,device_platform`,
      user.facebookBusiness.accessToken
    );

    res.json({
      success: true,
      insights: data.data || [],
      summary: calculateInsightsSummary(data.data || [])
    });
  } catch (error) {
    console.error('Get ad insights error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Facebook Pages connected to the user
export const getPages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const data = await facebookApiRequest(
      'me/accounts?fields=id,name,category,followers_count,fan_count,link,picture,access_token',
      user.facebookBusiness.accessToken
    );

    res.json({
      success: true,
      pages: data.data || []
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get posts for a specific Facebook page
export const getPagePosts = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { limit = 25 } = req.query;
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const data = await facebookApiRequest(
      `${pageId}/posts?fields=id,message,story,created_time,updated_time,type,status_type,link,picture,full_picture,likes.summary(true),comments.summary(true),shares&limit=${limit}`,
      user.facebookBusiness.accessToken
    );

    res.json({
      success: true,
      posts: data.data || []
    });
  } catch (error) {
    console.error('Get page posts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get comprehensive social media analytics dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user.facebookBusiness?.connected || !user.facebookBusiness?.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const token = user.facebookBusiness.accessToken;
    
    // Fetch multiple data sources in parallel
    const [adAccountsRes, pagesRes] = await Promise.allSettled([
      facebookApiRequest('me/adaccounts?fields=id,name,account_status,balance,currency', token),
      facebookApiRequest('me/accounts?fields=id,name,followers_count,fan_count', token)
    ]);

    const adAccounts = adAccountsRes.status === 'fulfilled' ? adAccountsRes.value.data : [];
    const pages = pagesRes.status === 'fulfilled' ? pagesRes.value.data : [];

    // Get insights for first ad account if available
    let insights = null;
    if (adAccounts.length > 0) {
      try {
        const insightsRes = await facebookApiRequest(
          `${adAccounts[0].id}/insights?fields=impressions,clicks,spend,reach&date_preset=last_7d`,
          token
        );
        insights = insightsRes.data?.[0] || null;
      } catch (err) {
        console.log('Could not fetch insights:', err.message);
      }
    }

    res.json({
      success: true,
      dashboard: {
        adAccounts: adAccounts.map(acc => ({
          id: acc.id,
          name: acc.name,
          status: acc.account_status,
          balance: acc.balance,
          currency: acc.currency
        })),
        pages: pages.map(page => ({
          id: page.id,
          name: page.name,
          followers: page.followers_count || page.fan_count || 0
        })),
        insights: insights ? {
          impressions: parseInt(insights.impressions || 0),
          clicks: parseInt(insights.clicks || 0),
          spend: parseFloat(insights.spend || 0),
          reach: parseInt(insights.reach || 0)
        } : null,
        summary: {
          totalAdAccounts: adAccounts.length,
          totalPages: pages.length,
          totalFollowers: pages.reduce((sum, page) => sum + (page.followers_count || page.fan_count || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate insights summary
const calculateInsightsSummary = (insights) => {
  if (!insights.length) return null;
  
  return {
    totalImpressions: insights.reduce((sum, insight) => sum + parseInt(insight.impressions || 0), 0),
    totalClicks: insights.reduce((sum, insight) => sum + parseInt(insight.clicks || 0), 0),
    totalSpend: insights.reduce((sum, insight) => sum + parseFloat(insight.spend || 0), 0),
    totalReach: insights.reduce((sum, insight) => sum + parseInt(insight.reach || 0), 0),
    averageCTR: insights.reduce((sum, insight) => sum + parseFloat(insight.ctr || 0), 0) / insights.length,
    averageCPM: insights.reduce((sum, insight) => sum + parseFloat(insight.cpm || 0), 0) / insights.length
  };
};
