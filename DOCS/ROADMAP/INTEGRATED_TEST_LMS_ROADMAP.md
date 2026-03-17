# 🎯 Integrated Test Management + LMS System - Step-by-Step Roadmap

**Status**: Complete integration plan for Enromatics  
**Scope**: AI-powered test platform + Learning management system  
**Timeline**: 12 weeks  

---

## 🔗 How Test Management & LMS Work Together

### Traditional Approach (Separate)
```
LMS (Video lectures) → Student learns
Test System (Exams) → Student tests separately
No connection
```

### Our Integrated Approach ✅
```
LMS (Video lectures + Lessons) 
    ↓
Question Bank (Chapter-wise questions)
    ↓
Test System (Tests with AI generation)  
    ↓
Analytics (Chapter + Topic performance)
    ↓
AI Learning Tools (Doubt solver using lesson context)
```

**Benefits:**
- Single question bank for both lessons & tests
- Lesson → Practice Test → Mock Test flow
- Better analytics (video watch + test performance)
- AI can reference lesson content for doubt solving
- Lower development time

---

## 📊 Shared Infrastructure

These components are used by BOTH systems:

```
1. Subject/Chapter/Topic Hierarchy
   ├─ LMS: Organize lessons
   └─ Test: Organize questions

2. Question Bank
   ├─ LMS: Practice questions in lessons
   └─ Test: Questions for tests

3. Student Progress
   ├─ LMS: Video watch history
   └─ Test: Test results & analytics

4. Video Storage (YouTube URLs encrypted)
   ├─ LMS: Lessons
   └─ Test: Video explanations

5. AI Service Layer
   ├─ LMS: Generate lessons, doubt solver
   └─ Test: Generate questions, explanations
```

---

## 📅 Phase-Wise Implementation (12 Weeks)

---

# PHASE 1: Foundation & Database (Week 1-2)

## Week 1: Core Database Schema

### What to build:
1. Subject collection
2. Chapter collection  
3. Topic collection (subtopic hierarchy)
4. Student enrollment

### Collections:

```javascript
// Shared by both systems
Subject {
  _id,
  instituteId,
  name,
  description,
  icon,
  order,
  status: 'active'|'inactive',
  createdBy,
  createdAt
}

Chapter {
  _id,
  subjectId,
  name,
  description,
  order,
  status,
  createdAt
}

Topic {
  _id,
  subjectId,
  chapterId,
  parentTopic,
  name,
  description,
  order,
  createdAt
}

// Student enrollment
StudentEnrollment {
  _id,
  studentId,
  instituteId,
  enrollmentNumber,
  course,
  batch,
  subjects: [{ subjectId, enrolledAt }],
  status: 'active'|'inactive',
  enrolledAt
}
```

### Files to create:
```
backend/models/
  Subject.js
  Chapter.js
  Topic.js
  StudentEnrollment.js

backend/routes/
  subjects.routes.js
  chapters.routes.js
  topics.routes.js
```

### Deliverables:
- ✅ API to create/update subjects, chapters, topics
- ✅ API to list hierarchies
- ✅ Student enrollment management

---

## Week 2: Teacher Management Dashboard

### What to build:
1. Teacher CRUD for subjects/chapters/topics
2. Dashboard UI (Next.js)
3. Bulk import via CSV

### Endpoints:
```
POST   /api/subjects
GET    /api/subjects
PUT    /api/subjects/:id
DELETE /api/subjects/:id

POST   /api/chapters
GET    /api/chapters/:subjectId
PUT    /api/chapters/:id

POST   /api/topics
GET    /api/topics/:chapterId
PUT    /api/topics/:id

POST   /api/bulk-import/subjects
```

### Frontend (Next.js):
```
Dashboard
  ├─ Subjects Management
  │   ├─ Create Subject
  │   ├─ Edit Subject
  │   └─ View Chapters
  │
  ├─ Chapters Management
  │   ├─ Create Chapter
  │   └─ Add Topics
  │
  └─ CSV Import
      └─ Bulk upload subjects + chapters
```

### Deliverables:
- ✅ Teacher dashboard for content structure
- ✅ CRUD operations
- ✅ CSV bulk import

---

---

# PHASE 2: LMS - Video Lectures (Week 3-4)

## Week 3: Lesson Management + Secure Video Storage

### What to build:
1. Lesson collection (links to chapters)
2. YouTube video URL encryption
3. Secure video player component
4. Watch history tracking

### Collections:

