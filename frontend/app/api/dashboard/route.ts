/**
 * BFF Dashboard Route
 * 
 * GET /api/dashboard/overview - Dashboard stats and summary
 * GET /api/dashboard/stats - Quick statistics
 * 
 * This route provides aggregated data for the dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function GET(request: NextRequest) {
  try {
    const EXPRESS_URL = (process as any).env?.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const endpoint = url.pathname.replace('/api/dashboard', '/api/dashboard');
    const queryString = url.search;

    console.log('📤 Calling Express dashboard:', `${EXPRESS_URL}${endpoint}${queryString}`);

    const expressResponse = await fetch(
      `${EXPRESS_URL}${endpoint}${queryString}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch dashboard data' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Dashboard data retrieved');

    // Clean sensitive data from dashboard
    const cleanData = {
      success: true,
      ...cleanDashboardData(data),
    };

    return NextResponse.json(cleanData);
  } catch (error) {
    console.error('❌ BFF Dashboard GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Clean dashboard data - remove sensitive information
 */
function cleanDashboardData(data: any): any {
  return {
    overview: data.overview ? {
      totalStudents: data.overview.totalStudents,
      totalTeachers: data.overview.totalTeachers,
      totalClasses: data.overview.totalClasses,
      totalExams: data.overview.totalExams,
      totalRevenue: data.overview.totalRevenue,
      averageAttendance: data.overview.averageAttendance,
      pendingFees: data.overview.pendingFees,
    } : undefined,
    
    stats: data.stats ? {
      activeStudents: data.stats.activeStudents,
      activeTeachers: data.stats.activeTeachers,
      recentLogins: data.stats.recentLogins,
      pendingAssignments: data.stats.pendingAssignments,
      upcomingExams: data.stats.upcomingExams,
      averageGPA: data.stats.averageGPA,
    } : undefined,

    recentActivity: Array.isArray(data.recentActivity)
      ? data.recentActivity.slice(0, 20).map((activity: any) => ({
          id: activity._id,
          type: activity.type,
          title: activity.title,
          timestamp: activity.timestamp,
          user: activity.user,
        }))
      : undefined,

    charts: data.charts ? {
      attendanceByClass: data.charts.attendanceByClass,
      revenueByMonth: data.charts.revenueByMonth,
      studentDistribution: data.charts.studentDistribution,
    } : undefined,

    message: data.message,
  };
}
