import { NextResponse } from 'next/server';
import { getMCPClient } from '@/lib/mcp/client';

export async function GET() {
  try {
    const client = getMCPClient();
    const boards = await client.listBoards();

    return NextResponse.json({
      success: true,
      data: { boards },
    });
  } catch (error) {
    console.error('[API] Failed to fetch boards:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BOARDS_FETCH_FAILED',
          message: error instanceof Error ? error.message : 'Failed to fetch boards',
        },
      },
      { status: 500 }
    );
  }
}

