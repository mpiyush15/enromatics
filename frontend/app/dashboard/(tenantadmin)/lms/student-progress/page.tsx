'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, Award, Download } from 'lucide-react';

interface StudentProgress {
  id: string;
  name: string;
  email: string;
  testsAttempted: number;
  averageScore: number;
  totalMarks: number;
  passingTests: number;
  lastTestDate: string;
  studyHours: number;
  lessonsCompleted: number;
}

export default function StudentProgressPage() {
  const [students, setStudents] = useState<StudentProgress[]>([
    {
      id: '1',
      name: 'Akshay Mane',
      email: 'akshay@example.com',
      testsAttempted: 5,
      averageScore: 85,
      totalMarks: 100,
      passingTests: 4,
      lastTestDate: '2026-03-15',
      studyHours: 25,
      lessonsCompleted: 18,
    },
    {
      id: '2',
      name: 'Nikhil Patel',
      email: 'nikhil@example.com',
      testsAttempted: 4,
      averageScore: 78,
      totalMarks: 100,
      passingTests: 3,
      lastTestDate: '2026-03-14',
      studyHours: 20,
      lessonsCompleted: 15,
    },
    {
      id: '3',
      name: 'Priya Sharma',
      email: 'priya@example.com',
      testsAttempted: 6,
      averageScore: 92,
      totalMarks: 100,
      passingTests: 6,
      lastTestDate: '2026-03-16',
      studyHours: 30,
      lessonsCompleted: 22,
    },
  ]);

  const [selectedFilter, setSelectedFilter] = useState('all');

  const stats = {
    totalStudents: students.length,
    avgScore: Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length),
    totalTests: students.reduce((sum, s) => sum + s.testsAttempted, 0),
    topStudent: students.reduce((top, s) => s.averageScore > (top?.averageScore || 0) ? s : top, students[0])?.name,
  };

  const filteredStudents = students.filter(student => {
    if (selectedFilter === 'high') return student.averageScore >= 80;
    if (selectedFilter === 'medium') return student.averageScore >= 60 && student.averageScore < 80;
    if (selectedFilter === 'low') return student.averageScore < 60;
    return true;
  });

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    return 'text-red-700';
  };

  const getPerformanceBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📊 Student Progress</h1>
            <p className="text-gray-600">Track student performance and learning analytics</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-semibold shadow-md">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalStudents}</h3>
              </div>
              <Users className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Avg Score</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.avgScore}%</h3>
              </div>
              <BarChart3 className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Tests</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats.totalTests}</h3>
              </div>
              <Award className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Top Performer</p>
                <h3 className="text-xl font-bold text-gray-900 truncate">{stats.topStudent}</h3>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedFilter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Students
          </button>
          <button
            onClick={() => setSelectedFilter('high')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedFilter === 'high'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            High Performers (80%+)
          </button>
          <button
            onClick={() => setSelectedFilter('medium')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedFilter === 'medium'
                ? 'bg-yellow-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Average (60-80%)
          </button>
          <button
            onClick={() => setSelectedFilter('low')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              selectedFilter === 'low'
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Need Help (&lt;60%)
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Tests</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Avg Score</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Passing</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Study Hours</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Lessons Done</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Last Test</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.email}</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">{student.testsAttempted}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`font-bold ${getPerformanceColor(student.averageScore)}`}>
                        {student.averageScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">
                      {student.passingTests}/{student.testsAttempted}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">{student.studyHours}h</td>
                    <td className="px-6 py-4 text-center text-gray-900 font-medium">{student.lessonsCompleted}</td>
                    <td className="px-6 py-4 text-center text-gray-600 text-sm">{student.lastTestDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* High Performers */}
          <div className={`border rounded-lg p-6 ${getPerformanceBg(85)}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 rounded-lg p-2 text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">High Performers</h3>
            </div>
            <p className="text-3xl font-bold text-green-700">
              {students.filter(s => s.averageScore >= 80).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Students scoring 80% or above</p>
          </div>

          {/* Average Performers */}
          <div className={`border rounded-lg p-6 ${getPerformanceBg(70)}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-yellow-100 rounded-lg p-2 text-yellow-600">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Average Performers</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-700">
              {students.filter(s => s.averageScore >= 60 && s.averageScore < 80).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Students scoring 60-80%</p>
          </div>

          {/* Need Help */}
          <div className={`border rounded-lg p-6 ${getPerformanceBg(50)}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 rounded-lg p-2 text-red-600">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Need Support</h3>
            </div>
            <p className="text-3xl font-bold text-red-700">
              {students.filter(s => s.averageScore < 60).length}
            </p>
            <p className="text-sm text-gray-600 mt-2">Students scoring below 60%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
