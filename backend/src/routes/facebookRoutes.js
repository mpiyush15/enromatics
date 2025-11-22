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

export default router;
