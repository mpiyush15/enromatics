import express from 'express';
import Chapter from '../models/Chapter.js';
import Subject from '../models/Subject.js';
import Lesson from '../models/Lesson.js';
import Question from '../models/Question.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============= CHAPTER MANAGEMENT =============

// GET all chapters for a subject
router.get('/subject/:subjectId', protect, tenantProtect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const tenantId = req.tenantId;

    // Verify subject exists
    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const chapters = await Chapter.find({
      subjectId,
      tenantId,
    })
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    // Add lesson count for each chapter
    const chaptersWithStats = await Promise.all(
      chapters.map(async (chapter) => {
        const lessonCount = await Lesson.countDocuments({
          chapterId: chapter._id,
          tenantId,
        });
        const questionCount = await Question.countDocuments({
          chapterId: chapter._id,
          tenantId,
        });
        return {
          ...chapter.toObject(),
          lessonCount,
          questionCount,
        };
      })
    );

    res.json({
      success: true,
      count: chaptersWithStats.length,
      data: chaptersWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single chapter with lessons
router.get('/:chapterId', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    const chapter = await Chapter.findOne({
      _id: chapterId,
      tenantId,
    }).populate('createdBy', 'name email');

    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    // Get lessons and questions
    const lessons = await Lesson.find({
      chapterId: chapter._id,
      tenantId,
    }).sort({ order: 1 });

    const questions = await Question.find({
      chapterId: chapter._id,
      tenantId,
    });

    res.json({
      success: true,
      data: {
        ...chapter.toObject(),
        lessons,
        questionCount: questions.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new chapter (TENANT ADMIN)
router.post(
  '/',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { subjectId, name, description, order } = req.body;
      const tenantId = req.tenantId;
      const userId = req.user?.id;

      if (!subjectId || !name) {
        return res.status(400).json({
          success: false,
          error: 'Subject ID and chapter name are required',
        });
      }

      // Verify subject exists
      const subject = await Subject.findOne({ _id: subjectId, tenantId });
      if (!subject) {
        return res.status(404).json({ success: false, error: 'Subject not found' });
      }

      // Check for duplicate
      const exists = await Chapter.findOne({
        subjectId,
        name,
        tenantId,
      });
      if (exists) {
        return res.status(409).json({ success: false, error: 'Chapter already exists in this subject' });
      }

      const chapter = new Chapter({
        tenantId,
        subjectId,
        name,
        description,
        order: order || 1,
        createdBy: userId,
      });

      await chapter.save();

      res.status(201).json({
        success: true,
        message: 'Chapter created successfully',
        data: chapter,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// PATCH: Update chapter (TENANT ADMIN)
router.patch(
  '/:chapterId',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { chapterId } = req.params;
      const { name, description, order } = req.body;
      const tenantId = req.tenantId;

      const chapter = await Chapter.findOneAndUpdate(
        { _id: chapterId, tenantId },
        { name, description, order },
        { new: true }
      );

      if (!chapter) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }

      res.json({
        success: true,
        message: 'Chapter updated successfully',
        data: chapter,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE: Remove chapter (TENANT ADMIN ONLY)
router.delete(
  '/:chapterId',
  protect,
  tenantProtect,
  authorizeRoles('tenantAdmin', 'superadmin'),
  async (req, res) => {
    try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    // Check if chapter has lessons/questions
    const lessonCount = await Lesson.countDocuments({
      chapterId,
      tenantId,
    });

    const questionCount = await Question.countDocuments({
      chapterId,
      tenantId,
    });

    if (lessonCount > 0 || questionCount > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete chapter with ${lessonCount} lesson(s) and ${questionCount} question(s). Delete them first.`,
      });
    }

    const result = await Chapter.deleteOne({
      _id: chapterId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    res.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= BULK OPERATIONS =============

// POST: Create multiple chapters for subject
router.post('/:subjectId/bulk', protect, tenantProtect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { chapters } = req.body; // [{name, description}, ...]
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!Array.isArray(chapters) || chapters.length === 0) {
      return res.status(400).json({ success: false, error: 'Chapters array is required' });
    }

    // Verify subject exists
    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const chaptersToCreate = chapters.map((c, idx) => ({
      tenantId,
      subjectId,
      name: c.name,
      description: c.description || '',
      order: idx + 1,
      createdBy: userId,
    }));

    const created = await Chapter.insertMany(chaptersToCreate);

    res.status(201).json({
      success: true,
      message: `Created ${created.length} chapters`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Chapter statistics
router.get('/:chapterId/stats', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    const chapter = await Chapter.findOne({ _id: chapterId, tenantId });
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const lessons = await Lesson.find({
      chapterId,
      tenantId,
    });

    const questionsByDifficulty = await Question.aggregate([
      { $match: { chapterId, tenantId } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalLessons: lessons.length,
      totalQuestions: questionsByDifficulty.reduce((sum, q) => sum + q.count, 0),
      questionsByDifficulty: Object.fromEntries(
        questionsByDifficulty.map((q) => [q._id, q.count])
      ),
    };

    res.json({
      success: true,
      data: {
        ...chapter.toObject(),
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
