import Question from '../models/Question.js';
import { generateQuestionsAI, answerDoubtAI } from '../services/aiService.js';

/**
 * Generate questions using AI
 * POST /api/questions/generate
 */
export const generateQuestions = async (req, res) => {
  try {
    const { tenantId } = req.user || { tenantId: req.body.tenantId };
    const { subject, chapter, difficulty = 'medium', count = 5 } = req.body;

    console.log('\n' + '='.repeat(80));
    console.log('🤖 [QUESTION GENERATION] Request received');
    console.log('='.repeat(80));
    console.log('📧 Tenant:', tenantId);
    console.log('📚 Subject:', subject);
    console.log('📖 Chapter:', chapter);
    console.log('⚡ Difficulty:', difficulty);
    console.log('📊 Count:', count);

    // Validate inputs
    if (!subject || !chapter) {
      return res.status(400).json({
        message: 'Subject and chapter are required',
      });
    }

    // Call OpenAI to generate questions
    console.log('\n🚀 Calling OpenAI...');
    const generatedQuestions = await generateQuestionsAI(subject, chapter, difficulty, count);

    // Save generated questions to database
    console.log('💾 Saving to database...');
    const questionsWithTenant = generatedQuestions.map((q) => ({
      ...q,
      tenantId,
      subject,
      chapter,
    }));

    const savedQuestions = await Question.insertMany(questionsWithTenant);

    console.log(`✅ Saved ${savedQuestions.length} questions to database`);
    console.log('='.repeat(80) + '\n');

    res.status(201).json({
      message: `Successfully generated ${savedQuestions.length} questions`,
      count: savedQuestions.length,
      questions: savedQuestions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    res.status(500).json({
      message: error.message || 'Failed to generate questions',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

/**
 * Get questions by subject and chapter
 * GET /api/questions?subject=Math&chapter=Algebra&difficulty=medium
 */
export const getQuestions = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { subject, chapter, difficulty, limit = 10, skip = 0 } = req.query;

    console.log('📋 Fetching questions...');

    const filter = { tenantId, status: 'active' };
    if (subject) filter.subject = subject;
    if (chapter) filter.chapter = chapter;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Question.countDocuments(filter);

    res.status(200).json({
      message: 'Questions fetched successfully',
      count: questions.length,
      total,
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        marks: q.marks,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching questions:', error.message);
    res.status(500).json({
      message: 'Failed to fetch questions',
      error: error.message,
    });
  }
};

/**
 * Answer student doubt using AI
 * POST /api/questions/answer-doubt
 */
export const answerDoubt = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { doubt, subject, chapter, lessonContext } = req.body;

    console.log('🤔 [DOUBT SOLVER] Answering doubt...');

    if (!doubt) {
      return res.status(400).json({
        message: 'Doubt text is required',
      });
    }

    // Call AI service
    const answer = await answerDoubtAI(doubt, subject, chapter, lessonContext);

    res.status(200).json({
      message: 'Doubt answered successfully',
      doubt,
      answer,
      subject,
      chapter,
    });
  } catch (error) {
    console.error('❌ Error answering doubt:', error.message);
    res.status(500).json({
      message: 'Failed to answer doubt',
      error: error.message,
    });
  }
};

/**
 * Get question statistics
 * GET /api/questions/stats
 */
export const getQuestionStats = async (req, res) => {
  try {
    const { tenantId } = req.user;

    const stats = await Question.aggregate([
      { $match: { tenantId, status: 'active' } },
      {
        $group: {
          _id: null,
          totalQuestions: { $sum: 1 },
          byDifficulty: {
            $push: {
              difficulty: '$difficulty',
            },
          },
          bySubject: {
            $push: {
              subject: '$subject',
            },
          },
        },
      },
    ]);

    const result = stats[0] || { totalQuestions: 0 };

    res.status(200).json({
      message: 'Statistics retrieved successfully',
      stats: result,
    });
  } catch (error) {
    console.error('❌ Error getting stats:', error.message);
    res.status(500).json({
      message: 'Failed to get statistics',
      error: error.message,
    });
  }
};
