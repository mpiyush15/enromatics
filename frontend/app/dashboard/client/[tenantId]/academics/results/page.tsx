'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Test {
  _id: string;
  name: string;
  subject: string;
  course: string;
  batch?: string;
  testDate: string;
  totalMarks: number;
  passingMarks: number;
}

interface ResultDrawerTest extends Test {
  attendanceCount?: number;
  marksCount?: number;
  averageMarks?: number;
  studentResults?: StudentResult[];
}

interface StudentResult {
  studentId: string;
  name: string;
  rollNumber?: string;
  marksObtained: number;
  percentage: number;
  rank?: number;
  status: 'pass' | 'fail';
}

export default function TestResultsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenantId as string) || '';

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedTestForResults, setSelectedTestForResults] = useState<ResultDrawerTest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/academics/tests`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch tests');

      const data = await res.json();
      setTests(data.tests || data.data || []);
      setStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tests';
      setStatus('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Open results drawer
  const handleViewResults = async (test: Test) => {
    try {
      setStatus('⟳ Loading results...');
      
      // Fetch test results (attendance + marks)
      const attendanceRes = await fetch(`/api/academics/tests/${test._id}/attendance`, {
        credentials: 'include',
      });

      const marksRes = await fetch(`/api/academics/tests/${test._id}/marks`, {
        credentials: 'include',
      });

      const attendanceData = attendanceRes.ok ? await attendanceRes.json() : { attendance: [] };
      const marksData = marksRes.ok ? await marksRes.json() : { marks: [] };

      console.log('Attendance:', attendanceData);
      console.log('Marks:', marksData);

      // Get all marks for ranking
      const allMarks = marksData.marks || [];
      
      // Calculate student results
      const studentResults: StudentResult[] = allMarks.map((record: any) => {
        const marksObtained = record.marksObtained || 0;
        const percentage = (marksObtained / test.totalMarks) * 100;
        const status = marksObtained >= test.passingMarks ? 'pass' : 'fail';

        return {
          studentId: typeof record.studentId === 'string' ? record.studentId : record.studentId?._id,
          name: record.studentId?.name || 'Unknown',
          rollNumber: record.studentId?.rollNumber || '-',
          marksObtained,
          percentage: Math.round(percentage * 100) / 100,
          status,
        };
      });

      // Sort by marks to assign ranks
      const sortedResults = [...studentResults].sort((a, b) => b.marksObtained - a.marksObtained);
      sortedResults.forEach((result, index) => {
        result.rank = index + 1;
      });

      // Calculate stats
      const attendanceCount = attendanceData.attendance?.length || 0;
      const marksCount = allMarks.length;
      const averageMarks = marksCount > 0
        ? allMarks.reduce((sum: number, m: any) => sum + (m.marksObtained || 0), 0) / marksCount
        : 0;

      setSelectedTestForResults({
        ...test,
        attendanceCount,
        marksCount,
        averageMarks: Math.round(averageMarks * 100) / 100,
        studentResults: sortedResults,
      });
      setDrawerOpen(true);
      setStatus('');
    } catch (error) {
      console.error('Error fetching results:', error);
      setStatus('❌ Failed to load results');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">📊 Test Results</h1>
          <p className="text-gray-600 dark:text-gray-400">View attendance and marks for all tests</p>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl font-semibold ${
            status.includes('✅') 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
          }`}>
            {status}
          </div>
        )}

        {/* Tests Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tests</h2>
              <button
                onClick={fetchTests}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '⟳ Loading...' : '⟳ Refresh'}
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No tests available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase">Test Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase">Subject</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase">Course</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase">Batch</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase">Date</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase">Marks</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-900 dark:text-white uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">{test.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{test.subject}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{test.course}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{test.batch || '-'}</td>
                      <td className="px-6 py-4 text-center text-gray-600 dark:text-gray-400">
                        {new Date(test.testDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded-lg text-sm font-semibold">
                          {test.totalMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewResults(test)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Drawer */}
      {drawerOpen && selectedTestForResults && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/50 cursor-pointer"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="w-full md:w-96 bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTestForResults.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedTestForResults.course} {selectedTestForResults.batch && `- ${selectedTestForResults.batch}`}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Marked</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedTestForResults.attendanceCount}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Marks Entered</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedTestForResults.marksCount}</p>
                </div>
              </div>

              {/* Average Marks */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Class Average</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {(selectedTestForResults.averageMarks || 0).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  out of {selectedTestForResults.totalMarks}
                </p>
              </div>

              {/* Student Results Table */}
              {selectedTestForResults.studentResults && selectedTestForResults.studentResults.length > 0 ? (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Student Results</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedTestForResults.studentResults.map((result) => (
                      <div
                        key={result.studentId}
                        className={`p-3 rounded-lg border ${
                          result.status === 'pass'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{result.name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Roll: {result.rollNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {result.marksObtained}/{selectedTestForResults.totalMarks}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {result.percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            result.status === 'pass'
                              ? 'bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200'
                              : 'bg-red-200 text-red-800 dark:bg-red-700 dark:text-red-200'
                          }`}>
                            {result.status === 'pass' ? '✅ Pass' : '❌ Fail'}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 font-semibold">
                            Rank: {result.rank}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">No marks entered yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