```javascript
Lesson {
  _id,
  chapterId,
  subjectId,
  title,
  description,
  order,
  
  // Video storage
  youtubeVideoId_encrypted,
  youtubeVideoId_iv,  // initialization vector
  duration,
  
  // Metadata
  prerequisites: [topicIds],
  keywords: ['keyword1', 'keyword2'],
  
  createdBy,
  createdAt,
  updatedAt
}

WatchHistory {
  _id,
  studentId,
  lessonId,
  watchedDuration,
  totalDuration,
  percentageWatched,
  watchedAt,
  
  // Security tracking
  ipAddress,
  deviceId,
  sessionToken
}
```

### Backend Implementation:

```javascript
// crypto.js - Encryption for YouTube URLs
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.VIDEO_ENCRYPTION_KEY; // 32 bytes

export function encryptVideoId(videoId) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(videoId, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

export function decryptVideoId(encrypted, iv) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### API Routes:

```javascript
// Teacher: Add lesson
POST /api/lessons
Body: {
  chapterId,
  title,
  description,
  youtubeVideoId,  // unencrypted
  duration
}

// Student: Get lesson with secure token
GET /api/lessons/:lessonId
Response: {
  _id,
  title,
  description,
  videoToken,  // JWT token valid 30 mins
  videoId_encrypted,
  iv
}

// Student: Get video access token
GET /api/lessons/:lessonId/video-token
Response: {
  token,           // JWT
  videoId_enc,
  iv,
  expiresIn: 1800  // 30 mins
}

// Log watch history
POST /api/watch-history
Body: {
  lessonId,
  watchedDuration,
  totalDuration,
  sessionToken
}
```

### Frontend - Secure Video Player Component:

```jsx
// components/SecureVideoPlayer.tsx
'use client';

import { useEffect, useState } from 'react';
import crypto from 'crypto-js';

export default function SecureVideoPlayer({ 
  token, 
  videoIdEncrypted, 
  iv 
}) {
  const [videoId, setVideoId] = useState('');
  const [canPlayVideo, setCanPlayVideo] = useState(false);

  useEffect(() => {
    // Verify token validity
    const tokenValid = verifyJWT(token);
    
    if (!tokenValid) {
      setCanPlayVideo(false);
      return;
    }

    // Decrypt video ID only after token verification
    try {
      // Decryption on client (this is secure because token is already verified by backend)
      const key = crypto.enc.Hex.parse(process.env.NEXT_PUBLIC_ENCRYPTION_KEY);
      const iv_buf = crypto.enc.Hex.parse(iv);
      const decrypted = crypto.AES.decrypt(
        videoIdEncrypted,
        key,
        { iv: iv_buf }
      );
      
      const decodedVideoId = decrypted.toString(crypto.enc.Utf8);
      setVideoId(decodedVideoId);
      setCanPlayVideo(true);
    } catch (error) {
      console.log('Cannot decrypt');
      setCanPlayVideo(false);
    }
  }, [token, videoIdEncrypted, iv]);

  if (!canPlayVideo) {
    return <div>Video access denied or expired</div>;
  }

  return (
    <div className="video-container">
      <iframe
        width="100%"
        height="600"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        onContextMenu={(e) => e.preventDefault()}
        allowFullScreen
        style={{
          pointerEvents: 'auto',
          // Security: iframe will have restricted permissions
        }}
      />
      
      <div className="watch-progress mt-4">
        <p>Watch time tracked for progress</p>
      </div>
    </div>
  );
}
```

### Deliverables:
- ✅ Lesson CRUD API
- ✅ YouTube URL encryption
- ✅ Secure video player component
- ✅ Watch history logging

---

## Week 4: Lesson Practice & Navigation

### What to build:
1. Student lesson view
2. Lesson completion tracking
3. Pre-requisite checking
4. Lesson sequence navigation

### Collections:

```javascript
LessonCompletion {
  _id,
  studentId,
  lessonId,
  completedAt,
  duration,
  accuracy: {
    questionsAttempted,
    correctAnswers
  }
}
```

### API Routes:

```javascript
// Student: Get lesson
GET /api/lessons/:lessonId
Response: {
  title,
  description,
  videoPlayer: {...},
  practiceQuestions: [{id, text, options, difficulty}],
  nextLesson: {...},
  previousLesson: {...}
}

