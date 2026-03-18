import express from 'express';
import Test from '../models/Test.js';
import TestQuestion from '../models/TestQuestion.js';
import Question from '../models/Question.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { RBAC } from '../config/rbacConfig.js';

const router = express.Router();

// ============= TEST CREATION & MANAGEMENT =============

// GET all tests for tenant
router.get('/', protect, tenantProtect, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status, subjectId, search } = req.query;

    const filter = { tenantId };
    if (status) filter.status = status;
    if (subjectId) filter.subjectId = subjectId;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const tests = await Test.find(filter)
      .populate('subjectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tests.length,
      data: tests,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single test with questions
router.get('/:testId', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const tenantId = req.tenantId;

    const test = await Test.findOne({
      _id: testId,
      tenantId,
    })
      .populate('subjectId', 'name')
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Get questions for this test
    const testQuestions = await TestQuestion.find({
      testId,
      tenantId,
    })
      .populate('questionId')
      .sort({ order: 1 });

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        questions: testQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Create new test (initial setup - without questions) (TEACHER, ADMIN)
router.post('/', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { title, description, subjectId, totalMarks, duration, passingMarks, status } = req.body;
    const tenantId = req.tenantId;
    const userId = req.user?.id;

    if (!title || !subjectId) {
      return res.status(400).json({
        success: false,
        error: 'Test title and subject are required',
      });
    }

    // Verify subject exists
    const subject = await Subject.findOne({ _id: subjectId, tenantId });
    if (!subject) {
      return res.status(404).json({ success: false, error: 'Subject not found' });
    }

    const test = new Test({
      tenantId,
      title,
      description,
      subjectId,
      totalMarks: totalMarks || 100,
      duration: duration || 60, // minutes
      passingMarks: passingMarks || 40,
      status: status || 'draft', // draft, published, archived
      createdBy: userId,
    });

    await test.save();
    await test.populate('subjectId', 'name');

    res.status(201).json({
      success: true,
      message: 'Test created successfully. Now add questions.',
      data: test,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH: Update test details (TEACHER, ADMIN)
router.patch('/:testId', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId } = req.params;
    const { title, description, totalMarks, duration, passingMarks, status } = req.body;
    const tenantId = req.tenantId;

    const test = await Test.findOneAndUpdate(
      { _id: testId, tenantId },
      { title, description, totalMarks, duration, passingMarks, status },
      { new: true }
    ).populate('subjectId', 'name');

    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: test,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove test (TEACHER, ADMIN)
router.delete('/:testId', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId } = req.params;
    const tenantId = req.tenantId;

    // Delete all test-question mappings
    await TestQuestion.deleteMany({ testId, tenantId });

    // Delete test
    const result = await Test.deleteOne({
      _id: testId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= QUESTION SELECTION & ASSIGNMENT =============

// GET: Available questions for test (by chapter & difficulty)
router.get('/:testId/available-questions', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const { chapterId, difficulty, limit } = req.query;
    const tenantId = req.tenantId;

    // Verify test exists
    const test = await Test.findOne({ _id: testId, tenantId });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Get existing questions in this test
    const existingQuestions = await TestQuestion.find({ testId, tenantId }).select('questionId');
    const existingIds = existingQuestions.map((tq) => tq.questionId.toString());

    // Build filter for available questions
    const filter = {
      tenantId,
      _id: { $nin: existingIds },
    };

    if (chapterId) filter.chapterId = chapterId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .select('_id question difficulty marks chapterId')
      .limit(limit ? parseInt(limit) : 50)
      .sort({ difficulty: 1, marks: -1 });

    res.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Add single question to test (TEACHER, ADMIN)
router.post('/:testId/add-question', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, marks, order } = req.body;
    const tenantId = req.tenantId;

    if (!questionId) {
      return res.status(400).json({ success: false, error: 'Question ID is required' });
    }

    // Verify test exists
    const test = await Test.findOne({ _id: testId, tenantId });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Verify question exists
    const question = await Question.findOne({ _id: questionId, tenantId });
    if (!question) {
      return res.status(404).json({ success: false, error: 'Question not found' });
    }

    // Check if question already in test
    const exists = await TestQuestion.findOne({
      testId,
      questionId,
      tenantId,
    });
    if (exists) {
      return res.status(409).json({ success: false, error: 'Question already in test' });
    }

    // Get next order if not provided
    let nextOrder = order;
    if (!nextOrder) {
      const lastQ = await TestQuestion.findOne({ testId, tenantId }).sort({ order: -1 });
      nextOrder = (lastQ?.order || 0) + 1;
    }

    const testQuestion = new TestQuestion({
      tenantId,
      testId,
      questionId,
      marks: marks || question.marks,
      order: nextOrder,
    });

    await testQuestion.save();
    await testQuestion.populate('questionId');

    res.status(201).json({
      success: true,
      message: 'Question added to test',
      data: testQuestion,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Add multiple questions to test (TEACHER, ADMIN)
router.post('/:testId/add-questions-bulk', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionIds } = req.body; // Array of question IDs
    const tenantId = req.tenantId;

    if (!Array.isArray(questionIds) || questionIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Question IDs array is required' });
    }

    // Verify test exists
    const test = await Test.findOne({ _id: testId, tenantId });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Get existing questions count
    const existingCount = await TestQuestion.countDocuments({ testId, tenantId });

    // Create test-question mappings
    const testQuestionsData = await Promise.all(
      questionIds.map(async (qId, idx) => {
        const question = await Question.findOne({ _id: qId, tenantId });
        if (!question) return null;

        return {
          tenantId,
          testId,
          questionId: qId,
          marks: question.marks,
          order: existingCount + idx + 1,
        };
      })
    );

    // Filter out null entries
    const validData = testQuestionsData.filter((t) => t !== null);

    const created = await TestQuestion.insertMany(validData);

    res.status(201).json({
      success: true,
      message: `Added ${created.length} questions to test`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE: Remove question from test (TEACHER, ADMIN)
router.delete('/:testId/question/:questionId', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId, questionId } = req.params;
    const tenantId = req.tenantId;

    const result = await TestQuestion.deleteOne({
      testId,
      questionId,
      tenantId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Question not found in test' });
    }

    // Reorder remaining questions
    const remaining = await TestQuestion.find({ testId, tenantId }).sort({ order: 1 });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].order = i + 1;
      await remaining[i].save();
    }

    res.json({
      success: true,
      message: 'Question removed from test',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= AUTO-SELECT QUESTIONS =============

// POST: Auto-select questions by difficulty (TEACHER, ADMIN)
router.post('/:testId/auto-select', protect, tenantProtect, authorizeRoles(RBAC.TENANT_ADMIN, RBAC.TEACHER, RBAC.SUPER_ADMIN), async (req, res) => {
  try {
    const { testId } = req.params;
    const { chapterId, difficulty, count } = req.body;
    const tenantId = req.tenantId;

    if (!chapterId || !difficulty || !count) {
      return res.status(400).json({
        success: false,
        error: 'Chapter ID, difficulty, and count are required',
      });
    }

    // Verify test exists
    const test = await Test.findOne({ _id: testId, tenantId });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    // Get existing questions
    const existingQuestions = await TestQuestion.find({ testId, tenantId }).select('questionId');
    const existingIds = existingQuestions.map((tq) => tq.questionId.toString());

    // Get random questions matching criteria
    const questions = await Question.find({
      tenantId,
      chapterId,
      difficulty,
      _id: { $nin: existingIds },
    })
      .limit(parseInt(count))
      .exec();

    if (questions.length === 0) {
      return res.status(404).json({
        success: false,
        error: `No questions found for difficulty: ${difficulty}`,
      });
    }

    // Create test-question mappings
    const currentOrder = await TestQuestion.countDocuments({ testId, tenantId });
    const testQuestionsData = questions.map((q, idx) => ({
      tenantId,
      testId,
      questionId: q._id,
      marks: q.marks,
      order: currentOrder + idx + 1,
    }));

    const created = await TestQuestion.insertMany(testQuestionsData);

    res.status(201).json({
      success: true,
      message: `Auto-selected ${created.length} questions`,
      count: created.length,
      data: created,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============= TEST STATISTICS =============

// GET: Test completion stats
router.get('/:testId/stats', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const tenantId = req.tenantId;

    const test = await Test.findOne({ _id: testId, tenantId });
    if (!test) {
      return res.status(404).json({ success: false, error: 'Test not found' });
    }

    const testQuestions = await TestQuestion.find({ testId, tenantId });

    const questionsByDifficulty = await Question.aggregate([
      {
        $match: {
          _id: { $in: testQuestions.map((tq) => tq.questionId) },
        },
      },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } },
    ]);

    const stats = {
      totalQuestions: testQuestions.length,
      totalMarks: testQuestions.reduce((sum, tq) => sum + tq.marks, 0),
      questionsByDifficulty: Object.fromEntries(
        questionsByDifficulty.map((q) => [q._id, q.count])
      ),
    };

    res.json({
      success: true,
      data: {
        ...test.toObject(),
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
