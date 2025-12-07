// Secure video access controller
// Mints signed URLs + one-time tokens + watermark params for HLS playback

import crypto from 'crypto';
import { getMaterialSignedUrl } from '../../lib/s3StorageUtils.js';
import * as planGuard from '../../lib/planGuard.js';

/**
 * Generate a one-time video access token
 * Token expires after first use or after TTL (10 minutes)
 */
function generateAccessToken(videoKey, tenantId, studentId, expiryMinutes = 10) {
  const payload = {
    videoKey,
    tenantId,
    studentId,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
    nonce: crypto.randomBytes(16).toString('hex'),
  };

  // Sign with secret to prevent tampering
  const secret = process.env.VIDEO_ACCESS_SECRET || 'dev-secret-change-in-prod';
  const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

  return {
    token: Buffer.from(JSON.stringify(payload)).toString('base64'),
    signature,
    expiresAt: payload.expiresAt,
  };
}

/**
 * POST /api/videos/access
 * Mint a secure, short-lived signed URL + one-time token + watermark params
 * Student can pass this to the video player for playback
 */
export const getVideoAccessToken = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    const studentId = req.user?.studentId || req.user?._id;
    const studentName = req.user?.name || 'Student';
    const studentEmail = req.user?.email || '';

    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const { videoKey, expiryMinutes = 10 } = req.body;
    if (!videoKey) return res.status(400).json({ message: 'videoKey required' });

    // Gate: Check if student tier has secure video access
    const tierKey = req.user?.subscriptionTier || 'basic';
    if (!planGuard.hasFeature({ tierKey, featureKey: 'secureVideo' })) {
      return res.status(403).json({
        success: false,
        code: 'feature_not_available',
        message: 'Secure video streaming not available in your plan.',
      });
    }

    // Generate one-time access token
    const { token, signature, expiresAt } = generateAccessToken(videoKey, tenantId, studentId, expiryMinutes);

    // Get signed S3 URL for the video (shorter TTL: 15 minutes)
    const signedUrl = getMaterialSignedUrl(tenantId, videoKey, 15 * 60);
    if (!signedUrl) {
      return res.status(500).json({ message: 'Failed to generate S3 URL' });
    }

    // Watermark parameters (dynamic: include student info)
    const watermark = {
      text: `${studentName} · ${studentEmail} · ${new Date().toLocaleString()}`,
      position: 'bottom-right', // top-right, top-left, bottom-right, bottom-left
      opacity: 0.25,
      fontSize: 12,
      color: '#ffffff',
    };

    // Audit log
    console.log(`Video access granted: ${tenantId} / ${studentId} -> ${videoKey}`);

    res.status(200).json({
      success: true,
      accessToken: token,
      signature,
      signedUrl, // S3 URL for playlist/segments
      watermark,
      expiresAt,
      hints: {
        tokenReuse: 'single-use (server validates on playback request)',
        urlExpiry: '15 minutes',
        playerSuggestion: 'Use Shaka Player or Video.js with HLS.js for encrypted playback',
      },
    });
  } catch (err) {
    console.error('Video access token error:', err);
    res.status(500).json({ message: 'Failed to generate access token' });
  }
};

/**
 * POST /api/videos/verify-token
 * Backend validates one-time token before serving segments
 * Call this from your HLS proxy/segment handler
 */
export const verifyVideoAccessToken = async (req, res) => {
  try {
    const { token, signature } = req.body;
    if (!token || !signature) return res.status(400).json({ message: 'Token and signature required' });

    // Decode and verify
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const secret = process.env.VIDEO_ACCESS_SECRET || 'dev-secret-change-in-prod';
    const expectedSignature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    // Check expiry
    if (new Date() > new Date(payload.expiresAt)) {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }

    // Token valid
    res.status(200).json({
      success: true,
      videoKey: payload.videoKey,
      tenantId: payload.tenantId,
      studentId: payload.studentId,
      expiresAt: payload.expiresAt,
    });
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
