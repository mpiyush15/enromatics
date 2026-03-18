import express from 'express';
import Lesson from '../models/Lesson.js';
import Chapter from '../models/Chapter.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';

const router = express.Router();

// ============= LESSON MANAGEMENT =============

// GET all lessons for a chapter
router.get('/chapter/:chapterId', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    // Verify chapter exists
    const chapter = await Chapter.findOne({ _id: chapterId, tenantId });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const lessons = await Lesson.find({
      chapterId,
      tenantId,
    })
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.json({
      success: true,
      count: lessons.length,
      data: lessons,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single lesson
router.get('/:lessonId', protect, tenantProtect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const tenantId = req.tenantId;

    const lesson = await Lesson.findOne({
      _id: lessonId,
      tenantId,
    }).populate('createdBy', 'name email');

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new lesson
router.post('/', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId, title, description, content, videoUrl, duration, order } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!chapterId || !title) {
      return res.status(400).json({
        success: false,
        error: 'Chapter ID and lesson title are required',
      });
    }

    // Verify chapter exists
    const chapter = await Chapter.findOne({ _id: chapterId, tenantId });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const lesson = new Lesson({
      tenantId,
      chapterId,
      title,
      description,
      content,
      videoUrl,
      duration,
      order: order || 1,
      createdBy: userId,
    });

    await lesson.save();

    res.status(201).json({
      success: true,
      message: 'Lesson created successfully',
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH: Update lesson
router.patch('/:lessonId', protect, tenantProtect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, description, content, videoUrl, duration, order } = req.body;
    const tenantId = req.tenantId;

    const lesson = await Lesson.findOneAndUpdate(
      { _id: lessonId, tenantId },
      { title, description, content, videoUrl, duration, order },
      { new: true }
    );

    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    res.json({
      success: true,
      message: 'Lesson updated successfully',
      data: lesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove lesson
router.delete('/:lessonId', protect, tenantProtect, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const tenantId = req.tenantId;

    const result = await Lesson.deleteOne({
      _id: lessonId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }

    res.json({
      success: true,
      message: 'Lesson deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= BULK OPERATIONS =============

// POST: Create multiple lessons for chapter
router.post('/:chapterId/bulk', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { lessons } = req.body; // [{title, description, videoUrl, content}, ...]
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({ success: false, error: 'Lessons array is required' });
    }

    // Verify chapter exists
    const chapter = await Chapter.findOne({ _id: chapterId, tenantId });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const lessonsToCreate = lessons.map((l, idx) => ({
      tenantId,
      chapterId,
      title: l.title,
      description: l.description || '',
      content: l.content || '',
      videoUrl: l.videoUrl || '',
      duration: l.duration || 0,
      order: idx + 1,
      createdBy: userId,
    }));

    const created = await Lesson.insertMany(lessonsToCreate);

    res.status(201).json({
      success: true,
      message: `Created ${created.length} lessons`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