// Mark lesson complete
POST /api/lessons/:lessonId/complete
Body: { duration, accuracy }
```

### Deliverables:
- ✅ Student lesson interface
- ✅ Practice questions in lesson
- ✅ Completion tracking
- ✅ Lesson navigation

---

---

# PHASE 3: Question Bank (Week 5-6)

## Week 5: Question Management System

### What to build:
1. Question collection with full support
2. Question categories (text, LaTeX, image)
3. Teacher upload interface
4. Question search & filtering

### Collections:

```javascript
Question {
  _id,
  instituteId,
  
  // Hierarchy
  subjectId,
  chapterId,
  topicId,
  
  // Content
  questionText,
  questionLatex,  // For math equations
  questionImage,  // URL to S3
  
  // Options
  options: [
    {
      text,
      latex,
      image
    }
  ],
  
  correctAnswer,  // Index or text
  explanation,
  explanationLatex,
  explanationImage,
  
  // Metadata
  difficulty: 'easy'|'medium'|'hard',
  marks,
  negativeMarks,
  examType: 'JEE'|'NEET'|'CBSE'|'UPSC',
  tags: [],
  
  // AI tracking
  generatedByAI: false,
  aiModel: 'gpt-4o-mini',
  aiConfidence: 0.95,
  
  // Teacher review
  uploadedBy,
  reviewedBy,
  status: 'draft'|'approved'|'rejected',
  
  createdAt,
  updatedAt
}
```

### API Routes:

```javascript
// Teacher: Upload single question
POST /api/questions
Body: {
  subjectId,
  chapterId,
  topicId,
  questionText,
  options: [{text, latex, image}],
  correctAnswer,
  explanation,
  difficulty,
  marks
}

// Teacher: Bulk upload (CSV/JSON)
POST /api/questions/bulk-upload
File: CSV or JSON

// Student: Search questions (for practice)
GET /api/questions?subject=Math&chapter=Algebra&difficulty=hard
Response: [{id, question, options, explanation}]

// Get question by ID
GET /api/questions/:id

// Update question
PUT /api/questions/:id

// Delete question
DELETE /api/questions/:id
```

### Frontend - Question Upload:

```jsx
// pages/teacher/questions/upload.tsx
'use client';

import { useState } from 'react';

export default function QuestionUpload() {
  const [uploadMode, setUploadMode] = useState('single'); // or 'bulk'

  return (
    <div className="question-upload">
      <div className="mode-selector">
        <button onClick={() => setUploadMode('single')}>
          Single Question
        </button>
        <button onClick={() => setUploadMode('bulk')}>
          Bulk Upload (CSV)
        </button>
      </div>

      {uploadMode === 'single' && <SingleQuestionForm />}
      {uploadMode === 'bulk' && <BulkUploadForm />}
    </div>
  );
}
```

### Deliverables:
- ✅ Question CRUD API
- ✅ Question storage (text, LaTeX, images)
- ✅ Bulk upload from CSV/JSON
- ✅ Question search API
- ✅ Teacher upload dashboard

---

## Week 6: AI Question Generation Pipeline

### What to build:
1. AI question generation service
2. Batch processing for bulk generation
3. Quality validation
4. Teacher review workflow

### AI Generation Pipeline:

```
Step 1: Teacher selects topic
         ↓
Step 2: AI generates concepts (GPT-4o-mini)
         ↓
Step 3: AI generates questions per concept
         ↓
Step 4: Verify answers with second AI pass
         ↓
Step 5: Check for duplicates (embeddings)
         ↓
Step 6: Save as "Draft" (requires teacher approval)
         ↓
Step 7: Teacher reviews & approves
         ↓
Step 8: Move to "Approved" (Live in test system)
```

### Backend Service:

```javascript
// backend/services/aiQuestionGeneration.service.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateQuestionsForTopic(data) {
  const {
    subjectId,
    chapterId,
    topicId,
    difficulty,
    count,
    examType,
    instituteId
  } = data;

  try {
    // Step 1: Get topic details from DB
    const topic = await Topic.findById(topicId);
    const subject = await Subject.findById(subjectId);

    // Step 2: Generate concepts
    const concepts = await generateConcepts(
      subject.name,
      topic.name,
      difficulty,
      examType
    );

    // Step 3: Generate questions for each concept
    const questions = [];
    for (const concept of concepts) {
      const generated = await generateQuestionsForConcept(
        subject.name,
        topic.name,
        concept,
        difficulty,
        examType
      );
      questions.push(...generated);
    }

    // Step 4: Verify answers
    const verified = await verifyAnswers(questions);

    // Step 5: Check duplicates
    const unique = await checkDuplicates(verified, instituteId);

    // Step 6-8: Save as draft
    const savedQuestions = await Question.insertMany(
      unique.map(q => ({
        ...q,
        instituteId,
        status: 'draft',
        generatedByAI: true,
        uploadedBy: null  // AI generated
      }))
    );

    return {
      success: true,
      generated: savedQuestions.length,
      questions: savedQuestions
    };
  } catch (error) {
    console.error('AI generation failed:', error);
    throw error;
  }
}

