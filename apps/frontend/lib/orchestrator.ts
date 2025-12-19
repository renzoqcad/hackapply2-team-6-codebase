import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync } from "fs";
import { join } from "path";
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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 8192, // Maximum for gemini-2.0-flash
        temperature: 0.9,
      },
    });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("[Orchestrator] Raw response received, length:", text.length);

    // Save raw response to file for debugging
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `ai-response-${timestamp}.txt`;
      const filepath = join(process.cwd(), "debug", filename);
      writeFileSync(filepath, text, "utf-8");
      console.log("[Orchestrator] Raw response saved to:", filepath);
    } catch (error) {
      console.warn("[Orchestrator] Failed to save response to file:", error);
    }

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

    // Parse JSON with repair attempts
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("[Orchestrator] JSON parse error:", parseError);
      console.log("[Orchestrator] Attempting to repair JSON...");

      try {
        // Attempt 1: Extract JSON between first { and last }
        const firstBrace = cleanText.indexOf("{");
        const lastBrace = cleanText.lastIndexOf("}");
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          const extracted = cleanText.slice(firstBrace, lastBrace + 1);
          parsed = JSON.parse(extracted);
          console.log(
            "[Orchestrator] Successfully repaired JSON by extracting"
          );
        } else {
          throw parseError;
        }
      } catch (repairError) {
        // Attempt 2: Try to fix unterminated strings by finding incomplete quotes
        console.log(
          "[Orchestrator] First repair attempt failed, trying string fix..."
        );
        try {
          let fixed = cleanText;
          // Find position mentioned in error
          const errorMatch =
            parseError instanceof Error
              ? parseError.message.match(/position (\d+)/)
              : null;

          if (errorMatch) {
            const position = parseInt(errorMatch[1]);
            console.log(`[Orchestrator] Error at position ${position}`);

            // Try to complete the JSON by closing unterminated strings/objects
            // Find the last complete object before the error
            const beforeError = fixed.slice(0, position);
            const lastCompleteObj = beforeError.lastIndexOf("},");

            if (lastCompleteObj !== -1) {
              // Truncate to last complete object and close the array/object
              fixed = beforeError.slice(0, lastCompleteObj + 1) + "]}";
              console.log("[Orchestrator] Attempting to parse truncated JSON");
              parsed = JSON.parse(fixed);
              console.log("[Orchestrator] Successfully parsed truncated JSON");
            } else {
              throw repairError;
            }
          } else {
            throw repairError;
          }
        } catch (finalError) {
          console.error("[Orchestrator] All repair attempts failed");
          throw new Error(
            `Failed to parse AI response as JSON: ${
              parseError instanceof Error ? parseError.message : "Unknown error"
            }. Please check the debug file for the raw response.`
          );
        }
      }
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
