'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StudentInfo {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  batch?: string;
}

interface TestResult {
  testId: string;
  testName: string;
  subject: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  testDate: string;
  status: 'pass' | 'fail';
}

export default function StudentProgressPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenantId as string) || '';
  const studentId = (params?.studentId as string) || '';

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [progressData, setProgressData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);

  // Fetch student details
  const fetchStudentDetails = async () => {
    try {
      const res = await fetch(`/api/academics/students/${studentId}`, {
        credentials: 'include',
      });

      if (!res.ok) {
        // Fallback: create basic student object
        setStudent({
          _id: studentId,
          name: 'Student',
          email: '',
          rollNumber: '',
          batch: '',
        });
      } else {
        const data = await res.json();
        setStudent(data.student || data);
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    }
  };

  // Fetch all tests and get marks for this student
  const fetchStudentProgress = async () => {
    try {
      setLoading(true);
      setStatus('⟳ Loading progress data...');

      // Fetch all tests
      const testsRes = await fetch(`/api/academics/tests`, {
        credentials: 'include',
      });

      if (!testsRes.ok) throw new Error('Failed to fetch tests');

      const testsData = await testsRes.json();
      const allTests = testsData.tests || testsData.data || [];

      const results: TestResult[] = [];
      const subjectMap: { [key: string]: { total: number; count: number; passed: number } } = {};

      // For each test, fetch marks and find this student's result
      for (const test of allTests) {
        try {
          const marksRes = await fetch(`/api/academics/tests/${test._id}/marks`, {
            credentials: 'include',
          });

          if (!marksRes.ok) continue;

          const marksData = await marksRes.json();
          const marks = marksData.marks || [];

          // Find marks for this student
          const studentMark = marks.find(
            (m: any) =>
              (typeof m.studentId === 'string' ? m.studentId : m.studentId?._id) ===
              studentId
          );

          if (studentMark) {
            const marksObtained = studentMark.marksObtained || 0;
            const percentage = (marksObtained / test.totalMarks) * 100;
            const status = marksObtained >= test.passingMarks ? 'pass' : 'fail';

            results.push({
              testId: test._id,
              testName: test.name,
              subject: test.subject || 'General',
              marksObtained,
              totalMarks: test.totalMarks,
              percentage: Math.round(percentage * 100) / 100,
              testDate: test.testDate,
              status,
            });

            // Aggregate subject data
            const subject = test.subject || 'General';
            if (!subjectMap[subject]) {
              subjectMap[subject] = { total: 0, count: 0, passed: 0 };
            }
            subjectMap[subject].total += marksObtained;
            subjectMap[subject].count += 1;
            if (status === 'pass') {
              subjectMap[subject].passed += 1;
            }
          }
        } catch (err) {
          console.error(`Error fetching marks for test ${test._id}:`, err);
        }
      }

      // Sort by test date
      results.sort(
        (a, b) => new Date(a.testDate).getTime() - new Date(b.testDate).getTime()
      );

      // Format progress data for line chart
      const progressChartData = results.map((r) => ({
        date: new Date(r.testDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        testName: r.testName,
        marks: r.marksObtained,
        percentage: r.percentage,
        totalMarks: r.totalMarks,
      }));

      // Format subject data for bar chart
      const subjectChartData = Object.entries(subjectMap).map(([subject, stats]) => ({
        subject,
        avgMarks: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
        passRate: stats.count > 0 ? Math.round((stats.passed / stats.count) * 100) : 0,
        attempts: stats.count,
      }));

      setTestResults(results);
      setProgressData(progressChartData);
      setSubjectData(subjectChartData);
      setStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load progress';
      setStatus('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchStudentDetails();
      fetchStudentProgress();
    }
  }, [studentId]);

  // Calculate overall stats
  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.status === 'pass').length;
  const avgPercentage =
    totalTests > 0
      ? Math.round(
          (testResults.reduce((sum, r) => sum + r.percentage, 0) / totalTests) * 100
        ) / 100
      : 0;
  const overallPassRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            📈 Student Progress Report
          </h1>
          {student && (
            <div className="text-gray-600 dark:text-gray-400">
              <p className="text-lg font-semibold">{student.name}</p>
              <p>Roll No: {student.rollNumber || '-'} | Batch: {student.batch || '-'}</p>
              <p>Email: {student.email || '-'}</p>
            </div>
          )}
        </div>

        {/* Status Message */}
        {status && (
          <div
            className={`mb-6 p-4 rounded-xl font-semibold ${
              status.includes('✅')
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
            }`}
          >
            {status}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading progress data...</p>
          </div>
        ) : (
          <>
            {/* Overall Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {totalTests}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tests Passed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {passedTests}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Percentage</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {avgPercentage}%
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {overallPassRate}%
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Progress Over Time */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📊 Marks Progression
                </h3>
                {progressData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={progressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="percentage"
                        stroke="#8b5cf6"
                        name="Percentage %"
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6', r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="marks"
                        stroke="#3b82f6"
                        name="Marks Obtained"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No progress data available</p>
                )}
              </div>

              {/* Subject Performance */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📚 Subject Performance
                </h3>
                {subjectData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgMarks" fill="#10b981" name="Avg Marks" />
                      <Bar dataKey="passRate" fill="#f59e0b" name="Pass Rate %" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-8">No subject data available</p>
                )}
              </div>
            </div>

            {/* Test Results Table */}
            {testResults.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  📋 Test Results Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">
                          Test Name
                        </th>
                        <th className="px-4 py-2 text-left text-gray-900 dark:text-white font-semibold">
                          Subject
                        </th>
                        <th className="px-4 py-2 text-center text-gray-900 dark:text-white font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-2 text-center text-gray-900 dark:text-white font-semibold">
                          Marks
                        </th>
                        <th className="px-4 py-2 text-center text-gray-900 dark:text-white font-semibold">
                          Percentage
                        </th>
                        <th className="px-4 py-2 text-center text-gray-900 dark:text-white font-semibold">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {testResults.map((result) => (
                        <tr
                          key={result.testId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <td className="px-4 py-3 text-gray-900 dark:text-white">
                            {result.testName}
                          </td>
                          <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                            {result.subject}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                            {new Date(result.testDate).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                            {result.marksObtained}/{result.totalMarks}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">
                            {result.percentage.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-3 py-1 rounded text-xs font-semibold ${
                                result.status === 'pass'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {result.status === 'pass' ? '✅ Pass' : '❌ Fail'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Export Buttons */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => {
                  // PDF logic to be added later
                  alert('PDF export logic will be added soon');
                }}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Download PDF
              </button>
              <button
                onClick={() => {
                  // Print logic to be added later
                  alert('Print logic will be added soon');
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z"
                  />
                </svg>
                Print Report
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
