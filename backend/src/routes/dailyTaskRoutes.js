import express from "express";
import DailyTask from "../models/DailyTask.js";

const router = express.Router();

/**
 * @route   POST /api/daily-tasks
 * @desc    Create a new daily task
 * @access  Private
 */
router.post("/", async (req, res) => {
  try {
    const { title, date, time, priority, description } = req.body;
    // For now, use a default userId since protect middleware is removed
    const userId = req.user?._id || "temp-user-id";
    const tenantId = req.user?.tenantId || "global";

    if (!title || !date) {
      return res.status(400).json({ message: "Title and date are required" });
    }

    const newTask = new DailyTask({
      userId,
      tenantId,
      title,
      date,
      time: time || null,
      priority: priority || "medium",
      description: description || "",
      status: "pending",
    });

    await newTask.save();

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task: newTask,
    });
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/daily-tasks
 * @desc    Get all daily tasks (filtered by user and optional date)
 * @access  Private
 */
router.get("/", async (req, res) => {
  try {
    const { date, status } = req.query;
    const userId = req.user?._id || "temp-user-id";

    let filter = { userId };

    if (date) filter.date = date;
    if (status) filter.status = status;

    const tasks = await DailyTask.find(filter)
      .sort({ date: 1, time: 1, priority: -1 })
      .lean();

    res.json({
      success: true,
      tasks,
    });
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/daily-tasks/:taskId
 * @desc    Get a specific daily task
 * @access  Private
 */
router.get("/:taskId", async (req, res) => {
  try {
    const task = await DailyTask.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify ownership
    if (task.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Not authorized to view this task" });
    }

    res.json({
      success: true,
      task,
    });
  } catch (err) {
    console.error("❌ Error fetching task:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   PUT /api/daily-tasks/:taskId
 * @desc    Update a daily task (status, completion, cancellation)
 * @access  Private
 */
router.put("/:taskId", async (req, res) => {
  try {
    const { status, title, description, priority, time, cancellationReason } =
      req.body;
    const userId = req.user?._id;

    const task = await DailyTask.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify ownership
    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to update this task" });
    }

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (time) task.time = time;

    // Handle status updates
    if (status) {
      if (status === "completed") {
        task.status = "completed";
        task.completedAt = new Date();
      } else if (status === "cancelled") {
        task.status = "cancelled";
        task.cancelledAt = new Date();
        if (cancellationReason) {
          task.cancellationReason = cancellationReason;
        }
      } else if (status === "pending") {
        task.status = "pending";
        task.completedAt = null;
        task.cancelledAt = null;
      }
    }

    await task.save();

    res.json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (err) {
    console.error("❌ Error updating task:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   DELETE /api/daily-tasks/:taskId
 * @desc    Delete a daily task
 * @access  Private
 */
router.delete("/:taskId", async (req, res) => {
  try {
    const userId = req.user?._id;

    const task = await DailyTask.findById(req.params.taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Verify ownership
    if (task.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this task" });
    }

    await DailyTask.findByIdAndDelete(req.params.taskId);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
