# PROJECT BRIEF: Miro-to-Stories Framework

## 1. Executive Summary

**Project Name:** Miro-to-Stories Framework  
**Type:** Internal Tool — MVP  
**Timeline:** 8 hours of development  
**Stakeholders:** Product Managers, Business Analysts, Engineering Leads

### Problem

Teams conduct discovery and brainstorming sessions in Miro, but the process of converting those insights into structured epics and user stories is manual, inconsistent, and time-consuming.

### Solution

A lightweight web application that:

1. Reads Miro boards via MCP server
2. Processes content through specialized BMAD agents
3. Generates structured JSON output ready for Jira import

### Value Proposition

> "From Miro brainstorming to Jira-ready stories in minutes, not hours."

---

## 2. Goals & Success Criteria

### Primary Goals

| # | Goal | Success Metric |
|---|------|----------------|
| 1 | Reduce story creation time | From ~2hrs manual → <10min automated |
| 2 | Standardize output format | 100% of stories with structured ACs |
| 3 | Capture risks/assumptions automatically | Minimum 3 of each per board |

### Secondary Goals

- Familiarize team with MCP architecture
- Validate BMAD agent integration in real workflow
- Create extensible foundation for future integrations

---

## 3. Scope Definition

### ✅ IN SCOPE (MVP 8hrs)

| Component | Description |
|-----------|-------------|
| **Miro Reader** | MCP connection, reading stickies/frames/text |
| **Simple Web UI** | Board selector, process button, result display |
| **Orchestrator** | Sequence: Analyst → PM → Output |
| **JSON Generator** | Schema compatible with Jira import |

### ❌ OUT OF SCOPE (v1)

| Component | Reason |
|-----------|--------|
| Direct Jira push | OAuth/API complexity — future |
| Multiple simultaneous boards | MVP = 1 board at a time |
| In-app story editing | Output is final, editing in Jira |
| User authentication | Internal tool, no auth needed |
| Persistence/history | Stateless for MVP |

---

## 4. User Flow (MVP)

```
┌─────────────────────────────────────────────────────────────┐
│                      USER JOURNEY                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User opens the web app                                  │
│           │                                                 │
│           ▼                                                 │
│  2. Sees list of available Miro boards                      │
│           │                                                 │
│           ▼                                                 │
│  3. Selects a discovery/brainstorming board                 │
│           │                                                 │
│           ▼                                                 │
│  4. Clicks "Process Board"                                  │
│           │                                                 │
│           ▼                                                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         PROCESSING (Backend)                           │ │
│  │  • MCP reads board content                             │ │
│  │  • Analyst agent: summarizes insights                  │ │
│  │  • PM agent: structures epics/stories                  │ │
│  │  • Generates JSON output                               │ │
│  └────────────────────────────────────────────────────────┘ │
│           │                                                 │
│           ▼                                                 │
│  5. Sees structured result on screen                        │
│           │                                                 │
│           ▼                                                 │
│  6. Clicks "Copy JSON" or "Download"                        │
│           │                                                 │
│           ▼                                                 │
│  7. Pastes into Jira bulk import                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Output Schema (JSON)

```json
{
  "metadata": {
    "board_id": "string",
    "board_name": "string",
    "processed_at": "ISO8601",
    "sticky_count": "number"
  },
  "discovery_summary": {
    "context": "string",
    "key_insights": ["string"],
    "user_problems": ["string"]
  },
  "epics": [
    {
      "id": "EPIC-001",
      "title": "string",
      "description": "string",
      "priority": "HIGH|MEDIUM|LOW",
      "stories": [
        {
          "id": "STORY-001",
          "title": "string",
          "description": "As a [user], I want [goal], so that [benefit]",
          "acceptance_criteria": [
            "Given [context], When [action], Then [outcome]"
          ],
          "story_points": "number|null"
        }
      ]
    }
  ],
  "risks": [
    { "id": "R1", "description": "string", "impact": "HIGH|MEDIUM|LOW" }
  ],
  "assumptions": [
    { "id": "A1", "description": "string", "validated": false }
  ],
  "open_questions": [
    { "id": "Q1", "question": "string", "owner": "string|null" }
  ]
}
```

---

## 6. Technical Constraints

| Constraint | Details |
|------------|---------|
| **MCP Server** | Requires Miro MCP server running locally or accessible |
| **AI API** | OpenAI or Claude API key available |
| **Timeline** | 8 hours of development — pragmatic decisions required |
| **Environment** | Simple web app (Next.js, Vite, or similar) |

---

## 7. Risks, Assumptions & Questions

### 🔴 Risks

| ID | Risk | Mitigation |
|----|------|------------|
| R1 | Miro MCP server unstable or limited | Have fallback with mock data |
| R2 | Unstructured boards → poor output | Robust prompt engineering |
| R3 | 8hrs insufficient for full scope | Prioritize end-to-end flow over polish |

### 🟡 Assumptions

| ID | Assumption |
|----|------------|
| A1 | Miro MCP server is already configured and accessible |
| A2 | AI API keys are available |
| A3 | Users have existing boards to test with |
| A4 | Jira accepts bulk import via JSON/CSV |

### 🔵 Open Questions

| ID | Question |
|----|----------|
| Q1 | Which Miro MCP model will we use? (official or custom) |
| Q2 | Frontend framework preference? (Next.js, Vite, etc.) |
| Q3 | Where will it be deployed? (local, Vercel, internal server) |

---

## 8. Input Characteristics

| Attribute | Value |
|-----------|-------|
| Board content type | Unstructured brainstorming (free-form) |
| Typical sticky count | 10-30 stickies per board |
| Max epics per board | 3 epics |
| Expected stories | 5-10 per board |

---

## 9. Next Steps

1. ✅ Project Brief — Complete
2. ⏳ PRD Creation — Next phase
3. ⏳ Technical Architecture
4. ⏳ Development

---

*Document created by: Mary (Business Analyst Agent)*  
*Date: December 19, 2024*  
*Status: Approved*
