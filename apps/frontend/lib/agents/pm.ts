import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AnalysisResult, Epic, Risk, Assumption, OpenQuestion } from '@/types';
import { storiesResultSchema } from '@/schemas/output';
import { buildPMPrompt } from './prompts';

// Lazy initialize to ensure env vars are loaded
function getGenAI() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

export interface StoriesResult {
  epics: Epic[];
  risks: Risk[];
  assumptions: Assumption[];
  openQuestions: OpenQuestion[];
}

export async function generateStories(
  analysis: AnalysisResult,
  boardName: string
): Promise<StoriesResult> {
  const prompt = buildPMPrompt(analysis, boardName);

  console.log('[PM] Starting story generation for:', boardName);

  try {
    console.log('[PM] Calling Gemini 2.0 Flash API...');
    
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('[PM] Raw response received, length:', text.length);

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
    const validated = storiesResultSchema.parse(parsed);

    console.log('[PM] Stories generated:', {
      epics: validated.epics.length,
      stories: validated.epics.reduce((acc, e) => acc + e.stories.length, 0),
      risks: validated.risks.length,
    });

    return validated;
  } catch (error) {
    console.error('[PM] Story generation failed:', error instanceof Error ? error.message : error);
    
    // Return fallback if AI fails
    return {
      epics: [
        {
          id: 'EPIC-ERR',
          title: 'Processing Error',
          description: 'Unable to generate epics - please try again',
          priority: 'HIGH',
          stories: [
            {
              id: 'STORY-ERR',
              title: 'Retry Processing',
              description: 'As a user, I want to retry processing, so that I can get valid results',
              acceptanceCriteria: ['Given an error occurred, When I click retry, Then processing restarts'],
            },
          ],
        },
      ],
      risks: [{ id: 'R1', description: 'AI service may be temporarily unavailable', impact: 'MEDIUM' }],
      assumptions: [{ id: 'A1', description: 'API keys are correctly configured', validated: false }],
      openQuestions: [{ id: 'Q1', question: 'Is the Gemini API key valid?' }],
    };
  }
}
