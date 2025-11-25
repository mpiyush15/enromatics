import express from 'express';
import { 
  connectFacebook, 
  facebookCallback,
  getConnectionStatus,
  getAdAccounts,
  getCampaigns,
  getAdInsights,
  getPages,
  getPagePosts,
  getDashboardData
} from '../controllers/facebookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// OAuth routes
router.get('/connect', protect, connectFacebook);
router.get('/callback', protect, facebookCallback);

// Connection status
router.get('/status', protect, getConnectionStatus);

// Ad accounts and campaigns
router.get('/ad-accounts', protect, getAdAccounts);
router.get('/ad-accounts/:adAccountId/campaigns', protect, getCampaigns);
router.get('/ad-accounts/:adAccountId/insights', protect, getAdInsights);
router.get('/campaigns/:campaignId/insights', protect, getAdInsights);

// Pages and posts
router.get('/pages', protect, getPages);
router.get('/pages/:pageId/posts', protect, getPagePosts);

// Dashboard data
router.get('/dashboard', protect, getDashboardData);

// Debug endpoint to check user's Facebook data
router.get('/debug', protect, async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const FacebookConnection = (await import('../models/FacebookConnection.js')).default;
    
    const user = await User.findById(req.user._id);
    const facebookConnection = await FacebookConnection.findByTenant(user.tenantId);
    const allConnections = await FacebookConnection.find({ tenantId: user.tenantId });
    
    res.json({
      success: true,
      debug: {
        user: {
          userId: user._id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          oldFacebookBusiness: user.facebookBusiness || 'undefined'
        },
        facebookConnection: {
          found: !!facebookConnection,
          id: facebookConnection?._id,
          connected: facebookConnection?.connected,
          facebookUserId: facebookConnection?.facebookUserId,
          hasAccessToken: !!facebookConnection?.accessToken,
          tokenPreview: facebookConnection?.accessToken ? 
            facebookConnection.accessToken.substring(0, 10) + '...' : null,
          connectedAt: facebookConnection?.connectedAt,
          permissions: facebookConnection?.permissions
        },
        allConnections: allConnections.map(conn => ({
          id: conn._id,
          connected: conn.connected,
          facebookUserId: conn.facebookUserId,
          connectedAt: conn.connectedAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
