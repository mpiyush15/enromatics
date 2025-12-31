/**
 * Website Analytics Routes - Live Visitor Tracking
 * Enro Matics © 2025
 * 
 * Production-ready for Railway backend + Vercel frontend
 */

import express from "express";
import PageView from "../models/PageView.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Helper: Parse user agent to detect device/browser/os
 */
function parseUserAgent(ua) {
  if (!ua) return { device: "unknown", browser: "unknown", os: "unknown" };
  
  // Device detection
  let device = "desktop";
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? "tablet" : "mobile";
  }
  
  // Browser detection
  let browser = "unknown";
  if (/chrome/i.test(ua) && !/edge|edg/i.test(ua)) browser = "chrome";
  else if (/firefox/i.test(ua)) browser = "firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "safari";
  else if (/edge|edg/i.test(ua)) browser = "edge";
  else if (/opera|opr/i.test(ua)) browser = "opera";
  
  // OS detection
  let os = "unknown";
  if (/windows/i.test(ua)) os = "windows";
  else if (/mac os|macos/i.test(ua)) os = "macos";
  else if (/linux/i.test(ua)) os = "linux";
  else if (/android/i.test(ua)) os = "android";
  else if (/ios|iphone|ipad/i.test(ua)) os = "ios";
  
  return { device, browser, os };
}

/**
 * Helper: Detect traffic source from referrer
 */
function detectSource(referrer) {
  if (!referrer) return "direct";
  const ref = referrer.toLowerCase();
  if (ref.includes("google")) return "google";
  if (ref.includes("facebook") || ref.includes("fb.com")) return "facebook";
  if (ref.includes("instagram")) return "instagram";
  if (ref.includes("linkedin")) return "linkedin";
  if (ref.includes("twitter") || ref.includes("t.co")) return "twitter";
  if (ref.includes("mail") || ref.includes("outlook")) return "email";
  // Any other domain referrer is treated as referral
  return "referral";
}

/**
 * @route   POST /api/website-analytics/track
 * @desc    Track a page view (called from frontend)
 * @access  Public (no auth - called by visitors)
 */
router.post("/track", async (req, res) => {
  try {
    const { page, path, sessionId, referrer, utmSource, utmMedium, utmCampaign } = req.body;
    console.log("📊 [Backend] Track endpoint hit - body:", { page, path, sessionId, referrer });
    
    if (!page || !sessionId) {
      console.warn("❌ [Backend] Missing required fields - page or sessionId");
      return res.status(400).json({ success: false, message: "page and sessionId required" });
    }

    // Get IP from request (handle proxies like Railway/Vercel)
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || 
               req.headers["x-real-ip"] || 
               req.connection?.remoteAddress || 
               "unknown";

    const userAgent = req.headers["user-agent"] || "";
    const { device, browser, os } = parseUserAgent(userAgent);
    const source = utmSource || detectSource(referrer);

    // Check if this is a new session (no pageview with this sessionId in last 30 min)
    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const existingSession = await PageView.findOne({
      sessionId,
      createdAt: { $gte: thirtyMinAgo }
    });

    const pageView = await PageView.create({
      page,
      path,
      sessionId,
      ip,
      userAgent,
      device,
      browser,
      os,
      referrer,
      source,
      utmSource,
      utmMedium,
      utmCampaign,
      isNewSession: !existingSession,
      sessionStart: existingSession ? existingSession.sessionStart : new Date(),
    });

    console.log(`✅ [Backend] PageView saved (${pageView._id}) - session:${sessionId}, page:${page}`);

    // Return minimal response (fast)
    res.status(201).json({ success: true, id: pageView._id });
  } catch (err) {
    console.error("❌ [Backend] Analytics track error:", err.message);
    // Don't expose errors to public
    res.status(500).json({ success: false });
  }
});

/**
 * @route   GET /api/website-analytics/live
 * @desc    Get live visitor count (last 5 minutes)
 * @access  Private – SuperAdmin only
 */
router.get(
  "/live",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Count unique sessions in last 5 min
      const liveVisitors = await PageView.distinct("sessionId", {
        createdAt: { $gte: fiveMinAgo }
      });

      // Get pages being viewed now
      const activePages = await PageView.aggregate([
        { $match: { createdAt: { $gte: fiveMinAgo } } },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      res.json({
        liveCount: liveVisitors.length,
        activePages: activePages.map(p => ({ page: p._id, count: p.count })),
        timestamp: new Date(),
      });
    } catch (err) {
      console.error("❌ Analytics live error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * @route   GET /api/website-analytics/stats
 * @desc    Get analytics stats (today, week, month)
 * @access  Private – SuperAdmin only
 */
router.get(
  "/stats",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const now = new Date();
      
      // Time ranges
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(now);
      monthStart.setDate(monthStart.getDate() - 30);
      monthStart.setHours(0, 0, 0, 0);

      // Parallel queries for performance
      const [
        todayViews,
        todayVisitors,
        weekViews,
        weekVisitors,
        monthViews,
        monthVisitors,
        topPages,
        topSources,
        deviceBreakdown,
        hourlyData
      ] = await Promise.all([
        // Today
        PageView.countDocuments({ createdAt: { $gte: todayStart } }),
        PageView.distinct("sessionId", { createdAt: { $gte: todayStart } }),
        // Week
        PageView.countDocuments({ createdAt: { $gte: weekStart } }),
        PageView.distinct("sessionId", { createdAt: { $gte: weekStart } }),
        // Month
        PageView.countDocuments({ createdAt: { $gte: monthStart } }),
        PageView.distinct("sessionId", { createdAt: { $gte: monthStart } }),
        // Top pages (week)
        PageView.aggregate([
          { $match: { createdAt: { $gte: weekStart } } },
          { $group: { _id: "$page", views: { $sum: 1 }, visitors: { $addToSet: "$sessionId" } } },
          { $project: { page: "$_id", views: 1, visitors: { $size: "$visitors" } } },
          { $sort: { views: -1 } },
          { $limit: 10 }
        ]),
        // Traffic sources (week)
        PageView.aggregate([
          { $match: { createdAt: { $gte: weekStart } } },
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        // Device breakdown (week)
        PageView.aggregate([
          { $match: { createdAt: { $gte: weekStart } } },
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        // Hourly data (today)
        PageView.aggregate([
          { $match: { createdAt: { $gte: todayStart } } },
          { $group: { 
            _id: { $hour: "$createdAt" }, 
            views: { $sum: 1 },
            visitors: { $addToSet: "$sessionId" }
          }},
          { $project: { hour: "$_id", views: 1, visitors: { $size: "$visitors" } } },
          { $sort: { hour: 1 } }
        ])
      ]);

      res.json({
        today: {
          views: todayViews,
          visitors: todayVisitors.length,
        },
        week: {
          views: weekViews,
          visitors: weekVisitors.length,
        },
        month: {
          views: monthViews,
          visitors: monthVisitors.length,
        },
        topPages,
        sources: topSources.map(s => ({ source: s._id, count: s.count })),
        devices: deviceBreakdown.map(d => ({ device: d._id, count: d.count })),
        hourly: hourlyData,
        generatedAt: new Date(),
      });
    } catch (err) {
      console.error("❌ Analytics stats error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;
