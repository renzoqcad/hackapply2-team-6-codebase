# hackapply2-team-6-codebase

A monorepo managed with Turborepo.

## Structure

- `apps/backend/` - Backend application (Next.js API)
- `apps/frontend/` - Frontend application (empty, ready for files)
- `packages/` - Shared packages (can be added later)
- `agents/` - Agent definitions
- `teams/` - Team configurations
- `expansion-packs/` - Expansion pack definitions

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build all apps:
   ```bash
   npm run build
   ```

## Workspaces

This monorepo uses npm workspaces and Turborepo for build orchestration. Each app in `apps/` is a separate workspace.