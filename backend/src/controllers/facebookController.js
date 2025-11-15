import User from '../models/User.js';

// Redirect the user to Facebook OAuth consent screen
export const connectFacebook = async (req, res) => {
  try {
    // ensure user is logged in
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5050'}/api/facebook/callback`;

    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID,
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

    const redirectUri = `${process.env.BACKEND_URL || 'http://localhost:5050'}/api/facebook/callback`;

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`;

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
      // Redirect back to frontend with error
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings/facebook?error=no_user`);
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

    // Redirect back to frontend settings page
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings/facebook?connected=1`);
  } catch (err) {
    console.error('Facebook callback error:', err);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/settings/facebook?error=${encodeURIComponent(err.message)}`);
  }
};
