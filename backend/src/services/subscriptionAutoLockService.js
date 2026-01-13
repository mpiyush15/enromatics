import Tenant from '../models/Tenant.js';

/**
 * 🔒 Auto-Lock Service
 * Automatically locks tenant accounts when subscriptions expire
 * Works for both trial and paid subscriptions
 */

/**
 * Check and lock all expired subscriptions
 * Runs periodically to ensure expired accounts are locked
 */
export const lockExpiredSubscriptions = async () => {
  try {
    console.log('🔒 Starting auto-lock check for expired subscriptions...');

    const now = new Date();

    // Find all active tenants with expired or missing subscriptions
    const expiredTenants = await Tenant.find({
      active: true, // Only check active accounts
      $or: [
        {
          'subscription.endDate': {
            $exists: true,
            $lt: now // Subscription end date is in the past
          }
        },
        {
          'subscription.endDate': {
            $exists: false // No endDate at all (malformed subscription)
          }
        },
        {
          'subscription.endDate': null // Null endDate
        }
      ]
    }).lean();

    if (expiredTenants.length === 0) {
      console.log('✅ No expired subscriptions found');
      return { checked: 0, locked: 0 };
    }

    console.log(`📋 Found ${expiredTenants.length} expired accounts to lock`);

    let lockedCount = 0;

    // Lock each expired account
    for (const tenant of expiredTenants) {
      try {
        const result = await Tenant.findByIdAndUpdate(
          tenant._id,
          {
            $set: {
              active: false,
              'subscription.autoRenew': false,
              updatedAt: new Date(),
              lockReason: 'Subscription expired - locked automatically',
              lockedAt: new Date()
            }
          },
          { new: true }
        );

        if (result) {
          lockedCount++;
          const endDate = result.subscription?.endDate ? new Date(result.subscription.endDate).toLocaleDateString() : 'Invalid/Missing';
          console.log(
            `✅ Locked: ${result.email} (Plan: ${result.plan}, Expired: ${endDate})`
          );
        }
      } catch (error) {
        console.error(
          `❌ Error locking tenant ${tenant.email}:`,
          error.message
        );
      }
    }

    console.log(`✅ Auto-lock completed: ${lockedCount}/${expiredTenants.length} accounts locked`);
    
    return {
      checked: expiredTenants.length,
      locked: lockedCount
    };
  } catch (error) {
    console.error('❌ Error in lockExpiredSubscriptions:', error);
    throw error;
  }
};

/**
 * Get all locked/inactive accounts for admin dashboard
 */
export const getLockedAccounts = async (days = 30) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const lockedAccounts = await Tenant.find({
      active: false,
      lockReason: 'Subscription expired - locked automatically',
      lockedAt: {
        $gte: cutoffDate
      }
    })
      .select('name email plan subscription.endDate lockedAt')
      .sort({ lockedAt: -1 })
      .lean();

    return lockedAccounts;
  } catch (error) {
    console.error('❌ Error fetching locked accounts:', error);
    throw error;
  }
};

/**
 * Unlock an account (for manual admin override)
 */
export const unlockAccount = async (tenantId, reason) => {
  try {
    const result = await Tenant.findByIdAndUpdate(
      tenantId,
      {
        $set: {
          active: true,
          unlockReason: reason,
          unlockedAt: new Date()
        },
        $unset: {
          lockReason: '',
          lockedAt: ''
        }
      },
      { new: true }
    );

    console.log(`✅ Unlocked account: ${result.email}`);
    return result;
  } catch (error) {
    console.error('❌ Error unlocking account:', error);
    throw error;
  }
};
