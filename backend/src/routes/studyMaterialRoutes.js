import express from 'express';
import multer from 'multer';
import StudyMaterial from '../models/StudyMaterial.js';
import StudentMaterialProgress from '../models/StudentMaterialProgress.js';
import Student from '../models/Student.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/study-materials/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'video/mp4',
      'video/quicktime',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed: MP4, PDF, DOC, DOCX, PPT, PPTX'));
    }
  },
});

// GET all study materials (by subject/chapter)
router.get('/', protect, tenantProtect, async (req, res) => {
  try {
    const { subject, chapter, contentType, batchId } = req.query;
    const tenantId = req.tenantId;

    const filter = {
      tenantId,
      isActive: true,
    };

    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (contentType) filter.contentType = contentType;

    // If batchId provided, filter by shared batches
    if (batchId) {
      filter['sharedWith.batchId'] = batchId;
    }

    const materials = await StudyMaterial.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single material with progress tracking
router.get('/:materialId', protect, tenantProtect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const tenantId = req.tenantId;

    const material = await StudyMaterial.findOne({
      _id: materialId,
      tenantId,
    }).populate('createdBy', 'name email');

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    res.json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET student progress on material
router.get('/:materialId/progress', protect, tenantProtect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user?.id; // From JWT
    const tenantId = req.tenantId;

    const progress = await StudentMaterialProgress.findOne({
      materialId,
      studentId,
      tenantId,
    });

    res.json({
      success: true,
      data: progress || {
        status: 'not-started',
        viewCount: 0,
        completionPercentage: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new study material
router.post('/', protect, tenantProtect, upload.single('file'), async (req, res) => {
  try {
    const { title, description, contentType, subject, chapter, visibility, sharedBatches } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    const material = new StudyMaterial({
      tenantId,
      title,
      description,
      contentType,
      subject,
      chapter,
      visibility,
      fileUrl: `/uploads/study-materials/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSizeBytes: req.file.size,
      fileType: req.file.mimetype,
      createdBy: userId,
      sharedWith: sharedBatches
        ? JSON.parse(sharedBatches).map((batch) => ({
            batchId: batch.batchId,
            className: batch.className,
          }))
        : [],
    });

    await material.save();
    res.status(201).json({ success: true, data: material });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH: Share material with batches
router.patch('/:materialId/share', protect, tenantProtect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const { batches } = req.body; // [{batchId, className}]
    const tenantId = req.tenantId;

    const material = await StudyMaterial.findOneAndUpdate(
      { _id: materialId, tenantId },
      {
        $set: {
          sharedWith: batches,
          visibility: batches.length > 0 ? 'batch-wise' : 'private',
        },
      },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    res.json({
      success: true,
      message: `Material shared with ${batches.length} batches`,
      data: material,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Track student view/progress
router.put('/:materialId/progress', protect, tenantProtect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const { watchedSeconds, completionPercentage, isDownloaded } = req.body;
    const tenantId = req.tenantId;

    // Get student from auth context (you might store studentId differently)
    const student = await Student.findOne({ userId: req.user?.id, tenantId });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    let progress = await StudentMaterialProgress.findOne({
      materialId,
      studentId: student._id,
      tenantId,
    });

    if (!progress) {
      progress = new StudentMaterialProgress({
        tenantId,
        materialId,
        studentId: student._id,
        firstViewedAt: new Date(),
      });
    }

    // Update progress
    if (watchedSeconds) {
      progress.totalWatchedSeconds += watchedSeconds;
    }
    if (completionPercentage !== undefined) {
      progress.completionPercentage = completionPercentage;
      if (completionPercentage === 100) {
        progress.status = 'completed';
        progress.completedAt = new Date();
      } else if (completionPercentage > 0) {
        progress.status = 'in-progress';
      }
    }
    if (isDownloaded !== undefined) {
      progress.isDownloaded = isDownloaded;
      progress.downloadedAt = new Date();
    }

    progress.viewCount += 1;
    progress.lastViewedAt = new Date();

    await progress.save();

    // Increment material view count
    await StudyMaterial.findByIdAndUpdate(materialId, {
      $inc: { viewCount: 1 },
    });

    res.json({
      success: true,
      message: 'Progress updated',
      data: progress,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove material
router.delete('/:materialId', protect, tenantProtect, async (req, res) => {
  try {
    const { materialId } = req.params;
    const tenantId = req.tenantId;

    const material = await StudyMaterial.findOneAndUpdate(
      { _id: materialId, tenantId },
      { isActive: false },
      { new: true }
    );

    if (!material) {
      return res.status(404).json({ success: false, error: 'Material not found' });
    }

    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Materials by student batch (for student portal)
router.get('/batch/:batchId/materials', protect, tenantProtect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const tenantId = req.tenantId;

    const materials = await StudyMaterial.find({
      tenantId,
      'sharedWith.batchId': batchId,
      isActive: true,
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: materials.length,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Bulk materials for batch-wise sharing
router.get('/batch/:batchId/assigned', protect, tenantProtect, async (req, res) => {
  try {
    const { batchId } = req.params;
    const { subject, contentType } = req.query;
    const tenantId = req.tenantId;

    const filter = {
      tenantId,
      'sharedWith.batchId': batchId,
      isActive: true,
    };

    if (subject) filter.subject = subject;
    if (contentType) filter.contentType = contentType;

    const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });

    const breakdown = {
      byType: {},
      bySubject: {},
      total: materials.length,
    };

    materials.forEach((mat) => {
      breakdown.byType[mat.contentType] = (breakdown.byType[mat.contentType] || 0) + 1;
      breakdown.bySubject[mat.subject] = (breakdown.bySubject[mat.subject] || 0) + 1;
    });

    res.json({
      success: true,
      breakdown,
      data: materials,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
