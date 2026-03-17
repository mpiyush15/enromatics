import express from 'express';
import Question from '../models/Question.js';
import { generateQuestionsAI } from '../services/aiService.js';
import { generateQuestionsAIMock } from '../services/aiServiceMock.js';
import Subject from '../models/Subject.js';
import Chapter from '../models/Chapter.js';

const router = express.Router();

/**
 * POST /api/questions/generate
 * Generate questions using AI
 */
router.post('/generate', async (req, res) => {
  try {
    const { subjectName, chapterName, difficulty = 'medium', count = 5, tenantId } = req.body;

    console.log('📝 [QUESTION GENERATION] Request received');
    console.log('   - Subject:', subjectName);
    console.log('   - Chapter:', chapterName);
    console.log('   - Difficulty:', difficulty);
    console.log('   - Count:', count);
    console.log('   - TenantId:', tenantId);

    // Validate required fields
    if (!subjectName || !chapterName || !tenantId) {
      return res.status(400).json({
        message: 'Missing required fields: subjectName, chapterName, tenantId',
      });
    }

    // Find subject & chapter
    const subject = await Subject.findOne({ name: subjectName, tenantId });
    const chapter = await Chapter.findOne({ name: chapterName, tenantId });

    if (!subject) {
      console.error('❌ Subject not found:', subjectName);
      return res.status(404).json({ message: `Subject "${subjectName}" not found` });
    }

    if (!chapter) {
      console.error('❌ Chapter not found:', chapterName);
      return res.status(404).json({ message: `Chapter "${chapterName}" not found` });
    }

    console.log('✅ Subject & Chapter verified');

    // Generate questions using AI (with fallback to mock)
    let generatedQuestions;
    try {
      console.log('🚀 Trying OpenAI API...');
      generatedQuestions = await generateQuestionsAI(subjectName, chapterName, difficulty, count);
    } catch (aiError) {
      console.warn('⚠️  OpenAI API failed, using mock data:', aiError.message);
      generatedQuestions = await generateQuestionsAIMock(subjectName, chapterName, difficulty, count);
    }

    console.log(`✅ Generated ${generatedQuestions.length} questions`);

    // Save questions to database
    const questionsWithMetadata = generatedQuestions.map((q) => ({
      ...q,
      tenantId,
      subjectId: subject._id,
      chapterId: chapter._id,
      generatedBy: {
        userId: req.userId || 'system',
        timestamp: new Date(),
        model: 'gpt-4o-mini',
      },
    }));

    const savedQuestions = await Question.insertMany(questionsWithMetadata);

    console.log(`✅ Saved ${savedQuestions.length} questions to database`);

    res.status(201).json({
      message: `✅ Generated and saved ${savedQuestions.length} questions`,
      count: savedQuestions.length,
      questions: savedQuestions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        marks: q.marks,
      })),
    });
  } catch (error) {
    console.error('❌ [QUESTION GENERATION] ERROR:', error.message);
    res.status(500).json({
      message: 'Failed to generate questions',
      error: error.message,
    });
  }
});

/**
 * GET /api/questions
 * Get questions by chapter
 */
router.get('/', async (req, res) => {
  try {
    const { tenantId, chapterId, difficulty, limit = 10 } = req.query;

    console.log('📖 Fetching questions');

    const filter = { tenantId };
    if (chapterId) filter.chapterId = chapterId;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await Question.find(filter).limit(parseInt(limit)).exec();

    res.json({
      count: questions.length,
      questions: questions.map((q) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        marks: q.marks,
        source: q.source,
      })),
    });
  } catch (error) {
    console.error('❌ Error fetching questions:', error.message);
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
});

/**
 * GET /api/questions/:id
 * Get single question with explanation
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({
      _id: question._id,
      question: question.question,
      options: question.options,
      difficulty: question.difficulty,
      marks: question.marks,
      explanation: question.explanation,
      source: question.source,
    });
  } catch (error) {
    console.error('❌ Error fetching question:', error.message);
    res.status(500).json({ message: 'Failed to fetch question', error: error.message });
  }
});

export default router;
