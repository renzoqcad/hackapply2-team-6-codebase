import { NextRequest, NextResponse } from 'next/server';
import { processInput } from '@/lib/orchestrator';
import type { ProcessingInput } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const miroUrl = formData.get('miroUrl') as string | null;

    // Validate that exactly one input is provided
    if (!file && !miroUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_INPUT',
            message: 'Either file or miroUrl must be provided',
          },
        },
        { status: 400 }
      );
    }

    if (file && miroUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MULTIPLE_INPUTS',
            message: 'Only one of file or miroUrl should be provided',
          },
        },
        { status: 400 }
      );
    }

    // Validate file if provided
    if (file) {
      if (!(file instanceof File)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_FILE',
              message: 'Invalid file provided',
            },
          },
          { status: 400 }
        );
      }

      // Check file size (e.g., 10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FILE_TOO_LARGE',
              message: `File size exceeds ${maxSize / 1024 / 1024}MB limit`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Validate Miro URL if provided
    if (miroUrl) {
      if (typeof miroUrl !== 'string' || !miroUrl.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_MIRO_URL',
              message: 'Invalid Miro URL provided',
            },
          },
          { status: 400 }
        );
      }
    }

    // Prepare input
    const input: ProcessingInput = file
      ? { type: 'file', data: file }
      : { type: 'miro-url', data: miroUrl!.trim() };

    console.log(`[API] Processing ${input.type}:`, file ? file.name : miroUrl);

    // Process input
    const result = await processInput(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[API] Processing failed:', error);

    const message = error instanceof Error ? error.message : 'Processing failed';
    
    // Determine error type
    let status = 500;
    let code = 'PROCESSING_FAILED';

    if (message.includes('not found') || message.includes('Board not found')) {
      status = 404;
      code = 'BOARD_NOT_FOUND';
    } else if (message.includes('validation') || message.includes('schema')) {
      status = 400;
      code = 'VALIDATION_ERROR';
    } else if (message.includes('Unsupported file type') || message.includes('Invalid')) {
      status = 400;
      code = 'INVALID_INPUT';
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code,
          message,
        },
      },
      { status }
    );
  }
}

