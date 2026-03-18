/**
 * Test Connection to WhatsApp Platform v1.1
 * Routes to verify if Enromatics can connect to WhatsApp v1.1
 */

import express from 'express';
import axios from 'axios';

const router = express.Router();

const WHATSAPP_PLATFORM_URL = process.env.WHATSAPP_PLATFORM_URL || 'http://localhost:5050';

/**
 * GET /api/test/whatsapp-connection
 * Test if we can reach WhatsApp v1.1 platform
 */
router.get('/whatsapp-connection', async (req, res) => {
  try {

    const response = await axios.get(`${WHATSAPP_PLATFORM_URL}/api/health`, {
      timeout: 5000
    });

    res.json({
      success: true,
      message: 'Connected to WhatsApp Platform v1.1',
      platform: response.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to connect to WhatsApp Platform',
      url: `${WHATSAPP_PLATFORM_URL}/api/health`,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/test/whatsapp-info
 * Get information about WhatsApp platform
 */
router.get('/whatsapp-info', async (req, res) => {
  try {

    const response = await axios.get(`${WHATSAPP_PLATFORM_URL}/api/health/test`, {
      timeout: 5000
    });

    res.json({
      success: true,
      platformInfo: response.data,
      enromatics: {
        environment: process.env.NODE_ENV,
        backendUrl: process.env.BACKEND_URL,
        whatsappUrl: WHATSAPP_PLATFORM_URL
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      enromatics: {
        environment: process.env.NODE_ENV,
        whatsappUrl: WHATSAPP_PLATFORM_URL
      },
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/test/health
 * Overall system health
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Enromatics Backend',
    timestamp: new Date().toISOString(),
    features: {
      whatsappConnection: 'testing at /api/test/whatsapp-connection',
      whatsappInfo: 'testing at /api/test/whatsapp-info'
    }
  });
});

export default router;
