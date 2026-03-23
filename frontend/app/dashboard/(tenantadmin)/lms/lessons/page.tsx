'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Video, Play, Trash2, Edit2, Search, ChevronRight, Volume2, Maximize } from 'lucide-react';

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
  thumbnail?: string;
}

export default function LessonsPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([
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
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    chapter: '',
    videoUrl: '',
    duration: '',
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const chapters = {
    Mathematics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electricity', 'Optics'],
    Chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical'],
    Biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology'],
    English: ['Grammar', 'Literature', 'Writing', 'Communication'],
  };

  const convertYouTubeUrl = (url: string): string => {
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      subject: '',
      chapter: '',
      videoUrl: '',
      duration: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setFormData({
      title: lesson.title,
      description: lesson.description,
      subject: lesson.subject,
      chapter: lesson.chapter,
      videoUrl: lesson.videoUrl,
      duration: lesson.duration.toString(),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.title || !formData.subject || !formData.chapter || !formData.videoUrl) {
      alert('Please fill all required fields');
      return;
    }

    const embedUrl = convertYouTubeUrl(formData.videoUrl);

    if (editingId) {
      setLessons(lessons.map(l => l.id === editingId ? {
        ...l,
        ...formData,
        videoUrl: embedUrl,
        duration: parseInt(formData.duration),
      } : l));
    } else {
      const newLesson: Lesson = {
        id: Date.now().toString(),
        ...formData,
        videoUrl: embedUrl,
        duration: parseInt(formData.duration),
        views: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setLessons([...lessons, newLesson]);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      setLessons(lessons.filter(l => l.id !== id));
    }
  };

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || lesson.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const featuredLesson = lessons[0];
  const groupedBySubject = subjects.map(subject => ({
    subject,
    lessons: lessons.filter(l => l.subject === subject),
  })).filter(group => group.lessons.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header - Minimal */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-gray-950/95 to-gray-950/80 backdrop-blur-md border-b border-gray-800 py-4">
        <div className="px-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Video Academy</h1>
            <p className="text-gray-400 text-xs">Premium content</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/50 text-sm"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
        
        {/* Search - Compact */}
        <div className="px-6 mt-3 flex gap-3 items-center">
          <div className="flex-1 max-w-xs relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Featured Section - Full Width */}
      {featuredLesson && (
        <div className="px-6 py-8">
          <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">Featured Now</p>
          <div
            className="group relative rounded-2xl overflow-hidden cursor-pointer h-80"
            onClick={() => setPlayingVideoId(featuredLesson.id)}
          >
            {/* Featured Thumbnail */}
            <div className="relative h-full bg-gradient-to-br from-blue-900 to-cyan-900 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-40">
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent" />
              </div>
              <Video className="w-40 h-40 text-gray-700 opacity-20" />
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent group-hover:from-black/50 group-hover:via-black/30 transition-all duration-300 z-20" />

            {/* Featured Content */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-8">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Now Playing</span>
                <span className="text-gray-500 text-xs">•</span>
                <span className="text-gray-400 text-xs">{featuredLesson.subject}</span>
              </div>
              <h2 className="text-5xl font-black mb-3 group-hover:text-cyan-300 transition-colors duration-300 line-clamp-2">{featuredLesson.title}</h2>
              <p className="text-gray-300 text-base mb-6 max-w-3xl line-clamp-2">{featuredLesson.description}</p>
              
              <div className="flex items-center gap-8 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">●</span>
                  <span className="text-gray-300 text-sm">{featuredLesson.duration} min</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">●</span>
                  <span className="text-gray-300 text-sm">{featuredLesson.views.toLocaleString()} views</span>
                </div>
              </div>

              <button
                onClick={() => setPlayingVideoId(featuredLesson.id)}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-10 py-3 rounded-lg flex items-center gap-3 font-bold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-cyan-500/40"
              >
                <Play className="w-6 h-6 fill-current" />
                Watch Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Grid - No Side Margins */}
      <div className="px-6 pb-12 space-y-12">
        {groupedBySubject.map(({ subject, lessons: subjectLessons }) => (
          <div key={subject}>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-black">{subject}</h3>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </div>

            {/* Lesson Cards Grid - Instagram Style Portrait */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {subjectLessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  className="group relative rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-30"
                  onClick={() => setPlayingVideoId(lesson.id)}
                >
                  {/* Card - Portrait/Square */}
                  <div className="relative bg-gradient-to-br from-blue-900/60 to-cyan-900/60 aspect-square rounded-2xl overflow-hidden border border-gray-700/50 group-hover:border-cyan-500/80 transition-all duration-300 shadow-xl group-hover:shadow-cyan-500/40">
                    {/* Thumbnail Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-cyan-900 to-blue-950 flex items-center justify-center">
                      <Video className="w-16 h-16 text-gray-600 opacity-30" />
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-100 group-hover:via-gray-950/20 transition-all duration-300" />

                    {/* Content Overlay - Large Title + Index */}
                    <div className="absolute inset-0 flex flex-col items-center justify-between p-4 z-20">
                      {/* Top - Large Index Number */}
                      <div className="text-5xl font-black text-cyan-400 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                        {idx + 1}
                      </div>

                      {/* Bottom - Title + Play */}
                      <div className="w-full text-center">
                        <h4 className="text-sm font-black mb-3 line-clamp-2 text-white group-hover:text-cyan-300 transition-colors duration-300">
                          {lesson.title}
                        </h4>
                        
                        {/* Play Button */}
                        <div className="flex justify-center">
                          <div className="bg-white/20 backdrop-blur-md group-hover:bg-cyan-500 rounded-full p-2.5 transition-all duration-300 shadow-lg">
                            <Play className="w-4 h-4 text-white fill-white" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Duration Badge - Top Right */}
                    <div className="absolute top-2 right-2 bg-gray-950/80 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-cyan-300 z-30">
                      {lesson.duration}m
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full border border-gray-200 shadow-2xl">
            <h2 className="text-3xl font-black text-gray-900 mb-6">
              {editingId ? '✏️ Edit Lesson' : '✨ Create New Lesson'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Lesson Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Algebra Basics - Introduction"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the lesson"
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Chapter *</label>
                  <select
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="">Select Chapter</option>
                    {formData.subject && chapters[formData.subject as keyof typeof chapters]?.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Video URL *</label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="Paste YouTube URL here"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-gray-600 mt-1">📝 Paste full YouTube URL (auto-converts to embed)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Duration (minutes) *</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="15"
                  min="1"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/30"
                >
                  💾 Save Lesson
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {lessons.length === 0 && (
        <div className="text-center py-16 px-8">
          <Video className="w-20 h-20 text-gray-400 mx-auto mb-6" />
          <p className="text-gray-700 text-xl mb-6">No lessons yet. Start creating amazing content!</p>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300"
          >
            Create First Lesson
          </button>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideoId && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-5xl">
            {/* Close Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">
                {lessons.find(l => l.id === playingVideoId)?.title}
              </h3>
              <button
                onClick={() => setPlayingVideoId(null)}
                className="text-gray-400 hover:text-white transition-colors text-3xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="relative bg-gray-950 aspect-video rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
              <iframe
                src={`${lessons.find(l => l.id === playingVideoId)?.videoUrl}?controls=1&modestbranding=1&rel=0&fs=1&playsinline=1&autoplay=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                style={{ border: 'none' }}
              />
            </div>

            {/* Lesson Info */}
            <div className="mt-6 p-6 bg-gray-900 rounded-xl border border-gray-800">
              <h4 className="text-lg font-bold mb-2 text-white">{lessons.find(l => l.id === playingVideoId)?.description}</h4>
              <div className="flex gap-6 text-gray-400 text-sm">
                <span className="flex items-center gap-2"><span className="text-cyan-400">●</span> ⏱️ {lessons.find(l => l.id === playingVideoId)?.duration} minutes</span>
                <span className="flex items-center gap-2"><span className="text-cyan-400">●</span> 👁️ {lessons.find(l => l.id === playingVideoId)?.views.toLocaleString()} views</span>
                <span className="flex items-center gap-2"><span className="text-cyan-400">●</span> 📚 {lessons.find(l => l.id === playingVideoId)?.subject} • {lessons.find(l => l.id === playingVideoId)?.chapter}</span>
              </div>
            </div>

            <p className="text-center text-gray-500 text-xs mt-4">Press ESC or click X to close</p>
          </div>
        </div>
      )}
    </div>
  );
}
