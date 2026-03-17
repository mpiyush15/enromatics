import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate MCQ questions using OpenAI GPT-4o-mini
 * @param {string} subject - Subject name (e.g., "Mathematics")
 * @param {string} chapter - Chapter name (e.g., "Algebra")
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @param {number} count - Number of questions to generate (default: 5)
 * @returns {Array} Array of generated questions with options
 */
export const generateQuestionsAI = async (subject, chapter, difficulty = 'medium', count = 5) => {
  try {
    console.log(`🤖 Generating ${count} ${difficulty} questions for ${subject} - ${chapter}`);

    const prompt = `You are an expert teacher creating multiple choice questions (MCQs).

Generate ${count} unique MCQ questions for the following:
- Subject: ${subject}
- Chapter: ${chapter}
- Difficulty Level: ${difficulty}

For each question, provide:
1. A clear, well-formatted question
2. Exactly 4 options (A, B, C, D)
3. The correct answer (A, B, C, or D)
4. A brief explanation (2-3 sentences)

Format your response as a valid JSON array with this structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Explanation text here."
  }
]

Only return the JSON array, no additional text.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;
    console.log('✅ OpenAI Response:', content.substring(0, 200) + '...');

    // Parse JSON response
    let questions = JSON.parse(content);

    // Validate and transform
    questions = questions.map((q, index) => ({
      question: q.question,
      options: q.options.map((opt, idx) => ({
        id: String.fromCharCode(65 + idx), // A, B, C, D
        text: opt,
        isCorrect: String.fromCharCode(65 + idx) === q.correctAnswer,
      })),
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty,
      marks: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
      source: 'ai-generated',
    }));

    console.log(`✅ Generated ${questions.length} questions successfully`);
    return questions;
  } catch (error) {
    console.error('❌ Error generating questions:', error.message);
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

/**
 * Generate a lesson explanation using OpenAI
 */
export const generateLessonExplanation = async (subject, chapter, topic) => {
  try {
    const prompt = `Write a clear, concise explanation for teaching the following:
- Subject: ${subject}
- Chapter: ${chapter}
- Topic: ${topic}

Provide:
1. Key concepts (bullet points)
2. Real-world examples
3. Common mistakes students make
4. Practice tips

Keep it suitable for high school level students.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error generating lesson:', error.message);
    throw error;
  }
};

/**
 * Solve a doubt using OpenAI with context
 */
export const solveDoubt = async (doubt, subject, chapter, context = '') => {
  try {
    const prompt = `You are a helpful math and science tutor.

Student's doubt: "${doubt}"
Subject: ${subject}
Chapter: ${chapter}
${context ? `Context: ${context}` : ''}

Provide a clear, step-by-step explanation that:
1. Addresses the specific doubt
2. Breaks down complex concepts
3. Provides examples
4. Suggests similar practice problems`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error solving doubt:', error.message);
    throw error;
  }
};
