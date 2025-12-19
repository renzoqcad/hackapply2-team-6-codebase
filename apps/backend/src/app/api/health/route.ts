import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';

export async function GET() {
  try {
    const client = getMCPClient();
    const connected = await client.connect();
    const isUsingMock = client.isUsingMock();

    return NextResponse.json({
      status: connected ? 'healthy' : 'degraded',
      mcp: {
        connected,
        mode: isUsingMock ? 'mock' : 'miro-api',
      },
      miroEnabled: process.env.MIRO_ENABLED === 'true',
      hasApiKey: !!process.env.MIRO_API_KEY,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        mcp: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
