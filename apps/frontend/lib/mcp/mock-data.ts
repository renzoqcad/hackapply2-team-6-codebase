import type { Board, BoardContent } from '@/types';

// Mock boards for development without MCP server
export const MOCK_BOARDS: Board[] = [
  {
    id: 'board-001',
    name: 'Q1 Product Discovery Session',
    description: 'Brainstorming session for Q1 features',
    lastModified: '2024-12-18T15:30:00Z',
  },
  {
    id: 'board-002',
    name: 'User Onboarding Improvements',
    description: 'Ideas for improving the onboarding flow',
    lastModified: '2024-12-17T10:00:00Z',
  },
  {
    id: 'board-003',
    name: 'Mobile App Feature Brainstorm',
    description: 'New features for mobile application',
    lastModified: '2024-12-15T14:20:00Z',
  },
];

// Mock board content for testing
export const MOCK_BOARD_CONTENT: Record<string, BoardContent> = {
  'board-001': {
    boardId: 'board-001',
    boardName: 'Q1 Product Discovery Session',
    extractedAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'frame', content: 'User Pain Points', color: '#ff9800' },
      { id: '2', type: 'sticky_note', content: 'Users struggle to find key features in the navigation', parentFrameId: '1', color: '#ffeb3b' },
      { id: '3', type: 'sticky_note', content: 'Onboarding takes too long - users drop off', parentFrameId: '1', color: '#ffeb3b' },
      { id: '4', type: 'sticky_note', content: 'No way to save progress and continue later', parentFrameId: '1', color: '#ffeb3b' },
      { id: '5', type: 'sticky_note', content: 'Mobile experience is frustrating', parentFrameId: '1', color: '#ffeb3b' },
      
      { id: '6', type: 'frame', content: 'Feature Ideas', color: '#4caf50' },
      { id: '7', type: 'sticky_note', content: 'Add quick action shortcuts on dashboard', parentFrameId: '6', color: '#c8e6c9' },
      { id: '8', type: 'sticky_note', content: 'Implement progress saving with auto-resume', parentFrameId: '6', color: '#c8e6c9' },
      { id: '9', type: 'sticky_note', content: 'Create guided tour for new users', parentFrameId: '6', color: '#c8e6c9' },
      { id: '10', type: 'sticky_note', content: 'Redesign mobile navigation with bottom tabs', parentFrameId: '6', color: '#c8e6c9' },
      { id: '11', type: 'sticky_note', content: 'Add search functionality across all sections', parentFrameId: '6', color: '#c8e6c9' },
      
      { id: '12', type: 'frame', content: 'Technical Considerations', color: '#2196f3' },
      { id: '13', type: 'sticky_note', content: 'Need to consider API rate limits for auto-save', parentFrameId: '12', color: '#bbdefb' },
      { id: '14', type: 'sticky_note', content: 'Mobile redesign requires native components', parentFrameId: '12', color: '#bbdefb' },
      { id: '15', type: 'sticky_note', content: 'Search needs Elasticsearch integration', parentFrameId: '12', color: '#bbdefb' },
      
      { id: '16', type: 'frame', content: 'User Quotes', color: '#9c27b0' },
      { id: '17', type: 'sticky_note', content: '"I never know where to find things"', parentFrameId: '16', color: '#e1bee7' },
      { id: '18', type: 'sticky_note', content: '"The app crashed and I lost all my work"', parentFrameId: '16', color: '#e1bee7' },
      { id: '19', type: 'sticky_note', content: '"Why cant I just search for what I need?"', parentFrameId: '16', color: '#e1bee7' },
    ],
  },
  'board-002': {
    boardId: 'board-002',
    boardName: 'User Onboarding Improvements',
    extractedAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'frame', content: 'Current Problems', color: '#f44336' },
      { id: '2', type: 'sticky_note', content: '40% drop-off rate during onboarding', parentFrameId: '1', color: '#ffcdd2' },
      { id: '3', type: 'sticky_note', content: 'Users skip tutorial and get confused', parentFrameId: '1', color: '#ffcdd2' },
      { id: '4', type: 'sticky_note', content: 'Too many form fields required upfront', parentFrameId: '1', color: '#ffcdd2' },
      
      { id: '5', type: 'frame', content: 'Solutions', color: '#4caf50' },
      { id: '6', type: 'sticky_note', content: 'Progressive profiling - ask less upfront', parentFrameId: '5', color: '#c8e6c9' },
      { id: '7', type: 'sticky_note', content: 'Interactive tutorial with real data', parentFrameId: '5', color: '#c8e6c9' },
      { id: '8', type: 'sticky_note', content: 'Gamification with progress badges', parentFrameId: '5', color: '#c8e6c9' },
      { id: '9', type: 'sticky_note', content: 'Personalized onboarding based on role', parentFrameId: '5', color: '#c8e6c9' },
    ],
  },
  'board-003': {
    boardId: 'board-003',
    boardName: 'Mobile App Feature Brainstorm',
    extractedAt: new Date().toISOString(),
    elements: [
      { id: '1', type: 'frame', content: 'Must Have', color: '#4caf50' },
      { id: '2', type: 'sticky_note', content: 'Offline mode with sync', parentFrameId: '1', color: '#c8e6c9' },
      { id: '3', type: 'sticky_note', content: 'Push notifications', parentFrameId: '1', color: '#c8e6c9' },
      { id: '4', type: 'sticky_note', content: 'Biometric login', parentFrameId: '1', color: '#c8e6c9' },
      
      { id: '5', type: 'frame', content: 'Nice to Have', color: '#ff9800' },
      { id: '6', type: 'sticky_note', content: 'Dark mode', parentFrameId: '5', color: '#ffe0b2' },
      { id: '7', type: 'sticky_note', content: 'Widget support', parentFrameId: '5', color: '#ffe0b2' },
      { id: '8', type: 'sticky_note', content: 'Voice commands', parentFrameId: '5', color: '#ffe0b2' },
    ],
  },
};

export function getMockBoards(): Board[] {
  return MOCK_BOARDS;
}

export function getMockBoardContent(boardId: string): BoardContent | null {
  return MOCK_BOARD_CONTENT[boardId] || null;
}

