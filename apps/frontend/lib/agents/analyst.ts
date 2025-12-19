import { GoogleGenerativeAI } from '@google/generative-ai';
import type { BoardContent, AnalysisResult } from '@/types';
import { analysisResultSchema } from '@/schemas/output';
import { buildAnalystPrompt } from './prompts';

// Lazy initialize to ensure env vars are loaded
function getGenAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function analyzeContent(content: BoardContent): Promise<AnalysisResult> {
  const prompt = buildAnalystPrompt(content);

  console.log('[Analyst] Starting analysis for board:', content.boardName);
  console.log('[Analyst] Elements count:', content.elements.length);

  try {
    console.log('[Analyst] Calling Gemini 2.0 Flash API...');
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('[Analyst] Raw response received, length:', text.length);

    // Clean the response - remove markdown code blocks if present
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    // Parse and validate the response
    const parsed = JSON.parse(cleanText);
    const validated = analysisResultSchema.parse(parsed);

    console.log('[Analyst] Analysis complete:', {
      insights: validated.keyInsights.length,
      problems: validated.userProblems.length,
      themes: validated.themes.length,
    });

    return validated;
  } catch (error) {
    console.error('[Analyst] Analysis failed:', error instanceof Error ? error.message : error);
    
    // Return fallback analysis if AI fails
    return {
      context: `Analysis of ${content.boardName} with ${content.elements.length} elements.`,
      keyInsights: ['Unable to generate insights - please try again'],
      userProblems: ['Analysis service temporarily unavailable'],
      themes: ['Error handling required'],
    };
  }
}
