'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, FileText, Sparkles } from 'lucide-react';

interface Question {
  id: string;
  type: 'mcq' | 'short' | 'essay';
  text: string;
  subject: string;
  chapter: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
  correctAnswer?: string;
  createdAt: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: '1',
      type: 'mcq',
      text: 'What is the value of 2x + 3 when x = 5?',
      subject: 'Mathematics',
      chapter: 'Algebra',
      difficulty: 'easy',
      marks: 2,
      options: ['11', '13', '15', '17'],
      correctAnswer: '13',
      createdAt: '2026-03-16',
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'mcq' as const,
    text: '',
    subject: '',
    chapter: '',
    difficulty: 'easy' as const,
    marks: '1',
    options: ['', '', '', ''],
    correctAnswer: '',
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
      type: 'mcq',
      text: '',
      subject: '',
      chapter: '',
      difficulty: 'easy',
      marks: '1',
      options: ['', '', '', ''],
      correctAnswer: '',
    });
    setShowForm(true);
  };

  const handleEditClick = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      type: question.type as 'mcq' | 'short' | 'essay',
      text: question.text,
      subject: question.subject,
      chapter: question.chapter,
      difficulty: question.difficulty as 'easy' | 'medium' | 'hard',
      marks: question.marks.toString(),
      options: question.options || ['', '', '', ''],
      correctAnswer: question.correctAnswer || '',
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.text || !formData.subject || !formData.chapter) {
      alert('Please fill all required fields');
      return;
    }

    if (formData.type === 'mcq' && (!formData.correctAnswer || formData.options.some(o => !o))) {
      alert('Please fill all options and select correct answer');
      return;
    }

    if (editingId) {
      setQuestions(questions.map(q => q.id === editingId ? {
        ...q,
        ...formData,
        marks: parseInt(formData.marks),
      } : q));
    } else {
      const newQuestion: Question = {
        id: Date.now().toString(),
        ...formData,
        marks: parseInt(formData.marks),
        createdAt: new Date().toISOString().split('T')[0],
      };
      setQuestions([...questions, newQuestion]);
    }

    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">❓ Questions</h1>
            <p className="text-gray-600">Create and manage assessment questions</p>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md"
              title="AI Generate Questions (Coming soon)"
            >
              <Sparkles className="w-5 h-5" />
              AI Generate
            </button>
            <button
              onClick={handleAddClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Question
            </button>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingId ? '✏️ Edit Question' : '✨ Create New Question'}
              </h2>

              <div className="space-y-4">
                {/* Question Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="short">Short Answer</option>
                    <option value="essay">Essay</option>
                  </select>
                </div>

                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Question Text *</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Enter the question"
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

                <div className="grid grid-cols-2 gap-4">
                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  {/* Marks */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Marks *</label>
                    <input
                      type="number"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                      min="1"
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* MCQ Options */}
                {formData.type === 'mcq' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Options *</label>
                    <div className="space-y-2">
                      {formData.options.map((option, idx) => (
                        <div key={idx} className="flex gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...formData.options];
                              newOptions[idx] = e.target.value;
                              setFormData({ ...formData, options: newOptions });
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <label className="flex items-center gap-2 text-gray-700">
                            <input
                              type="radio"
                              name="correct"
                              checked={formData.correctAnswer === option}
                              onChange={() => setFormData({ ...formData, correctAnswer: option })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Correct</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                  >
                    💾 Save Question
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

        {/* Questions List */}
        <div className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-blue-100 rounded-lg p-2 text-blue-600 mt-1">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium mb-2">{question.text}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded font-medium">
                          {question.type.toUpperCase()}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                          {question.subject}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
                          {question.chapter}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {question.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                          {question.marks} marks
                        </span>
                      </div>

                      {question.type === 'mcq' && (
                        <div className="text-sm text-gray-700 space-y-1">
                          <p className="font-semibold text-gray-900">Options:</p>
                          {question.options?.map((opt, idx) => (
                            <p key={idx} className={opt === question.correctAnswer ? 'text-green-700 font-semibold' : ''}>
                              {String.fromCharCode(65 + idx)}. {opt} {opt === question.correctAnswer ? '✓' : ''}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(question)}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {questions.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4 font-medium">No questions created yet</p>
              <button
                onClick={handleAddClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Create Your First Question
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
