/**
 * Superadmin Configuration
 * Email notifications for key business events
 */

export const SUPERADMIN_CONFIG = {
  // Primary superadmin email for notifications
  email: process.env.SUPERADMIN_EMAIL || 'mpiyush2727@gmail.com',
  
  // Events to notify
  notifyOn: {
    newSignup: true,
    newDemoRequest: true,
    newSubscription: true,
  }
};

export default SUPERADMIN_CONFIG;
