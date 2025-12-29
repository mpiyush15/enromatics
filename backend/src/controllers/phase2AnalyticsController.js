/**
 * Phase 2 Analytics Controller
 * Conversion goals & funnel tracking
 * 
 * Enro Matics © 2025
 */

import Goal from "../models/Goal.js";
import Funnel from "../models/Funnel.js";
import PageView from "../models/PageView.js";

// ==================== GOALS METHODS ====================

/**
 * POST /api/analytics/phase2/goals
 * Create a new conversion goal
 */
export const createGoal = async (req, res) => {
  try {
    const { name, type, targetPage, eventName, formSelector, scrollDepthThreshold, timeThresholdSeconds, value, revenue } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "name and type required" });
    }

    const goal = new Goal({
      name,
      type,
      targetPage,
      eventName,
      formSelector,
      scrollDepthThreshold,
      timeThresholdSeconds,
      value: value || 1,
      revenue: revenue || 0
    });

    await goal.save();
    res.status(201).json({ success: true, goal });
  } catch (error) {
    console.error("❌ Create goal error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/phase2/goals
 * Get all conversion goals
 */
export const getGoals = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, goals, totalGoals: goals.length });
  } catch (error) {
    console.error("❌ Get goals error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/analytics/phase2/track-goal
 * Track a goal conversion (called from frontend)
 */
export const trackGoal = async (req, res) => {
  try {
    const { goalId, sessionId, conversionValue, revenue } = req.body;

    if (!goalId || !sessionId) {
      return res.status(400).json({ success: false, message: "goalId and sessionId required" });
    }

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    // Increment goal conversions
    goal.totalConversions += 1;
    goal.totalConversionValue += conversionValue || goal.value;
    if (revenue) {
      goal.revenue += revenue;
    }

    await goal.save();

    // Update PageView with goal tracking
    const updated = await PageView.findOneAndUpdate(
      { sessionId },
      {
        $push: { goalId },
        $set: { 
          conversionValue: conversionValue || goal.value,
          revenue: revenue || 0
        }
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      goal: {
        id: goal._id,
        name: goal.name,
        totalConversions: goal.totalConversions,
        revenue: goal.revenue
      },
      tracked: !!updated
    });
  } catch (error) {
    console.error("❌ Track goal error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/analytics/phase2/goals/:id/analytics
 * Get conversion analytics for a specific goal
 */
export const getGoalAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
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

    const goal = await Goal.findById(id);
    if (!goal) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    // Count conversions in time period
    const conversions = await PageView.countDocuments({
      goalId: id,
      createdAt: { $gte: startDate }
    });

    // Total sessions in period
    const totalSessions = await PageView.distinct("sessionId", {
      createdAt: { $gte: startDate }
    });

    const conversionRate = totalSessions.length > 0 
      ? ((conversions / totalSessions.length) * 100).toFixed(2)
      : 0;

    // By traffic source
    const bySource = await PageView.aggregate([
      { 
        $match: { 
          goalId: id,
          createdAt: { $gte: startDate }
        }
      },
      { $group: {
        _id: "$source",
        conversions: { $sum: 1 },
        revenue: { $sum: "$revenue" }
      }},
      { $project: {
        source: "$_id",
        conversions: 1,
        revenue: 1
      }},
      { $sort: { conversions: -1 } }
    ]);

    res.json({
      success: true,
      goal: {
        id: goal._id,
        name: goal.name,
        totalConversions: goal.totalConversions,
        totalRevenue: goal.revenue || 0
      },
      timeRange,
      conversionsInPeriod: conversions,
      totalSessions: totalSessions.length,
      conversionRate: parseFloat(conversionRate),
      bySource,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Get goal analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==================== FUNNEL METHODS ====================

/**
 * POST /api/analytics/phase2/funnels
 * Create a new conversion funnel
 */
export const createFunnel = async (req, res) => {
  try {
    const { name, description, steps } = req.body;

    if (!name || !steps || steps.length < 2) {
      return res.status(400).json({ success: false, message: "name and at least 2 steps required" });
    }

    const funnel = new Funnel({
      name,
      description,
      steps: steps.map((s, idx) => ({
        ...s,
        stepNumber: idx + 1
      }))
    });

    await funnel.save();
    res.status(201).json({ success: true, funnel });
  } catch (error) {
    console.error("❌ Create funnel error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/phase2/funnels
 * Get all conversion funnels
 */
export const getFunnels = async (req, res) => {
  try {
    const { isActive } = req.query;
    const filter = isActive !== undefined ? { isActive: isActive === 'true' } : {};

    const funnels = await Funnel.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, funnels, totalFunnels: funnels.length });
  } catch (error) {
    console.error("❌ Get funnels error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/analytics/phase2/funnels/:id
 * Get single funnel with conversion analytics
 */
export const getFunnelAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
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

    let funnel = await Funnel.findById(id);
    if (!funnel) {
      return res.status(404).json({ success: false, message: "Funnel not found" });
    }

    // Calculate metrics for each step
    const enrichedSteps = await Promise.all(
      funnel.steps.map(async (step) => {
        let uniqueVisitors = 0;
        let completions = 0;

        if (step.type === "page_view" && step.pageUrl) {
          const pageViews = await PageView.distinct("sessionId", {
            page: step.pageUrl,
            createdAt: { $gte: startDate }
          });
          uniqueVisitors = pageViews.length;
          completions = await PageView.countDocuments({
            page: step.pageUrl,
            createdAt: { $gte: startDate }
          });
        } else if (step.type === "event" && step.eventName) {
          // Would need eventMetadata field in PageView
          uniqueVisitors = 0;
          completions = 0;
        }

        const conversionRate = uniqueVisitors > 0 
          ? ((completions / uniqueVisitors) * 100).toFixed(2)
          : 0;

        return {
          ...step.toObject(),
          uniqueVisitors,
          completions,
          conversionRate: parseFloat(conversionRate)
        };
      })
    );

    funnel = funnel.toObject();
    funnel.steps = enrichedSteps;

    // Calculate overall metrics
    const firstStepVisitors = enrichedSteps[0]?.uniqueVisitors || 0;
    const lastStepCompletions = enrichedSteps[enrichedSteps.length - 1]?.completions || 0;

    funnel.totalEntrants = firstStepVisitors;
    funnel.totalCompleters = lastStepCompletions;
    funnel.overallConversionRate = firstStepVisitors > 0 
      ? ((lastStepCompletions / firstStepVisitors) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      funnel,
      timeRange,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error("❌ Get funnel analytics error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/analytics/phase2/funnels/:id/track-step
 * Track a funnel step completion
 */
export const trackFunnelStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepNumber, sessionId, timeOnStep } = req.body;

    if (!stepNumber || !sessionId) {
      return res.status(400).json({ success: false, message: "stepNumber and sessionId required" });
    }

    const funnel = await Funnel.findById(id);
    if (!funnel) {
      return res.status(404).json({ success: false, message: "Funnel not found" });
    }

    const step = funnel.steps.find(s => s.stepNumber === parseInt(stepNumber));
    if (!step) {
      return res.status(404).json({ success: false, message: "Step not found" });
    }

    // Update step metrics
    step.completions = (step.completions || 0) + 1;
    if (timeOnStep) {
      step.avgTimeOnStep = (step.avgTimeOnStep + timeOnStep) / 2;
    }

    await funnel.save();

    // Update PageView
    const updated = await PageView.findOneAndUpdate(
      { sessionId },
      { $push: { funnelSteps: { funnelId: id, stepNumber, completedAt: new Date() } } },
      { new: true }
    );

    res.json({ 
      success: true, 
      step: {
        name: step.name,
        completions: step.completions,
        avgTimeOnStep: step.avgTimeOnStep
      },
      tracked: !!updated
    });
  } catch (error) {
    console.error("❌ Track funnel step error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  // Goals
  createGoal,
  getGoals,
  trackGoal,
  getGoalAnalytics,

  // Funnels
  createFunnel,
  getFunnels,
  getFunnelAnalytics,
  trackFunnelStep
};
