import { z } from "zod";

// Project Summary Schema
export const projectSummarySchema = z.object({
  title: z.string(),
  description: z.string(),
  objectives: z.array(z.string()),
});

// Story Schema
export const storySchema = z.object({
  id: z.string().regex(/^STORY-\d{3}-\d{2}$/),
  title: z.string(),
  shortDescription: z.string(),
  fullDescription: z.string(),
  acceptanceCriteria: z.array(z.string()),
  tags: z.array(z.string()),
});

// Epic Schema
export const epicSchema = z.object({
  id: z.string().regex(/^EPIC-\d{3}$/),
  title: z.string(),
  description: z.string(),
  stories: z.array(storySchema),
});

// Risk Schema
export const riskSchema = z.object({
  id: z.string().regex(/^RISK-\d{3}$/),
  description: z.string(),
  impact: z.enum(["low", "medium", "high"]),
  probability: z.enum(["low", "medium", "high"]),
  mitigation: z.string(),
});

// Assumption Schema
export const assumptionSchema = z.object({
  id: z.string().regex(/^ASSUMPTION-\d{3}$/),
  description: z.string(),
  reason: z.string(),
});

// Open Question Schema
export const openQuestionSchema = z.object({
  id: z.string().regex(/^Q-\d{3}$/),
  question: z.string(),
  type: z.enum([
    "clarification",
    "missing_detail",
    "dependency",
    "functional",
    "non_functional",
    "technical",
  ]),
  origin: z.string(),
});

// Open Questions Category Schema
export const openQuestionsCategorySchema = z.object({
  category: z.string(),
  questions: z.array(openQuestionSchema),
});

// Open Questions Schema
export const openQuestionsSchema = z.object({
  unclassified: z.array(z.unknown()).default([]),
  categories: z.array(openQuestionsCategorySchema),
});

// Project Output Schema (Root)
export const projectOutputSchema = z.object({
  projectSummary: projectSummarySchema,
  epics: z.array(epicSchema),
  risks: z.array(riskSchema),
  assumptions: z.array(assumptionSchema),
  openQuestions: openQuestionsSchema,
});

// Type exports
export type ProjectSummary = z.infer<typeof projectSummarySchema>;
export type Story = z.infer<typeof storySchema>;
export type Epic = z.infer<typeof epicSchema>;
export type Risk = z.infer<typeof riskSchema>;
export type Assumption = z.infer<typeof assumptionSchema>;
export type OpenQuestion = z.infer<typeof openQuestionSchema>;
export type OpenQuestionsCategory = z.infer<typeof openQuestionsCategorySchema>;
export type OpenQuestions = z.infer<typeof openQuestionsSchema>;
export type ProjectOutput = z.infer<typeof projectOutputSchema>;
