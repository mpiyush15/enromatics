'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  lessonCount: number;
}

interface Lesson {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  duration?: number;
  courseIds?: string[];
}

interface Course {
  _id: string;
  name: string;
}

export default function LessonsPlanningPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: '',
    description: '',
    duration: '',
    subject: '',
    assignToCourses: [] as string[],
  });

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonForm, setEditingLessonForm] = useState({
    name: '',
    description: '',
    duration: '',
  });

  useEffect(() => {
    if (tenantId) {
      fetchLessons();
      fetchCourses();
    }
  }, [tenantId]);

  useEffect(() => {
    if (tenantId) fetchSubjects();
  }, [lessons]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch(`/api/academics/subjects?tenantId=${tenantId}`, {
        credentials: 'include',
      });
      const json = await res.json();
      const list = Array.isArray(json.data) ? json.data : json;

      const map = new Map<string, number>();
      lessons.forEach(l => {
        map.set(l.subject, (map.get(l.subject) || 0) + 1);
      });

      setSubjects(
        list.map((s: any) => ({
          id: s._id || s.name,
          name: s.name,
          lessonCount: map.get(s.name) || 0,
        }))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/academics/lessons?tenantId=${tenantId}`, {
        credentials: 'include',
      });
      const json = await res.json();
      setLessons(Array.isArray(json.data) ? json.data : json);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    const res = await fetch(`/api/academics/courses?tenantId=${tenantId}`, {
      credentials: 'include',
    });
    const json = await res.json();
    setCourses(Array.isArray(json.data) ? json.data : json);
  };

  const getLessonsForSubject = (name: string) =>
    lessons.filter(l => l.subject === name);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      const res = await fetch(`/api/academics/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tenantId, name: newSubjectName.trim() }),
      });
      if (res.ok) {
        const json = await res.json();
        const newSubject = json.data || json;
        setSubjects([
          ...subjects,
          { id: newSubject._id || newSubject.name, name: newSubject.name, lessonCount: 0 },
        ]);
        setNewSubjectName('');
        setShowSubjectForm(false);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create subject');
    }
  };

  const handleAddLesson = async () => {
    if (!lessonForm.name.trim() || !expandedSubject) {
      alert('Please enter lesson name');
      return;
    }

    try {
      const subjectName = subjects.find(s => s.id === expandedSubject)?.name || '';
      const res = await fetch(`/api/academics/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tenantId,
          name: lessonForm.name,
          description: lessonForm.description,
          duration: lessonForm.duration ? parseInt(lessonForm.duration) : 0,
          subject: subjectName,
          addToCourses: lessonForm.assignToCourses,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const newLesson = json.data || json;
        setLessons([...lessons, newLesson]);
        setLessonForm({ name: '', description: '', duration: '', subject: '', assignToCourses: [] });
        setShowLessonForm(false);
      } else {
        alert('Failed to create lesson');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to create lesson');
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      console.log('🗑️ Deleting lesson:', lessonId);
      const res = await fetch(`/api/academics/lessons`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ lessonId }),
      });

      console.log('Delete response status:', res.status);

      if (res.ok) {
        const json = await res.json();
        console.log('✅ Lesson deleted successfully:', json);
        setLessons(lessons.filter(l => l._id !== lessonId));
        alert('Lesson deleted successfully');
      } else {
        let errorMessage = 'Failed to delete lesson';
        try {
          const errorData = await res.json();
          console.error('❌ Delete failed:', errorData);
          errorMessage = errorData.message || errorData.error || `Error (${res.status})`;
        } catch {
          console.error('❌ Delete failed with status:', res.status);
          errorMessage = `Failed to delete lesson (HTTP ${res.status})`;
        }
        alert(errorMessage);
      }
    } catch (e: any) {
      console.error('❌ Error deleting lesson:', e);
      alert(`Failed to delete lesson: ${e.message}`);
    }
  };

  const handleEditLesson = async (lessonId: string) => {
    if (!editingLessonForm.name.trim()) return;
    try {
      const res = await fetch(`/api/academics/lessons`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          lessonId,
          name: editingLessonForm.name,
          description: editingLessonForm.description,
          duration: editingLessonForm.duration ? parseInt(editingLessonForm.duration) : 0,
        }),
      });
      if (res.ok) {
        setLessons(
          lessons.map(l =>
            l._id === lessonId
              ? {
                  ...l,
                  name: editingLessonForm.name,
                  description: editingLessonForm.description,
                  duration: editingLessonForm.duration ? parseInt(editingLessonForm.duration) : 0,
                }
              : l
          )
        );
        setEditingLessonId(null);
        setEditingLessonForm({ name: '', description: '', duration: '' });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update lesson');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b px-8 py-6">
        <h1 className="text-3xl font-bold">📚 Global Lessons Planning</h1>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">

          {/* SUBJECTS */}
          <div className="lg:col-span-1 border rounded-lg flex flex-col overflow-hidden">
            <div className="p-4 border-b">
              <button
                onClick={() => setShowSubjectForm(!showSubjectForm)}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg flex justify-center gap-2"
              >
                <Plus size={18} /> New Subject
              </button>
            </div>

            {showSubjectForm && (
              <div className="p-3 border-b">
                <input
                  value={newSubjectName}
                  onChange={e => setNewSubjectName(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                  placeholder="Subject name"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSubject}
                    className="flex-1 bg-indigo-600 text-white py-1 rounded text-sm"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowSubjectForm(false);
                      setNewSubjectName('');
                    }}
                    className="flex-1 bg-gray-300 py-1 rounded text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {subjects.map(s => (
                <div
                  key={s.id}
                  onClick={() => setExpandedSubject(s.id)}
                  className={`p-3 rounded cursor-pointer ${
                    expandedSubject === s.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  <h4 className="text-sm font-medium">{s.name}</h4>
                  <p className="text-xs opacity-75">{s.lessonCount} lessons</p>
                </div>
              ))}
            </div>
          </div>

          {/* LESSONS */}
          <div className="lg:col-span-2 border rounded-lg flex flex-col overflow-hidden">
            {expandedSubject ? (
              <>
                <div className="p-4 border-b bg-gray-50 dark:bg-gray-800">
                  <h3 className="text-lg font-semibold">
                    {subjects.find(s => s.id === expandedSubject)?.name}
                  </h3>
                  <button
                    onClick={() => setShowLessonForm(!showLessonForm)}
                    className="mt-3 w-full bg-green-600 text-white py-2 rounded-lg flex justify-center gap-2"
                  >
                    <Plus size={18} /> New Lesson
                  </button>
                </div>

                {/* Lesson Form */}
                {showLessonForm && (
                  <div className="p-4 border-b bg-green-50 dark:bg-green-900/20 space-y-3">
                    <input
                      type="text"
                      placeholder="Lesson name"
                      value={lessonForm.name}
                      onChange={e => setLessonForm({ ...lessonForm, name: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />
                    <textarea
                      placeholder="Description (optional)"
                      value={lessonForm.description}
                      onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                    />
                    <input
                      type="number"
                      placeholder="Duration (mins)"
                      value={lessonForm.duration}
                      onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      className="w-full border rounded px-3 py-2"
                    />

                    <div>
                      <label className="block text-sm font-medium mb-2">Assign to Courses:</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2 bg-white dark:bg-gray-700">
                        {courses.map(course => (
                          <label key={course._id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={lessonForm.assignToCourses.includes(course._id)}
                              onChange={e => {
                                if (e.target.checked) {
                                  setLessonForm({
                                    ...lessonForm,
                                    assignToCourses: [...lessonForm.assignToCourses, course._id],
                                  });
                                } else {
                                  setLessonForm({
                                    ...lessonForm,
                                    assignToCourses: lessonForm.assignToCourses.filter(
                                      c => c !== course._id
                                    ),
                                  });
                                }
                              }}
                              className="cursor-pointer"
                            />
                            <span className="text-sm">{course.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAddLesson}
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm"
                      >
                        Create Lesson
                      </button>
                      <button
                        onClick={() => {
                          setShowLessonForm(false);
                          setLessonForm({
                            name: '',
                            description: '',
                            duration: '',
                            subject: '',
                            assignToCourses: [],
                          });
                        }}
                        className="flex-1 bg-gray-300 py-2 rounded-lg text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {getLessonsForSubject(
                    subjects.find(s => s.id === expandedSubject)?.name || ''
                  ).map(l => (
                    <div key={l._id} className="border rounded-lg p-4 space-y-2">
                      {editingLessonId === l._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editingLessonForm.name}
                            onChange={e =>
                              setEditingLessonForm({ ...editingLessonForm, name: e.target.value })
                            }
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Lesson name"
                          />
                          <textarea
                            value={editingLessonForm.description}
                            onChange={e =>
                              setEditingLessonForm({
                                ...editingLessonForm,
                                description: e.target.value,
                              })
                            }
                            className="w-full border rounded px-3 py-2 text-sm"
                            rows={2}
                            placeholder="Description"
                          />
                          <input
                            type="number"
                            value={editingLessonForm.duration}
                            onChange={e =>
                              setEditingLessonForm({
                                ...editingLessonForm,
                                duration: e.target.value,
                              })
                            }
                            className="w-full border rounded px-3 py-2 text-sm"
                            placeholder="Duration (mins)"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditLesson(l._id)}
                              className="flex-1 bg-green-600 text-white py-1 rounded text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingLessonId(null);
                                setEditingLessonForm({ name: '', description: '', duration: '' });
                              }}
                              className="flex-1 bg-gray-300 py-1 rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium">{l.name}</h4>
                              {l.description && <p className="text-sm opacity-75">{l.description}</p>}
                              <div className="text-xs opacity-60 mt-1 space-y-1">
                                {l.duration && <p>⏱️ {l.duration} mins</p>}
                                {l.courseIds && l.courseIds.length > 0 && (
                                  <p>📌 {l.courseIds.length} course(s) assigned</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2 ml-2">
                              <Edit2
                                size={16}
                                className="text-blue-500 cursor-pointer"
                                onClick={() => {
                                  setEditingLessonId(l._id);
                                  setEditingLessonForm({
                                    name: l.name,
                                    description: l.description || '',
                                    duration: l.duration ? String(l.duration) : '',
                                  });
                                }}
                              />
                              <Trash2
                                size={16}
                                className="text-red-500 cursor-pointer"
                                onClick={() => handleDeleteLesson(l._id)}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Select a subject to view lessons
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
