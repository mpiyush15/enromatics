'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, BookOpen } from 'lucide-react';

interface Chapter {
  id: string;
  name: string;
  description: string;
  subject: string;
  questions: number;
  lessons: number;
  order: number;
}

export default function ChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([
    {
      id: '1',
      name: 'Algebra Fundamentals',
      description: 'Introduction to algebraic concepts and equations',
      subject: 'Mathematics',
      questions: 25,
      lessons: 5,
      order: 1,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    order: '',
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', subject: '', order: '' });
    setShowForm(true);
  };

  const handleEditClick = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setFormData({
      name: chapter.name,
      description: chapter.description,
      subject: chapter.subject,
      order: chapter.order.toString(),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      setChapters(chapters.map(c => c.id === editingId ? {
        ...c,
        ...formData,
        order: parseInt(formData.order) || c.order,
      } : c));
    } else {
      const newChapter: Chapter = {
        id: Date.now().toString(),
        ...formData,
        order: parseInt(formData.order) || chapters.length + 1,
        questions: 0,
        lessons: 0,
      };
      setChapters([...chapters, newChapter]);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      setChapters(chapters.filter(c => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Chapters</h1>
            <p className="text-gray-600">Organize course content into chapters</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            New Chapter
          </button>
        </div>

        {/* Create/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full border border-gray-200 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? '✏️ Edit Chapter' : '✨ Create New Chapter'}
              </h2>

              <div className="space-y-4">
                {/* Chapter Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Algebra Fundamentals"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the chapter..."
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter Order</label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      placeholder="1"
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    💾 Save Chapter
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded font-semibold transition-colors"
                  >
                    ❌ Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Chapter Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 rounded-lg p-2 text-blue-600">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{chapter.name}</h3>
                      <p className="text-gray-600 text-sm">{chapter.subject}</p>
                    </div>
                  </div>

                  {chapter.description && (
                    <p className="text-gray-700 text-sm mb-4 ml-11">{chapter.description}</p>
                  )}

                  {/* Chapter Stats */}
                  <div className="flex gap-6 text-sm ml-11">
                    <span className="text-gray-700 font-medium">📝 {chapter.questions} questions</span>
                    <span className="text-gray-700 font-medium">🎬 {chapter.lessons} lessons</span>
                    <span className="text-gray-700 font-medium">📍 Order: {chapter.order}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(chapter)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                    title="Edit Chapter"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                    title="Delete Chapter"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {chapters.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4 font-medium">No chapters created yet</p>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Your First Chapter
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
