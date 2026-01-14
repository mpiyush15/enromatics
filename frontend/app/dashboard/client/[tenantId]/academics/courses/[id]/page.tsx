"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Book, Plus, Trash2, Edit2, X } from "lucide-react";

interface Lesson {
  _id: string;
  name: string;
  description: string;
  duration: string;
  subject: string;
  order: number;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  duration: string;
  fees: number;
  subjects?: string[];
  status: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "subjects">("overview");

  // Course editing
  const [editingCourse, setEditingCourse] = useState(false);
  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    status: "active",
  });

  // Subject management
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    name: "",
    description: "",
    duration: "0 mins",
  });
  const [shareAcrossCourses, setShareAcrossCourses] = useState(false);

  // Fetch course details
  useEffect(() => {
    if (!courseId) return;

    const fetchCourseDetails = async () => {
      try {
        const res = await fetch(`/api/academics/courses/${courseId}/detail`, {
          credentials: "include",
        });

        if (!res.ok) {
          setError("Course not found");
          return;
        }

        const data = await res.json();
        setCourse(data.course);
        setLessons(data.lessons || []);
        
        // Set course form
        setCourseForm({
          name: data.course.name,
          description: data.course.description,
          duration: data.course.duration,
          fees: data.course.fees?.toString() || "0",
          status: data.course.status,
        });
        
        // Extract unique subjects from lessons
        const uniqueSubjects = [...new Set((data.lessons || []).map((l: Lesson) => l.subject))];
        setSubjects(uniqueSubjects.length > 0 ? uniqueSubjects : ["General"]);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  // Update course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingLesson(true);

    try {
      const res = await fetch(`/api/academics/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...courseForm,
          fees: parseFloat(courseForm.fees) || 0,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setCourse(data.course);
        setEditingCourse(false);
        alert("✅ Course updated!");
      } else {
        alert("❌ " + (data.message || "Failed to update course"));
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("❌ Server error");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubject.trim() && !subjects.includes(newSubject)) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const handleDeleteSubject = (subject: string) => {
    if (confirm(`Delete "${subject}" and all its lessons?`)) {
      setLessons(lessons.filter((l) => l.subject !== subject));
      setSubjects(subjects.filter((s) => s !== subject));
      if (expandedSubject === subject) setExpandedSubject(null);
    }
  };

  const handleAddLesson = async (subject: string, e: React.FormEvent) => {
    e.preventDefault();
    setSavingLesson(true);

    try {
      const method = editingLesson ? "PUT" : "POST";
      const url = editingLesson
        ? `/api/academics/courses/${courseId}/lessons`
        : `/api/academics/courses/${courseId}/lessons`;

      console.log("📝 Saving lesson:", { subject, courseId, form: lessonForm, editing: !!editingLesson });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          ...lessonForm, 
          subject,
          courseId,
          lessonId: editingLesson?._id,
        }),
      });

      const data = await res.json();
      console.log("📝 Lesson response:", data);

      if (data.success) {
        if (editingLesson) {
          setLessons(lessons.map(l => l._id === editingLesson._id ? data.lesson : l));
          alert("✅ Lesson updated!");
        } else {
          setLessons([...lessons, data.lesson]);
          alert("✅ Lesson added!");
        }
        setLessonForm({ name: "", description: "", duration: "0 mins" });
        setShowLessonForm(null);
        setEditingLesson(null);
        setShareAcrossCourses(false);
      } else {
        alert("❌ " + (data.message || "Failed to save lesson"));
      }
    } catch (error) {
      console.error("❌ Error saving lesson:", error);
      alert("❌ Server error: " + String(error));
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      const res = await fetch(`/api/academics/courses/${courseId}/lessons`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId }),
      });

      const data = await res.json();

      if (data.success) {
        setLessons(lessons.filter((l) => l._id !== lessonId));
        alert("✅ Lesson deleted!");
      } else {
        alert("❌ Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("❌ Server error");
    }
  };

  const getLessonsForSubject = (subject: string) => {
    return lessons.filter((l) => l.subject === subject);
  };

  const startEditLesson = (lesson: Lesson, subject: string) => {
    setEditingLesson(lesson);
    setLessonForm({
      name: lesson.name,
      description: lesson.description,
      duration: lesson.duration,
    });
    setShowLessonForm(subject);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <p className="text-sm text-red-600 mb-4">{error || "Course not found"}</p>
          <button
            onClick={() => router.back()}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 hover:bg-gray-100 rounded text-gray-600"
              title="Go back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{course.name}</h1>
              <p className="text-xs text-gray-500">{course.description}</p>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-gray-600">
            <span>₹{course.fees}</span>
            <span>•</span>
            <span>{course.duration}</span>
            <span>•</span>
            <span className="capitalize text-green-600 font-medium">{course.status}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-6 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "overview"
                ? "text-gray-900 border-b-gray-900"
                : "text-gray-500 border-b-transparent hover:text-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("subjects")}
            className={`py-3 text-sm font-medium border-b-2 transition flex items-center gap-1 ${
              activeTab === "subjects"
                ? "text-gray-900 border-b-gray-900"
                : "text-gray-500 border-b-transparent hover:text-gray-700"
            }`}
          >
            <Book size={16} />
            Subjects & Lessons
            {subjects.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 rounded-full">
                {subjects.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Course Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Duration</p>
                  <p className="font-medium text-gray-900">{course.duration}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Fees</p>
                  <p className="font-medium text-gray-900">₹{course.fees}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Status</p>
                  <p className={`font-medium ${course.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                    {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Total Lessons</p>
                  <p className="font-medium text-gray-900">{lessons.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{course.description}</p>
            </div>
          </div>
        )}

        {/* Subjects Tab */}
        {activeTab === "subjects" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Subjects List - Left Column */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                {/* Add Subject Form */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <form onSubmit={handleAddSubject} className="space-y-2">
                    <input
                      type="text"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Subject name..."
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-medium"
                    >
                      + New Subject
                    </button>
                  </form>
                </div>

                {/* Subjects List */}
                <div className="space-y-2">
                  {subjects.length === 0 ? (
                    <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                      <p className="text-sm text-gray-500">No subjects yet</p>
                    </div>
                  ) : (
                    subjects.map((subject) => {
                      const subjectLessons = getLessonsForSubject(subject);
                      const isSelected = expandedSubject === subject;

                      return (
                        <div
                          key={subject}
                          onClick={() => setExpandedSubject(isSelected ? null : subject)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                            isSelected
                              ? "bg-blue-50 border-blue-400"
                              : "bg-white border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-900" : "text-gray-900"}`}>
                                {subject}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {subjectLessons.length} lesson{subjectLessons.length !== 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSubject(subject);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded ml-2"
                              title="Delete subject"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Subject Details - Right Column */}
            <div className="lg:col-span-2">
              {expandedSubject ? (
                <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
                  {/* Subject Header */}
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">{expandedSubject}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {getLessonsForSubject(expandedSubject).length} lesson
                      {getLessonsForSubject(expandedSubject).length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Lessons List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {getLessonsForSubject(expandedSubject).length === 0 ? (
                      <div className="flex items-center justify-center h-32 text-gray-500">
                        <p className="text-sm">No lessons in this subject</p>
                      </div>
                    ) : (
                      getLessonsForSubject(expandedSubject).map((lesson) => (
                        <div
                          key={lesson._id}
                          className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-400 transition"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{lesson.name}</p>
                              {lesson.description && (
                                <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                  {lesson.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-2">⏱️ {lesson.duration}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteLesson(lesson._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition flex-shrink-0"
                              title="Delete lesson"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Lesson Form */}
                  <div className="border-t border-gray-200 p-4">
                    {showLessonForm === expandedSubject ? (
                      <form
                        onSubmit={(e) => handleAddLesson(expandedSubject, e)}
                        className="space-y-3"
                      >
                        <input
                          type="text"
                          required
                          placeholder="Lesson name..."
                          value={lessonForm.name}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, name: e.target.value })
                          }
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <textarea
                          placeholder="Description (optional)..."
                          value={lessonForm.description}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, description: e.target.value })
                          }
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows={2}
                        />
                        <input
                          type="text"
                          placeholder="Duration (e.g., 45 mins)..."
                          value={lessonForm.duration}
                          onChange={(e) =>
                            setLessonForm({ ...lessonForm, duration: e.target.value })
                          }
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={savingLesson}
                            className="flex-1 text-sm bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 font-medium"
                          >
                            {savingLesson ? "Saving..." : "Add Lesson"}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowLessonForm(null);
                              setLessonForm({
                                name: "",
                                description: "",
                                duration: "0 mins",
                              });
                            }}
                            className="flex-1 text-sm bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setShowLessonForm(expandedSubject)}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded font-medium"
                      >
                        + Add Lesson
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-8 border border-gray-200 text-center flex items-center justify-center min-h-96">
                  <div>
                    <Book size={32} className="text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Select a subject to view and manage lessons</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
