import { NextRequest, NextResponse } from 'next/server';
import { extractCookies } from '@/lib/bff-client';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const EXPRESS_URL = process.env.EXPRESS_BACKEND_URL;
    if (!EXPRESS_URL) {
      return NextResponse.json(
        { success: false, message: 'Backend configuration error' },
        { status: 500 }
      );
    }

    const { id } = params;

    console.log('📤 Resetting student password:', id);

    const expressResponse = await fetch(
      `${EXPRESS_URL}/api/students/${id}/reset-password`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': extractCookies(request),
        },
        body: JSON.stringify(await request.json()),
      }
    );

    const data = await expressResponse.json();

    if (!expressResponse.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to reset password' },
        { status: expressResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.newPassword || 'Password reset successfully',
    });
  } catch (error) {
    console.error('❌ BFF reset-password error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
