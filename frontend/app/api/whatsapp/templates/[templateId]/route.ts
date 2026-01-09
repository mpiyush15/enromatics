import { NextRequest, NextResponse } from 'next/server';
import { getApiUrl } from '@/lib/apiConfig';

/**
 * DELETE /api/whatsapp/templates/[templateId]
 * Delete a WhatsApp template
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params;
    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    console.log(`🗑️ Deleting template ${templateId} for tenant: ${tenantId}`);

    const backendUrl = getApiUrl(`/api/whatsapp/templates/${templateId}`);
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({ tenantId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    console.log(`✅ Template ${templateId} deleted successfully`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
