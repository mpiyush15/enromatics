// Routes for secure video access and HLS playback

import express from 'express';
import { getVideoAccessToken, verifyVideoAccessToken } from '../controllers/videoAccessController.js';
import { protect } from '../middleware/authMiddleware.js';
import { protectStudent } from '../middleware/protectStudent.js';

const router = express.Router();

/**
 * POST /api/videos/access
 * Student/User: Request one-time video access token + signed S3 URL + watermark params
 */
router.post('/access', protect, getVideoAccessToken);

/**
 * POST /api/videos/verify-token
 * Internal: HLS proxy validates token before serving segments
 * (Called from edge/proxy server during segment fetch)
 */
router.post('/verify-token', verifyVideoAccessToken);

export default router;
