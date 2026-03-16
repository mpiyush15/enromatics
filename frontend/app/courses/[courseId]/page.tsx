"use client";

import { useState } from "react";
import Link from "next/link";

const COURSE_DETAILS: Record<string, any> = {
  "neet-2024": {
    title: "NEET 2024 Complete Guide",
    category: "Medical",
    price: 4999,
    originalPrice: 9999,
    rating: 4.8,
    students: 12500,
    instructor: "Dr. Rajesh Sharma",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&h=400&fit=crop",
    description: "Complete NEET preparation with live classes, mock tests, and doubt clearing sessions",
    highlights: ["Live Classes", "Mock Tests", "Doubt Sessions", "Previous Papers", "Study Materials"],
    lessons: [
      { id: 1, title: "Biology Fundamentals", duration: "45 min", videos: 12, locked: false },
      { id: 2, title: "Physics Concepts", duration: "52 min", videos: 15, locked: true },
      { id: 3, title: "Chemistry Basics", duration: "48 min", videos: 14, locked: true },
      { id: 4, title: "Organic Chemistry", duration: "58 min", videos: 18, locked: true },
      { id: 5, title: "Inorganic Chemistry", duration: "55 min", videos: 17, locked: true },
      { id: 6, title: "Advanced Biology", duration: "60 min", videos: 19, locked: true },
    ]
  },
  "jee-advanced": {
    title: "JEE Advanced Masterclass",
    category: "Engineering",
    price: 5999,
    originalPrice: 11999,
    rating: 4.9,
    students: 8900,
    instructor: "Prof. Amit Kumar",
    image: "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=800&h=400&fit=crop",
    description: "Advanced problem-solving techniques for JEE Main and Advanced exams",
    highlights: ["Advanced Problems", "Strategy Guide", "Time Management", "Ranking Tips", "Daily Practice"],
    lessons: [
      { id: 1, title: "Advanced Mechanics", duration: "55 min", videos: 16, locked: false },
      { id: 2, title: "Electricity & Magnetism", duration: "60 min", videos: 18, locked: true },
      { id: 3, title: "Modern Physics", duration: "50 min", videos: 15, locked: true },
      { id: 4, title: "Complex Numbers", duration: "48 min", videos: 14, locked: true },
      { id: 5, title: "Calculus Mastery", duration: "62 min", videos: 20, locked: true },
    ]
  },
  "board-12": {
    title: "Class 12 Board Exam Prep",
    category: "Board Exam",
    price: 2999,
    originalPrice: 5999,
    rating: 4.7,
    students: 25000,
    instructor: "Ms. Priya Singh",
    image: "https://images.unsplash.com/photo-1516534775068-bb57fbb92d50?w=800&h=400&fit=crop",
    description: "Complete CBSE/State board curriculum with previous year papers",
    highlights: ["NCERT Coverage", "Previous Papers", "Sample Tests", "Chapter Notes", "Video Solutions"],
    lessons: [
      { id: 1, title: "Chapter 1: Basics", duration: "40 min", videos: 10, locked: false },
      { id: 2, title: "Chapter 2: Advanced", duration: "45 min", videos: 12, locked: true },
      { id: 3, title: "Chapter 3: Applications", duration: "42 min", videos: 11, locked: true },
    ]
  },
};

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const course = COURSE_DETAILS[params.courseId];
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
          <Link href="/courses" className="text-blue-400 hover:underline">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/courses" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-2">
            ← Back
          </Link>
          <h1 className="text-xl font-bold text-white hidden md:block text-center flex-1">{course.title}</h1>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">₹{course.price.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Header Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={course.image} 
                alt={course.title}
                className="w-full h-96 object-cover"
              />
            </div>

            {/* Course Info */}
            <div>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold">
                  {course.category}
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <span>⭐ {course.rating}</span>
                  <span className="text-gray-400 text-sm">({course.students.toLocaleString()} students)</span>
                </div>
              </div>

              <h1 className="text-4xl font-bold text-white mb-4">{course.title}</h1>
              <p className="text-xl text-gray-300 mb-6">{course.description}</p>

              <div className="flex items-center gap-3 pb-6 border-b border-slate-700">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=faces"
                  alt={course.instructor}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="text-white font-semibold">{course.instructor}</p>
                  <p className="text-gray-400 text-sm">Expert Instructor</p>
                </div>
              </div>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">What You'll Get</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {course.highlights.map((highlight: string, idx: number) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4 text-center hover:bg-slate-700 transition">
                    <p className="text-white font-semibold">{highlight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Lessons */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Course Curriculum</h2>
              <div className="space-y-3">
                {course.lessons.map((lesson: any) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson)}
                    className={`w-full p-5 rounded-xl transition-all text-left ${
                      selectedLesson?.id === lesson.id
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg"
                        : "bg-slate-700 hover:bg-slate-600 text-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {lesson.locked ? (
                          <span className="text-xl">🔒</span>
                        ) : (
                          <span className="text-xl">▶️</span>
                        )}
                        <div>
                          <p className="font-semibold">{lesson.title}</p>
                          <p className="text-sm opacity-75">{lesson.videos} videos • {lesson.duration}</p>
                        </div>
                      </div>
                      {lesson.locked && <span className="text-lg">Enroll to unlock</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Video Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Video Preview */}
              <div className="bg-slate-700 rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-slate-800 flex items-center justify-center relative">
                  {selectedLesson ? (
                    <>
                      <img 
                        src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop"
                        alt={selectedLesson.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        {selectedLesson.locked ? (
                          <div className="text-center">
                            <div className="text-5xl mb-4">🔒</div>
                            <p className="text-white font-semibold">Video Locked</p>
                          </div>
                        ) : (
                          <button className="w-16 h-16 bg-white rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                            <span className="text-3xl">▶️</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <p className="text-4xl mb-3">🎥</p>
                      <p>Select a lesson to preview</p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-800">
                  {selectedLesson ? (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{selectedLesson.title}</h3>
                      <div className="flex items-center gap-4 mb-4 text-gray-300 text-sm">
                        <span>📚 {selectedLesson.videos} Videos</span>
                        <span>⏱️ {selectedLesson.duration}</span>
                      </div>
                      {selectedLesson.locked ? (
                        <div className="text-center">
                          <p className="text-gray-300 text-sm mb-4">Unlock this lesson by enrolling</p>
                          <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors">
                            Enroll Now - ₹{course.price}
                          </button>
                        </div>
                      ) : (
                        <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-lg transition-all">
                          Watch Lesson (Free Preview)
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">Choose a lesson to start</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enroll Button */}
              <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg">
                🛒 Enroll Now
              </button>

              {/* Price Info */}
              <div className="bg-slate-700/50 rounded-xl p-6 text-center">
                <p className="text-gray-300 text-sm mb-2">Regular Price</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-bold text-white">₹{course.price.toLocaleString()}</span>
                  <span className="text-lg text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                </div>
                <p className="text-green-400 font-semibold mt-2">
                  {Math.round((1 - course.price/course.originalPrice) * 100)}% Off
                </p>
              </div>

              {/* Info Cards */}
              <div className="space-y-3">
                <div className="bg-slate-700/50 rounded-lg p-4 flex gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-white font-semibold">Lifetime Access</p>
                    <p className="text-gray-400 text-sm">Learn at your own pace</p>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 flex gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <p className="text-white font-semibold">Mobile & Desktop</p>
                    <p className="text-gray-400 text-sm">Learn anywhere, anytime</p>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4 flex gap-3">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <p className="text-white font-semibold">Certificate</p>
                    <p className="text-gray-400 text-sm">After completion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
