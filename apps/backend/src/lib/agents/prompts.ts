import { readFileSync } from "fs";
import { join } from "path";
import type { BoardContent, AnalysisResult } from "@/types";

// Resolve prompts directory - in Next.js, use process.cwd() for API routes
const promptsDir = join(process.cwd(), "src", "lib", "prompts");

function loadPrompt(filename: string): string {
  try {
    return readFileSync(join(promptsDir, filename), "utf-8");
  } catch (error) {
    console.warn(`[Prompts] Failed to load ${filename}, using fallback`);
    throw error;
  }
}

export function loadOrchestratorPrompt(): string {
  return loadPrompt("orchestrator.md");
}

export function buildOrchestratorPrompt(content: string): string {
  const basePrompt = loadOrchestratorPrompt();
  return `${basePrompt}\n\n## Project Information\n\n${content}\n\nNow generate the complete product breakdown in JSON format following the schema above.`;
}

export function buildAnalystPrompt(content: BoardContent): string {
  const elementsText = content.elements
    .map((el) => {
      const prefix =
        el.type === "frame" ? `\n### ${el.content}\n` : `- ${el.content}`;
      return prefix;
    })
    .join("\n");

  try {
    const template = loadPrompt("analyst.md");
    return template
      .replace("{{boardName}}", content.boardName)
      .replace("{{elementsText}}", elementsText);
  } catch {
    // Fallback to original implementation
    return `You are an expert Business Analyst reviewing a Miro brainstorming board.

## Your Task
Analyze the following content from a Miro board and extract key information for product development.

## Board: ${content.boardName}

## Board Content
${elementsText}

## Required Output
Provide a structured analysis in the following JSON format:

{
  "context": "A 2-3 sentence summary of what this brainstorming session is about",
  "keyInsights": ["insight 1", "insight 2", "insight 3", "insight 4", "insight 5"],
  "userProblems": ["problem 1", "problem 2", "problem 3"],
  "themes": ["theme 1", "theme 2", "theme 3"]
}

Rules:
- Be concise and actionable
- Focus on what's most important for product development
- Extract 3-5 key insights
- Identify specific user problems mentioned
- Group related items into themes
- Return ONLY valid JSON, no additional text`;
  }
}

export function buildPMPrompt(
  analysis: AnalysisResult,
  boardName: string
): string {
  try {
    const template = loadPrompt("pm.md");
    return template
      .replace("{{boardName}}", boardName)
      .replace("{{context}}", analysis.context)
      .replace(
        "{{keyInsights}}",
        analysis.keyInsights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")
      )
      .replace(
        "{{userProblems}}",
        analysis.userProblems.map((p, idx) => `${idx + 1}. ${p}`).join("\n")
      )
      .replace(
        "{{themes}}",
        analysis.themes.map((t, idx) => `${idx + 1}. ${t}`).join("\n")
      );
  } catch {
    // Fallback to original implementation
    return `You are an expert Product Manager creating user stories from discovery insights.

## Analysis Context
Board: ${boardName}

Context: ${analysis.context}

Key Insights:
${analysis.keyInsights.map((i, idx) => `${idx + 1}. ${i}`).join("\n")}

User Problems:
${analysis.userProblems.map((p, idx) => `${idx + 1}. ${p}`).join("\n")}

Themes:
${analysis.themes.map((t, idx) => `${idx + 1}. ${t}`).join("\n")}

## Your Task
Transform these insights into structured epics and user stories for Jira.

## IMPORTANT Story Format
Each story description MUST follow this EXACT format:
"As a [specific role], I want to [specific action], so that [specific benefit]"

Examples of GOOD story descriptions:
- "As a customer, I want to pay with PayPal, so that I can checkout faster"
- "As an admin, I want to view payment history, so that I can track transactions"
- "As a developer, I want a sandbox environment, so that I can test payments safely"

## Required Output
Return a JSON object with this exact structure:

{
  "epics": [
    {
      "id": "EPIC-001",
      "title": "Epic title",
      "description": "Epic description",
      "priority": "HIGH",
      "stories": [
        {
          "id": "STORY-001",
          "title": "Short descriptive title",
          "description": "As a [role], I want to [action], so that [benefit]",
          "acceptanceCriteria": [
            "User can perform specific action",
            "System displays expected result",
            "Error handling works correctly"
          ],
          "storyPoints": 3
        }
      ]
    }
  ],
  "risks": [
    { "id": "R1", "description": "Risk description", "impact": "HIGH" }
  ],
  "assumptions": [
    { "id": "A1", "description": "Assumption description", "validated": false }
  ],
  "openQuestions": [
    { "id": "Q1", "question": "Question text", "owner": null }
  ]
}

Rules:
- Create 1-3 epics maximum
- Each epic should have 2-4 user stories
- Story descriptions MUST use: "As a [role], I want to [action], so that [benefit]"
- Acceptance criteria should be simple, testable statements (NOT Given/When/Then format)
- Include 3-5 risks with impact levels (HIGH/MEDIUM/LOW)
- Include 3-5 assumptions
- Include 3-5 open questions
- Story points should be 1, 2, 3, 5, or 8
- Return ONLY valid JSON, no additional text`;
  }
}
