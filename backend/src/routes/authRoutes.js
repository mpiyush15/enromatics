import express from "express";
import { registerUser, loginUser, getCurrentUser, getSession, logoutUser } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// 🔹 Register (main endpoint)
router.post("/register", registerUser);

// 🔹 Signup (alias for trial signup flow)
router.post("/signup", registerUser);

// 🔹 Login
router.post("/login", loginUser);

// 🔹 Logout
router.post("/logout", logoutUser);

// ✅ Get current logged-in user (uses cookie)
router.get("/me", getCurrentUser);

// ✅ Get session with stats (optimized - one call instead of multiple)
router.get("/session", getSession);

// 🔹 Get all users (debug only — optional)
router.get("/all", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get users by tenantId
router.get("/users", protect, async (req, res) => {
  try {
    const { tenantId } = req.query;
    
    if (!tenantId) {
      return res.status(400).json({ message: "tenantId is required" });
    }

    const users = await User.find({ tenantId }).select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Update user by ID
router.put("/users/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    const { name, email, role } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent updating SuperAdmin or tenantAdmin role
    if (user.role === "SuperAdmin" || user.role === "tenantAdmin") {
      return res.status(403).json({ message: "Cannot edit admin users" });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();
    
    const updatedUser = await User.findById(userId).select("-password");
    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Delete user by ID
router.delete("/users/:userId", protect, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting SuperAdmin or tenantAdmin
    if (user.role === "SuperAdmin" || user.role === "tenantAdmin") {
      return res.status(403).json({ message: "Cannot delete admin users" });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
