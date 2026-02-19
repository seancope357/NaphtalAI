import type { Node, Edge } from "@xyflow/react";

// Node Types
export type NodeType = 'file' | 'note' | 'entity';

// File Types
export type FileType = 'pdf' | 'txt' | 'json' | 'jpg' | 'png' | 'csv';

// Connection Line Style
export type ConnectionStyle = 'red-string' | 'golden-thread';

// AI Provider
export type AIProvider = 'openai' | 'anthropic';

// Draw Mode
export type DrawMode = 'select' | 'draw' | 'erase';

// Note font size
export type NoteFontSize = 'sm' | 'md' | 'lg';

// Freehand drawing stroke on canvas
export interface Stroke {
  id: string;
  color: string;
  strokeWidth: number; // in flow coordinates
  opacity: number;
  points: Array<{ x: number; y: number }>;
  createdAt: number;
}

// Node Data Model
export interface NodeData {
  [key: string]: any;
  id: string;
  type: NodeType;
  label: string;
  content: string;
  previewContent?: string;
  thumbnail?: string;
  fileId?: string;
  metadata: {
    source?: string;
    date?: string;
    tags?: string[];
    fileType?: FileType;
    entityType?: 'person' | 'location' | 'date' | 'symbol' | 'organization';
    isPinned?: boolean;
    noteColor?: string;          // hex accent color chosen by user
    noteFontSize?: NoteFontSize; // user-chosen font size for note content
  };
}

// File Model
export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number;
  content?: string | ArrayBuffer;
  thumbnail?: string;
  uploadedAt: Date;
  indexedDbKey?: string;
}

// Edge Data Model
export interface EdgeData {
  [key: string]: any;
  label?: string;
  style?: ConnectionStyle;
  isAnimated?: boolean;
  semanticType?: string;
  sourceNodeType?: NodeType;
  targetNodeType?: NodeType;
  logicRule?: string;
  confidence?: number;
}

// AI Request
export interface AIRequest {
  context: string[];
  query: string;
  mode: 'chat' | 'connect' | 'analyze_symbol' | 'extract_entities' | 'presentation' | 'report';
  graph?: {
    nodes: Array<{
      id: string;
      type: NodeType;
      label: string;
      source?: string;
      tags?: string[];
      color?: string;    // note accent color (visual grouping signal for AI)
    }>;
    edges: Array<{
      id: string;
      source: string;
      target: string;
      label?: string;
      semanticType?: string;
      logicRule?: string;
      confidence?: number;
      sourceHandle?: string;
      targetHandle?: string;
    }>;
    selectedNodeIds?: string[];
    annotations?: {
      strokeCount: number;
      colors: string[]; // distinct annotation colors used
    };
  };
}

// AI Response
export interface AIResponse {
  result: string;
  entities?: ExtractedEntity[];
  connections?: SuggestedConnection[];
}

// Extracted Entity
export interface ExtractedEntity {
  name: string;
  type: 'person' | 'location' | 'date' | 'symbol' | 'organization';
  context?: string;
  aliases?: string[];
}

// Suggested Connection
export interface SuggestedConnection {
  sourceId: string;
  targetId: string;
  label: string;
  confidence: number;
}

// Chat Message
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  nodeContext?: string[];
}

// Settings
export interface AppSettings {
  aiProvider: AIProvider;
  apiKey?: string;
  connectionStyle: ConnectionStyle;
  autoExtractEntities: boolean;
}

// Canvas Node Type for React Flow
export type CanvasNode = Node<NodeData>;

// Canvas Edge Type for React Flow
export type CanvasEdge = Edge<EdgeData>;

// Drag Item from Sidebar
export interface DragItem {
  type: 'file' | 'note';
  id: string;
  data?: FileItem;
}
