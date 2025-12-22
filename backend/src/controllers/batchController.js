import Batch from "../models/Batch.js";

/**
 * Get all batches for a tenant
 */
export const getBatches = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const batches = await Batch.find({ tenantId })
      .populate("courseId", "name fees duration") // Populate course with fees and duration
      .sort({ createdAt: -1 });

    // Map to include courseName field for easy access
    const batchesWithCourseName = batches.map((batch) => ({
      ...batch.toObject(),
      courseName: batch.courseId?.name || null,
    }));

    res.status(200).json({
      success: true,
      batches: batchesWithCourseName,
    });
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batches",
    });
  }
};

/**
 * Get single batch by ID
 */
export const getBatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const batch = await Batch.findOne({ _id: id, tenantId })
      .populate("courseId", "name fees duration");

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch: {
        ...batch.toObject(),
        courseName: batch.courseId?.name || null,
      },
    });
  } catch (error) {
    console.error("Error fetching batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch batch",
    });
  }
};

/**
 * Create a new batch
 */
export const createBatch = async (req, res) => {
  try {
    const { name, courseId, description, startDate, endDate, capacity, status } = req.body;
    const tenantId = req.user.tenantId;

    // Check if batch name already exists for this tenant
    const existingBatch = await Batch.findOne({ tenantId, name });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch with this name already exists",
      });
    }

    const batch = await Batch.create({
      tenantId,
      name,
      courseId: courseId || null,
      description,
      startDate,
      endDate,
      capacity,
      status: status || "active",
    });

    // Populate course details with fees and duration
    await batch.populate("courseId", "name fees duration");

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch: {
        ...batch.toObject(),
        courseName: batch.courseId?.name || null,
      },
    });
  } catch (error) {
    console.error("Error creating batch:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create batch",
    });
  }
};

/**
 * Update batch
 */
export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, courseId, description, startDate, endDate, capacity, status } = req.body;
    const tenantId = req.user.tenantId;

    console.log('[BATCH UPDATE] Request:', { id, name, courseId, description, startDate, endDate, capacity, status });

    // Check if batch exists
    const batch = await Batch.findOne({ _id: id, tenantId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    console.log('[BATCH UPDATE] Current batch courseId:', batch.courseId);

    // If name is being changed, check for duplicates
    if (name && name !== batch.name) {
      const existingBatch = await Batch.findOne({ tenantId, name });
      if (existingBatch) {
        return res.status(400).json({
          success: false,
          message: "Batch with this name already exists",
        });
      }
    }

    // Update batch
    batch.name = name || batch.name;
    // Handle courseId: empty string "" should set to null, undefined keeps existing
    if (courseId !== undefined) {
      batch.courseId = courseId === "" ? null : courseId;
    }
    batch.description = description !== undefined ? description : batch.description;
    batch.startDate = startDate !== undefined ? startDate : batch.startDate;
    batch.endDate = endDate !== undefined ? endDate : batch.endDate;
    batch.capacity = capacity !== undefined ? capacity : batch.capacity;
    batch.status = status || batch.status;

    console.log('[BATCH UPDATE] New courseId to save:', batch.courseId);

    await batch.save();

    console.log('[BATCH UPDATE] Batch saved, now populating...');

    // Populate course details after saving
    await batch.populate("courseId", "name fees duration");

    console.log('[BATCH UPDATE] Populated batch.courseId:', batch.courseId);

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch: {
        ...batch.toObject(),
        courseName: batch.courseId?.name || null,
      },
    });
  } catch (error) {
    console.error("Error updating batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update batch",
    });
  }
};

/**
 * Delete batch
 */
export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const batch = await Batch.findOneAndDelete({ _id: id, tenantId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete batch",
    });
  }
};
