import Student from "../models/Student.js";
import Payment from "../models/Payment.js";
import Batch from "../models/Batch.js";
import Attendance from "../models/Attendance.js";

export const getInstituteOverview = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(400).json({ message: "Tenant ID missing" });

    console.log("Fetching dashboard overview for tenant:", tenantId);

    // Total students count
    const studentsCount = await Student.countDocuments({ tenantId, status: "active" });

    // Total revenue
    const payments = await Payment.aggregate([
      { $match: { tenantId, status: "success" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue = payments[0]?.totalRevenue || 0;

    // Pending fees (total fees - paid balance)
    const feeStats = await Student.aggregate([
      { $match: { tenantId, status: "active" } },
      {
        $group: {
          _id: null,
          totalFees: { $sum: "$fees" },
          totalPaid: { $sum: "$balance" },
        },
      },
    ]);
    const pendingFees = (feeStats[0]?.totalFees || 0) - (feeStats[0]?.totalPaid || 0);

    // Active batches count
    const activeBatches = await Batch.countDocuments({ tenantId, status: "active" });

    // Today's attendance percentage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.aggregate([
      { $match: { tenantId, date: { $gte: today } } },
      {
        $group: {
          _id: null,
          totalPresent: {
            $sum: {
              $cond: [{ $eq: ["$status", "present"] }, 1, 0],
            },
          },
          totalStudents: { $sum: 1 },
        },
      },
    ]);
    const attendancePercentage = todayAttendance[0]
      ? Math.round((todayAttendance[0].totalPresent / todayAttendance[0].totalStudents) * 100)
      : 0;

    // Total tests count (placeholder - you can add Test model later)
    const totalTests = 0;

    return res.status(200).json({
      success: true,
      stats: {
        studentsCount,
        totalRevenue,
        pendingFees,
        activeBatches,
        todayAttendance: attendancePercentage,
        totalTests,
      },
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
