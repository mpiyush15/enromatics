import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

/**
 * BFF Route: /api/academics/student/tests
 * 
 * GET /api/academics/student/tests - Get tests for authenticated student with marks
 * 
 * Features:
 * - ✅ Fetches tests for student's course and batch
 * - ✅ Includes student marks, percentage, rank
 * - ✅ Secure cookie forwarding
 * - ✅ Student authentication via protectStudent middleware
 */

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
    const endpoint = `/api/academics/student/tests${url.search}`;

    console.log('📤 Calling Express (Student Tests):', `${EXPRESS_URL}${endpoint}`);

    const expressResponse = await fetch(`${EXPRESS_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': extractCookies(request),
      },
    });

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      console.error('❌ Express API error:', {
        status: expressResponse.status,
        message: data.message,
      });

      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch student tests' },
        { status: expressResponse.status }
      );
    }

    console.log('✅ Student tests fetched from Express:', {
      count: data.tests?.length || 0,
      hasMarks: data.tests?.some((t: any) => t.marksObtained !== undefined),
    });

    const cleanData = {
      success: true,
      count: data.count,
      tests: data.tests || [],
    };

    return NextResponse.json(cleanData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('❌ BFF Student Tests GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
