import express from "express";
import { tenantProtect } from "../middleware/tenantProtect.js";

const router = express.Router();

// Get all rewards for a tenant
router.get("/", tenantProtect, async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    // Mock data for now - replace with actual database queries
    const rewards = [
      {
        _id: "reward1",
        examId: "exam1",
        examName: "Scholarship Test 2024",
        examCode: "ST2024",
        examDate: "2024-12-15",
        studentId: "student1",
        studentName: "John Doe",
        registrationNumber: "REG001",
        email: "john@example.com",
        phone: "1234567890",
        currentClass: "10",
        school: "ABC School",
        marksObtained: 85,
        maxMarks: 100,
        percentage: 85,
        rank: 1,
        rewardType: "Merit Scholarship",
        rewardAmount: 5000,
        rewardDescription: "Excellence in academics",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "reward2",
        examId: "exam1",
        examName: "Scholarship Test 2024",
        examCode: "ST2024",
        examDate: "2024-12-15",
        studentId: "student2",
        studentName: "Alice Johnson",
        registrationNumber: "REG003",
        email: "alice@example.com",
        phone: "5555555555",
        currentClass: "10",
        school: "DEF School",
        marksObtained: 92,
        maxMarks: 100,
        percentage: 92,
        rank: 1,
        rewardType: "Excellence Award",
        rewardAmount: 10000,
        rewardDescription: "Top performer award",
        status: "approved",
        approvedBy: "admin",
        approvedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
    ];

    res.json({
      success: true,
      rewards,
    });
  } catch (error) {
    console.error("Error fetching rewards:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch rewards",
      error: error.message,
    });
  }
});

// Get reward statistics
router.get("/stats", tenantProtect, async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    // Mock statistics - replace with actual database aggregations
    const stats = {
      totalRewards: 15,
      totalAmount: 75000,
      pendingRewards: 3,
      approvedRewards: 8,
      disbursedRewards: 4,
      rejectedRewards: 0,
      avgRewardAmount: 5000,
      topRewardAmount: 15000,
      rewardsByType: {
        "Merit Scholarship": 8,
        "Excellence Award": 4,
        "Participation Certificate": 3,
      },
      rewardsByExam: {
        "Scholarship Test 2024": 10,
        "Aptitude Test 2024": 5,
      },
    };

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error fetching reward stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch reward statistics",
      error: error.message,
    });
  }
});

// Update reward status
router.patch("/:rewardId/status", tenantProtect, async (req, res) => {
  try {
    const { rewardId } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "approved", "disbursed", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: " + validStatuses.join(", "),
      });
    }

    // Here you would update the reward in your database
    console.log(`Updated reward ${rewardId} status to: ${status}`);

    res.json({
      success: true,
      message: "Reward status updated successfully",
    });
  } catch (error) {
    console.error("Error updating reward status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reward status",
      error: error.message,
    });
  }
});

// Create or update reward
router.post("/", tenantProtect, async (req, res) => {
  try {
    const rewardData = req.body;
    
    // Validate required fields
    const requiredFields = ['examId', 'studentId', 'rewardType', 'rewardDescription'];
    for (const field of requiredFields) {
      if (!rewardData[field]) {
        return res.status(400).json({
          success: false,
          message: `${field} is required`,
        });
      }
    }

    // Here you would save the reward to your database
    const newReward = {
      _id: `reward_${Date.now()}`,
      ...rewardData,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("Created new reward:", newReward);

    res.status(201).json({
      success: true,
      message: "Reward created successfully",
      reward: newReward,
    });
  } catch (error) {
    console.error("Error creating reward:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create reward",
      error: error.message,
    });
  }
});

// Delete reward
router.delete("/:rewardId", tenantProtect, async (req, res) => {
  try {
    const { rewardId } = req.params;

    // Here you would delete the reward from your database
    console.log(`Deleted reward: ${rewardId}`);

    res.json({
      success: true,
      message: "Reward deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reward:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete reward",
      error: error.message,
    });
  }
});

export default router;