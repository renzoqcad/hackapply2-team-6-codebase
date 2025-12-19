# Agile Factory - AI-Powered Project Discovery Tool

Transform your Miro boards and discovery documents into comprehensive project breakdowns with AI-powered analysis.

## 🚀 Features

- **Multi-Source Input**: Upload files (PDF, JSON, TXT, images) or connect to Miro boards
- **AI-Powered Analysis**: Leverages Google's Gemini AI to generate:
  - Project summaries with clear objectives
  - Epics and user stories with acceptance criteria
  - Risk assessments and mitigation strategies
  - Assumptions and dependencies
  - Open questions for clarification
- **Interactive UI**: Browse, filter, and export generated content
- **Real-time Processing**: See your project breakdown generated in real-time

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Generative AI (Gemini) API key
- (Optional) Miro API key for board integration

## 🛠️ Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd apps/frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_actual_gemini_api_key
MIRO_ENABLED=false  # Set to "true" if you want to use Miro integration
MIRO_API_KEY=your_actual_miro_api_key  # Only needed if MIRO_ENABLED=true
```

#### Getting API Keys:

- **Google Gemini API Key**:

  1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
  2. Sign in with your Google account
  3. Click "Create API Key"
  4. Copy the generated key

- **Miro API Key** (optional):
  1. Visit [Miro Developers](https://developers.miro.com/)
  2. Create a new app
  3. Copy your API access token

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### File Upload

1. Click on the **File** tab
2. Upload a PDF, JSON, TXT, or image file containing your project discovery notes
3. Click **Run Orchestrator**
4. Wait for AI to process and generate your project breakdown

### Miro Integration

1. Click on the **Miro** tab
2. Enter your Miro board URL or board ID
3. Click **Run Orchestrator**
4. The AI will analyze your board and generate structured output

### Viewing Results

Navigate through the tabs to view different aspects of your project:

- **Summary**: Project overview and objectives
- **Epics & Stories**: Detailed user stories grouped by epics
- **Risks**: Identified risks with impact assessment and mitigation
- **Assumptions**: Project assumptions and their rationale
- **Open Questions**: Questions that need clarification

## 🏗️ Project Structure

```
apps/frontend/
├── app/
│   ├── api/           # API routes
│   │   ├── boards/    # Miro board endpoints
│   │   ├── health/    # Health check endpoint
│   │   └── process/   # Main processing endpoint
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page component
├── lib/
│   ├── agents/        # AI agent logic
│   ├── mcp/           # Miro Client Protocol
│   ├── prompts/       # AI prompts
│   ├── file-processor.ts
│   └── orchestrator.ts
├── components/        # Reusable UI components
├── schemas/          # Zod validation schemas
└── types/            # TypeScript type definitions
```

## 🔧 Configuration

### AI Model Configuration

The app uses Google's Gemini 2.0 Flash model. You can adjust generation parameters in `lib/orchestrator.ts`:

```typescript
generationConfig: {
  maxOutputTokens: 8192,  // Maximum output length
  temperature: 0.9,       // Creativity level (0-1)
}
```

### Prompt Customization

Customize the AI prompt in `lib/prompts/orchestrator.md` to adjust:

- Number of epics/stories generated
- Level of detail in descriptions
- Risk and assumption requirements

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

Build the production version:

```bash
npm run build
npm start
```

## 🧪 Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

## 📝 API Endpoints

### Health Check

```
GET /api/health
```

Returns system status and configuration info.

### Process Input

```
POST /api/process
```

Processes a file or Miro URL and generates project breakdown.

**Request:**

- Form data with either:
  - `file`: File upload (PDF, JSON, TXT, or image)
  - `miroUrl`: Miro board URL or ID

**Response:**

```json
{
  "success": true,
  "data": {
    "projectSummary": { ... },
    "epics": [ ... ],
    "risks": [ ... ],
    "assumptions": [ ... ],
    "openQuestions": { ... }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:

- Open an issue on GitHub
- Contact the development team

## 🔄 Changelog

### Version 1.0.0

- Initial release
- File upload support
- Miro integration
- AI-powered project analysis
- Interactive results viewer
