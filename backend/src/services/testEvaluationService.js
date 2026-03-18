import StudentTestAnswer from '../models/StudentTestAnswer.js';
import TestQuestion from '../models/TestQuestion.js';
import emailAutomationService from './emailAutomationService.js';

class TestEvaluationService {
  /**
   * Evaluate a student's answer for a question
   * Handles MCQ, Numeric, Subjective, True/False, Fill-in-the-blank
   */
  async evaluateAnswer(tenantId, testId, studentId, questionId, studentAnswer) {
    try {
      const question = await TestQuestion.findById(questionId);
      if (!question) {
        throw new Error('Question not found');
      }

      let isCorrect = false;
      let marksObtained = 0;

      // Evaluate based on question type
      switch (question.questionType) {
        case 'mcq':
          isCorrect = this.evaluateMCQ(studentAnswer, question.correctAnswer);
          break;
        case 'numeric':
          isCorrect = this.evaluateNumeric(studentAnswer, question.correctAnswer, question.acceptableVariance);
          break;
        case 'true-false':
          isCorrect = this.evaluateTrueFalse(studentAnswer, question.correctAnswer);
          break;
        case 'fill-blank':
          isCorrect = this.evaluateFillBlank(studentAnswer, question.acceptableAnswerOptions);
          break;
        case 'subjective':
          // Subjective answers need manual evaluation
          isCorrect = null; // Will be evaluated by teacher
          break;
      }

      if (isCorrect !== null) {
        marksObtained = isCorrect ? question.marks : 0;
      }

      // Save the answer
      const testAnswer = new StudentTestAnswer({
        tenantId,
        testId,
        studentId,
        questionId,
        studentAnswer,
        isCorrect,
        marksObtained,
        totalMarks: question.marks,
        evaluationStatus:
          question.questionType === 'subjective' ? 'pending-review' : 'auto-evaluated',
      });

      await testAnswer.save();

      return {
        success: true,
        questionId,
        isCorrect,
        marksObtained,
        evaluationStatus: testAnswer.evaluationStatus,
        feedback: this.generateFeedback(question, studentAnswer, isCorrect),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Evaluate MCQ answer
   */
  evaluateMCQ(studentAnswer, correctAnswer) {
    return studentAnswer?.toLowerCase() === correctAnswer?.toLowerCase();
  }

  /**
   * Evaluate numeric answer with variance tolerance
   */
  evaluateNumeric(studentAnswer, correctAnswer, acceptableVariance = 0) {
    try {
      const student = parseFloat(studentAnswer);
      const correct = parseFloat(correctAnswer);

      if (isNaN(student) || isNaN(correct)) return false;

      const difference = Math.abs(student - correct);
      const allowedDifference = (acceptableVariance / 100) * Math.abs(correct);

      return difference <= allowedDifference;
    } catch {
      return false;
    }
  }

  /**
   * Evaluate True/False answer
   */
  evaluateTrueFalse(studentAnswer, correctAnswer) {
    const normalized = (answer) => {
      if (typeof answer === 'string') {
        return answer.toLowerCase() === 'true' ? true : false;
      }
      return Boolean(answer);
    };

    return normalized(studentAnswer) === normalized(correctAnswer);
  }

  /**
   * Evaluate fill-in-the-blank (case-insensitive, trimmed)
   */
  evaluateFillBlank(studentAnswer, acceptableAnswerOptions) {
    if (!acceptableAnswerOptions || acceptableAnswerOptions.length === 0) {
      return false;
    }

    const normalized = (answer) => answer?.trim().toLowerCase();
    const studentNormalized = normalized(studentAnswer);

    return acceptableAnswerOptions.some((option) => normalized(option) === studentNormalized);
  }

  /**
   * Generate feedback for student based on answer evaluation
   */
  generateFeedback(question, studentAnswer, isCorrect) {
    if (question.questionType === 'subjective') {
      return 'Your answer has been submitted for evaluation. You will receive feedback soon.';
    }

    if (isCorrect) {
      return question.explanation || 'Correct! Well done!';
    }

    let feedback = `Incorrect. The correct answer is: ${question.correctAnswer}`;
    if (question.explanation) {
      feedback += `\n\nExplanation: ${question.explanation}`;
    }

    return feedback;
  }

  /**
   * Evaluate all answers for a test and generate results
   */
  async evaluateTestSubmission(tenantId, testId, studentId) {
    try {
      const answers = await StudentTestAnswer.find({
        tenantId,
        testId,
        studentId,
      });

      if (answers.length === 0) {
        throw new Error('No answers found for this test submission');
      }

      const autoEvaluated = answers.filter((a) => a.isCorrect !== null);
      const pendingReview = answers.filter((a) => a.isCorrect === null);

      const totalMarks = answers.reduce((sum, a) => sum + a.totalMarks, 0);
      const marksObtained = answers.reduce((sum, a) => sum + a.marksObtained, 0);
      const percentage = (marksObtained / totalMarks) * 100;

      // Count auto-evaluated correct answers
      const correctAnswers = autoEvaluated.filter((a) => a.isCorrect).length;

      const result = {
        testId,
        studentId,
        tenantId,
        totalQuestions: answers.length,
        attemptedQuestions: answers.length,
        correctAnswers,
        incorrectAnswers: autoEvaluated.length - correctAnswers,
        pendingReviewQuestions: pendingReview.length,
        totalMarks,
        marksObtained,
        percentage: percentage.toFixed(2),
        status: pendingReview.length > 0 ? 'partial-evaluation' : 'evaluated',
        evaluatedAt: new Date(),
      };

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Manually evaluate subjective answers
   */
  async manuallyEvaluateAnswer(tenantId, answerId, marksObtained, evaluatorId, comment) {
    try {
      const answer = await StudentTestAnswer.findOne({
        _id: answerId,
        tenantId,
      });

      if (!answer) {
        throw new Error('Answer not found');
      }

      // Determine if correct based on marks
      const isCorrect = marksObtained === answer.totalMarks;

      answer.isCorrect = isCorrect;
      answer.marksObtained = marksObtained;
      answer.evaluatedBy = evaluatorId;
      answer.evaluatedAt = new Date();
      answer.evaluatorComment = comment;
      answer.evaluationStatus = 'manually-evaluated';

      await answer.save();

      return {
        success: true,
        message: 'Answer evaluated successfully',
        data: answer,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all pending subjective answers for a test
   */
  async getPendingAnswers(tenantId, testId) {
    try {
      const pending = await StudentTestAnswer.find({
        tenantId,
        testId,
        evaluationStatus: 'pending-review',
      })
        .populate('studentId', 'name rollNumber')
        .populate('questionId', 'question questionType marks')
        .sort({ createdAt: -1 });

      return {
        success: true,
        count: pending.length,
        data: pending,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get test result summary for student
   */
  async getTestResultSummary(tenantId, testId, studentId) {
    try {
      const answers = await StudentTestAnswer.find({
        tenantId,
        testId,
        studentId,
      }).populate('questionId', 'question questionType marks correctAnswer');

      const totalMarks = answers.reduce((sum, a) => sum + a.totalMarks, 0);
      const marksObtained = answers.reduce((sum, a) => sum + a.marksObtained, 0);
      const percentage = (marksObtained / totalMarks) * 100;
      const correctCount = answers.filter((a) => a.isCorrect === true).length;

      return {
        success: true,
        data: {
          totalQuestions: answers.length,
          correctAnswers: correctCount,
          wrongAnswers: answers.filter((a) => a.isCorrect === false).length,
          pendingReview: answers.filter((a) => a.isCorrect === null).length,
          totalMarks,
          marksObtained,
          percentage: percentage.toFixed(2),
          answers: answers.map((a) => ({
            questionId: a.questionId._id,
            question: a.questionId.question,
            studentAnswer: a.studentAnswer,
            correctAnswer: a.questionId.correctAnswer,
            isCorrect: a.isCorrect,
            marksObtained: a.marksObtained,
            evaluatorComment: a.evaluatorComment,
          })),
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new TestEvaluationService();
