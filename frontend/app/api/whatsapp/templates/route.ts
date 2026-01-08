import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Missing tenantId parameter' },
        { status: 400 }
      );
    }

    // Get tenant API key from backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
    
    const response = await fetch(
      `${backendUrl}/api/whatsapp/templates?tenantId=${tenantId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      console.error(`Backend response: ${response.status}`, await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch templates from backend' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Transform templates to match frontend expectations
    const templates = data.data?.templates?.map((template: any) => ({
      id: template._id || template.id,
      name: template.name,
      status: template.status?.toUpperCase() || 'PENDING_REVIEW',
      language: template.language || 'en',
      category: template.category || 'MARKETING',
      headerText: template.components?.find((c: any) => c.type === 'HEADER')?.text || template.components?.find((c: any) => c.type === 'HEADER')?.values?.[0],
      bodyText: template.components?.find((c: any) => c.type === 'BODY')?.text || template.content,
      footerText: template.components?.find((c: any) => c.type === 'FOOTER')?.text,
      usageCount: template.usageCount || 0,
      metaTemplateId: template.metaTemplateId,
    })) || [];
    
    // Return templates in expected format
    return NextResponse.json({
      success: true,
      data: {
        templates: templates
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}