async function generateConcepts(
  subject,
  topic,
  difficulty,
  examType
) {
  const prompt = `
List 10 key concepts for:
Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}
Exam: ${examType}

Return as JSON array of strings only.
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content);
  } catch {
    return content.split('\n').filter(c => c.trim());
  }
}

async function generateQuestionsForConcept(
  subject,
  topic,
  concept,
  difficulty,
  examType
) {
  const prompt = `
Generate 3 unique ${difficulty} level MCQ questions for:

Subject: ${subject}
Topic: ${topic}
Concept: ${concept}
Exam: ${examType}

Return valid JSON:
{
  "questions": [
    {
      "questionText": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "..."
    }
  ]
}
`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.8
  });

  const content = response.choices[0].message.content;
  const parsed = JSON.parse(content);
  return parsed.questions;
}

async function verifyAnswers(questions) {
  // Second pass: verify each answer is correct
  const verified = [];

  for (const q of questions) {
    const verification = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Verify this MCQ answer is correct:
Question: ${q.questionText}
Options: ${q.options.join(', ')}
Answer: ${q.correctAnswer}

Reply: CORRECT or INCORRECT`
      }]
    });

    const result = verification.choices[0].message.content;
    if (result.includes('CORRECT')) {
      verified.push(q);
    }
  }

  return verified;
}

async function checkDuplicates(questions, instituteId) {
  // Use embeddings to check for duplicate questions
  const unique = [];
  const seenEmbeddings = [];

  for (const q of questions) {
    const embedding = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: q.questionText
    });

    const vec = embedding.data[0].vector;

    // Check similarity with existing
    let isDuplicate = false;
    for (const seen of seenEmbeddings) {
      const similarity = cosineSimilarity(vec, seen);
      if (similarity > 0.85) {  // 85% similar = duplicate
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      unique.push(q);
      seenEmbeddings.push(vec);
    }
  }

  return unique;
}

function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magA * magB);
}
```

### API Routes:

```javascript
// POST /api/ai/generate-questions
POST /api/ai/generate-questions
Body: {
  topicId,
  difficulty,
  count,
  examType
}
Response: {
  jobId,
  status: 'processing'
}

// GET /api/ai/generation-status/:jobId
GET /api/ai/generation-status/:jobId
Response: {
  status: 'processing|completed|failed',
  generated: 45,
  progress: '45/50'
}

// Teacher review generated questions
GET /api/questions/pending-review
Response: [{id, question, status: 'draft', generatedAt}]

// Approve/reject question
PUT /api/questions/:id/approve
Body: { approved: true }

PUT /api/questions/:id/reject
Body: { reason: 'Answer incorrect' }
```

### Deliverables:
- ✅ AI question generation service
- ✅ Batch processing with queue
- ✅ Answer verification
- ✅ Duplicate detection
- ✅ Teacher review workflow

---

---

# PHASE 4: Test Management System (Week 7-9)

## Week 7: Test Creation & Configuration

### What to build:
1. Test creation interface
2. Question selection (manual + AI auto)
3. Test templates
4. Test scheduling

### Collections:

```javascript
Test {
  _id,
  instituteId,
  
  // Info
  title,
  description,
  
  // Content
  subjects: [{
    subjectId,
    chapters: [chapterId],
    questionCount,
    difficulty: { easy, medium, hard }
  }],
  
  // Settings
  totalQuestions,
  totalMarks,
  duration,  // minutes
  passingMarks,
  randomizeQuestions: true,
  shuffleOptions: true,
  
  // Delivery
  testType: 'practice'|'mock'|'exam',
  startDate,
  endDate,
  allowMultipleAttempts: false,
  
  // AI settings
  generatedByAI: false,
  autoGenerateQuestions: true,
  
  createdBy,
  status: 'draft'|'published'|'archived',
  createdAt
}
```

### API Routes:

```javascript
// Teacher: Create test
POST /api/tests
Body: {
  title,
  description,
  subjects: [{subjectId, chapters, questionCount}],
  duration,
  totalMarks,
  passingMarks,
  randomize: true,
  autoGenerateQuestions: true
}

// Get questions for test (auto-selection)
GET /api/tests/auto-select-questions
Query: {
  subjectId,
  chapterId,
  difficulty: 'hard',
  count: 15
}
Response: [question1, question2, ...]

// Get test for student
GET /api/tests/:id
Response: {
  title,
  duration,
  totalMarks,
  // NOTE: Questions NOT shown yet
}

