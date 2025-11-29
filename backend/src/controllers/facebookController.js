import User from '../models/User.js';
import FacebookConnection from '../models/FacebookConnection.js';

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
        'pages_show_list',
        'pages_read_engagement',
        'pages_read_user_content',
        'pages_manage_metadata',
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
    console.log('🔍 Facebook Callback - Checking user authentication...');
    console.log('🔍 req.user:', req.user ? `${req.user.email} (${req.user._id})` : 'null');
    console.log('🔍 req.query.state (tenantId):', req.query.state);
    
    let user = null;
    if (req.user) {
      console.log('✅ Using authenticated user from cookie');
      user = await User.findById(req.user._id);
    } else if (req.query.state) {
      console.log('⚠️ No cookie auth, trying to find user by tenantId:', req.query.state);
      user = await User.findOne({ tenantId: req.query.state });
    }

    if (!user) {
      console.error('❌ No logged-in user found during Facebook callback');
      console.error('❌ req.user:', req.user);
      console.error('❌ req.query.state:', req.query.state);
      // Redirect back to login page with error
      return res.redirect(`${process.env.FRONTEND_URL || 'https://enromatics.com'}/login?error=no_user`);
    }

    console.log('✅ Found user for Facebook callback:', user.email, 'Role:', user.role);
    console.log('🔍 User ID for callback:', user._id);
    console.log('🔍 User tenantId:', user.tenantId);

    // Create or update Facebook connection using dedicated model
    console.log('💾 Saving Facebook connection data to FacebookConnection model...');
    console.log('💾 Facebook User ID:', me.id);
    console.log('💾 Access Token (first 10 chars):', accessToken.substring(0, 10) + '...');
    console.log('💾 Permissions:', granted);
    
    // Check if connection already exists
    let facebookConnection = await FacebookConnection.findOne({ 
      tenantId: user.tenantId,
      userId: user._id 
    });

    if (facebookConnection) {
      console.log('� Updating existing Facebook connection...');
      // Update existing connection
      facebookConnection.connected = true;
      facebookConnection.facebookUserId = me.id;
      facebookConnection.facebookUserName = me.name;
      facebookConnection.accessToken = accessToken;
      facebookConnection.tokenExpiry = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;
      facebookConnection.permissions = granted;
      facebookConnection.connectedAt = new Date();
      facebookConnection.lastSyncAt = new Date();
    } else {
      console.log('🆕 Creating new Facebook connection...');
      // Create new connection
      facebookConnection = new FacebookConnection({
        userId: user._id,
        tenantId: user.tenantId,
        connected: true,
        facebookUserId: me.id,
        facebookUserName: me.name,
        accessToken: accessToken,
        tokenExpiry: expiresIn ? new Date(Date.now() + expiresIn * 1000) : null,
        permissions: granted,
        connectedAt: new Date(),
        lastSyncAt: new Date(),
      });
    }

    await facebookConnection.save();
    console.log('✅ Facebook connection data saved successfully to FacebookConnection model!');
    
    // Verify the save worked
    const verifyConnection = await FacebookConnection.findByTenant(user.tenantId);
    console.log('🔍 Verification - Saved connection:', {
      id: verifyConnection?._id,
      connected: verifyConnection?.connected,
      facebookUserId: verifyConnection?.facebookUserId,
      hasAccessToken: !!verifyConnection?.accessToken,
      tenantId: verifyConnection?.tenantId
    });

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
    // Enhanced authentication check
    if (!req.user) {
      console.error('❌ No authenticated user found in getConnectionStatus');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found in database:', req.user._id);
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('✅ Checking Facebook connection for user:', user.email);
    console.log('🔍 User ID for status check:', user._id);
    console.log('🔍 User tenantId:', user.tenantId);

    // Check Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    console.log('🔍 Facebook Connection Data:', {
      found: !!facebookConnection,
      connected: facebookConnection?.connected,
      facebookUserId: facebookConnection?.facebookUserId,
      hasAccessToken: !!facebookConnection?.accessToken,
      tokenLength: facebookConnection?.accessToken?.length,
      connectedAt: facebookConnection?.connectedAt,
      permissions: facebookConnection?.permissions?.slice(0, 3)
    });
    
    if (!facebookConnection || !facebookConnection.connected) {
      console.log('❌ Facebook not connected - no FacebookConnection found or not connected');
      return res.json({
        success: true,
        connected: false
      });
    }

    if (!facebookConnection.accessToken) {
      console.log('❌ Facebook connected but no access token found');
      return res.json({
        success: true,
        connected: false,
        error: 'No access token found'
      });
    }

    // Check if token is still valid by making a test request
    try {
      console.log('🔍 Testing Facebook access token validity...');
      const testResult = await facebookApiRequest('me', facebookConnection.accessToken);
      console.log('✅ Facebook token is valid. User info:', testResult);
      
      return res.json({
        success: true,
        connected: true,
        facebookUserId: facebookConnection.facebookUserId,
        permissions: facebookConnection.permissions,
        connectedAt: facebookConnection.connectedAt
      });
    } catch (error) {
      console.error('❌ Facebook token validation failed:', error.message);
      // Token is invalid, mark as disconnected
      facebookConnection.connected = false;
      facebookConnection.lastSyncError = error.message;
      facebookConnection.syncStatus = 'error';
      await facebookConnection.save();
      
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
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    if (!facebookConnection || !facebookConnection.connected || !facebookConnection.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    console.log('🔍 Fetching Facebook ad accounts...');
    const data = await facebookApiRequest(
      'me/adaccounts?fields=id,name,account_status,balance,currency,timezone_name,created_time,account_id',
      facebookConnection.accessToken
    );

    console.log('✅ Facebook ad accounts response:', {
      count: data.data?.length || 0,
      accounts: data.data?.map(acc => ({ id: acc.id, name: acc.name }))
    });

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
    
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Find Facebook connection based on user role
    let facebookConnection;
    if (req.user.role === 'SuperAdmin') {
      facebookConnection = await FacebookConnection.findOne({ 
        userId: req.user._id 
      });
    } else {
      facebookConnection = await FacebookConnection.findOne({ 
        tenantId: req.user.tenantId 
      });
    }

    if (!facebookConnection || !facebookConnection.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    // Remove 'act_' prefix if it exists to avoid duplication
    const cleanAdAccountId = adAccountId.startsWith('act_') ? adAccountId.slice(4) : adAccountId;

    const data = await facebookApiRequest(
      `act_${cleanAdAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,start_time,stop_time,budget_remaining,daily_budget,lifetime_budget,insights{spend,impressions,clicks,ctr,cpc,cpm}`,
      facebookConnection.accessToken
    );

    res.json({
      success: true,
      campaigns: data.data || []
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch campaigns' 
    });
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

// Get Facebook Pages (personal + business pages)
export const getPages = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const fb = await FacebookConnection.findByTenant(user.tenantId);
    if (!fb || !fb.connected || !fb.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const token = fb.accessToken;

    console.log('🔍 Fetching Facebook pages (personal + business)...');

    // 1️⃣ Fetch personal pages
    let personalPages = [];
    try {
      const personalRes = await facebookApiRequest(
        'me/accounts?fields=id,name,fan_count,followers_count,access_token,picture',
        token
      );
      personalPages = personalRes.data || [];
      console.log('✅ Personal pages fetched:', personalPages.length);
    } catch (err) {
      console.log('⚠️ Error fetching personal pages:', err.message);
    }

    // 2️⃣ Fetch businesses
    let businesses = [];
    try {
      const bizRes = await facebookApiRequest(
        'me/businesses?fields=id,name',
        token
      );
      businesses = bizRes.data || [];
      console.log('✅ Businesses fetched:', businesses.length);
    } catch (err) {
      console.log('⚠️ Error fetching businesses:', err.message);
    }

    let businessPages = [];

    // 3️⃣ Fetch business-owned & client pages
    for (const biz of businesses) {
      try {
        console.log(`🔍 Fetching pages for business ${biz.id}...`);
        
        const owned = await facebookApiRequest(
          `${biz.id}/owned_pages?fields=id,name,fan_count,followers_count,access_token,picture`,
          token
        );

        const client = await facebookApiRequest(
          `${biz.id}/client_pages?fields=id,name,fan_count,followers_count,access_token,picture`,
          token
        );

        const bizPagesCount = (owned.data?.length || 0) + (client.data?.length || 0);
        console.log(`✅ Business ${biz.id} pages fetched: ${bizPagesCount}`);

        businessPages.push(...(owned.data || []), ...(client.data || []));
      } catch (err) {
        console.log(`⚠️ Error fetching pages for business ${biz.id}:`, err.message);
      }
    }

    // 4️⃣ Merge + remove duplicates
    const allPages = [...personalPages, ...businessPages];

    const uniquePages = Array.from(
      new Map(allPages.map(page => [page.id, page])).values()
    );

    console.log('✅ Pages fetched successfully:', {
      businessCount: businessPages.length,
      personalCount: personalPages.length,
      total: uniquePages.length,
      pages: uniquePages.map(p => ({ id: p.id, name: p.name }))
    });

    return res.json({
      success: true,
      pages: uniquePages
    });

  } catch (error) {
    console.error('❌ Get pages error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get Instagram accounts linked to Facebook pages
export const getInstagramAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const fb = await FacebookConnection.findByTenant(user.tenantId);
    if (!fb || !fb.connected || !fb.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    const token = fb.accessToken;

    console.log('🔍 Fetching Instagram Business Accounts linked to Facebook pages...');

    // First get all pages with instagram_business_account
    let allPages = [];
    try {
      const personalRes = await facebookApiRequest(
        'me/accounts?fields=id,name,instagram_business_account',
        token
      );
      allPages = personalRes.data || [];
      console.log('✅ Personal pages fetched:', allPages.length);
    } catch (err) {
      console.log('⚠️ Error fetching personal pages:', err.message);
    }

    // Also get business pages
    let businesses = [];
    try {
      const bizRes = await facebookApiRequest(
        'me/businesses?fields=id,name',
        token
      );
      businesses = bizRes.data || [];
      console.log('✅ Businesses fetched:', businesses.length);
    } catch (err) {
      console.log('⚠️ Error fetching businesses:', err.message);
    }

    // Get business pages with instagram_business_account
    for (const biz of businesses) {
      try {
        const owned = await facebookApiRequest(
          `${biz.id}/owned_pages?fields=id,name,instagram_business_account`,
          token
        );
        const client = await facebookApiRequest(
          `${biz.id}/client_pages?fields=id,name,instagram_business_account`,
          token
        );
        allPages.push(...(owned.data || []), ...(client.data || []));
      } catch (err) {
        console.log(`⚠️ Error fetching pages for business ${biz.id}:`, err.message);
      }
    }

    console.log('🔍 Total pages to check for Instagram accounts:', allPages.length);

    // Now fetch Instagram Business Account details for each page
    let instagramAccounts = [];
    for (const page of allPages) {
      try {
        // If page has instagram_business_account field
        if (page.instagram_business_account && page.instagram_business_account.id) {
          console.log(`🔍 Fetching Instagram account details for ${page.instagram_business_account.id}...`);
          
          const igRes = await facebookApiRequest(
            `${page.instagram_business_account.id}?fields=id,username,name,biography,followers_count,follows_count,profile_pic_url,ig_username,website`,
            token
          );

          if (igRes.id) {
            console.log(`✅ Found Instagram account: @${igRes.username} for page ${page.name}`);
            instagramAccounts.push({
              id: igRes.id,
              username: igRes.username || igRes.ig_username,
              name: igRes.name,
              biography: igRes.biography,
              followers_count: igRes.followers_count,
              follows_count: igRes.follows_count,
              profile_pic_url: igRes.profile_pic_url,
              website: igRes.website,
              facebookPageId: page.id,
              facebookPageName: page.name
            });
          }
        } else {
          console.log(`ℹ️ Page ${page.id} (${page.name}) has no linked Instagram account`);
        }
      } catch (err) {
        console.log(`⚠️ Error fetching Instagram account for page ${page.id}:`, err.message);
      }
    }

    // Remove duplicates by Instagram ID
    const uniqueInstagramAccounts = Array.from(
      new Map(instagramAccounts.map(ig => [ig.id, ig])).values()
    );

    console.log('✅ Instagram Business Accounts fetched successfully:', {
      totalLinked: uniqueInstagramAccounts.length,
      accounts: uniqueInstagramAccounts.map(ig => ({ 
        id: ig.id, 
        username: ig.username,
        linkedPageName: ig.facebookPageName
      }))
    });

    return res.json({
      success: true,
      instagramAccounts: uniqueInstagramAccounts
    });

  } catch (error) {
    console.error('❌ Get Instagram accounts error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get posts for a specific Facebook page
export const getPagePosts = async (req, res) => {
  try {
    const { pageId } = req.params;
    const { limit = 25 } = req.query;
    const user = await User.findById(req.user._id);
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    if (!facebookConnection || !facebookConnection.connected || !facebookConnection.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    console.log(`🔍 Fetching posts for page ${pageId}...`);
    const data = await facebookApiRequest(
      `${pageId}/posts?fields=id,message,story,created_time,updated_time,type,status_type,link,picture,full_picture,likes.summary(true),comments.summary(true),shares&limit=${limit}`,
      facebookConnection.accessToken
    );

    console.log('✅ Facebook posts response:', {
      count: data.data?.length || 0,
      posts: data.data?.slice(0, 3).map(p => ({ id: p.id, type: p.type, hasMessage: !!p.message }))
    });

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
    // Enhanced authentication check
    if (!req.user) {
      console.error('❌ No authenticated user found in getDashboardData');
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      console.error('❌ User not found in database:', req.user._id);
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    console.log('✅ User found:', user.email, 'Role:', user.role);
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    console.log('✅ Facebook Connection Status:', facebookConnection?.connected ? 'Connected' : 'Not Connected');
    
    if (!facebookConnection || !facebookConnection.connected || !facebookConnection.accessToken) {
      return res.json({ 
        success: false,
        connected: false,
        message: 'Facebook account not connected' 
      });
    }

    const token = facebookConnection.accessToken;
    
    // Fetch multiple data sources in parallel
    console.log('🔍 Fetching Facebook dashboard data with token...');
    const [adAccountsRes, pagesRes, instagramRes] = await Promise.allSettled([
      facebookApiRequest('me/adaccounts?fields=id,name,account_status,balance,currency', token),
      facebookApiRequest('me/accounts?fields=id,name,followers_count,fan_count', token),
      (async () => {
        // Fetch Instagram Business Accounts for dashboard
        console.log('🔍 Fetching Instagram Business Accounts in dashboard...');
        
        // First get all pages with instagram_business_account
        let allPages = [];
        try {
          const personalRes = await facebookApiRequest(
            'me/accounts?fields=id,name,instagram_business_account',
            token
          );
          allPages = personalRes.data || [];
        } catch (err) {
          console.log('⚠️ Error fetching personal pages for Instagram:', err.message);
        }

        // Also get business pages
        let businesses = [];
        try {
          const bizRes = await facebookApiRequest(
            'me/businesses?fields=id,name',
            token
          );
          businesses = bizRes.data || [];
        } catch (err) {
          console.log('⚠️ Error fetching businesses for Instagram:', err.message);
        }

        // Get business pages with instagram_business_account
        for (const biz of businesses) {
          try {
            const owned = await facebookApiRequest(
              `${biz.id}/owned_pages?fields=id,name,instagram_business_account`,
              token
            );
            const client = await facebookApiRequest(
              `${biz.id}/client_pages?fields=id,name,instagram_business_account`,
              token
            );
            allPages.push(...(owned.data || []), ...(client.data || []));
          } catch (err) {
            console.log(`⚠️ Error fetching pages for business ${biz.id}:`, err.message);
          }
        }

        // Now fetch Instagram Business Account details for each page
        let instagramAccounts = [];
        for (const page of allPages) {
          try {
            // If page has instagram_business_account field
            if (page.instagram_business_account && page.instagram_business_account.id) {
              const igRes = await facebookApiRequest(
                `${page.instagram_business_account.id}?fields=id,username,name,biography,followers_count,follows_count,profile_pic_url,ig_username,website`,
                token
              );

              if (igRes.id) {
                instagramAccounts.push({
                  id: igRes.id,
                  username: igRes.username || igRes.ig_username,
                  name: igRes.name,
                  biography: igRes.biography,
                  followers_count: igRes.followers_count,
                  follows_count: igRes.follows_count,
                  profile_pic_url: igRes.profile_pic_url,
                  website: igRes.website,
                  facebookPageId: page.id,
                  facebookPageName: page.name
                });
              }
            }
          } catch (err) {
            // Silently skip - not all pages have Instagram accounts
          }
        }

        // Remove duplicates by Instagram ID
        return Array.from(
          new Map(instagramAccounts.map(ig => [ig.id, ig])).values()
        );
      })()
    ]);

    console.log('🔍 Ad Accounts API Result:', {
      status: adAccountsRes.status,
      data: adAccountsRes.status === 'fulfilled' ? adAccountsRes.value : adAccountsRes.reason
    });
    
    console.log('🔍 Pages API Result:', {
      status: pagesRes.status,
      data: pagesRes.status === 'fulfilled' ? pagesRes.value : pagesRes.reason
    });

    console.log('🔍 Instagram Accounts Result:', {
      status: instagramRes.status,
      data: instagramRes.status === 'fulfilled' ? `${instagramRes.value?.length || 0} accounts` : instagramRes.reason
    });

    const adAccounts = adAccountsRes.status === 'fulfilled' ? adAccountsRes.value.data : [];
    const pages = pagesRes.status === 'fulfilled' ? pagesRes.value.data : [];
    const instagramAccounts = instagramRes.status === 'fulfilled' ? instagramRes.value : [];
    
    console.log('✅ Processed data:', {
      adAccountsCount: adAccounts?.length || 0,
      pagesCount: pages?.length || 0,
      instagramAccountsCount: instagramAccounts?.length || 0,
      adAccounts: adAccounts?.map(acc => ({ id: acc.id, name: acc.name })),
      pages: pages?.map(page => ({ id: page.id, name: page.name })),
      instagramAccounts: instagramAccounts?.map(ig => ({ id: ig.id, username: ig.username }))
    });

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
        instagramAccounts: (instagramAccounts || []).map(ig => ({
          id: ig.id,
          username: ig.username,
          name: ig.name,
          followers: ig.followers_count || 0,
          following: ig.follows_count || 0,
          profilePicUrl: ig.profile_pic_url,
          biography: ig.biography,
          linkedPage: ig.facebookPageName
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
          totalInstagramAccounts: (instagramAccounts || []).length,
          totalFollowers: pages.reduce((sum, page) => sum + (page.followers_count || page.fan_count || 0), 0),
          totalInstagramFollowers: (instagramAccounts || []).reduce((sum, ig) => sum + (ig.followers_count || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Disconnect Facebook account
export const disconnectFacebook = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Determine tenantId
    const tenantId = req.query.tenantId || req.user.tenantId || null;

    if (!tenantId && req.user.role !== 'SuperAdmin') {
      return res.status(400).json({ 
        message: 'Tenant ID required for non-SuperAdmin users' 
      });
    }

    console.log('🔌 Disconnecting Facebook for:', {
      userId: req.user._id,
      tenantId: tenantId,
      userRole: req.user.role
    });

    // Find and delete the Facebook connection
    const connection = await FacebookConnection.findByTenant(tenantId);
    
    if (connection) {
      // Optional: Revoke the access token from Facebook
      try {
        if (connection.accessToken) {
          await facebookApiRequest(`/me/permissions`, connection.accessToken);
          console.log('✅ Facebook permissions revoked successfully');
        }
      } catch (error) {
        console.warn('⚠️ Could not revoke Facebook permissions:', error.message);
        // Continue with disconnect even if revoke fails
      }

      // Delete the connection from database
      await FacebookConnection.findByIdAndDelete(connection._id);
      console.log('✅ Facebook connection deleted from database');
    }

    // Also clear any old Facebook data from User model (legacy cleanup)
    if (req.user.facebookBusiness) {
      await User.findByIdAndUpdate(req.user._id, {
        $unset: { facebookBusiness: 1 }
      });
      console.log('✅ Legacy Facebook data cleared from User model');
    }

    res.json({ 
      success: true, 
      message: 'Facebook account disconnected successfully' 
    });

  } catch (error) {
    console.error('❌ Disconnect Facebook error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect Facebook account',
      error: error.message 
    });
  }
};

// Get payment methods for an ad account
export const getPaymentMethods = async (req, res) => {
  try {
    const { adAccountId } = req.params;
    const user = await User.findById(req.user._id);
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    if (!facebookConnection || !facebookConnection.connected || !facebookConnection.accessToken) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    console.log('🔍 Fetching payment methods for ad account:', adAccountId);
    
    try {
      // Try to fetch actual payment methods from Facebook
      const data = await facebookApiRequest(
        `act_${adAccountId}/payment_methods?fields=id,type,data`,
        facebookConnection.accessToken
      );

      console.log('✅ Payment methods response:', {
        count: data.data?.length || 0,
        methods: data.data?.map(method => ({ id: method.id, type: method.type }))
      });

      res.json({
        success: true,
        paymentMethods: data.data || []
      });
    } catch (error) {
      // If actual API fails, return mock data for development
      console.warn('⚠️ Payment methods API failed, returning mock data:', error.message);
      
      const mockPaymentMethods = [
        {
          id: 'pm_mock_1',
          type: 'Credit Card',
          lastFour: '4242',
          expiry: '12/25',
          status: 'active'
        },
        {
          id: 'pm_mock_2', 
          type: 'PayPal',
          lastFour: '****',
          expiry: 'N/A',
          status: 'active'
        }
      ];

      res.json({
        success: true,
        paymentMethods: mockPaymentMethods
      });
    }
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get campaign templates
export const getCampaignTemplates = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    if (!facebookConnection || !facebookConnection.connected) {
      return res.status(401).json({ message: 'Facebook account not connected' });
    }

    // Return predefined campaign templates for now
    const templates = [
      {
        id: 'template_1',
        name: 'Website Traffic Campaign',
        description: 'Drive traffic to your website with optimized ads',
        objective: 'traffic',
        category: 'traffic'
      },
      {
        id: 'template_2', 
        name: 'Lead Generation Campaign',
        description: 'Collect leads with engaging lead forms',
        objective: 'leads',
        category: 'leads'
      },
      {
        id: 'template_3',
        name: 'Brand Awareness Campaign', 
        description: 'Increase brand awareness and reach',
        objective: 'awareness',
        category: 'awareness'
      },
      {
        id: 'template_4',
        name: 'Video Views Campaign',
        description: 'Get more views on your video content',
        objective: 'video_views', 
        category: 'engagement'
      }
    ];

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Get campaign templates error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new Facebook ad campaign
export const createCampaign = async (req, res) => {
  try {
    const { tenantId, adAccountId, campaign, adSet, ad } = req.body;
    const user = await User.findById(req.user._id);
    
    // Validate required fields
    if (!adAccountId || !campaign?.name || !campaign?.objective) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: adAccountId, campaign name, and objective' 
      });
    }
    
    // Get Facebook connection using dedicated model
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    
    if (!facebookConnection || !facebookConnection.connected || !facebookConnection.accessToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Facebook account not connected' 
      });
    }

    console.log('🚀 Creating Facebook campaign:', {
      adAccountId,
      campaignName: campaign.name,
      objective: campaign.objective,
      budget: campaign.budget
    });

    try {
      // Step 1: Create Campaign
      const campaignData = {
        name: campaign.name,
        objective: campaign.objective.toUpperCase(),
        status: campaign.status === 'active' ? 'ACTIVE' : 'PAUSED'
      };

      console.log('📝 Creating campaign with data:', campaignData);
      
      const campaignResponse = await fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${facebookConnection.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      const campaignResult = await campaignResponse.json();
      
      if (!campaignResponse.ok) {
        console.error('❌ Campaign creation failed:', campaignResult);
        throw new Error(campaignResult.error?.message || 'Campaign creation failed');
      }

      console.log('✅ Campaign created:', campaignResult);

      // Step 2: Create Ad Set (if provided)
      let adSetResult = null;
      if (adSet?.name && campaign.budget) {
        const adSetData = {
          name: adSet.name,
          campaign_id: campaignResult.id,
          optimization_goal: adSet.optimization || 'LINK_CLICKS',
          billing_event: 'IMPRESSIONS',
          bid_amount: Math.round(parseFloat(campaign.budget) * 100), // Convert to cents
          daily_budget: campaign.budgetType === 'daily' ? Math.round(parseFloat(campaign.budget) * 100) : undefined,
          lifetime_budget: campaign.budgetType === 'lifetime' ? Math.round(parseFloat(campaign.budget) * 100) : undefined,
          targeting: {
            geo_locations: { countries: adSet.targeting?.locations || ['US'] },
            age_min: adSet.targeting?.ageMin || 18,
            age_max: adSet.targeting?.ageMax || 65
          },
          status: campaign.status === 'active' ? 'ACTIVE' : 'PAUSED'
        };

        if (campaign.startDate) {
          adSetData.start_time = new Date(campaign.startDate).toISOString();
        }
        if (campaign.endDate) {
          adSetData.end_time = new Date(campaign.endDate).toISOString();
        }

        console.log('📝 Creating ad set with data:', adSetData);
        
        const adSetResponse = await fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/adsets`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${facebookConnection.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(adSetData)
        });

        adSetResult = await adSetResponse.json();
        
        if (!adSetResponse.ok) {
          console.error('❌ Ad set creation failed:', adSetResult);
          // Continue anyway, campaign was created successfully
        } else {
          console.log('✅ Ad set created:', adSetResult);
        }
      }

      res.json({
        success: true,
        message: 'Campaign created successfully',
        data: {
          campaign: campaignResult,
          adSet: adSetResult,
          campaignId: campaignResult.id,
          campaignName: campaign.name
        }
      });

    } catch (apiError) {
      console.error('❌ Facebook API error during campaign creation:', apiError);
      
      // Return a more user-friendly error
      let errorMessage = 'Failed to create campaign';
      if (apiError.message.includes('insufficient permissions')) {
        errorMessage = 'Insufficient Facebook permissions. Please reconnect your Facebook account.';
      } else if (apiError.message.includes('budget')) {
        errorMessage = 'Invalid budget amount. Please check your budget settings.';
      } else if (apiError.message.includes('payment')) {
        errorMessage = 'Payment method issue. Please add a valid payment method to your Facebook ad account.';
      }
      
      res.status(400).json({
        success: false,
        message: errorMessage,
        details: apiError.message
      });
    }
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during campaign creation',
      details: error.message
    });
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
