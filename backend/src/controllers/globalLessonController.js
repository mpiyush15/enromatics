import mongoose from 'mongoose';
import Lesson from '../models/Lesson.js';

/**
 * Get all lessons for a tenant
 * Optionally filter by courseId
 */
export const getAllLessons = async (req, res) => {
  try {
    const { tenantId, courseId } = req.query;

    if (!tenantId) {
      return res.status(400).json({ message: 'Missing tenantId' });
    }

    let query = { tenantId };

    if (courseId) {
      // Filter lessons that are assigned to this course
      query.courseIds = new mongoose.Types.ObjectId(courseId);
    }

    const lessons = await Lesson.find(query).sort({ subject: 1, order: 1 });
    return res.status(200).json({ data: lessons });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Error fetching lessons', error: error.message });
  }
};

/**
 * Get lessons for a specific course by subject
 */
export const getLessonsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseObjectId = new mongoose.Types.ObjectId(courseId);

    const lessons = await Lesson.find({ courseIds: courseObjectId }).sort({ subject: 1, order: 1 });
    return res.status(200).json({ data: lessons });
  } catch (error) {
    console.error('Error fetching lessons for course:', error);
    res.status(500).json({ message: 'Error fetching lessons', error: error.message });
  }
};

/**
 * Create a new global lesson
 * Can be assigned to multiple courses via courseIds array
 */
export const createLesson = async (req, res) => {
  try {
    const { name, subject, description, duration, content, order, status, courseIds, addToCourses, tenantId } = req.body;

    if (!tenantId || !name || !subject) {
      return res.status(400).json({ message: 'Missing required fields: name, subject, tenantId' });
    }

    // Convert courseIds array to ObjectIds
    let courseObjectIds = [];
    const coursesToAdd = addToCourses || courseIds || [];

    if (Array.isArray(coursesToAdd)) {
      courseObjectIds = coursesToAdd.map(id => new mongoose.Types.ObjectId(id)).filter(Boolean);
    }

    const lessonData = {
      name,
      subject,
      description: description || '',
      duration: duration || 0,
      content: content || '',
      order: order || 0,
      status: status || 'active',
      courseIds: courseObjectIds,
      tenantId,
    };

    console.log('Creating lesson with data:', lessonData);

    const lesson = new Lesson(lessonData);
    await lesson.save();

    console.log('✅ Lesson created:', {
      lessonId: lesson._id,
      name: lesson.name,
      subject: lesson.subject,
      courseIds: lesson.courseIds,
    });

    return res.status(201).json({ data: lesson });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ message: 'Error creating lesson', error: error.message });
  }
};

/**
 * Update a lesson
 */
export const updateLesson = async (req, res) => {
  try {
    // Get lessonId from either params or body
    let { lessonId } = req.params;
    if (!lessonId && req.body.lessonId) {
      lessonId = req.body.lessonId;
    }

    const { name, subject, description, duration, content, order, status, courseIds } = req.body;

    if (!lessonId) {
      return res.status(400).json({ message: 'Missing lessonId' });
    }

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: 'Invalid lessonId format' });
    }

    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (description !== undefined) updateData.description = description;
    if (duration !== undefined) updateData.duration = duration;
    if (content !== undefined) updateData.content = content;
    if (order !== undefined) updateData.order = order;
    if (status) updateData.status = status;

    if (courseIds && Array.isArray(courseIds)) {
      updateData.courseIds = courseIds.map(id => new mongoose.Types.ObjectId(id)).filter(Boolean);
    }

    const lesson = await Lesson.findByIdAndUpdate(lessonObjectId, updateData, { new: true });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    console.log('✅ Lesson updated:', lesson._id);
    return res.status(200).json({ data: lesson });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ message: 'Error updating lesson', error: error.message });
  }
};

/**
 * Delete a lesson
 * Removes from all courses or just one specific course
 */
export const deleteLesson = async (req, res) => {
  try {
    // Get lessonId from either body or URL params
    let { lessonId, courseId } = req.body;
    
    // Fallback to params if not in body
    if (!lessonId && req.params && req.params.lessonId) {
      lessonId = req.params.lessonId;
    }

    console.log('🗑️ Delete request received:', { lessonId, courseId, body: req.body, params: req.params });

    if (!lessonId) {
      console.error('❌ Missing lessonId in body or params');
      return res.status(400).json({ message: 'Missing lessonId' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
      console.error('❌ Invalid lessonId format:', lessonId);
      return res.status(400).json({ message: 'Invalid lessonId format' });
    }

    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    console.log('Converted lessonId to ObjectId:', lessonObjectId);

    if (courseId) {
      // Remove lesson from a specific course
      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        console.error('❌ Invalid courseId format:', courseId);
        return res.status(400).json({ message: 'Invalid courseId format' });
      }

      const courseObjectId = new mongoose.Types.ObjectId(courseId);
      const lesson = await Lesson.findByIdAndUpdate(
        lessonObjectId,
        { $pull: { courseIds: courseObjectId } },
        { new: true }
      );

      if (!lesson) {
        console.error('❌ Lesson not found when trying to remove from course:', lessonObjectId);
        return res.status(404).json({ message: 'Lesson not found' });
      }

      console.log('✅ Lesson removed from course:', { lessonId, courseId });
      return res.status(200).json({ data: lesson, message: 'Lesson removed from course' });
    } else {
      // Delete lesson completely
      console.log('📝 Attempting to delete lesson with ID:', lessonObjectId);
      
      const lesson = await Lesson.findByIdAndDelete(lessonObjectId);

      if (!lesson) {
        console.error('❌ Lesson not found for deletion:', lessonObjectId);
        return res.status(404).json({ message: 'Lesson not found' });
      }

      console.log('✅ Lesson deleted completely:', lessonObjectId);
      return res.status(200).json({ data: lesson, message: 'Lesson deleted successfully' });
    }
  } catch (error) {
    console.error('❌ Error in deleteLesson:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error deleting lesson', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Assign lesson to additional courses
 */
export const assignLessonToCourses = async (req, res) => {
  try {
    const { lessonId, courseIds } = req.body;

    if (!lessonId || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({ message: 'Missing lessonId or courseIds' });
    }

    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    const courseObjectIds = courseIds.map(id => new mongoose.Types.ObjectId(id)).filter(Boolean);

    const lesson = await Lesson.findByIdAndUpdate(
      lessonObjectId,
      { $addToSet: { courseIds: { $each: courseObjectIds } } },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    console.log('✅ Lesson assigned to courses:', { lessonId, courseCount: lesson.courseIds.length });
    return res.status(200).json({ data: lesson });
  } catch (error) {
    console.error('Error assigning lesson to courses:', error);
    res.status(500).json({ message: 'Error assigning lesson', error: error.message });
  }
};
