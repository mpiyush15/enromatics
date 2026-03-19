import express from 'express';
import VideoLesson from '../models/VideoLesson.js';
import Chapter from '../models/Chapter.js';
import Subject from '../models/Subject.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// ============= VIDEO LESSON MANAGEMENT =============

// GET all video lessons for a chapter
router.get('/chapter/:chapterId', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    // Verify chapter exists and get subject info
    const chapter = await Chapter.findOne({ _id: chapterId, tenantId }).populate('subjectId', 'name');
    if (!chapter) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const videoLessons = await VideoLesson.find({
      chapterId,
      tenantId,
    })
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.json({
      success: true,
      count: videoLessons.length,
      chapter: {
        id: chapter._id,
        name: chapter.name,
        subjectId: chapter.subjectId._id,
        subjectName: chapter.subjectId.name,
      },
      data: videoLessons,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all video lessons for a subject
router.get('/subject/:subjectId', protect, tenantProtect, async (req, res) => {
  try {
    const { subjectId } = req.params;
    const tenantId = req.tenantId;

    // Verify subject exists
    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const videoLessons = await VideoLesson.find({
      subjectId,
      tenantId,
    })
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .populate('createdBy', 'name email')
      .sort({ order: 1 });

    res.json({
      success: true,
      count: videoLessons.length,
      subject: {
        id: subject._id,
        name: subject.name,
      },
      data: videoLessons,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single video lesson with full details
router.get('/:videoLessonId', protect, tenantProtect, async (req, res) => {
  try {
    const { videoLessonId } = req.params;
    const tenantId = req.tenantId;

    const videoLesson = await VideoLesson.findOne({
      _id: videoLessonId,
      tenantId,
    })
      .populate('subjectId', 'name')
      .populate('chapterId', 'name')
      .populate('createdBy', 'name email');

    if (!videoLesson) {
      return res.status(404).json({ success: false, error: 'Video lesson not found' });
    }

    // Increment view count
    videoLesson.viewCount = (videoLesson.viewCount || 0) + 1;
    await videoLesson.save();

    res.json({
      success: true,
      data: videoLesson,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new video lesson (TEACHER, ADMIN)
router.post(
  '/',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { chapterId, subjectId, title, description, videoUrl, duration, notes, order } = req.body;
      const tenantId = req.tenantId;
      const userId = req.user?.id;

      if (!chapterId || !subjectId || !title || !videoUrl) {
        return res.status(400).json({
          success: false,
          error: 'Chapter ID, Subject ID, title, and video URL are required',
        });
      }

      // Verify chapter exists and belongs to subject
      const chapter = await Chapter.findOne({
        _id: chapterId,
        subjectId,
        tenantId,
      });
      if (!chapter) {
        return res.status(404).json({
          success: false,
          error: 'Chapter not found or does not belong to this subject',
        });
      }

      const videoLesson = new VideoLesson({
        tenantId,
        subjectId,
        chapterId,
        title,
        description,
        videoUrl,
        duration: duration || 0,
        notes: notes || '',
        order: order || 1,
        createdBy: userId,
        status: 'active',
      });

      await videoLesson.save();

      const populated = await videoLesson.populate([
        { path: 'subjectId', select: 'name' },
        { path: 'chapterId', select: 'name' },
      ]);

      res.status(201).json({
        success: true,
        message: 'Video lesson created successfully',
        data: populated,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// PATCH: Update video lesson (TEACHER, ADMIN)
router.patch(
  '/:videoLessonId',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { videoLessonId } = req.params;
      const { title, description, videoUrl, duration, notes, order, status } = req.body;
      const tenantId = req.tenantId;

      const videoLesson = await VideoLesson.findOneAndUpdate(
        { _id: videoLessonId, tenantId },
        {
          title,
          description,
          videoUrl,
          duration,
          notes,
          order,
          status,
        },
        { new: true }
      )
        .populate('subjectId', 'name')
        .populate('chapterId', 'name');

      if (!videoLesson) {
        return res.status(404).json({ success: false, error: 'Video lesson not found' });
      }

      res.json({
        success: true,
        message: 'Video lesson updated successfully',
        data: videoLesson,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// DELETE: Remove video lesson (TEACHER, ADMIN)
router.delete(
  '/:videoLessonId',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { videoLessonId } = req.params;
      const tenantId = req.tenantId;

      const result = await VideoLesson.deleteOne({
        _id: videoLessonId,
        tenantId,
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, error: 'Video lesson not found' });
      }

      res.json({
        success: true,
        message: 'Video lesson deleted successfully',
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// ============= BULK OPERATIONS =============

// POST: Create multiple video lessons for chapter (TEACHER, ADMIN)
router.post(
  '/:chapterId/bulk',
  protect,
  tenantProtect,
  authorizeRoles('tenantadmin', 'superadmin'),
  async (req, res) => {
    try {
      const { chapterId } = req.params;
      const { videoLessons } = req.body; // [{title, description, videoUrl, duration, notes}, ...]
      const tenantId = req.tenantId;
      const userId = req.user?.id;

      if (!Array.isArray(videoLessons) || videoLessons.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Video lessons array is required',
        });
      }

      // Verify chapter exists
      const chapter = await Chapter.findOne({ _id: chapterId, tenantId });
      if (!chapter) {
        return res.status(404).json({ success: false, error: 'Chapter not found' });
      }

      const lessonsToCreate = videoLessons.map((lesson, idx) => ({
        tenantId,
        subjectId: chapter.subjectId,
        chapterId,
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: lesson.videoUrl,
        duration: lesson.duration || 0,
        notes: lesson.notes || '',
        order: idx + 1,
        createdBy: userId,
        status: 'active',
      }));

      const created = await VideoLesson.insertMany(lessonsToCreate);

      res.status(201).json({
        success: true,
        message: `${created.length} video lessons created successfully`,
        count: created.length,
        data: created,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// GET: Video lesson statistics for chapter
router.get('/:chapterId/stats', protect, tenantProtect, async (req, res) => {
  try {
    const { chapterId } = req.params;
    const tenantId = req.tenantId;

    const stats = await VideoLesson.aggregate([
      {
        $match: {
          chapterId: require('mongoose').Types.ObjectId(chapterId),
          tenantId,
        },
      },
      {
        $group: {
          _id: null,
          totalLessons: { $sum: 1 },
          totalDuration: { $sum: '$duration' },
          totalViews: { $sum: '$viewCount' },
          totalDownloads: { $sum: '$downloadCount' },
          activeLessons: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        totalLessons: 0,
        totalDuration: 0,
        totalViews: 0,
        totalDownloads: 0,
        activeLessons: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
