/**
 * Phase 1 Analytics Controller
 * Advanced engagement metrics: bounce rate, session duration, new vs returning, etc
 * 
 * Enro Matics © 2025
 */

import PageView from "../models/PageView.js";

/**
 * GET /api/analytics/bounce-rate
 * @desc Get bounce rate for a time period
 * @param timeRange: 'today', 'week', 'month' (default: today)
 */
export const getBounceRate = async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const now = new Date();
    let startDate;

    // Set date range
    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Count bounced sessions (no interaction for 30+ seconds)
    const bouncedCount = await PageView.countDocuments({
      createdAt: { $gte: startDate },
      bounced: true
    });

    // Total sessions
    const totalSessions = await PageView.distinct("sessionId", {
      createdAt: { $gte: startDate }
    });

    const totalSessionCount = totalSessions.length;
    const bounceRate = totalSessionCount > 0 
      ? ((bouncedCount / totalSessionCount) * 100).toFixed(2)
      : 0;

    // Breakdown by device
    const bounceByDevice = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$device",
        bounced: { $sum: { $cond: ["$bounced", 1, 0] } },
        total: { $sum: 1 }
      }},
      { $project: {
        device: "$_id",
        bounceRate: { $multiply: [{ $divide: ["$bounced", "$total"] }, 100] },
        bounced: 1,
        total: 1
      }}
    ]);

    res.json({
      success: true,
      bounceRate: parseFloat(bounceRate),
      totalSessions: totalSessionCount,
      bouncedSessions: bouncedCount,
      timeRange,
      byDevice: bounceByDevice.map(d => ({
        device: d.device,
        bounceRate: d.bounceRate.toFixed(2),
        bounced: d.bounced,
        total: d.total
      })),
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Bounce rate error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/session-duration
 * @desc Get average session duration and breakdown
 */
export const getSessionDuration = async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Calculate session durations
    const sessions = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$sessionId",
        pages: { $sum: 1 },
        duration: { $sum: "$duration" },
        device: { $first: "$device" },
        source: { $first: "$source" }
      }},
      { $sort: { duration: -1 } }
    ]);

    // Calculate averages
    const avgDuration = sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)
      : 0;

    // By device
    const byDevice = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$device",
        avgDuration: { $avg: "$duration" },
        avgPages: { $avg: "$duration" },
        sessions: { $addToSet: "$sessionId" }
      }},
      { $project: {
        device: "$_id",
        avgDuration: { $round: ["$avgDuration", 0] },
        avgPages: { $round: ["$avgPages", 0] },
        totalSessions: { $size: "$sessions" }
      }}
    ]);

    // By source
    const bySource = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$source",
        avgDuration: { $avg: "$duration" },
        sessions: { $addToSet: "$sessionId" }
      }},
      { $project: {
        source: "$_id",
        avgDuration: { $round: ["$avgDuration", 0] },
        totalSessions: { $size: "$sessions" }
      }}
    ]);

    res.json({
      success: true,
      avgDuration,
      totalSessions: sessions.length,
      medianDuration: calculateMedian(sessions.map(s => s.duration)),
      minDuration: Math.min(...sessions.map(s => s.duration), 0),
      maxDuration: Math.max(...sessions.map(s => s.duration), 0),
      timeRange,
      byDevice,
      bySource,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Session duration error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/user-types
 * @desc Get new vs returning user breakdown
 */
export const getUserTypes = async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Count new vs returning
    const newUsers = await PageView.countDocuments({
      createdAt: { $gte: startDate },
      isNewSession: true
    });

    const returningUsers = await PageView.countDocuments({
      createdAt: { $gte: startDate },
      isNewSession: false
    });

    const total = newUsers + returningUsers;
    const newPercent = total > 0 ? ((newUsers / total) * 100).toFixed(2) : 0;
    const returningPercent = total > 0 ? ((returningUsers / total) * 100).toFixed(2) : 0;

    // By traffic source
    const bySource = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$source",
        new: { $sum: { $cond: ["$isNewSession", 1, 0] } },
        returning: { $sum: { $cond: ["$isNewSession", 0, 1] } },
        total: { $sum: 1 }
      }},
      { $project: {
        source: "$_id",
        newUsers: "$new",
        returningUsers: "$returning",
        total: 1,
        newPercent: { $multiply: [{ $divide: ["$new", "$total"] }, 100] },
        returningPercent: { $multiply: [{ $divide: ["$returning", "$total"] }, 100] }
      }},
      { $sort: { total: -1 } }
    ]);

    res.json({
      success: true,
      summary: {
        newUsers,
        returningUsers,
        total,
        newPercent: parseFloat(newPercent),
        returningPercent: parseFloat(returningPercent)
      },
      timeRange,
      bySource: bySource.map(s => ({
        source: s.source,
        newUsers: s.newUsers,
        returningUsers: s.returningUsers,
        total: s.total,
        newPercent: s.newPercent.toFixed(2),
        returningPercent: s.returningPercent.toFixed(2)
      })),
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ User types error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/time-on-page
 * @desc Get average time spent on each page
 */
export const getTimeOnPage = async (req, res) => {
  try {
    const { timeRange = 'today', limit = 10 } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    const pageMetrics = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: {
        _id: "$page",
        avgTimeOnPage: { $avg: "$timeOnPage" },
        totalViews: { $sum: 1 },
        uniqueVisitors: { $addToSet: "$sessionId" },
        bounceRate: { $avg: { $cond: ["$bounced", 100, 0] } }
      }},
      { $project: {
        page: "$_id",
        avgTimeOnPage: { $round: ["$avgTimeOnPage", 2] },
        totalViews: 1,
        uniqueVisitors: { $size: "$uniqueVisitors" },
        bounceRate: { $round: ["$bounceRate", 2] }
      }},
      { $sort: { totalViews: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      pages: pageMetrics,
      timeRange,
      totalPagesAnalyzed: pageMetrics.length,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Time on page error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/entry-exit
 * @desc Get entry and exit pages (funnel starting/ending points)
 */
export const getEntryExitPages = async (req, res) => {
  try {
    const { timeRange = 'today', limit = 10 } = req.query;
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'today':
      default:
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
    }

    // Top entry pages (first page of session)
    const entryPages = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate }, entryPage: true } },
      { $group: {
        _id: "$page",
        entries: { $sum: 1 },
        bounceRate: { $avg: { $cond: ["$bounced", 100, 0] } },
        avgSessionDuration: { $avg: "$duration" }
      }},
      { $project: {
        page: "$_id",
        entries: 1,
        bounceRate: { $round: ["$bounceRate", 2] },
        avgSessionDuration: { $round: ["$avgSessionDuration", 0] }
      }},
      { $sort: { entries: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Top exit pages (last page of session)
    const exitPages = await PageView.aggregate([
      { $match: { createdAt: { $gte: startDate }, exitPage: true } },
      { $group: {
        _id: "$page",
        exits: { $sum: 1 },
        totalVisitors: { $addToSet: "$sessionId" },
        avgTimeOnPage: { $avg: "$timeOnPage" }
      }},
      { $project: {
        page: "$_id",
        exits: 1,
        uniqueVisitors: { $size: "$totalVisitors" },
        avgTimeOnPage: { $round: ["$avgTimeOnPage", 0] }
      }},
      { $sort: { exits: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      entryPages,
      exitPages,
      timeRange,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Entry/exit pages error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/analytics/track-interaction
 * @desc Track user interaction (click, scroll, form input)
 * Used by frontend JS to send interaction data
 */
export const trackInteraction = async (req, res) => {
  try {
    const { sessionId, page, type, element, scrollDepth, source, referrer, interactions } = req.body;

    if (!sessionId || !page) {
      return res.status(400).json({ success: false, message: "sessionId and page required" });
    }

    // CRITICAL FIX: Try to find pageview, create if missing (handles schema validation failures)
    let pageView = await PageView.findOne({
      sessionId,
      page,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    // If no pageview exists, CREATE it (fallback for schema-rejected inserts)
    if (!pageView) {
      console.log(`📝 Creating missing PageView for: ${sessionId}/${page} (source: ${source})`);
      
      try {
        pageView = await PageView.create({
          sessionId,
          page,
          source: source || 'direct',
          referrer: referrer || '',
          device: 'unknown',
          interactions: interactions || 1,
          scrollDepth: scrollDepth || 0,
          bounced: false,
          entryPage: true,
          exitPage: false
        });
      } catch (createError) {
        console.error("❌ Failed to create PageView:", createError.message);
        // Still return success to not block frontend
        return res.status(200).json({ success: true, created: false, error: "PageView creation failed" });
      }
    } else {
      // Update existing pageview
      pageView = await PageView.findOneAndUpdate(
        { sessionId, page, createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) } },
        {
          $inc: { interactions: 1 },
          $set: { 
            bounced: false,
            scrollDepth: scrollDepth || 0,
            source: source || pageView.source,
            referrer: referrer || pageView.referrer
          }
        },
        { new: true }
      );
    }

    res.status(200).json({ 
      success: true, 
      created: !!pageView,
      source: pageView?.source || source || 'direct'
    });
  } catch (error) {
    console.error("❌ Track interaction error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};;

/**
 * Helper: Calculate median
 */
function calculateMedian(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default {
  getBounceRate,
  getSessionDuration,
  getUserTypes,
  getTimeOnPage,
  getEntryExitPages,
  trackInteraction
};
