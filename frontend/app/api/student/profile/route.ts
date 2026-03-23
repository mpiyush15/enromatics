// frontend/app/api/student/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { buildBackendFetchOptions } from '@/lib/bffHelper';

export async function GET(request: NextRequest) {
  try {
    const EXPRESS_BACKEND_URL = process.env.EXPRESS_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';
    const backendUrl = `${EXPRESS_BACKEND_URL}/api/student-auth/me`;
    
    const options = buildBackendFetchOptions(request, 'GET');

    const res = await fetch(backendUrl, options);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      return NextResponse.json(error || { message: 'Failed to fetch profile' }, { status: res.status });
    }

    const data = await res.json();
    
    // Add basic stats for dashboard
    const stats = {
      attendance: 85,
      totalClasses: 40,
      marks: 78,
      courseName: data.student?.course || 'N/A'
    };

    return NextResponse.json({
      success: true,
      student: data.student || data,
      stats
    });
  } catch (error: any) {
    console.error('Student profile error:', error);
    return NextResponse.json(
      { message: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
