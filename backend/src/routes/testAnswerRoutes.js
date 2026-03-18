import express from 'express';
import mongoose from 'mongoose';
import StudentTestAnswer from '../models/StudentTestAnswer.js';
import testEvaluationService from '../services/testEvaluationService.js';
import emailAutomationService from '../services/emailAutomationService.js';
import { protect } from '../middleware/authMiddleware.js';
import { tenantProtect } from '../middleware/tenantProtect.js';

const router = express.Router();

// POST: Submit single answer during test
router.post('/:testId/answer', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, studentAnswer, timeSpentSeconds } = req.body;
    const studentId = req.user?.id;
    const tenantId = req.tenantId;

    // Evaluate the answer
    const evaluation = await testEvaluationService.evaluateAnswer(
      tenantId,
      testId,
      studentId,
      questionId,
      studentAnswer
    );

    if (!evaluation.success) {
      return res.status(400).json(evaluation);
    }

    // Update time spent if provided
    if (timeSpentSeconds) {
      await StudentTestAnswer.updateOne(
        { _id: evaluation.questionId, studentId },
        { timeSpentSeconds }
      );
    }

    res.json(evaluation);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST: Submit all test answers at once
router.post('/:testId/submit', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers } = req.body; // [{questionId, studentAnswer, timeSpentSeconds}]
    const studentId = req.user?.id;
    const tenantId = req.tenantId;

    // Evaluate all answers
    const evaluations = [];
    for (const answer of answers) {
      const evaluation = await testEvaluationService.evaluateAnswer(
        tenantId,
        testId,
        studentId,
        answer.questionId,
        answer.studentAnswer
      );
      if (evaluation.success) {
        evaluations.push(evaluation);
      }
    }

    // Generate test result summary
    const testResult = await testEvaluationService.evaluateTestSubmission(
      tenantId,
      testId,
      studentId
    );

    res.json({
      success: true,
      message: `Test submitted. ${evaluations.length} answers evaluated`,
      totalAnswers: answers.length,
      evaluations,
      testResult,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Student's test result summary
router.get('/:testId/results/:studentId', protect, tenantProtect, async (req, res) => {
  try {
    const { testId, studentId } = req.params;
    const tenantId = req.tenantId;

    const result = await testEvaluationService.getTestResultSummary(
      tenantId,
      testId,
      studentId
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: All pending subjective answers for test
router.get('/:testId/pending', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const tenantId = req.tenantId;

    const result = await testEvaluationService.getPendingAnswers(tenantId, testId);

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH: Manually evaluate subjective answer
router.patch(
  '/answer/:answerId/evaluate',
  protect,
  tenantProtect,
  async (req, res) => {
    try {
      const { answerId } = req.params;
      const { marksObtained, comment } = req.body;
      const evaluatorId = req.user?.id;
      const tenantId = req.tenantId;

      const result = await testEvaluationService.manuallyEvaluateAnswer(
        tenantId,
        answerId,
        marksObtained,
        evaluatorId,
        comment
      );

      // If all answers now evaluated, send result notification to student
      if (result.success) {
        const answer = result.data;
        // Check if all answers for this test are now evaluated
        const pendingAnswers = await StudentTestAnswer.countDocuments({
          testId: answer.testId,
          studentId: answer.studentId,
          evaluationStatus: 'pending-review',
        });

        if (pendingAnswers === 0) {
          // All answers evaluated - send email notification
          const testSummary = await testEvaluationService.getTestResultSummary(
            tenantId,
            answer.testId,
            answer.studentId
          );

          if (testSummary.success) {
            const testData = testSummary.data;
            // Will implement test result notification in email service
            // await emailAutomationService.sendTestResultNotification(...)
          }
        }
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

// GET: Student answers for review
router.get('/:testId/review/:studentId', protect, tenantProtect, async (req, res) => {
  try {
    const { testId, studentId } = req.params;
    const tenantId = req.tenantId;

    const answers = await StudentTestAnswer.find({
      tenantId,
      testId,
      studentId,
    })
      .populate('questionId', 'question questionType marks correctAnswer explanation')
      .sort({ questionNumber: 1 });

    res.json({
      success: true,
      count: answers.length,
      data: answers,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET: Analytics - Test performance across students
router.get('/:testId/analytics', protect, tenantProtect, async (req, res) => {
  try {
    const { testId } = req.params;
    const tenantId = req.tenantId;

    // Aggregate test statistics
    const stats = await StudentTestAnswer.aggregate([
      { $match: { testId: new mongoose.Types.ObjectId(testId), tenantId } },
      {
        $group: {
          _id: '$studentId',
          totalMarks: { $sum: '$totalMarks' },
          marksObtained: { $sum: '$marksObtained' },
          correctAnswers: {
            $sum: { $cond: ['$isCorrect', 1, 0] },
          },
          totalQuestions: { $sum: 1 },
        },
      },
      {
        $project: {
          percentage: {
            $multiply: [{ $divide: ['$marksObtained', '$totalMarks'] }, 100],
          },
          marksObtained: 1,
          totalMarks: 1,
          correctAnswers: 1,
          totalQuestions: 1,
        },
      },
      { $sort: { percentage: -1 } },
    ]);

    const totalStudents = stats.length;
    const avgPercentage =
      stats.reduce((sum, s) => sum + s.percentage, 0) / totalStudents;
    const highestScore = stats[0]?.percentage || 0;
    const lowestScore = stats[stats.length - 1]?.percentage || 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        averagePercentage: avgPercentage.toFixed(2),
        highestScore: highestScore.toFixed(2),
        lowestScore: lowestScore.toFixed(2),
        distribution: {
          excellent: stats.filter((s) => s.percentage >= 90).length,
          veryGood: stats.filter((s) => s.percentage >= 80 && s.percentage < 90).length,
          good: stats.filter((s) => s.percentage >= 70 && s.percentage < 80).length,
          average: stats.filter((s) => s.percentage >= 60 && s.percentage < 70).length,
          needsImprovement: stats.filter((s) => s.percentage < 60).length,
        },
        studentPerformance: stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
