// Board Types
export interface Board {
  id: string;
  name: string;
  description?: string;
  lastModified: string;
  thumbnailUrl?: string;
}

export interface BoardElement {
  id: string;
  type: 'sticky_note' | 'frame' | 'text' | 'shape';
  content: string;
  parentFrameId?: string;
  position?: { x: number; y: number };
  color?: string;
}

export interface BoardContent {
  boardId: string;
  boardName: string;
  elements: BoardElement[];
  extractedAt: string;
}

// Analysis Types
export interface AnalysisResult {
  context: string;
  keyInsights: string[];
  userProblems: string[];
  themes: string[];
}

// Story Types
export interface Story {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  storyPoints?: number;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  stories: Story[];
}

export interface Risk {
  id: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Assumption {
  id: string;
  description: string;
  validated: boolean;
}

export interface OpenQuestion {
  id: string;
  question: string;
  owner?: string;
}

// Output Types
export interface ProcessingOutput {
  metadata: {
    boardId: string;
    boardName: string;
    processedAt: string;
    stickyCount: number;
  };
  discoverySummary: {
    context: string;
    keyInsights: string[];
    userProblems: string[];
  };
  epics: Epic[];
  risks: Risk[];
  assumptions: Assumption[];
  openQuestions: OpenQuestion[];
}

// API Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Processing Status
export type ProcessingStep = 
  | 'idle'
  | 'connecting'
  | 'reading'
  | 'analyzing'
  | 'generating'
  | 'complete'
  | 'error';

export interface ProcessingStatus {
  step: ProcessingStep;
  message: string;
  progress: number;
}

// New Project Output Types (matching project-output.ts schema)
export type { ProjectOutput, ProjectSummary, Epic, Story, Risk, Assumption, OpenQuestion, OpenQuestionsCategory, OpenQuestions } from '@/schemas/project-output';

// Processing Input Types
export type ProcessingInputType = 'file' | 'miro-url';

export interface ProcessingInput {
  type: ProcessingInputType;
  data: File | string; // File for file upload, string for Miro URL
}

