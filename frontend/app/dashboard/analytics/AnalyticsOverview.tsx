'use client';

import { useMemo } from 'react';
import useSWR from 'swr';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Users, BookOpen, DollarSign } from 'lucide-react';

// Mock data generator
const generateMockData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const revenueData = months.map((month, i) => ({
    month,
    revenue: 15000 + Math.random() * 20000,
    target: 20000,
  }));

  const enrollmentData = months.map((month, i) => ({
    month,
    newStudents: 25 + Math.floor(Math.random() * 30),
    totalStudents: 200 + i * 40,
  }));

  const coursePerformance = [
    { name: 'Mathematics', students: 245, completion: 78, avgScore: 72 },
    { name: 'Science', students: 189, completion: 82, avgScore: 75 },
    { name: 'English', students: 210, completion: 85, avgScore: 78 },
    { name: 'History', students: 156, completion: 71, avgScore: 68 },
    { name: 'Commerce', students: 134, completion: 79, avgScore: 74 },
  ];

  const engagementData = [
    { name: 'Very High', value: 35 },
    { name: 'High', value: 28 },
    { name: 'Medium', value: 22 },
    { name: 'Low', value: 15 },
  ];

  const studentPerformance = months.map((month, i) => ({
    month,
    topPerformers: 15 + Math.floor(Math.random() * 10),
    average: 45 + Math.floor(Math.random() * 20),
    belowAverage: 40 - Math.floor(Math.random() * 15),
  }));

  return {
    revenueData,
    enrollmentData,
    coursePerformance,
    engagementData,
    studentPerformance,
  };
};

interface AnalyticsOverviewProps {
  tenantId: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsOverview({ tenantId }: AnalyticsOverviewProps) {
  const data = useMemo(() => generateMockData(), []);

  // Fetch real data when API is ready
  // revalidateOnFocus: false = Don't refetch on window focus
  // revalidateOnReconnect: false = Don't refetch on reconnect
  // dedupingInterval: 0 = Disable auto-revalidation (use mock data until API ready)
  const { data: apiData } = useSWR(
    tenantId ? `/api/analytics/dashboard?tenantId=${tenantId}` : null,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) return null;
      return res.json();
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
      errorRetryCount: 1,
    }
  );

  // Use API data if available, otherwise use mock data
  const displayData = apiData || data;

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalRevenue = displayData.revenueData.reduce((sum: number, item: any) => sum + item.revenue, 0);
    const totalStudents = displayData.enrollmentData[displayData.enrollmentData.length - 1]?.totalStudents || 0;
    const avgCompletion = displayData.coursePerformance.reduce((sum: number, item: any) => sum + item.completion, 0) / displayData.coursePerformance.length;
    const totalCourses = displayData.coursePerformance.length;

    return {
      totalRevenue: Math.round(totalRevenue),
      totalStudents,
      avgCompletion: Math.round(avgCompletion),
      totalCourses,
    };
  }, [displayData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Revenue',
            value: `₹${(metrics.totalRevenue / 100000).toFixed(1)}L`,
            icon: DollarSign,
            color: 'from-blue-500 to-blue-600',
          },
          {
            title: 'Active Students',
            value: metrics.totalStudents,
            icon: Users,
            color: 'from-green-500 to-green-600',
          },
          {
            title: 'Completion Rate',
            value: `${metrics.avgCompletion}%`,
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600',
          },
          {
            title: 'Total Courses',
            value: metrics.totalCourses,
            icon: BookOpen,
            color: 'from-orange-500 to-orange-600',
          },
        ].map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${metric.color} rounded-xl shadow-lg p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{metric.title}</p>
                  <p className="text-3xl font-bold mt-2">{metric.value}</p>
                </div>
                <Icon className="w-12 h-12 opacity-30" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={displayData.revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Student Enrollment */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Student Enrollment</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData.enrollmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="newStudents" fill="#10b981" name="New Students" />
              <Bar dataKey="totalStudents" fill="#3b82f6" name="Total Students" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Course Performance */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Course Performance</h3>
          <div className="space-y-3">
            {displayData.coursePerformance.map((course: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.students} students</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{course.completion}%</p>
                    <p className="text-xs text-gray-600">completion</p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${course.completion}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Engagement Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Student Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={displayData.engagementData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {displayData.engagementData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Performance Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Student Performance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={displayData.studentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="topPerformers" fill="#10b981" name="Top Performers" />
              <Bar dataKey="average" fill="#f59e0b" name="Average" />
              <Bar dataKey="belowAverage" fill="#ef4444" name="Below Average" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: '📈 Fastest Growing Course',
            value: 'Science',
            subtitle: '82% completion rate',
          },
          {
            title: '⭐ Highest Engagement',
            value: 'Mathematics',
            subtitle: 'Average score: 72/100',
          },
          {
            title: '🎯 Performance Trend',
            value: '+12% MoM',
            subtitle: 'Overall improvement',
          },
        ].map((insight, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-lg font-semibold text-gray-900 mb-1">{insight.title}</p>
            <p className="text-2xl font-bold text-blue-600 mb-2">{insight.value}</p>
            <p className="text-sm text-gray-600">{insight.subtitle}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
