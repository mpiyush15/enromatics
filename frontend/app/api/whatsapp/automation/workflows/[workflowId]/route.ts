import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://endearing-blessing-production-c61f.up.railway.app';

export async function GET(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const { workflowId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/automation/workflows/${workflowId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await response.json();
    const newResponse = NextResponse.json(data, { status: response.status });
    
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      newResponse.headers.set('set-cookie', setCookieHeader);
    }

    return newResponse;
  } catch (error) {
    console.error('BFF Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const { workflowId } = params;
    const body = await req.json();

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/automation/workflows/${workflowId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    const data = await response.json();
    const newResponse = NextResponse.json(data, { status: response.status });
    
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      newResponse.headers.set('set-cookie', setCookieHeader);
    }

    return newResponse;
  } catch (error) {
    console.error('BFF Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { workflowId: string } }
) {
  try {
    const cookies = req.headers.get('cookie') || '';
    const { workflowId } = params;

    const response = await fetch(
      `${BACKEND_URL}/api/whatsapp/automation/workflows/${workflowId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies,
        },
        credentials: 'include',
      }
    );

    const data = await response.json();
    const newResponse = NextResponse.json(data, { status: response.status });
    
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      newResponse.headers.set('set-cookie', setCookieHeader);
    }

    return newResponse;
  } catch (error) {
    console.error('BFF Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
}
