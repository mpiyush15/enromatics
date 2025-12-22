import Course from "../models/Course.js";

/**
 * Get all courses for a tenant
 */
export const getCourses = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;

    const courses = await Course.find({ tenantId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

/**
 * Get single course by ID
 */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const course = await Course.findOne({ _id: id, tenantId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
    });
  }
};

/**
 * Create a new course
 */
export const createCourse = async (req, res) => {
  try {
    const { name, description, duration, fees, status } = req.body;
    const tenantId = req.user.tenantId;

    // Validate required fields
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Course name is required",
      });
    }

    // Check if course name already exists for this tenant
    const existingCourse = await Course.findOne({ tenantId, name });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course with this name already exists",
      });
    }

    const course = await Course.create({
      tenantId,
      name: name.trim(),
      description: description?.trim() || "",
      duration: duration?.trim() || "",
      fees: fees || 0,
      status: status || "active",
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create course",
    });
  }
};

/**
 * Update course
 */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, fees, status } = req.body;
    const tenantId = req.user.tenantId;

    const course = await Course.findOne({ _id: id, tenantId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // If name is being changed, check if new name already exists
    if (name && name !== course.name) {
      const existingCourse = await Course.findOne({ tenantId, name });
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: "Course with this name already exists",
        });
      }
    }

    // Update fields
    if (name !== undefined) course.name = name.trim();
    if (description !== undefined) course.description = description.trim();
    if (duration !== undefined) course.duration = duration.trim();
    if (fees !== undefined) course.fees = fees;
    if (status !== undefined) course.status = status;

    await course.save();

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update course",
    });
  }
};

/**
 * Delete course
 */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.user.tenantId;

    const course = await Course.findOne({ _id: id, tenantId });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
    });
  }
};
