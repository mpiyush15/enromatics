import TenantSubscription from '../models/TenantSubscription.js';
import { exec } from 'child_process';
import path from 'path';

// Get subscription details for a tenant
const getSubscription = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    let subscription = await TenantSubscription.findOne({ tenantId });
    
    // Create default subscription if none exists
    if (!subscription) {
      subscription = new TenantSubscription({
        tenantId,
        subscription: {
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        }
      });
      await subscription.save();
    }
    
    res.json({
      success: true,
      subscription: {
        tenantId: subscription.tenantId,
        planType: subscription.planType,
        features: subscription.features,
        pricing: subscription.pricing,
        status: subscription.subscription.status,
        endDate: subscription.subscription.endDate,
        hasCustomApp: subscription.mobileAppDetails.hasCustomApp,
        canAccessMobileApp: subscription.canAccessMobileApp()
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription details'
    });
  }
};

// Upgrade to premium subscription
const upgradeToPremium = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { paymentDetails } = req.body;
    
    let subscription = await TenantSubscription.findOne({ tenantId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Upgrade subscription
    await subscription.upgradeToPremium();
    
    res.json({
      success: true,
      message: 'Successfully upgraded to Premium Plan!',
      subscription: {
        planType: subscription.planType,
        features: subscription.features,
        pricing: subscription.pricing,
        canAccessMobileApp: subscription.canAccessMobileApp()
      }
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade subscription'
    });
  }
};

// Request mobile app generation
const requestMobileApp = async (req, res) => {
  try {
    const { tenantId } = req.params;
    
    const subscription = await TenantSubscription.findOne({ tenantId });
    
    if (!subscription || !subscription.canAccessMobileApp()) {
      return res.status(403).json({
        success: false,
        message: 'Premium subscription required for mobile app access'
      });
    }
    
    // Check if app is already being built or exists
    if (subscription.mobileAppDetails.lastBuildStatus === 'building') {
      return res.json({
        success: true,
        message: 'Mobile app is currently being built. Please check back in 30-45 minutes.',
        status: 'building'
      });
    }
    
    if (subscription.mobileAppDetails.hasCustomApp && subscription.mobileAppDetails.downloadUrl) {
      return res.json({
        success: true,
        message: 'Mobile app is ready for download!',
        status: 'ready',
        downloadUrl: subscription.mobileAppDetails.downloadUrl,
        version: subscription.mobileAppDetails.appVersion
      });
    }
    
    // Start building the app
    subscription.mobileAppDetails.lastBuildStatus = 'building';
    await subscription.save();
    
    // Trigger APK generation (async)
    generateAPK(tenantId);
    
    res.json({
      success: true,
      message: 'Mobile app generation started! This will take 30-45 minutes. We will notify you when ready.',
      status: 'building',
      estimatedTime: '30-45 minutes'
    });
    
  } catch (error) {
    console.error('Error requesting mobile app:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to request mobile app'
    });
  }
};

// Get all premium subscriptions (admin)
const getPremiumSubscriptions = async (req, res) => {
  try {
    const premiumSubscriptions = await TenantSubscription.findPremiumTenants();
    
    res.json({
      success: true,
      count: premiumSubscriptions.length,
      subscriptions: premiumSubscriptions.map(sub => ({
        tenantId: sub.tenantId,
        planType: sub.planType,
        status: sub.subscription.status,
        endDate: sub.subscription.endDate,
        monthlyRevenue: sub.pricing.monthlyPrice,
        hasCustomApp: sub.mobileAppDetails.hasCustomApp,
        lastBuildStatus: sub.mobileAppDetails.lastBuildStatus
      }))
    });
  } catch (error) {
    console.error('Error fetching premium subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch premium subscriptions'
    });
  }
};

// Function to generate APK (called asynchronously)
const generateAPK = async (tenantId) => {
  try {
    console.log(`Starting APK generation for tenant: ${tenantId}`);
    
    const buildScript = path.join(__dirname, '../../scripts/build-client-apk.sh');
    const command = `cd "${path.dirname(buildScript)}" && ./build-client-apk.sh ${tenantId}`;
    
    exec(command, async (error, stdout, stderr) => {
      const subscription = await TenantSubscription.findOne({ tenantId });
      
      if (error) {
        console.error(`APK generation failed for ${tenantId}:`, error);
        subscription.mobileAppDetails.lastBuildStatus = 'failed';
        await subscription.save();
        return;
      }
      
      // Update subscription with success
      subscription.mobileAppDetails.hasCustomApp = true;
      subscription.mobileAppDetails.lastBuildStatus = 'completed';
      subscription.mobileAppDetails.appGeneratedDate = new Date();
      subscription.mobileAppDetails.appVersion = '1.0.0';
      subscription.mobileAppDetails.downloadUrl = `https://yourdomain.com/downloads/${tenantId}/app.apk`;
      
      await subscription.save();
      
      console.log(`APK generation completed for tenant: ${tenantId}`);
      
      // Here you could send email notification to client
      // sendAPKReadyNotification(tenantId);
    });
    
  } catch (error) {
    console.error('Error in generateAPK:', error);
  }
};

export {
  getSubscription,
  upgradeToPremium,
  requestMobileApp,
  getPremiumSubscriptions
};