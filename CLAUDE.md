# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # Start dev server on port 3000 (output teed to dev.log)
bun run build        # Build for production (standalone output + copies static/public)
bun run start        # Start production server (reads from .next/standalone/server.js)
bun run lint         # Run ESLint

# Database (Prisma + SQLite)
bun run db:push      # Push schema changes to DB
bun run db:generate  # Regenerate Prisma client
bun run db:migrate   # Run migrations (dev)
bun run db:reset     # Reset and re-run all migrations
```

> The project uses **Bun** as the runtime. `npm` works too but Bun is preferred. TypeScript build errors are intentionally ignored (`ignoreBuildErrors: true` in next.config.ts).

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The AI endpoint (`/api/ai`) accepts optional `openAIKey` / `anthropicKey` at request time — no server-side AI API key env vars are needed; the client passes keys from the Overseer sidebar settings.

## Architecture Overview

### Three-Panel Layout (`src/app/page.tsx`)

The entire app is a single page with three resizable panels (`react-resizable-panels`):

1. **Left — ArchivesSidebar**: File library, entity panel, graph search (3 tabs)
2. **Center — Trestleboard**: Infinite pan/zoom canvas powered by `@xyflow/react`
3. **Right — OverseerSidebar**: AI chat and analysis controls

All cross-panel orchestration (AI calls, entity extraction, pinning docs to canvas) lives in `src/app/page.tsx` and flows downward as props/callbacks.

### State Management (Zustand Stores)

Four stores in `src/stores/`, each independent:

| Store | Purpose |
|---|---|
| `canvasStore` | Nodes, edges, selection, 50-step undo/redo history, grid/snap settings, alignment/distribution |
| `entityStore` | Extracted entity registry and entity–entity connections |
| `chatStore` | AI chat message history and loading state |
| `fileStore` | File metadata list (not file content — content lives in IndexedDB) |
| `viewerStore` | Document viewer open/close and currently viewed file |

**Key pattern**: `canvasStore` exposes factory helpers (`createDocumentNode`, `createEntityNode`, `createNoteNode`, `createEdge`) — always use these rather than building node objects manually to ensure consistent shape.

### File Storage — IndexedDB (`src/lib/indexedDb.ts`)

File **content** is stored client-side in IndexedDB (`naphtalai-db`), not on any server. `fileStore` only holds metadata (`FileItem`). When a node needs its full content (e.g., for AI analysis), the code calls `getFile(fileId)` from IndexedDB directly.

Two IndexedDB object stores:
- `files` — raw file content + thumbnails
- `canvas` — serialized canvas snapshots (save/load sessions)

### AI Integration (`src/app/api/ai/route.ts`)

Single POST endpoint. Accepts `mode`:
- `chat` — general Q&A with document context
- `extract_entities` — returns JSON `{ entities[], connections[] }`
- `connect` — finds relationships across multiple documents
- `analyze_symbol` — Freemasonic symbol recognition

Uses `z-ai-web-dev-sdk` (`ZAI`) as the LLM abstraction layer (supports OpenAI and Anthropic). The instance is lazily created and cached module-level. For structured modes, the response is JSON-extracted with a regex (`/\{[\s\S]*\}/`) before parsing.

### Canvas Node Types (`src/components/canvas/`)

Three XY Flow node types registered in `nodeTypes.ts`:
- `fileNode` → `DocumentNode` — displays document preview, has drag-resize handles
- `noteNode` → `NoteNode` — editable text note
- `entityNode` → `EntityNode` — extracted entity with type badge

Edge type: `customEdge` → `CustomEdge` — supports label editing and two visual styles (`red-string`, `golden-thread`).

### Design System

Custom Tailwind colors (defined in `tailwind.config.ts` as CSS vars):
- Lodge Blue, Revelation Gold, Red String, Golden Thread

Fonts loaded via `src/app/layout.tsx`:
- **Spectral** — headings
- **Inter** — UI text
- **JetBrains Mono** — code/monospace

Dark mode is the default and only theme.

### Authentication

Supabase auth is set up (`src/lib/supabaseClient.ts`, `/app/login/`, `/app/auth/callback/`) but the main canvas page (`/`) has no auth guard — it renders directly. Auth integration is present but not enforced on the primary app route.

### Prisma Schema

Currently minimal (User + Post models on SQLite). Not actively used by the main application — the real persistence is IndexedDB (client) + Supabase (auth).