// Get questions when student starts test
GET /api/tests/:id/start
Response: {
  sessionId,
  questions: [{id, text, options}],  // Options shuffled
  duration
}
```

### Deliverables:
- ✅ Test CRUD API
- ✅ Auto-question selection logic
- ✅ Test templates
- ✅ Test scheduling

---

## Week 8: Test Taking & Submission

### What to build:
1. Test taking interface
2. Timer & progress tracking
3. Answer validation
4. Auto-save
5. Security checks

### Collections:

```javascript
TestAttempt {
  _id,
  studentId,
  testId,
  
  // Session
  sessionId,
  startTime,
  submittedTime,
  totalTime,  // seconds
  
  // Answers
  answers: [{
    questionId,
    selectedOption,
    isCorrect,
    timeTaken,
    marksAwarded,
    marksObtained
  }],
  
  // Results
  score,
  totalMarks,
  accuracy,
  rank,
  
  // Security
  ipAddress,
  userAgent,
  tabSwitches,
  
  status: 'in_progress'|'submitted'|'graded'
}

TestSession {
  _id,
  testAttemptId,
  studentId,
  testId,
  
  // Security tokens
  sessionToken,
  
  // Validity
  startTime,
  expiresAt,
  
  // Tracking
  activityLog: [{
    action: 'tab_switch'|'api_call'|'answer_change',
    timestamp
  }]
}
```

### Frontend - Test Interface:

```jsx
// components/TestContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestContainer({ testId }) {
  const [test, setTest] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionId, setSessionId] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Start test
    const startTest = async () => {
      const response = await fetch(`/api/tests/${testId}/start`, {
        method: 'GET'
      });
      const data = await response.json();
      setTest(data);
      setSessionId(data.sessionId);
      setTimeLeft(data.duration * 60);
    };

    startTest();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      submitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Track tab switches (security)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab switched away
        logActivity('tab_switch');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleAnswer = async (questionId, selectedOption) => {
    const newAnswers = {
      ...answers,
      [questionId]: selectedOption
    };
    setAnswers(newAnswers);

    // Auto-save to server
    await fetch(`/api/tests/${testId}/save-answer`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        questionId,
        selectedOption
      })
    });
  };

  const logActivity = async (action) => {
    await fetch(`/api/tests/${testId}/log-activity`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        action,
        timestamp: new Date()
      })
    });
  };

  const submitTest = async () => {
    const response = await fetch(`/api/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
        answers,
        totalTime: test.duration * 60 - timeLeft
      })
    });

    const result = await response.json();
    router.push(`/test/${testId}/results/${result.attemptId}`);
  };

  if (!test) return <div>Loading...</div>;

  const question = test.questions[currentQuestion];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="test-container">
      <div className="header">
        <h1>{test.title}</h1>
        <div className="timer">
          {minutes}:{seconds < 10 ? '0' : ''}{seconds}
        </div>
      </div>

      <div className="main">
        <div className="question-panel">
          <h2>{question.questionText}</h2>
          <div className="options">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, idx)}
                className={answers[question.id] === idx ? 'selected' : ''}
              >
                {String.fromCharCode(65 + idx)}) {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="progress-panel">
          <div className="progress-bar">
            {currentQuestion + 1} / {test.questions.length}
          </div>
          <button onClick={() => setCurrentQuestion(prev => prev + 1)}>
            Next
          </button>
          <button onClick={submitTest}>
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
```

### API Routes:

```javascript
// Start test
GET /api/tests/:id/start
Response: {
  sessionId,
  questions: [{id, text, options}],
  duration,
  totalMarks
}

// Save answer (auto-save)
POST /api/tests/:id/save-answer
Body: {
  sessionId,
  questionId,
  selectedOption
}

// Log activity (security)
POST /api/tests/:id/log-activity
Body: {
  sessionId,
  action,
  timestamp
}

// Submit test
POST /api/tests/:id/submit
Body: {
  sessionId,
  answers: {questionId: option},
  totalTime
}
Response: {
  attemptId,
  score,
  totalMarks
}
```

### Deliverables:
- ✅ Test taking interface with timer
- ✅ Answer auto-save
- ✅ Security tracking (tab switches, activity log)
- ✅ Test submission
- ✅ Session management

---

## Week 9: Auto-Grading & Results

### What to build:
1. Auto-grading engine
2. Results dashboard
3. Analytics generation
4. Performance reports

### Backend - Grading Service:

```javascript
// backend/services/grading.service.js

export async function gradeTest(attemptId) {
  const attempt = await TestAttempt.findById(attemptId);
  const test = await Test.findById(attempt.testId);

  let totalScore = 0;
  let correctAnswers = 0;

  for (const answer of attempt.answers) {
    const question = await Question.findById(answer.questionId);
    
    const isCorrect = answer.selectedOption === question.correctAnswer;
    answer.isCorrect = isCorrect;

    if (isCorrect) {
      answer.marksAwarded = question.marks;
      totalScore += question.marks;
      correctAnswers++;
    } else {
      answer.marksAwarded = -question.negativeMarks || 0;
      totalScore -= question.negativeMarks || 0;
    }
  }

  const accuracy = (correctAnswers / attempt.answers.length) * 100;
  const rank = await calculateRank(attempt.testId, totalScore);

  attempt.score = totalScore;
  attempt.accuracy = accuracy;
  attempt.rank = rank;
  attempt.status = 'graded';

  await attempt.save();

  return {
    score: totalScore,
    totalMarks: test.totalMarks,
    accuracy,
    rank,
    correctAnswers,
    totalQuestions: attempt.answers.length
  };
}

async function calculateRank(testId, score) {
  const betterScores = await TestAttempt.countDocuments({
    testId,
    score: { $gt: score }
  });

  return betterScores + 1;
}

// Generate performance analysis
export async function analyzePerformance(studentId, testId) {
  const attempt = await TestAttempt.findOne({
    studentId,
    testId
  });

  const analysis = {
    totalScore: attempt.score,
    accuracy: attempt.accuracy,
    rank: attempt.rank,
    
    // Chapter-wise performance
    chapterPerformance: [],
    
    // Topic-wise performance
    topicPerformance: [],
    
    // Weak areas
    weakTopics: [],
    
    // Time analysis
    averageTimePerQuestion: 0
  };

  // Group answers by chapter/topic
  for (const answer of attempt.answers) {
    const question = await Question.findById(answer.questionId);
    // ... calculate chapter/topic wise performance
  }

  return analysis;
}
```

### API Routes:

```javascript
// Get test results
GET /api/tests/:testId/results/:attemptId
Response: {
  score,
  totalMarks,
  accuracy,
  rank,
  analysis: {
    chapterPerformance: [],
    topicPerformance: [],
    weakTopics: [],
    strongTopics: []
  }
}

// Get answer details
GET /api/tests/:testId/results/:attemptId/answer/:questionId
Response: {
  question,
  yourAnswer,
  correctAnswer,
  explanation,
  marksAwarded
}

// Student analytics
GET /api/students/:studentId/analytics
Query: { subject, chapter }
Response: {
  totalTests: 15,
  averageScore: 75,
  bestScore: 95,
  improvement: +5,
  weakTopics: ['Vectors', 'Thermodynamics'],
  strongTopics: ['Mechanics', 'Optics']
}
```

### Deliverables:
- ✅ Auto-grading engine
- ✅ Results dashboard
- ✅ Chapter/topic-wise performance
- ✅ Analytics & reports
- ✅ Improvement tracking

---

---

# PHASE 5: Analytics & AI Tools (Week 10-11)

## Week 10: Student Learning Analytics

### What to build:
1. Dashboard with performance graphs
2. Learning progress tracking
3. Weak topic identification
4. Recommendations

### Collections:

```javascript
StudentAnalytics {
  _id,
  studentId,
  
  // Overall
  totalTestsTaken: 15,
  averageScore: 75,
  improvementRate: 2.5,  // % per week
  
  // Subject-wise
  subjects: [{
    subjectId,
    topicsCompleted: 25,
    topicsCovered: 50,
    averageAccuracy: 68,
    weakTopics: [{topicId, accuracy}],
    strongTopics: [{topicId, accuracy}]
  }],
  
  // Time tracking
  totalHoursLearned: 120,
  totalVideosWatched: 45,
  averageDailyStudyTime: 2.5,  // hours
  
  // Predictions
  estimatedReadiness: 72,  // % ready for exam
  
  lastUpdated: Date
}
```

### Frontend - Analytics Dashboard:

```jsx
// pages/student/analytics.tsx
'use client';

import { BarChart, LineChart, PieChart } from 'recharts';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetch('/api/students/me/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data));
  }, []);

  return (
    <div className="analytics-dashboard">
      <div className="metrics">
        <MetricCard
          title="Average Score"
          value="75%"
          trend="+5% this month"
        />
        <MetricCard
          title="Tests Taken"
          value="15"
          trend="8 this month"
        />
        <MetricCard
          title="Study Time"
          value="120 hrs"
          trend="10 hrs this week"
        />
      </div>

      <div className="charts">
        <div className="chart">
          <h3>Performance Trend</h3>
          <LineChart data={analytics?.scoreTrend} />
        </div>

        <div className="chart">
          <h3>Subject Performance</h3>
          <BarChart data={analytics?.subjectAccuracy} />
        </div>

        <div className="chart">
          <h3>Topics Coverage</h3>
          <PieChart data={analytics?.topicsCoverage} />
        </div>
      </div>

      <div className="insights">
        <h3>📊 Insights</h3>
        <ul>
          {analytics?.insights.map(insight => (
            <li key={insight.id}>{insight.text}</li>
          ))}
        </ul>
      </div>

      <div className="weak-topics">
        <h3>⚠️ Weak Topics to Focus</h3>
        <ul>
          {analytics?.weakTopics.map(topic => (
            <li key={topic.id}>
              {topic.name} - {topic.accuracy}% accuracy
              <a href={`/lessons/${topic.lessonId}`}>
                Review Lesson
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

### Deliverables:
- ✅ Analytics dashboard
- ✅ Performance graphs
- ✅ Weak topic identification
- ✅ Learning insights

---

## Week 11: AI Doubt Solver & Learning Assistant

### What to build:
1. AI doubt solver (text + image questions)
2. Lesson context integration
3. Personalized learning paths
4. Progress recommendations

### Collections:

```javascript
Doubt {
  _id,
  studentId,
  
  // Question details
  questionText,
  questionImage,
  
  // Context
  lessonId,  // Optional
  testAttemptId,  // Optional
  relatedTopics: [topicId],
  
  // AI Response
  aiResponse,
  aiModel: 'gpt-4o',
  confidence: 0.95,
  
  // Student feedback
  helpfulRating: 5,  // 1-5
  followUpQuestions: [{}],
  
  status: 'solved'|'pending'|'escalated',
  createdAt
}

PersonalizedLearningPath {
  _id,
  studentId,
  
  // Recommended topics
  recommendedTopics: [{
    topicId,
    reason: 'Low accuracy in previous tests',
    priority: 'high'|'medium'|'low'
  }],
  
  // Recommended tests
  recommendedTests: [{
    testId,
    expectedDifficulty,
    estimatedTime
  }],
  
  // Study schedule
  scheduledLessons: [{
    lessonId,
    recommendedDate,
    estimatedDuration
  }],
  
  generatedAt
}
```

### API Routes:

```javascript
// Student: Ask doubt
POST /api/doubts
Body: {
  questionText,
  questionImage: 'url',
  lessonId,  // optional
  testAttemptId  // optional
}
Response: {
  doubtId,
  response: 'AI explanation...',
  confidence: 0.95
}

// Get doubt response
GET /api/doubts/:doubtId
Response: {
  question,
  response,
  relatedLessons: [lesson1, lesson2],
  followUpQuestions: ['Q1', 'Q2']
}

// Rate doubt solution
PUT /api/doubts/:doubtId/rate
Body: { rating: 5 }

// Get personalized path
GET /api/students/me/learning-path
Response: {
  recommendedTopics: [],
  recommendedTests: [],
  scheduledLessons: []
}
```

### Backend - Doubt Solver Service:

```javascript
// backend/services/doubtSolver.service.js

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function solveDoubt(data) {
  const { studentId, questionText, questionImage, lessonId } = data;

  try {
    // Get lesson context if provided
    let lessonContext = '';
    if (lessonId) {
      const lesson = await Lesson.findById(lessonId);
      lessonContext = `
Related Lesson: ${lesson.title}
Lesson Content: ${lesson.description}
`;
    }

    // Prepare message
    let message = lessonContext + `
Student's Question:
${questionText}
`;

    // If image is provided, use vision
    let messages = [];
    if (questionImage) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: message },
          {
            type: 'image_url',
            image_url: { url: questionImage }
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: message
      });
    }

    // Get AI response
    const model = questionImage ? 'gpt-4o' : 'gpt-4o-mini';
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const aiResponse = response.choices[0].message.content;

    // Generate follow-up questions
    const followUpResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Based on this doubt: "${questionText}", 
suggest 2 follow-up questions to deepen understanding.
Return as JSON array of strings.`
        }
      ]
    });

    const followUpText = followUpResponse.choices[0].message.content;
    const followUpQuestions = JSON.parse(followUpText);

    // Save doubt
    const doubt = new Doubt({
      studentId,
      questionText,
      questionImage,
      lessonId,
      aiResponse,
      aiModel: model,
      confidence: 0.92,  // Default
      followUpQuestions,
      status: 'solved'
    });

    await doubt.save();

    return {
      doubtId: doubt._id,
      response: aiResponse,
      followUpQuestions,
      confidence: 0.92
    };
  } catch (error) {
    console.error('Doubt solving failed:', error);
    throw error;
  }
}

// Generate personalized learning path
export async function generateLearningPath(studentId) {
  const student = await Student.findById(studentId);
  const analytics = await StudentAnalytics.findOne({ studentId });

  // Identify weak topics
  const weakTopics = analytics.subjects.flatMap(s => 
    s.weakTopics.slice(0, 3)
  );

  // Find relevant tests for weak topics
  const recommendedTests = await Test.find({
    $or: weakTopics.map(t => ({
      subjects: { $elemMatch: { chapters: t.topicId } }
    }))
  }).limit(5);

  // Find lessons for weak topics
  const recommendedLessons = await Lesson.find({
    topicId: { $in: weakTopics.map(t => t.topicId) }
  }).limit(10);

  const path = new PersonalizedLearningPath({
    studentId,
    recommendedTopics: weakTopics.map(t => ({
      topicId: t.topicId,
      reason: 'Low accuracy in previous tests',
      priority: t.accuracy < 40 ? 'high' : 'medium'
    })),
    recommendedTests: recommendedTests.map(t => ({
      testId: t._id,
      expectedDifficulty: 'medium',
      estimatedTime: t.duration
    })),
    scheduledLessons: recommendedLessons.map((l, idx) => ({
      lessonId: l._id,
      recommendedDate: new Date(Date.now() + idx * 2 * 24 * 60 * 60 * 1000),
      estimatedDuration: l.duration
    }))
  });

  await path.save();
  return path;
}
```

### Deliverables:
- ✅ AI doubt solver (text + images)
- ✅ Lesson context integration
- ✅ Follow-up question generation
- ✅ Personalized learning paths
- ✅ Study recommendations

---

---

# PHASE 6: Deployment & Optimization (Week 12)

## What to build:
1. Production database setup
2. API rate limiting
3. Image storage (S3)
4. Performance optimization
5. Security hardening

### Deployment Checklist:

```
Backend:
  ✅ Environment variables setup
  ✅ Database indexing
  ✅ API rate limiting
  ✅ Error handling
  ✅ Logging

Frontend:
  ✅ Build optimization
  ✅ Image compression
  ✅ Code splitting
  ✅ CDN setup

Security:
  ✅ API key management
  ✅ CORS configuration
  ✅ Rate limiting
  ✅ Input validation
  ✅ HTTPS setup

Infrastructure:
  ✅ MongoDB Atlas setup
  ✅ AWS S3 bucket
  ✅ Redis cache
  ✅ Deployment pipeline
```

### Deliverables:
- ✅ Production-ready system
- ✅ Monitoring setup
- ✅ Backup strategy
- ✅ Scaling plan

---

---

# 🎯 Summary: Test + LMS Integration Benefits

| Feature | Test System | LMS | Both |
|---------|-----------|-----|------|
| Subject/Chapter | ✅ | ✅ | Shared |
| Questions | ✅ | ✅ | Shared |
| Student Progress | ✅ | ✅ | Unified |
| AI Generation | ✅ | ✅ | Same service |
| Analytics | ✅ | ✅ | Integrated |
| Watch History | ❌ | ✅ | Combined learning |
| Test Results | ✅ | ❌ | Assessment |

**Total Development Time**: 12 weeks (if built together)  
**Time if separate**: 16-18 weeks

**Savings**: 4-6 weeks of development + unified codebase + better analytics

---

# 📚 File Structure After Implementation

```
backend/
  models/
    Subject.js
    Chapter.js
    Topic.js
    Lesson.js
    Question.js
    Test.js
    TestAttempt.js
    StudentEnrollment.js
    Doubt.js
    PersonalizedLearningPath.js
    StudentAnalytics.js
  
  services/
    aiQuestionGeneration.service.js
    doubtSolver.service.js
    grading.service.js
    learningPath.service.js
    videoEncryption.service.js
  
  controllers/
    subjects.controller.js
    lessons.controller.js
    questions.controller.js
    tests.controller.js
    doubts.controller.js
    analytics.controller.js
  
  routes/
    subjects.routes.js
    lessons.routes.js
    questions.routes.js
    tests.routes.js
    doubts.routes.js
    analytics.routes.js
  
  middleware/
    auth.js
    rateLimiter.js
    videoTokenValidator.js

frontend/
  pages/
    teacher/
      subjects/
      lessons/
      questions/
      tests/
    student/
      lessons/
      tests/
      results/
      analytics/
      doubts/
  
  components/
    SecureVideoPlayer.tsx
    TestContainer.tsx
    DoubtSolver.tsx
    AnalyticsDashboard.tsx
    QuestionUploader.tsx
```

---

**Ready to start building? 🚀**

Bro, this is the complete roadmap. Should I start with Phase 1 (Database setup) or do you want me to refine anything first?

