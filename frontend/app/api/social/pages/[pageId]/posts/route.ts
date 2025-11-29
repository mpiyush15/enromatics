import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const { pageId } = params;
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') || '20';

    console.log('🔵 BFF: Fetching posts for page:', pageId, 'limit:', limit);

    if (!pageId) {
      return NextResponse.json(
        { error: 'pageId is required' },
        { status: 400 }
      );
    }

    // Get cookies from request
    const cookies = request.headers.get('cookie') || '';

    // Fetch from backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/facebook/pages/${pageId}/posts?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('🔴 Backend error:', data);
      return NextResponse.json(data, {
        status: backendResponse.status,
      });
    }

    console.log('✅ Posts fetched successfully');
    return NextResponse.json(data, {
      status: 200,
    });
  } catch (error: any) {
    console.error('🔴 Error fetching posts:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
