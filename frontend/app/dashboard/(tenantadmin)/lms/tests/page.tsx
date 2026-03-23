'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Play, BarChart3, Clock, FileText } from 'lucide-react';

interface Test {
  id: string;
  name: string;
  subject: string;
  chapter: string;
  questions: number;
  totalMarks: number;
  duration: number;
  passingMarks: number;
  students: number;
  createdAt: string;
  status: 'draft' | 'published';
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([
    {
      id: '1',
      name: 'Algebra Basics Quiz',
      subject: 'Mathematics',
      chapter: 'Algebra',
      questions: 10,
      totalMarks: 50,
      duration: 30,
      passingMarks: 25,
      students: 0,
      createdAt: '2026-03-16',
      status: 'published',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    chapter: '',
    questions: '',
    totalMarks: '',
    duration: '',
    passingMarks: '',
  });

  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
  const chapters = {
    Mathematics: ['Algebra', 'Geometry', 'Calculus', 'Statistics'],
    Physics: ['Mechanics', 'Thermodynamics', 'Electricity', 'Optics'],
    Chemistry: ['Organic', 'Inorganic', 'Physical', 'Analytical'],
    Biology: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology'],
    English: ['Grammar', 'Literature', 'Writing', 'Communication'],
  };

  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: '',
      subject: '',
      chapter: '',
      questions: '',
      totalMarks: '',
      duration: '',
      passingMarks: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (test: Test) => {
    setEditingId(test.id);
    setFormData({
      name: test.name,
      subject: test.subject,
      chapter: test.chapter,
      questions: test.questions.toString(),
      totalMarks: test.totalMarks.toString(),
      duration: test.duration.toString(),
      passingMarks: test.passingMarks.toString(),
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject || !formData.chapter) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      setTests(tests.map(t => t.id === editingId ? {
        ...t,
        ...formData,
        questions: parseInt(formData.questions),
        totalMarks: parseInt(formData.totalMarks),
        duration: parseInt(formData.duration),
        passingMarks: parseInt(formData.passingMarks),
      } : t));
    } else {
      const newTest: Test = {
        id: Date.now().toString(),
        ...formData,
        questions: parseInt(formData.questions),
        totalMarks: parseInt(formData.totalMarks),
        duration: parseInt(formData.duration),
        passingMarks: parseInt(formData.passingMarks),
        students: 0,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'draft',
      };
      setTests([...tests, newTest]);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this test?')) {
      setTests(tests.filter(t => t.id !== id));
    }
  };

  const handlePublish = (id: string) => {
    setTests(tests.map(t => t.id === id ? { ...t, status: 'published' } : t));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Tests & Exams</h1>
            <p className="text-gray-600">Create and manage student assessments</p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md"
          >
            <Plus className="w-5 h-5" />
            Create Test
          </button>
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full border border-gray-200 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? '✏️ Edit Test' : '✨ Create New Test'}
              </h2>

              <div className="space-y-4">
                {/* Test Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Test Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Algebra Basics Quiz"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* Chapter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Chapter *</label>
                    <select
                      value={formData.chapter}
                      onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select Chapter</option>
                      {formData.subject && chapters[formData.subject as keyof typeof chapters]?.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Questions *</label>
                    <input
                      type="number"
                      value={formData.questions}
                      onChange={(e) => setFormData({ ...formData, questions: e.target.value })}
                      placeholder="10"
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Total Marks */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Marks *</label>
                    <input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                      placeholder="50"
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Duration (minutes) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (min) *</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="30"
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Passing Marks */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Passing Marks *</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                    placeholder="25"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    💾 Save Test
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

        {/* Tests List */}
        <div className="space-y-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Test Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 rounded-lg p-2 text-blue-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{test.name}</h3>
                      <p className="text-gray-600 text-sm">{test.subject} &gt; {test.chapter}</p>
                    </div>
                    <span className={`ml-auto px-3 py-1 rounded text-sm font-semibold ${
                      test.status === 'published' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {test.status === 'published' ? '✅ Published' : '📋 Draft'}
                    </span>
                  </div>

                  {/* Test Stats */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{test.questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <BarChart3 className="w-4 h-4 text-purple-600" />
                      <span className="font-medium">{test.totalMarks} Marks</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="font-medium">{test.duration} minutes</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Play className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{test.students} students</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {test.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(test.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded text-sm font-semibold transition-colors"
                      title="Publish Test"
                    >
                      ✅ Publish
                    </button>
                  )}
                  <button
                    onClick={() => handleEditClick(test)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                    title="Edit Test"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                    title="Delete Test"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {tests.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4 font-medium">No tests created yet</p>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Your First Test
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
