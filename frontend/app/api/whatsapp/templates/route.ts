import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * GET /api/whatsapp/templates
 * Fetch all WhatsApp templates for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching templates for tenant: ${tenantId}`);

    const backendUrl = getApiUrl('/api/whatsapp/templates');
    const response = await fetch(`${backendUrl}?tenantId=${tenantId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`✅ Retrieved ${data.templates?.length || 0} templates for tenant: ${tenantId}`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/whatsapp/templates
 * Create a new WhatsApp template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, templateName, templateBody, category, language } = body;

    if (!tenantId || !templateName || !templateBody) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'tenantId, templateName, and templateBody are required' },
        { status: 400 }
      );
    }

    console.log(`🆕 Creating template "${templateName}" for tenant: ${tenantId}`);

    const backendUrl = getApiUrl('/api/whatsapp/templates');
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        tenantId,
        templateName,
        templateBody,
        category: category || 'MARKETING',
        language: language || 'en',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`✅ Template "${templateName}" created successfully`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
