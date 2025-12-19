import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ProcessingStatus, ProcessingInput } from "@/types";
import type { ProjectOutput } from "@/schemas/project-output";
import { projectOutputSchema } from "@/schemas/project-output";
import { buildOrchestratorPrompt } from "./agents/prompts";
import { extractContentFromFile, extractMiroBoardId } from "./file-processor";
import { getMiroClient } from "./mcp/miro-api";
import { getMockBoardContent } from "./mcp/mock-data";

// Lazy initialize to ensure env vars are loaded
function getGenAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set"
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

export type StatusCallback = (status: ProcessingStatus) => void;

/**
 * Extract content from Miro board
 */
async function extractMiroContent(boardId: string): Promise<string> {
  const useMiro = process.env.MIRO_ENABLED === "true";

  let content;

  if (useMiro) {
    const miroClient = getMiroClient();
    console.log("[Orchestrator] Getting Miro board content:", boardId);
    content = await miroClient.getBoardContent(boardId);
  } else {
    console.log("[Orchestrator] Using mock data (Miro not enabled)");
    content = getMockBoardContent(boardId);
  }

  if (!content) {
    throw new Error(`Board not found: ${boardId}`);
  }

  if (content.elements.length === 0) {
    throw new Error("Board has no content to process");
  }

  // Format board content as text
  const elementsText = content.elements
    .map((el) => {
      const prefix =
        el.type === "frame" ? `\n### ${el.content}\n` : `- ${el.content}`;
      return prefix;
    })
    .join("\n");

  return `Miro Board: ${content.boardName}\n\n${elementsText}`;
}

/**
 * Process input and generate project output
 */
export async function processInput(
  input: ProcessingInput,
  onStatusChange?: StatusCallback
): Promise<ProjectOutput> {
  const updateStatus = (
    step: ProcessingStatus["step"],
    message: string,
    progress: number
  ) => {
    if (onStatusChange) {
      onStatusChange({ step, message, progress });
    }
    console.log(`[Orchestrator] ${step}: ${message} (${progress}%)`);
  };

  try {
    let extractedContent: string;

    // Step 1: Extract content based on input type
    if (input.type === "file") {
      updateStatus("reading", "Extracting content from file...", 20);
      const file = input.data as File;
      const result = await extractContentFromFile(file);
      extractedContent = result.text;
      console.log(
        `[Orchestrator] Extracted ${
          result.metadata?.wordCount || 0
        } words from ${result.type} file`
      );
    } else {
      // Miro URL
      updateStatus("connecting", "Connecting to Miro...", 10);
      const miroUrl = input.data as string;
      const boardId = extractMiroBoardId(miroUrl);

      if (!boardId) {
        throw new Error("Invalid Miro URL format");
      }

      updateStatus("reading", "Reading board content...", 20);
      extractedContent = await extractMiroContent(boardId);
      console.log(
        `[Orchestrator] Extracted content from Miro board: ${boardId}`
      );
    }

    // Step 2: Build prompt with extracted content
    updateStatus("analyzing", "Preparing AI analysis...", 40);
    const prompt = buildOrchestratorPrompt(extractedContent);

    // Step 3: Call AI with orchestrator prompt
    updateStatus("generating", "Generating project breakdown with AI...", 60);
    console.log("[Orchestrator] Calling Gemini API...");

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("[Orchestrator] Raw response received, length:", text.length);

    // Step 4: Clean and parse JSON response
    updateStatus("generating", "Parsing AI response...", 80);
    let cleanText = text.trim();

    // Remove markdown code blocks if present
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.slice(7);
    }
    if (cleanText.startsWith("```")) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    // Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("[Orchestrator] JSON parse error:", parseError);
      throw new Error(
        `Failed to parse AI response as JSON: ${
          parseError instanceof Error ? parseError.message : "Unknown error"
        }`
      );
    }

    // Step 5: Validate against schema
    updateStatus("generating", "Validating output...", 90);
    let validated: ProjectOutput;
    try {
      validated = projectOutputSchema.parse(parsed);
    } catch (validationError) {
      console.error("[Orchestrator] Schema validation error:", validationError);
      if (validationError instanceof Error && "issues" in validationError) {
        const zodError = validationError as {
          issues: Array<{ path: string[]; message: string }>;
        };
        const errors = zodError.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ");
        throw new Error(`Schema validation failed: ${errors}`);
      }
      throw new Error(
        `Schema validation failed: ${
          validationError instanceof Error
            ? validationError.message
            : "Unknown error"
        }`
      );
    }

    // Step 6: Complete
    updateStatus("complete", "Processing complete!", 100);
    console.log("[Orchestrator] Validation successful:", {
      epics: validated.epics.length,
      stories: validated.epics.reduce((acc, e) => acc + e.stories.length, 0),
      risks: validated.risks.length,
      assumptions: validated.assumptions.length,
    });

    return validated;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Processing failed";
    updateStatus("error", errorMessage, 0);
    throw error;
  }
}

/**
 * Legacy function for backward compatibility with Miro board processing
 */
export async function processBoard(
  boardId: string,
  onStatusChange?: StatusCallback
): Promise<ProjectOutput> {
  return processInput(
    { type: "miro-url", data: `https://miro.com/app/board/${boardId}/` },
    onStatusChange
  );
}
