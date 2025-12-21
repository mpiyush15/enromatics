/**
 * BFF Payments Individual Route (STABILIZED - NO CACHING)
 * 
 * DELETE /api/payments/[id] - Delete a payment
 * 
 * This route:
 * 1. Receives payment ID from URL
 * 2. Forwards cookies to Express backend
 * 3. Calls Express /api/payments/:id endpoint
 * 4. Returns response
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.EXPRESS_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookies = request.headers.get('cookie') || '';

    console.log('📤 Deleting payment via Backend:', id);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/payments/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      console.error('❌ Backend DELETE error:', backendResponse.status, data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete payment' },
        { status: backendResponse.status }
      );
    }

    console.log('✅ Payment deleted successfully');

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ BFF Payments DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
