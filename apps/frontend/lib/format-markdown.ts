import type { ProcessingOutput } from '@/types';

export function formatAsJiraMarkdown(output: ProcessingOutput): string {
  const lines: string[] = [];
  
  // Header with board name as Feature
  lines.push(`# Feature: ${output.metadata.boardName}`);
  lines.push('');
  
  // Problem Statement from discovery summary
  lines.push('## Problem Statement');
  lines.push('');
  lines.push(output.discoverySummary.context);
  if (output.discoverySummary.userProblems.length > 0) {
    lines.push('');
    output.discoverySummary.userProblems.forEach((problem) => {
      lines.push(`- ${problem}`);
    });
  }
  lines.push('');
  
  // User Stories
  lines.push('## User Stories');
  lines.push('');
  
  let storyCounter = 1;
  
  output.epics.forEach((epic) => {
    epic.stories.forEach((story) => {
      // Parse the "As a... I want... so that..." format
      const parsed = parseStoryDescription(story.description);
      
      lines.push(`### US-${storyCounter}: ${story.title}`);
      lines.push('');
      lines.push(`**As** ${parsed.role} **I want** ${parsed.action} **for** ${parsed.benefit}`);
      lines.push('');
      
      lines.push('**Acceptance Criteria:**');
      story.acceptanceCriteria.forEach((ac) => {
        lines.push(`- [ ] ${ac}`);
      });
      lines.push('');
      
      storyCounter++;
    });
  });
  
  // Risks & Assumptions
  lines.push('## Risks & Assumptions');
  lines.push('');
  
  // Risks first
  output.risks.forEach((risk) => {
    lines.push(`- **Risk:** ${risk.description}`);
  });
  
  // Then assumptions
  output.assumptions.forEach((assumption) => {
    lines.push(`- **Assumption:** ${assumption.description}`);
  });
  
  lines.push('');
  
  // Open Questions (if any)
  if (output.openQuestions.length > 0) {
    lines.push('## Open Questions');
    lines.push('');
    output.openQuestions.forEach((q) => {
      lines.push(`- ${q.question}`);
    });
    lines.push('');
  }
  
  return lines.join('\n');
}

// Format for individual story export (single Jira ticket)
export function formatSingleStory(
  story: { title: string; description: string; acceptanceCriteria: string[] },
  storyNumber: number,
  problemStatement: string
): string {
  const lines: string[] = [];
  const parsed = parseStoryDescription(story.description);
  
  lines.push(`### US-${storyNumber}: ${story.title}`);
  lines.push('');
  lines.push(`**As** ${parsed.role} **I want** ${parsed.action} **for** ${parsed.benefit}`);
  lines.push('');
  lines.push('**Acceptance Criteria:**');
  story.acceptanceCriteria.forEach((ac) => {
    lines.push(`- [ ] ${ac}`);
  });
  
  return lines.join('\n');
}

function parseStoryDescription(description: string): { role: string; action: string; benefit: string } {
  // Try to parse "As a [role], I want [action], so that [benefit]"
  const patterns = [
    /As an?\s+(.+?),?\s+I want\s+(.+?),?\s+so that\s+(.+)/i,
    /As an?\s+(.+?),?\s+I want\s+(.+?)\s+for\s+(.+)/i,
    /As an?\s+(.+?)\s+I want\s+(.+?)\s+so that\s+(.+)/i,
    /As an?\s+(.+?),?\s+I want to\s+(.+?),?\s+so that\s+(.+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      return {
        role: match[1].trim(),
        action: match[2].trim(),
        benefit: match[3].trim(),
      };
    }
  }
  
  // Fallback: just use the description as action
  return {
    role: 'a user',
    action: description.replace(/^As an?\s+\w+,?\s*/i, '').replace(/^I want\s+/i, ''),
    benefit: 'improved experience',
  };
}
