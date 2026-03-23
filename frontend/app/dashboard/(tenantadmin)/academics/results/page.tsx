'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import useAuth from '@/hooks/useAuth';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
  batchRank?: number;
  status: 'pass' | 'fail';
}

export default function TestResultsPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tenantId = user?.tenantId as string;

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedTestForResults, setSelectedTestForResults] = useState<ResultDrawerTest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [batchPerformanceData, setBatchPerformanceData] = useState<any[]>([]);
  const [monthlyPerformanceData, setMonthlyPerformanceData] = useState<any[]>([]);

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
      
      // Calculate performance data after fetching tests
      await calculatePerformanceData(data.tests || data.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tests';
      setStatus('❌ ' + message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate performance by batch and monthly trends
  const calculatePerformanceData = async (allTests: Test[]) => {
    try {
      const batchStats: { [key: string]: { total: number; count: number; passed: number } } = {};
      const monthlyStats: { [key: string]: { total: number; count: number } } = {};

      // Fetch marks for all tests
      for (const test of allTests) {
        try {
          const marksRes = await fetch(`/api/academics/tests/${test._id}/marks`, {
            credentials: 'include',
          });

          if (!marksRes.ok) continue;

          const marksData = await marksRes.json();
          const marks = marksData.marks || [];

          // Group by batch
          const batch = test.batch || 'General';
          if (!batchStats[batch]) {
            batchStats[batch] = { total: 0, count: 0, passed: 0 };
          }

          marks.forEach((m: any) => {
            const marksObtained = m.marksObtained || 0;
            batchStats[batch].total += marksObtained;
            batchStats[batch].count += 1;
            if (marksObtained >= test.passingMarks) {
              batchStats[batch].passed += 1;
            }
          });

          // Group by month
          const testDate = new Date(test.testDate);
          const monthKey = `${testDate.getMonth() + 1}/${testDate.getFullYear()}`;
          if (!monthlyStats[monthKey]) {
            monthlyStats[monthKey] = { total: 0, count: 0 };
          }

          marks.forEach((m: any) => {
            monthlyStats[monthKey].total += m.marksObtained || 0;
            monthlyStats[monthKey].count += 1;
          });
        } catch (err) {
          console.error(`Error fetching marks for test ${test._id}:`, err);
        }
      }

      // Format batch data
      const batchData = Object.entries(batchStats).map(([batch, stats]) => ({
        batch,
        avgMarks: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
        passRate: stats.count > 0 ? Math.round((stats.passed / stats.count) * 100) : 0,
        studentCount: stats.count,
      }));

      // Format monthly data
      const monthlyData = Object.entries(monthlyStats)
        .sort((a, b) => {
          const [aMonth, aYear] = a[0].split('/').map(Number);
          const [bMonth, bYear] = b[0].split('/').map(Number);
          return aYear === bYear ? aMonth - bMonth : aYear - bYear;
        })
        .map(([month, stats]) => ({
          month,
          avgMarks: stats.count > 0 ? Math.round((stats.total / stats.count) * 100) / 100 : 0,
        }));

      setBatchPerformanceData(batchData);
      setMonthlyPerformanceData(monthlyData);
    } catch (error) {
      console.error('Error calculating performance data:', error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Function to calculate batch rank for students
  const calculateBatchRanks = (results: StudentResult[]): StudentResult[] => {
    // Sort by marks obtained (descending)
    const sorted = [...results].sort((a, b) => b.marksObtained - a.marksObtained);
    
    // Assign batch rank (handling ties)
    let currentRank = 1;
    const rankedResults = sorted.map((result, index) => {
      // If marks are same as previous student, use same rank
      if (index > 0 && sorted[index - 1].marksObtained === result.marksObtained) {
        currentRank = currentRank; // Keep same rank
      } else {
        currentRank = index + 1;
      }
      return {
        ...result,
        batchRank: currentRank,
      };
    });
    
    return rankedResults;
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

      // Calculate batch ranks
      const resultsWithBatchRanks = calculateBatchRanks(studentResults);

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
        studentResults: resultsWithBatchRanks,
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

        {/* Performance Analytics Section */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Performance by Batch */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📈 Performance by Batch</h3>
              {batchPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={batchPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="batch" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgMarks" fill="#3b82f6" name="Avg Marks" />
                    <Bar dataKey="passRate" fill="#10b981" name="Pass Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No performance data available</p>
              )}
            </div>

            {/* Monthly Performance Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📊 Monthly Performance Trend</h3>
              {monthlyPerformanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgMarks" stroke="#8b5cf6" name="Avg Marks" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center py-8">No monthly data available</p>
              )}
            </div>
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

          {/* Drawer - Fits Table Width */}
          <div className="w-full md:max-w-4xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col">
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
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{selectedTestForResults.attendanceCount}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Marks Entered</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{selectedTestForResults.marksCount}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Avg Marks</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(selectedTestForResults.averageMarks || 0).toFixed(1)}</p>
                </div>
              </div>

              {/* Student Results Table */}
              {selectedTestForResults.studentResults && selectedTestForResults.studentResults.length > 0 ? (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Student Results</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-gray-900 dark:text-white font-semibold text-xs">Rank</th>
                          <th className="px-3 py-2 text-left text-gray-900 dark:text-white font-semibold text-xs">Student Name</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">Roll No</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">Batch Rank</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">Marks</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">%</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">Status</th>
                          <th className="px-3 py-2 text-center text-gray-900 dark:text-white font-semibold text-xs">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedTestForResults.studentResults.map((result) => (
                          <tr key={result.studentId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2 font-bold text-gray-900 dark:text-white text-sm">#{result.rank}</td>
                            <td className="px-3 py-2 text-gray-900 dark:text-white text-sm">{result.name}</td>
                            <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{result.rollNumber}</td>
                            <td className="px-3 py-2 text-center font-semibold text-blue-600 dark:text-blue-400 text-sm">{result.batchRank || '-'}</td>
                            <td className="px-3 py-2 text-center font-semibold text-gray-900 dark:text-white text-sm">
                              {result.marksObtained}/{selectedTestForResults.totalMarks}
                            </td>
                            <td className="px-3 py-2 text-center text-gray-600 dark:text-gray-400 text-sm">{result.percentage.toFixed(1)}%</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                result.status === 'pass'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {result.status === 'pass' ? '✅ Pass' : '❌ Fail'}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                onClick={() => router.push(`/dashboard/(tenantadmin)/academics/student-progress/${result.studentId}`)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                              >
                                📈
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-gray-600 dark:text-gray-400 text-center py-4">No marks entered yet</p>
                </div>
              )}
            </div>

            {/* Footer with Print & Download */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Print functionality
                    const printWindow = window.open('', '', 'height=600,width=800');
                    if (printWindow) {
                      const html = `
                        <!DOCTYPE html>
                        <html>
                        <head>
                          <title>${selectedTestForResults.name} - Results</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
                            .test-info { margin: 20px 0; color: #666; }
                            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            th { background-color: #007bff; color: white; padding: 12px; text-align: left; font-weight: bold; }
                            td { padding: 10px; border-bottom: 1px solid #ddd; }
                            tr:nth-child(even) { background-color: #f9f9f9; }
                            .pass { color: green; font-weight: bold; }
                            .fail { color: red; font-weight: bold; }
                            .stats { display: flex; gap: 30px; margin: 20px 0; }
                            .stat-box { padding: 15px; background-color: #f0f0f0; border-radius: 5px; }
                          </style>
                        </head>
                        <body>
                          <h1>${selectedTestForResults.name}</h1>
                          <div class="test-info">
                            <p><strong>Course:</strong> ${selectedTestForResults.course}</p>
                            <p><strong>Batch:</strong> ${selectedTestForResults.batch || 'N/A'}</p>
                            <p><strong>Total Marks:</strong> ${selectedTestForResults.totalMarks}</p>
                            <p><strong>Passing Marks:</strong> ${selectedTestForResults.passingMarks}</p>
                          </div>
                          <div class="stats">
                            <div class="stat-box"><strong>Total Students:</strong> ${selectedTestForResults.marksCount}</div>
                            <div class="stat-box"><strong>Class Average:</strong> ${(selectedTestForResults.averageMarks || 0).toFixed(1)}</div>
                            <div class="stat-box"><strong>Attendance:</strong> ${selectedTestForResults.attendanceCount}</div>
                          </div>
                          <table>
                            <thead>
                              <tr>
                                <th>Rank</th>
                                <th>Student Name</th>
                                <th>Roll No</th>
                                <th>Batch Rank</th>
                                <th>Marks</th>
                                <th>Percentage</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${selectedTestForResults.studentResults?.map((result) => `
                                <tr>
                                  <td>#${result.rank}</td>
                                  <td>${result.name}</td>
                                  <td>${result.rollNumber}</td>
                                  <td>${result.batchRank || '-'}</td>
                                  <td>${result.marksObtained}/${selectedTestForResults.totalMarks}</td>
                                  <td>${result.percentage.toFixed(1)}%</td>
                                  <td class="${result.status}">✓ ${result.status.toUpperCase()}</td>
                                </tr>
                              `).join('')}
                            </tbody>
                          </table>
                          <p style="margin-top: 30px; text-align: center; color: #999; font-size: 12px;">
                            Generated on ${new Date().toLocaleString()}
                          </p>
                        </body>
                        </html>
                      `;
                      printWindow.document.write(html);
                      printWindow.document.close();
                      setTimeout(() => printWindow.print(), 250);
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H7a2 2 0 01-2-2v-4a2 2 0 012-2h10a2 2 0 012 2v4a2 2 0 01-2 2zm-6 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => {
                    // CSV Download functionality
                    let csv = 'Rank,Student Name,Roll Number,Batch Rank,Marks,Total Marks,Percentage,Status\n';
                    selectedTestForResults.studentResults?.forEach((result) => {
                      csv += `${result.rank},"${result.name}",${result.rollNumber},${result.batchRank || '-'},${result.marksObtained},${selectedTestForResults.totalMarks},${result.percentage.toFixed(1)},${result.status.toUpperCase()}\n`;
                    });
                    
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${selectedTestForResults.name}_Results.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  CSV
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold transition-colors text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
