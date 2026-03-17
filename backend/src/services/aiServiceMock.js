/**
 * Mock AI Service for testing (when OpenAI quota exceeded)
 * This generates realistic-looking questions for demonstration
 */

const mockQuestions = {
  'Mathematics-Algebra': [
    {
      question: 'If 2x + 5 = 13, what is the value of x?',
      options: [
        { id: 'a', text: '3', isCorrect: false },
        { id: 'b', text: '4', isCorrect: true },
        { id: 'c', text: '5', isCorrect: false },
        { id: 'd', text: '6', isCorrect: false },
      ],
      correctAnswer: '4',
      explanation: '2x + 5 = 13 → 2x = 8 → x = 4. This is a simple linear equation solved using basic algebra rules.',
    },
    {
      question: 'What is the product of (x+2)(x-3)?',
      options: [
        { id: 'a', text: 'x² - x - 6', isCorrect: true },
        { id: 'b', text: 'x² + x - 6', isCorrect: false },
        { id: 'c', text: 'x² - 5x - 6', isCorrect: false },
        { id: 'd', text: 'x² + 5x + 6', isCorrect: false },
      ],
      correctAnswer: 'x² - x - 6',
      explanation: 'Using FOIL: x·x + x·(-3) + 2·x + 2·(-3) = x² - 3x + 2x - 6 = x² - x - 6',
    },
    {
      question: 'Simplify: 3(x+2) - 2(x-1)',
      options: [
        { id: 'a', text: 'x + 4', isCorrect: false },
        { id: 'b', text: 'x + 8', isCorrect: true },
        { id: 'c', text: '2x + 2', isCorrect: false },
        { id: 'd', text: '3x + 3', isCorrect: false },
      ],
      correctAnswer: 'x + 8',
      explanation: '3(x+2) - 2(x-1) = 3x + 6 - 2x + 2 = x + 8',
    },
  ],
  'Physics-Mechanics': [
    {
      question: 'What is the SI unit of force?',
      options: [
        { id: 'a', text: 'Kilogram', isCorrect: false },
        { id: 'b', text: 'Newton', isCorrect: true },
        { id: 'c', text: 'Joule', isCorrect: false },
        { id: 'd', text: 'Watt', isCorrect: false },
      ],
      correctAnswer: 'Newton',
      explanation: 'Newton (N) is the SI unit of force. 1 N = 1 kg·m/s²',
    },
  ],
  'Chemistry-Organic Chemistry': [
    {
      question: 'What is the general formula for alkanes?',
      options: [
        { id: 'a', text: 'CnH2n', isCorrect: false },
        { id: 'b', text: 'CnH2n+2', isCorrect: true },
        { id: 'c', text: 'CnHn', isCorrect: false },
        { id: 'd', text: 'CnH2n-2', isCorrect: false },
      ],
      correctAnswer: 'CnH2n+2',
      explanation: 'Alkanes are saturated hydrocarbons with the general formula CnH(2n+2), where n is the number of carbon atoms.',
    },
  ],
};

export const generateQuestionsAIMock = async (subject, chapter, difficulty = 'medium', count = 5) => {
  const key = `${subject}-${chapter}`;
  const baseQuestions = mockQuestions[key] || mockQuestions['Mathematics-Algebra'];

  // Generate more questions by cycling through base questions
  const generated = [];
  for (let i = 0; i < count; i++) {
    const baseQ = baseQuestions[i % baseQuestions.length];
    generated.push({
      question: baseQ.question,
      options: baseQ.options,
      correctAnswer: baseQ.correctAnswer,
      explanation: baseQ.explanation,
    });
  }

  return generated;
};

export const answerDoubtAIMock = async (doubt, subject, chapter) => {
  const doubtAnswers = {
    algebra: 'In algebra, we solve equations by isolating the variable. For example, if 2x + 3 = 7, we subtract 3 from both sides to get 2x = 4, then divide by 2 to get x = 2.',
    physics: 'Force is defined as mass times acceleration (F = ma). It is a vector quantity, meaning it has both magnitude and direction.',
    chemistry: 'Chemical bonding occurs when atoms share or transfer electrons. The three main types are ionic, covalent, and metallic bonds.',
  };

  for (const [key, answer] of Object.entries(doubtAnswers)) {
    if (doubt.toLowerCase().includes(key)) {
      return answer;
    }
  }

  return `Great question about ${subject}! ${chapter} is an important topic. Remember to focus on the fundamentals and practice problems regularly.`;
};
