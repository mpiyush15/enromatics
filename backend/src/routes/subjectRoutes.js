import express from 'express';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============= SUBJECT MANAGEMENT =============

// GET all subjects for tenant (ALL AUTHENTICATED USERS)
router.get('/', protect, tenantProtect, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search } = req.query;

    const filter = { tenantId };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }

    const subjects = await Subject.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Add chapter count
    const subjectsWithStats = await Promise.all(
      subjects.map(async (subject) => {
        const chapterCount = await Chapter.countDocuments({
          subjectId: subject._id,
          tenantId,
        });
        return {
          ...subject.toObject(),
          chapterCount,
        };
      })
    );

    res.json({
      success: true,
      count: subjectsWithStats.length,
      data: subjectsWithStats,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single subject with chapters (ALL AUTHENTICATED USERS)
router.get('/:subjectId', protect, tenantProtect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const tenantId = req.tenantId;

    const subject = await Subject.findOne({
      _id: subjectId,
      tenantId,
    }).populate('createdBy', 'name email');

    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Get all chapters for this subject
    const chapters = await Chapter.find({
      subjectId: subject._id,
      tenantId,
    }).sort({ order: 1 });

    res.json({
      success: true,
      data: {
        ...subject.toObject(),
        chapters,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new subject (TEACHER, ADMIN)
router.post(
  '/',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { name, description, color } = req.body;
      const tenantId = req.tenantId;
      const userId = req.user?.id;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Subject name is required' });
      }

      // Check for duplicate
      const exists = await Subject.findOne({ name, tenantId });
      if (exists) {
        return res.status(409).json({ success: false, error: 'Subject already exists' });
      }

      const subject = new Subject({
        tenantId,
        name,
        description,
        color: color || '#3B82F6',
        createdBy: userId,
      });

      await subject.save();

      res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: subject,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// PATCH: Update subject (TEACHER, ADMIN)
router.patch(
  '/:subjectId',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { subjectId } = req.params;
      const { name, description, color } = req.body;
      const tenantId = req.tenantId;

      const subject = await Subject.findOneAndUpdate(
        { _id: subjectId, tenantId },
        { name, description, color },
        { new: true }
      );

      if (!subject) {
        return res.status(404).json({ success: false, error: 'Subject not found' });
      }

      res.json({
        success: true,
        message: 'Subject updated successfully',
        data: subject,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE: Remove subject (TEACHER, ADMIN)
router.delete(
  '/:subjectId',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { subjectId } = req.params;
      const tenantId = req.tenantId;

      // Check if subject has chapters
      const chapterCount = await Chapter.countDocuments({
        subjectId,
        tenantId,
      });

      if (chapterCount > 0) {
        return res.status(409).json({
          success: false,
          error: `Cannot delete subject with ${chapterCount} chapter(s). Delete chapters first.`,
        });
      }

      const result = await Subject.deleteOne({
        _id: subjectId,
        tenantId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, error: 'Subject not found' });
      }

      res.json({
        success: true,
        message: 'Subject deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============= BULK OPERATIONS =============

// POST: Create multiple subjects (TEACHER, ADMIN)
router.post(
  '/bulk/create',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { subjects } = req.body; // [{name, description, color}, ...]
      const tenantId = req.tenantId;
      const userId = req.user?.id;

      if (!Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ success: false, error: 'Subjects array is required' });
      }

      const subjectsToCreate = subjects.map((s) => ({
        tenantId,
        name: s.name,
        description: s.description || '',
        color: s.color || '#3B82F6',
        createdBy: userId,
      }));

      const created = await Subject.insertMany(subjectsToCreate);

      res.status(201).json({
        success: true,
        message: `Created ${created.length} subjects`,
        count: created.length,
        data: created,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// GET: Subject statistics (ALL AUTHENTICATED USERS)
router.get('/:subjectId/stats', protect, tenantProtect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const tenantId = req.tenantId;

    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    // Get stats
    const chapters = await Chapter.find({
      subjectId,
      tenantId,
    });

    const stats = {
      totalChapters: chapters.length,
      chapters: chapters.map((c) => ({
        _id: c._id,
        name: c.name,
      })),
    };

    res.json({
      success: true,
      data: {
        ...subject.toObject(),
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
