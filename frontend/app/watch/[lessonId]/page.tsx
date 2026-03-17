'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, Share2, Download, Volume2, Maximize, Play } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

interface Lesson {
  id: string;
  title: string;
  subject: string;
  chapter: string;
  videoUrl: string;
  description: string;
  duration: number;
  views: number;
  createdAt: string;
}

// Mock data - will be replaced with API call
const LESSONS_DATA: Lesson[] = [
  {
    id: '1',
    title: 'Algebra Basics - Introduction to Variables',
    subject: 'Mathematics',
    chapter: 'Algebra',
    videoUrl: 'https://www.youtube.com/embed/example1',
    description: 'Master the fundamentals of algebraic concepts and learn how to work with variables effectively.',
    duration: 15,
    views: 1250,
    createdAt: '2026-03-15',
  },
  {
    id: '2',
    title: 'Quadratic Equations Explained',
    subject: 'Mathematics',
    chapter: 'Algebra',
    videoUrl: 'https://www.youtube.com/embed/example2',
    description: 'Deep dive into quadratic equations with real-world applications.',
    duration: 22,
    views: 890,
    createdAt: '2026-03-14',
  },
  {
    id: '3',
    title: 'Functions and Graphs',
    subject: 'Mathematics',
    chapter: 'Algebra',
    videoUrl: 'https://www.youtube.com/embed/example3',
    description: 'Understand functions, their properties, and how to visualize them on graphs.',
    duration: 18,
    views: 1050,
    createdAt: '2026-03-13',
  },
  {
    id: '4',
    title: 'Geometry Fundamentals',
    subject: 'Mathematics',
    chapter: 'Geometry',
    videoUrl: 'https://www.youtube.com/embed/example4',
    description: 'Explore basic geometric shapes and their properties.',
    duration: 20,
    views: 760,
    createdAt: '2026-03-12',
  },
  {
    id: '5',
    title: 'Physics: Laws of Motion',
    subject: 'Physics',
    chapter: 'Mechanics',
    videoUrl: 'https://www.youtube.com/embed/example5',
    description: 'Newton\'s three laws of motion explained with practical examples.',
    duration: 25,
    views: 2100,
    createdAt: '2026-03-11',
  },
];

export default function WatchLessonPage() {
  const router = useRouter();
  const params = useParams();
  const lessonId = params?.lessonId as string;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [relatedLessons, setRelatedLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch lesson
    const currentLesson = LESSONS_DATA.find(l => l.id === lessonId);
    
    if (currentLesson) {
      setLesson(currentLesson);
      // Get related lessons from same subject/chapter
      setRelatedLessons(
        LESSONS_DATA.filter(l => 
          (l.subject === currentLesson.subject || l.chapter === currentLesson.chapter) 
          && l.id !== lessonId
        )
      );
    }

    setIsLoading(false);
  }, [lessonId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <div className="text-gray-900 text-2xl font-bold">Lesson not found</div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header with back button */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-4 shadow-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-bold"
        >
          <ChevronLeft className="w-6 h-6" />
          Back to Lessons
        </button>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        {/* Video Player Container */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg aspect-video">
            <iframe
              src={`${lesson.videoUrl}?controls=1&modestbranding=1&rel=0&fs=1&playsinline=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              style={{ border: 'none' }}
            />
          </div>

          {/* Video Info & Actions */}
          <div className="mt-6 max-w-6xl mx-auto">
            <h1 className="text-4xl font-black mb-3 text-gray-900">{lesson.title}</h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6 border-b border-gray-200 pb-6">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">●</span>
                <span>{lesson.subject} • {lesson.chapter}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">●</span>
                <span>{lesson.duration} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">●</span>
                <span>{lesson.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">●</span>
                <span>Published {new Date(lesson.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/50">
                ➕ Add to Watchlist
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Share2 className="w-5 h-5" />
                Share
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                <Download className="w-5 h-5" />
                Download (coming soon)
              </button>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">About this lesson</h2>
              <p className="text-gray-700 text-lg leading-relaxed">{lesson.description}</p>
            </div>

            {/* Security Info for Bunny CDN */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="text-blue-600 text-2xl">🔒</div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">Secure Content</h3>
                  <p className="text-gray-700">
                    This lesson is protected with enterprise-grade security. Access is logged and monitored. 
                    Unauthorized sharing or downloading is prohibited and will be tracked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Lessons */}
        {relatedLessons.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-6 text-gray-900">Related Lessons</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedLessons.map((relatedLesson) => (
                <div
                  key={relatedLesson.id}
                  onClick={() => router.push(`/watch/${relatedLesson.id}`)}
                  className="group relative rounded-lg overflow-hidden bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105 hover:z-10"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center overflow-hidden">
                    <video className="w-8 h-8 text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-blue-600 rounded-full p-3">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 bg-white">
                    <h4 className="text-sm font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 text-gray-900">
                      {relatedLesson.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{relatedLesson.duration} min</span>
                      <span>{relatedLesson.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 mt-12 pt-8 px-4 sm:px-6 lg:px-8 pb-8 bg-gradient-to-t from-gray-100 to-gray-50">
        <div className="max-w-6xl mx-auto text-center text-gray-600 text-sm">
          <p>This lesson is available exclusively to authorized users. All views are logged.</p>
        </div>
      </div>
    </div>
  );
}
