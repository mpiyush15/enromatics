# 📚 Learning Management System (LMS) - Technical Brief

## System Overview
Online test generation + Video streaming with security focus. Teachers manage questions & videos, students take tests & watch lessons.

---

## 🎯 Core Modules

### 1. **Subjects & Chapters**
- **Structure**: Subject → Chapters → Lessons
- **Database**: `Subject`, `Chapter`, `Lesson` collections
- **Fields**: name, description, order, status
- Teacher CRUD via dashboard

### 2. **Video Lectures (Secure)**
- **No Direct Upload** - Only YouTube URLs stored
- **Secure Streaming Approach**:
  - Store encrypted YouTube video IDs (not full URLs)
  - Backend validates access (user role + enrollment)
  - Custom video player component embeds iframe with:
    - No controls show (hide progress, quality, share buttons)
    - Origin restricted iframe parameters
    - Session token verification
  - Frontend shows NO YouTube links or metadata
  - Prevent right-click, console access on player

**Backend Route**: `/api/lessons/:lessonId/video-token`
- Returns JWT token + encrypted video ID
- Token expires in 30 min per session
- Log watch history (user, lesson, duration)

### 3. **Question Bank & Tests**
- **Question Model**:
  ```
  {
    tenantId, subject, chapter, difficulty,
    question, options[], correctAnswer, 
    explanation, marks, uploadedBy(teacher)
  }
  ```
- **Test Model**:
  ```
  {
    tenantId, name, subject, chapters[],
    totalQuestions, totalMarks, duration(mins),
    passingMarks, randomize, createdBy(teacher)
  }
  ```

### 4. **Test Generation & Submission**
- Teacher creates test → select subject → auto-fetch questions by chapter
- System randomly selects questions (optional shuffle)
- Student takes test → submits answers
- Backend auto-grades → marks sheet generated
- Results stored with timestamp, IP, duration

---

## 🔐 Security Architecture

### Video Player Protection:
```javascript
// Backend sends encrypted token + video ID
GET /api/lessons/:id/video-token
Response: { token, videoId_encrypted, expiresIn }

// Frontend component
<SecureVideoPlayer 
  token={token}
  videoIdEncrypted={videoIdEncrypted}
/>
// - Decrypts on client only
// - Loads iframe with token query param
// - Iframe origin restricted to player domain only
// - Disable right-click, inspect, F12
// - No video URL visible in network tab
```

### Test Security:
- Prevent page refresh during test (warn, lock submission)
- Session validation (re-login = test locked)
- Tamper detection (answer swapping)
- IP tracking + unusual activity alerts
- Cannot copy-paste questions

---

## 📊 Database Models

```
Subject
├── Chapter
│   └── Lesson (has YouTube URL encrypted)
│
Question
├── subject: ref(Subject)
├── chapter: ref(Chapter)
├── difficulty: easy|medium|hard
├── videoId_youtube: encrypted
│
Test
├── subject: ref(Subject)
├── chapters: [ref(Chapter)]
├── questions: [ref(Question)] (populated on test start)
│
StudentTest (submission)
├── student: ref(Student)
├── test: ref(Test)
├── answers: { questionId, selected, isCorrect }
├── score, duration, submittedAt
└── watchHistory: { lessonId, duration, timestamp }
```

---

## 🛠️ API Routes

**Teacher Routes:**
- `POST /api/subjects` - Create subject
- `POST /api/chapters` - Create chapter with lessons
- `POST /api/lessons` - Add lesson (+ YouTube URL encrypted)
- `POST /api/questions/bulk` - Upload question bank (CSV/JSON)
- `POST /api/tests` - Create test from question bank
- `GET /api/tests/:id/results` - Student results

**Student Routes:**
- `GET /api/subjects` - Browse subjects
- `GET /api/chapters/:subjectId` - Get chapters
- `GET /api/lessons/:id/video-token` - Secure video access
- `GET /api/tests/available` - Available tests
- `POST /api/tests/:id/start` - Start test (generates question list)
- `POST /api/tests/:id/submit` - Submit answers → auto-grade
- `GET /api/results/:testId` - View results

---

## 💾 Implementation Phases

| Phase | What | Timeline |
|-------|------|----------|
| **1** | Subject/Chapter/Lesson CRUD | Week 1 |
| **2** | Secure video player + streaming | Week 1 |
| **3** | Question bank management | Week 2 |
| **4** | Test generation engine | Week 2 |
| **5** | Test taking + grading | Week 3 |
| **6** | Results & analytics | Week 3 |
| **7** | Progress reports | Week 4 |

---

## ✅ Key Features
- ✅ Subject-wise question filtering
- ✅ Random question selection per test
- ✅ YouTube video with encryption (no sharing)
- ✅ Auto-grading with explanations
- ✅ Teacher test analytics
- ✅ Student progress tracking
- ✅ Secure token-based video access
- ✅ Watch time logging

---

**Ready to start with Phase 1: Subjects/Chapters/Lessons?**
