import Batch from "../models/Batch.js";

/**
 * Get all batches for a tenant
 */
export const getBatches = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const batches = await Batch.find({ tenantId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      batches,
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

    const batch = await Batch.findOne({ _id: id, tenantId });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

    res.status(200).json({
      success: true,
      batch,
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
    const { name, description, startDate, endDate, capacity } = req.body;
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
      description,
      startDate,
      endDate,
      capacity,
      status: "active",
    });

    res.status(201).json({
      success: true,
      message: "Batch created successfully",
      batch,
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
    const { name, description, startDate, endDate, capacity, status } = req.body;
    const tenantId = req.user.tenantId;

    // Check if batch exists
    const batch = await Batch.findOne({ _id: id, tenantId });
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found",
      });
    }

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
    batch.description = description !== undefined ? description : batch.description;
    batch.startDate = startDate !== undefined ? startDate : batch.startDate;
    batch.endDate = endDate !== undefined ? endDate : batch.endDate;
    batch.capacity = capacity !== undefined ? capacity : batch.capacity;
    batch.status = status || batch.status;

    await batch.save();

    res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      batch,
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
