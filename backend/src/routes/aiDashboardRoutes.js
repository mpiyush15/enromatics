/**
 * ⚠️ DEPRECATED FILE
 * 
 * This file has been moved to centralized AI folder structure:
 * NEW LOCATION: /backend/src/ai/routes/dashboardRoutes.js
 * 
 * Please use the new file location. This file is kept only as reference.
 * Delete this file after updating all imports.
 */

export default null;
import Tenant from "../models/Tenants.js";
import Student from "../models/Student.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import Lead from "../models/Lead.js";
import Batch from "../models/Batch.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

// Test route to verify router is loaded
router.get("/test", (req, res) => {
  res.json({ message: "🧠 AI Dashboard router is loaded!" });
});

// Test insights route without auth
router.get("/dashboard/insights-test", async (req, res) => {
  try {
    res.json({ 
      message: "🧠 Insights endpoint is accessible (no auth)",
      timestamp: new Date()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/ai/dashboard/insights
 * @desc    Get all AI dashboard insights (alerts, KPIs, recommendations)
 * @access  Private - tenantAdmin
 * @consistency: Uses existing models/fields/enums from system
 */
router.get(
  "/dashboard/insights",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  async (req, res) => {
    try {
      console.log("🧠 [AI INSIGHTS] Route handler hit!");
      console.log("🧠 User:", req.user?.email, "Role:", req.user?.role, "TenantId:", req.user?.tenantId);
      
      const tenantId = req.user.tenantId;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      console.log(`🧠 AI Dashboard Insights - TenantId: ${tenantId}`);

      // ========== FETCH DATA FROM EXISTING MODELS ==========

      // 1. Get tenant info
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      // 2. Count active students
      const totalStudents = await Student.countDocuments({
        tenantId,
        status: "active", // Using existing enum
      });

      // 3. Get pending fees (students with unpaid invoices)
      const pendingFeesData = await SubscriptionPayment.aggregate([
        {
          $match: {
            tenantId,
            status: { $in: ["pending", "failed"] }, // Using existing enum
          },
        },
        {
          $group: {
            _id: null,
            totalPending: { $sum: "$totalAmount" },
            count: { $sum: 1 },
          },
        },
      ]);

      const totalPending = pendingFeesData[0]?.totalPending || 0;
      const pendingCount = pendingFeesData[0]?.count || 0;

      // 4. Get today's collection
      const todayCollection = await SubscriptionPayment.aggregate([
        {
          $match: {
            tenantId,
            status: "success", // Using existing enum
            paidAt: {
              $gte: today,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$totalAmount" },
          },
        },
      ]);

      const collectedToday = todayCollection[0]?.totalCollected || 0;

      // 5. Get this month's collection
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthCollection = await SubscriptionPayment.aggregate([
        {
          $match: {
            tenantId,
            status: "success", // Using existing enum
            paidAt: {
              $gte: monthStart,
              $lte: today,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$totalAmount" },
          },
        },
      ]);

      const collectedThisMonth = monthCollection[0]?.totalCollected || 0;

      // 6. Count active leads (enquiries not converted)
      const activeLeads = await Lead.countDocuments({
        tenantId,
        status: { $nin: ["converted", "lost"] }, // Not converted/lost
      });

      // 7. Count hot leads (not contacted in 24hrs + interested)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const hotLeads = await Lead.countDocuments({
        tenantId,
        status: "interested", // Interested but not contacted recently
        lastContactedAt: { $lt: twentyFourHoursAgo },
      });

      // 8. Get attendance data for risk detection
      const batchAttendance = await Attendance.aggregate([
        {
          $match: {
            tenantId,
            date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          },
        },
        {
          $group: {
            _id: "$batchId",
            totalDays: { $sum: 1 },
            presentDays: {
              $sum: {
                $cond: [{ $eq: ["$status", "present"] }, 1, 0], // Using existing enum
              },
            },
          },
        },
        {
          $project: {
            attendance: {
              $multiply: [
                { $divide: ["$presentDays", "$totalDays"] },
                100,
              ],
            },
          },
        },
        {
          $match: { attendance: { $lt: 75 } }, // Below 75% threshold
        },
      ]);

      const lowAttendanceBatches = batchAttendance.length;

      // 9. Get pending fees >20 days
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const longOverdueCount = await SubscriptionPayment.countDocuments({
        tenantId,
        status: { $in: ["pending", "failed"] }, // Using existing enum
        createdAt: { $lt: twentyDaysAgo },
      });

      // ========== GENERATE ALERTS ==========
      const alerts = [];

      // Critical Alert: Long overdue fees
      if (longOverdueCount > 0) {
        alerts.push({
          id: "alert_overdue_fees",
          type: "critical",
          priority: 1,
          message: `⚠️ ${longOverdueCount} students with pending fees >20 days`,
          actionUrl: "/dashboard/accounts/receipts",
          count: longOverdueCount,
          severity: "critical",
        });
      }

      // Warning Alert: Hot leads not contacted
      if (hotLeads > 0) {
        alerts.push({
          id: "alert_hot_leads",
          type: "warning",
          priority: 2,
          message: `⚠️ ${hotLeads} hot leads not contacted in 24hrs`,
          actionUrl: "/dashboard/leads", // Adjust path as needed
          count: hotLeads,
          severity: "warning",
        });
      }

      // Warning Alert: Low attendance batches
      if (lowAttendanceBatches > 0) {
        alerts.push({
          id: "alert_low_attendance",
          type: "warning",
          priority: 3,
          message: `⚠️ ${lowAttendanceBatches} batch(es) with attendance <75%`,
          actionUrl: "/dashboard/students/attendance",
          count: lowAttendanceBatches,
          severity: "warning",
        });
      }

      // Sort by priority
      alerts.sort((a, b) => a.priority - b.priority);

      // ========== GENERATE KPIs ==========
      const kpis = {
        students: {
          count: totalStudents,
          change24h: 0, // TODO: Calculate if needed
          trend: "stable",
          icon: "👥",
        },
        revenue: {
          today: collectedToday,
          thisMonth: collectedThisMonth,
          pending: totalPending,
          pendingCount,
          expectedRecoveryRate: 0.72, // Default 72% recovery
          icon: "💰",
        },
        admissions: {
          activeLeads,
          hotLeads,
          icon: "📈",
        },
      };

      // ========== GENERATE RECOMMENDATIONS ==========
      const recommendations = [];

      // Recommendation 1: Send fee reminders
      if (longOverdueCount > 0) {
        recommendations.push({
          id: "rec_fee_reminder",
          action: "sendFeeReminder",
          priority: "high",
          message: `Send WhatsApp reminders to ${longOverdueCount} students`,
          expectedImpact: "72% recovery expected this week",
          affectedCount: longOverdueCount,
          targetAudience: "pending_fees",
          button: {
            label: "Send Fee Reminder",
            action: "openWhatsappTemplate",
            template: "fee_reminder",
          },
        });
      }

      // Recommendation 2: Follow up hot leads
      if (hotLeads > 0) {
        recommendations.push({
          id: "rec_lead_followup",
          action: "callHotLeads",
          priority: "high",
          message: `Call ${hotLeads} hot leads (best time: 6-8 PM)`,
          expectedImpact: "Increase conversion by 25%",
          affectedCount: hotLeads,
          targetAudience: "hot_leads",
          button: {
            label: "Call Now",
            action: "openDialer",
          },
        });
      }

      // Recommendation 3: Review low attendance
      if (lowAttendanceBatches > 0) {
        recommendations.push({
          id: "rec_attendance_alert",
          action: "reviewAttendance",
          priority: "medium",
          message: `Review attendance in ${lowAttendanceBatches} batch(es)`,
          expectedImpact: "Improve student retention",
          affectedCount: lowAttendanceBatches,
          targetAudience: "low_attendance_batches",
          button: {
            label: "View Attendance",
            action: "openAttendance",
          },
        });
      }

      // ========== DAILY ACTIONS ==========
      const dailyActions = [];

      if (hotLeads > 0) {
        dailyActions.push({
          priority: "high",
          icon: "📞",
          title: `Call ${hotLeads} hot leads`,
          time: "6-8 PM (Best time)",
          action: "callHotLeads",
        });
      }

      if (longOverdueCount > 0) {
        dailyActions.push({
          priority: "high",
          icon: "💸",
          title: `Collect ₹${(totalPending / 100000).toFixed(1)}L pending fees`,
          description: `From ${longOverdueCount} students`,
          action: "sendFeeReminder",
        });
      }

      if (lowAttendanceBatches > 0) {
        dailyActions.push({
          priority: "medium",
          icon: "📊",
          title: `Review ${lowAttendanceBatches} batch(es) attendance`,
          action: "reviewAttendance",
        });
      }

      // ========== RESPONSE ==========
      console.log("✅ AI Dashboard insights generated successfully");

      res.status(200).json({
        success: true,
        data: {
          timestamp: new Date(),
          tenantId,
          tenant: {
            name: tenant.name,
            instituteName: tenant.instituteName,
          },
          alerts, // Sorted by priority
          kpis,
          recommendations, // Sorted by priority
          dailyActions,
          metadata: {
            dataFreshness: "real-time",
            calculatedAt: new Date().toISOString(),
            nextRefreshIn: "5 minutes",
          },
        },
      });
    } catch (err) {
      console.error("❌ AI Dashboard Error:", err);
      res.status(500).json({
        success: false,
        message: "Error generating AI insights",
        error: err.message,
      });
    }
  }
);

export default router;
