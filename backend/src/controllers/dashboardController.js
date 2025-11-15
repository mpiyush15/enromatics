import Student from "../models/Student.js";
import Payment from "../models/Payment.js";

export const getInstituteOverview = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ message: "Tenant ID missing" });

    console.log("Fetching dashboard overview for tenant:", tenantId);
  // 🧮 Fetch total students count (only active students)
  const studentsCount = await Student.countDocuments({ tenantId, status: "active" });

    // 💰 Calculate total revenue (sum of all successful payments)
    // 💰 Calculate total revenue (sum of all successful payments)
    // Note: Payment.status enum uses "success" (not "paid") in the schema.
    const payments = await Payment.aggregate([
      { $match: { tenantId, status: "success" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);

    const totalRevenue = payments[0]?.totalRevenue || 0;

    return res.status(200).json({
      success: true,
      stats: {
        studentsCount,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
