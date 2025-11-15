import express from 'express';
import { connectFacebook, facebookCallback } from '../controllers/facebookController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Start OAuth flow (user must be logged in)
router.get('/connect', protect, connectFacebook);

// OAuth callback from Facebook
router.get('/callback', protect, facebookCallback);

export default router;
