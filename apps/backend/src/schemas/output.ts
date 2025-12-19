import { z } from 'zod';

export const storySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  acceptanceCriteria: z.array(z.string()),
  storyPoints: z.number().optional(),
});

export const epicSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  stories: z.array(storySchema),
});

export const riskSchema = z.object({
  id: z.string(),
  description: z.string(),
  impact: z.enum(['HIGH', 'MEDIUM', 'LOW']),
});

export const assumptionSchema = z.object({
  id: z.string(),
  description: z.string(),
  validated: z.boolean(),
});

export const questionSchema = z.object({
  id: z.string(),
  question: z.string(),
  owner: z.string().nullable().optional(),
});

export const analysisResultSchema = z.object({
  context: z.string(),
  keyInsights: z.array(z.string()),
  userProblems: z.array(z.string()),
  themes: z.array(z.string()),
});

export const storiesResultSchema = z.object({
  epics: z.array(epicSchema),
  risks: z.array(riskSchema),
  assumptions: z.array(assumptionSchema),
  openQuestions: z.array(questionSchema),
});

export const processingOutputSchema = z.object({
  metadata: z.object({
    boardId: z.string(),
    boardName: z.string(),
    processedAt: z.string(),
    stickyCount: z.number(),
  }),
  discoverySummary: z.object({
    context: z.string(),
    keyInsights: z.array(z.string()),
    userProblems: z.array(z.string()),
  }),
  epics: z.array(epicSchema),
  risks: z.array(riskSchema),
  assumptions: z.array(assumptionSchema),
  openQuestions: z.array(questionSchema),
});

export type StorySchema = z.infer<typeof storySchema>;
export type EpicSchema = z.infer<typeof epicSchema>;
export type AnalysisResultSchema = z.infer<typeof analysisResultSchema>;
export type StoriesResultSchema = z.infer<typeof storiesResultSchema>;
export type ProcessingOutputSchema = z.infer<typeof processingOutputSchema>;

