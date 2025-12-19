import { NextRequest, NextResponse } from 'next/server';
import { processBoard } from '@/lib/orchestrator';

export async function POST(
  request: NextRequest,
  { params }: { params: { boardId: string } }
) {
  const { boardId } = params;

  if (!boardId) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MISSING_BOARD_ID',
          message: 'Board ID is required',
        },
      },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Processing board: ${boardId}`);
    const result = await processBoard(boardId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Processing failed:', error);

    const message = error instanceof Error ? error.message : 'Processing failed';
    const isNotFound = message.includes('not found');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: isNotFound ? 'BOARD_NOT_FOUND' : 'PROCESSING_FAILED',
          message,
        },
      },
      { status: isNotFound ? 404 : 500 }
    );
  }
}

