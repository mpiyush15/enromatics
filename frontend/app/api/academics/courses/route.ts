/**
 * BFF Courses Route (STABILIZED)
 * 
 * GET /api/academics/courses - Get list of available courses
 * 
 * Returns hardcoded list of common courses for now.
 * Can be connected to backend later if needed.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Common courses for coaching institutes
    const courses = [
      { _id: '1', name: 'NEET', description: 'Medical entrance exam preparation' },
      { _id: '2', name: 'JEE', description: 'Engineering entrance exam preparation' },
      { _id: '3', name: 'MHT-CET', description: 'Maharashtra state entrance exam' },
      { _id: '4', name: 'Repeaters', description: 'For students repeating the year' },
      { _id: '5', name: 'Foundation', description: 'Foundation courses for 11th/12th' },
    ];

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('❌ BFF Courses GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
