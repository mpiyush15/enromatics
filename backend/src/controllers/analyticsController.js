import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';

/**
 * Get all analytics data for SuperAdmin dashboard
 */
export const getDashboardAnalytics = async (req, res) => {
  try {
    console.log("📊 Analytics API called - User:", { email: req.user?.email, role: req.user?.role });
    
    // Get total revenue (sum of all active subscription amounts)
    const totalRevenue = await Tenant.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.amount': { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$subscription.amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const activeSubscriptions = totalRevenue[0]?.count || 0;

    // Get total tenants
    const totalTenants = await Tenant.countDocuments();

    // Get tenants by plan
    const tenantsByPlan = await Tenant.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ['$subscription.status', 'active'] },
                '$subscription.amount',
                0
              ]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get active users
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Get revenue trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueTrend = await Tenant.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.startDate': { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$subscription.startDate'
            }
          },
          revenue: { $sum: '$subscription.amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get subscription status breakdown
    const subscriptionStatus = await Tenant.aggregate([
      {
        $group: {
          _id: '$subscription.status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get website visitors (simulated - you can replace with actual analytics)
    const websiteVisitors = await Tenant.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newTenants: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 30
      }
    ]);

    // Get monthly revenue projection
    const monthlyRevenue = await Tenant.aggregate([
      {
        $match: { 'subscription.status': 'active' }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$subscription.startDate'
            }
          },
          revenue: { $sum: '$subscription.amount' },
          tenants: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $limit: 12
      }
    ]);

    // Calculate growth rate
    const lastMonth = monthlyRevenue[0]?.revenue || 0;
    const previousMonth = monthlyRevenue[1]?.revenue || 0;
    const growthRate = previousMonth > 0 
      ? ((lastMonth - previousMonth) / previousMonth * 100).toFixed(2)
      : 0;

    // Get plan distribution (pie chart data)
    const planDistribution = tenantsByPlan.map(plan => ({
      name: plan._id?.toUpperCase() || 'UNKNOWN',
      value: plan.count,
      revenue: plan.revenue
    }));

    res.status(200).json({
      success: true,
      kpis: {
        totalRevenue: revenue,
        activeSubscriptions: activeSubscriptions,
        totalTenants: totalTenants,
        activeUsers: activeUsers,
        growthRate: Number(growthRate)
      },
      charts: {
        tenantsByPlan: planDistribution,
        subscriptionStatus: subscriptionStatus.map(item => ({
          name: item._id?.toUpperCase() || 'UNKNOWN',
          value: item.count
        })),
        revenueTrend: revenueTrend.map(item => ({
          date: item._id,
          revenue: item.revenue,
          tenants: item.count
        })),
        websiteVisitors: websiteVisitors.reverse().map(item => ({
          date: item._id,
          newTenants: item.newTenants
        })),
        monthlyRevenue: monthlyRevenue.reverse().map(item => ({
          month: item._id,
          revenue: item.revenue,
          tenants: item.tenants
        }))
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch analytics',
      error: error.message 
    });
  }
};

/**
 * Get revenue breakdown by billing cycle
 */
export const getRevenueBreakdown = async (req, res) => {
  try {
    const breakdown = await Tenant.aggregate([
      {
        $match: { 'subscription.status': 'active' }
      },
      {
        $group: {
          _id: '$subscription.billingCycle',
          totalRevenue: { $sum: '$subscription.amount' },
          count: { $sum: 1 },
          avgRevenue: { $avg: '$subscription.amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      breakdown: breakdown.map(item => ({
        cycle: item._id || 'monthly',
        totalRevenue: item.totalRevenue,
        count: item.count,
        avgRevenue: Math.round(item.avgRevenue)
      }))
    });
  } catch (error) {
    console.error('Revenue breakdown error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch revenue breakdown',
      error: error.message 
    });
  }
};

/**
 * Get top tenants by revenue
 */
export const getTopTenants = async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const topTenants = await Tenant.aggregate([
      {
        $match: { 'subscription.status': 'active' }
      },
      {
        $sort: { 'subscription.amount': -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          instituteName: 1,
          name: 1,
          email: 1,
          plan: 1,
          'subscription.amount': 1,
          'subscription.billingCycle': 1,
          'subscription.startDate': 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      topTenants
    });
  } catch (error) {
    console.error('Top tenants error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch top tenants',
      error: error.message 
    });
  }
};
