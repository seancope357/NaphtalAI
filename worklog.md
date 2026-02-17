# NaphtalAI Worklog

---
Task ID: 1-12
Agent: Main Agent
Task: Build NaphtalAI - Freemasonic Research & Visual Connection Engine

Work Log:
- Installed @xyflow/react for React Flow canvas engine
- Set up "The Archive" visual design system with Masonic-inspired dark theme
- Configured Tailwind CSS with custom colors (Lodge Blue, Revelation Gold, Red String, Golden Thread)
- Added Google Fonts: Spectral for headings, Inter for UI, JetBrains Mono for code
- Created TypeScript type definitions for nodes, edges, files, and AI requests
- Built Zustand stores: canvasStore, fileStore, chatStore, entityStore for state management
- Implemented IndexedDB utility for local file storage (privacy-first approach)
- Created custom React Flow node components: DocumentNode, NoteNode, EntityNode
- Built custom edge component with label editing and visual styles
- Developed left sidebar "The Archives" with drag-and-drop file upload and entity panel
- Developed center canvas "The Trestleboard" with infinite pan/zoom
- Developed right sidebar "The Overseer" for AI-powered analysis
- Created floating toolbar with zoom controls, note creation, and export
- Implemented AI API route using z-ai-web-dev-sdk for LLM integration
- Added entity extraction, connection analysis, and symbol recognition features
- Fixed lint errors (Image import conflicts with DOM Image constructor)
- Removed react-pdf due to SSR issues

---
Task ID: 13-17
Agent: Main Agent
Task: Document Viewer and Entity System

Work Log:
- Created viewerStore for document preview state management
- Built DocumentViewer component with image and text preview
- Created entityStore with full entity management and connections
- Built EntityPanel with type filters and search
- Created GraphSearch component for entity and connection discovery
- Updated ArchivesSidebar with tabs (Files, Entities, Graph)
- Enhanced AI API to extract entities and connections together

---
Task ID: 18-27
Agent: Main Agent
Task: Canvas Enhancements - Resizing, Undo/Redo, Power Shortcuts

Work Log:
- **Document Resizing**: Created useResizable hook with drag handles
- **Undo/Redo System**: Full history management with 50-state history
- **Keyboard Shortcuts**: Created useKeyboardShortcuts hook with comprehensive shortcuts
- **Alignment Tools**: Added align and distribute functions for selected nodes
- **Enhanced Toolbar**: Added undo/redo, alignment popup, keyboard shortcut help
- **Grid System**: Added snap-to-grid and grid visibility toggles
- **Bulk Operations**: Duplicate, delete, align, distribute selected nodes
- Updated DocumentNode with resize handles and open in viewer button
- Updated canvasStore with history, grid settings, and bulk operations

Stage Summary:
- Complete application with three-panel layout
- Functional file upload supporting PDF, TXT, JSON, JPG, PNG, CSV
- Double-click files to view, push-pin to add to canvas
- AI-powered analysis with entity extraction and connection finding
- Custom visual styling matching "Masonic/Archive" aesthetic
- Document resizing with drag handles
- Full undo/redo support (Ctrl+Z, Ctrl+Shift+Z)
- Keyboard shortcuts panel (press keyboard icon in toolbar)
- Alignment and distribution tools for organizing nodes
- Entity management system with type filters
- Graph search for finding entities and connections

Key Keyboard Shortcuts:
- Ctrl+Z: Undo
- Ctrl+Shift+Z or Ctrl+Y: Redo  
- Ctrl+A: Select all
- Escape: Clear selection
- Delete/Backspace: Delete selected
- Ctrl+D: Duplicate selected
- Ctrl+G: Toggle snap to grid
- Ctrl+Shift+G: Toggle grid visibility

Key Files:
- src/stores/canvasStore.ts - Canvas state with history
- src/stores/entityStore.ts - Entity and connection management
- src/hooks/useKeyboardShortcuts.ts - Power user shortcuts
- src/hooks/useResizable.tsx - Resizable node logic
- src/components/canvas/DocumentNode.tsx - Resizable document node
- src/components/layout/FloatingToolbar.tsx - Enhanced toolbar
- src/components/layout/EntityPanel.tsx - Entity management
- src/components/layout/GraphSearch.tsx - Entity search
