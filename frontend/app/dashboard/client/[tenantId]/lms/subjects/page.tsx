'use client';

import { useState } from 'react';
import { Plus, BookOpen, Trash2, Edit2, Users, FileText } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  description: string;
  chapters: number;
  questions: number;
  color: string;
  createdAt: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', description: 'Advanced Math course', chapters: 5, questions: 0, color: 'blue', createdAt: '2026-03-15' },
    { id: '2', name: 'Physics', description: 'Physics fundamentals', chapters: 5, questions: 0, color: 'purple', createdAt: '2026-03-15' },
    { id: '3', name: 'Chemistry', description: 'Chemistry essentials', chapters: 4, questions: 0, color: 'green', createdAt: '2026-03-15' },
    { id: '4', name: 'Biology', description: 'Biology basics', chapters: 5, questions: 0, color: 'orange', createdAt: '2026-03-15' },
    { id: '5', name: 'English', description: 'English language', chapters: 5, questions: 0, color: 'pink', createdAt: '2026-03-15' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
  });

  const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'red', 'cyan', 'indigo'];

  const colorMap = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600',
    orange: 'bg-orange-600',
    pink: 'bg-pink-600',
    red: 'bg-red-600',
    cyan: 'bg-cyan-600',
    indigo: 'bg-indigo-600',
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', color: 'blue' });
    setShowForm(true);
  };

  const handleEditClick = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      description: subject.description,
      color: subject.color,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Subject name is required');
      return;
    }

    if (editingId) {
      setSubjects(subjects.map(s => s.id === editingId ? {
        ...s,
        name: formData.name,
        description: formData.description,
        color: formData.color,
      } : s));
    } else {
      const newSubject: Subject = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        color: formData.color,
        chapters: 0,
        questions: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setSubjects([...subjects, newSubject]);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure? This will delete the subject and all associated chapters.')) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Subjects</h1>
            <p className="text-gray-600">Manage your course subjects and curriculum</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            Add Subject
          </button>
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-xl w-full border border-gray-200 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? '✏️ Edit Subject' : '➕ Create New Subject'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Advanced Mathematics"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the subject"
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color Theme</label>
                  <div className="grid grid-cols-4 gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`h-10 rounded border-2 transition-all ${
                          colorMap[color as keyof typeof colorMap]
                        } ${formData.color === color ? 'border-gray-900' : 'border-gray-300'}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    💾 Save Subject
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

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${colorMap[subject.color as keyof typeof colorMap]} rounded-lg p-3 text-white`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEditClick(subject)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-600 p-2 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(subject.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">{subject.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{subject.description}</p>

              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{subject.chapters} Chapters</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{subject.questions} Questions</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4 font-medium">No subjects created yet</p>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Create Your First Subject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
