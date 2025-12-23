'use client';

import useAuth from '@/hooks/useAuth';

/**
 * Student Dashboard - Main entry point for student users
 * Shows student-specific information and courses
 */
export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🎓 Student Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
          <p className="text-gray-600 mb-2">Role: {user?.role}</p>
          <p className="text-gray-600">Student ID: {user?.tenantId}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">📚 My Courses</h3>
            <p className="text-gray-600 mb-4">View your enrolled courses</p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              View Courses →
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✏️ Assignments</h3>
            <p className="text-gray-600 mb-4">Check pending assignments</p>
            <button className="text-green-600 hover:text-green-800 font-medium">
              View Assignments →
            </button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">📊 Attendance</h3>
            <p className="text-gray-600 mb-4">View your attendance record</p>
            <button className="text-purple-600 hover:text-purple-800 font-medium">
              View Attendance →
            </button>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">🎯 Exams</h3>
            <p className="text-gray-600 mb-4">View upcoming exams</p>
            <button className="text-orange-600 hover:text-orange-800 font-medium">
              View Exams →
            </button>
          </div>

          <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-pink-800 mb-2">💰 Fees</h3>
            <p className="text-gray-600 mb-4">Check fee status</p>
            <button className="text-pink-600 hover:text-pink-800 font-medium">
              View Fees →
            </button>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-indigo-800 mb-2">📱 Resources</h3>
            <p className="text-gray-600 mb-4">Access study materials</p>
            <button className="text-indigo-600 hover:text-indigo-800 font-medium">
              View Resources →
            </button>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>🚧 Coming Soon:</strong> Student portal features are being developed. 
            This dashboard will include courses, assignments, grades, and more.
          </p>
        </div>
      </div>
    </div>
  );
}
