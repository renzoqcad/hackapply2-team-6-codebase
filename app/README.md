# Miro-to-Stories Framework

Transform Miro brainstorming boards into structured user stories with AI.

## Features

- 📋 **Board Selection** — Browse and select Miro boards
- 🤖 **AI Analysis** — Automated content analysis with Analyst agent
- 📝 **Story Generation** — Structured epics and user stories with acceptance criteria
- ⚠️ **Risk Assessment** — Automatic risk, assumption, and question identification
- 📤 **JSON Export** — Jira-compatible output format

## Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your OPENAI_API_KEY

# Start development server
npm run dev
```

### Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── boards/        # GET /api/boards
│   │   ├── process/       # POST /api/process/:boardId
│   │   └── health/        # GET /api/health
│   ├── page.tsx           # Main UI
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React Components
│   ├── ui/               # Base UI components
│   ├── board-selector.tsx
│   ├── results-display.tsx
│   ├── export-controls.tsx
│   └── processing-status.tsx
├── lib/                   # Core Logic
│   ├── mcp/              # MCP Client & Mock Data
│   ├── agents/           # AI Agents
│   ├── orchestrator.ts   # Processing Pipeline
│   └── utils.ts          # Utilities
├── types/                # TypeScript Types
└── schemas/              # Zod Schemas
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI agents | Yes |
| `MCP_ENABLED` | Enable real MCP server (default: false) | No |
| `MCP_SERVER_URL` | MCP server URL | No |

## Usage

1. **Select a Board** — Click on a board from the left panel
2. **Process** — Click "Process Board" button
3. **Review** — Examine the generated epics, stories, and risks
4. **Export** — Copy JSON or download the file

## Mock Mode

By default, the app runs in mock mode with sample boards. This allows you to:
- Test the UI without MCP server
- Develop and debug without API costs
- Demo the application

## API Endpoints

### GET /api/health
Health check and MCP connection status.

### GET /api/boards
List available Miro boards.

### POST /api/process/:boardId
Process a board and generate stories.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Vercel AI SDK + OpenAI
- **Validation**: Zod

## Output Format

The generated JSON follows this structure:

```json
{
  "metadata": {
    "boardId": "...",
    "boardName": "...",
    "processedAt": "...",
    "stickyCount": 24
  },
  "discoverySummary": {
    "context": "...",
    "keyInsights": ["..."],
    "userProblems": ["..."]
  },
  "epics": [...],
  "risks": [...],
  "assumptions": [...],
  "openQuestions": [...]
}
```

## License

MIT

---

Built with the BMAD Method 🚀

