/**
 * Subscription Lifecycle Cron Jobs
 * Periodically check and update subscription statuses
 */

import cron from 'node-cron';
import {
  autoExpireSubscriptions,
  sendExpiryWarnings
} from './subscriptionLifecycleService.js';

let cronJobs = [];

/**
 * Initialize all subscription lifecycle cron jobs
 */
export const initializeCronJobs = () => {
  console.log('⏰ Initializing subscription lifecycle cron jobs...');
  
  // Auto-expire check: Run every hour
  const expireJob = cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔄 Running auto-expire check...');
      const result = await autoExpireSubscriptions();
      
      if (result.expired.length > 0 || result.inactive.length > 0) {
        console.log(`✅ Auto-expire completed: ${result.expired.length} expired, ${result.inactive.length} inactive`);
      }
      
      if (result.errors.length > 0) {
        console.warn(`⚠️  ${result.errors.length} errors during auto-expire`);
      }
    } catch (error) {
      console.error('❌ Error in auto-expire cron:', error.message);
    }
  });
  
  // Expiry warning check: Run every day at 9 AM
  const warningJob = cron.schedule('0 9 * * *', async () => {
    try {
      console.log('🔔 Checking for expiry warnings...');
      const warnings = await sendExpiryWarnings(7);
      
      if (warnings.length > 0) {
        console.log(`✅ Found ${warnings.length} subscriptions expiring soon`);
        // TODO: Send notifications
      }
    } catch (error) {
      console.error('❌ Error in expiry warning cron:', error.message);
    }
  });
  
  cronJobs.push(expireJob, warningJob);
  console.log('✅ Cron jobs initialized');
  
  return { expireJob, warningJob };
};

/**
 * Stop all cron jobs
 */
export const stopCronJobs = () => {
  console.log('⏹️  Stopping subscription lifecycle cron jobs...');
  
  cronJobs.forEach(job => {
    if (job) {
      job.stop();
    }
  });
  
  cronJobs = [];
  console.log('✅ Cron jobs stopped');
};

/**
 * Manually trigger auto-expire (for testing/admin)
 */
export const triggerAutoExpire = async () => {
  console.log('🔄 Manually triggering auto-expire...');
  return autoExpireSubscriptions();
};

/**
 * Manually trigger expiry warnings (for testing/admin)
 */
export const triggerExpiryWarnings = async (daysBeforeExpiry = 7) => {
  console.log(`🔔 Manually triggering expiry warnings (${daysBeforeExpiry} days)...`);
  return sendExpiryWarnings(daysBeforeExpiry);
};

export default {
  initializeCronJobs,
  stopCronJobs,
  triggerAutoExpire,
  triggerExpiryWarnings
};
