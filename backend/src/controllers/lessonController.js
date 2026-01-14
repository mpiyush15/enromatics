import Lesson from "../models/Lesson.js";
import mongoose from "mongoose";

/**
 * Get all lessons for a course
 */
export const getLessonsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const tenantId = req.user.tenantId;

    // Convert courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const lessons = await Lesson.find({
      tenantId,
      courseIds: courseObjectId,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      lessons,
    });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
    });
  }
};

/**
 * Get single lesson by ID
 */
export const getLessonById = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const tenantId = req.user.tenantId;

    // Convert courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const lesson = await Lesson.findOne({
      _id: lessonId,
      tenantId,
      courseIds: courseObjectId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lesson",
    });
  }
};

/**
 * Create a new lesson for a course
 */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { name, description, duration, content, order, subject, addToCourses } = req.body;
    const tenantId = req.user.tenantId;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Lesson name is required",
      });
    }

    // Convert courseId to ObjectId
    const courseObjectId = new mongoose.Types.ObjectId(courseId);
    
    // If addToCourses is provided, use those courses; otherwise just use current course
    const courseIds = addToCourses && addToCourses.length > 0
      ? addToCourses.map(id => new mongoose.Types.ObjectId(id))
      : [courseObjectId];

    const lesson = await Lesson.create({
      courseIds,
      tenantId,
      name: name.trim(),
      description: description?.trim() || "",
      duration: duration || "0 mins",
      content: content || "",
      subject: subject || "General",
      order: order || 0,
    });

    console.log("✅ Lesson created:", { lessonId: lesson._id, courseIds, subject });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create lesson",
    });
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const { name, description, duration, content, order, status, addToCourses } = req.body;
    const tenantId = req.user.tenantId;

    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const lesson = await Lesson.findOne({
      _id: lessonId,
      tenantId,
      courseIds: courseObjectId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    if (name) lesson.name = name.trim();
    if (description !== undefined) lesson.description = description.trim();
    if (duration) lesson.duration = duration;
    if (content !== undefined) lesson.content = content;
    if (order !== undefined) lesson.order = order;
    if (status) lesson.status = status;
    if (addToCourses && addToCourses.length > 0) {
      lesson.courseIds = addToCourses.map(id => new mongoose.Types.ObjectId(id));
    }

    await lesson.save();

    res.status(200).json({
      success: true,
      message: "Lesson updated successfully",
      lesson,
    });
  } catch (error) {
    console.error("Error updating lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update lesson",
    });
  }
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const tenantId = req.user.tenantId;

    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const lesson = await Lesson.findOne({
      _id: lessonId,
      tenantId,
      courseIds: courseObjectId,
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    // If lesson is only in this course, delete it; otherwise just remove this course
    if (lesson.courseIds.length === 1) {
      await Lesson.deleteOne({ _id: lessonId });
    } else {
      lesson.courseIds = lesson.courseIds.filter(id => !id.equals(courseObjectId));
      await lesson.save();
    }

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete lesson",
    });
  }
};
