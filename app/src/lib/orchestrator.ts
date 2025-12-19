import type { ProcessingOutput, ProcessingStatus } from '@/types';
import { getMCPClient } from './mcp/client';
import { analyzeContent } from './agents/analyst';
import { generateStories } from './agents/pm';

export type StatusCallback = (status: ProcessingStatus) => void;

export async function processBoard(
  boardId: string,
  onStatusChange?: StatusCallback
): Promise<ProcessingOutput> {
  const updateStatus = (step: ProcessingStatus['step'], message: string, progress: number) => {
    if (onStatusChange) {
      onStatusChange({ step, message, progress });
    }
    console.log(`[Orchestrator] ${step}: ${message} (${progress}%)`);
  };

  try {
    // Step 1: Connect to MCP
    updateStatus('connecting', 'Connecting to Miro...', 10);
    const client = getMCPClient();
    await client.connect();

    // Step 2: Read board content
    updateStatus('reading', 'Reading board content...', 25);
    const content = await client.getBoardContent(boardId);

    if (!content) {
      throw new Error(`Board not found: ${boardId}`);
    }

    if (content.elements.length === 0) {
      throw new Error('Board has no content to process');
    }

    const stickyCount = content.elements.filter((e) => e.type === 'sticky_note').length;
    console.log(`[Orchestrator] Found ${stickyCount} sticky notes`);

    // Step 3: Analyze with Analyst agent
    updateStatus('analyzing', 'Analyzing content with AI...', 50);
    const analysis = await analyzeContent(content);

    // Step 4: Generate stories with PM agent
    updateStatus('generating', 'Generating epics and stories...', 75);
    const stories = await generateStories(analysis, content.boardName);

    // Step 5: Format output
    updateStatus('complete', 'Processing complete!', 100);

    const output: ProcessingOutput = {
      metadata: {
        boardId: content.boardId,
        boardName: content.boardName,
        processedAt: new Date().toISOString(),
        stickyCount,
      },
      discoverySummary: {
        context: analysis.context,
        keyInsights: analysis.keyInsights,
        userProblems: analysis.userProblems,
      },
      epics: stories.epics,
      risks: stories.risks,
      assumptions: stories.assumptions,
      openQuestions: stories.openQuestions,
    };

    return output;
  } catch (error) {
    updateStatus('error', error instanceof Error ? error.message : 'Processing failed', 0);
    throw error;
  }
}

