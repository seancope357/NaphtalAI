import type { Node, Edge } from "@xyflow/react";

// Node Types
export type NodeType = 'file' | 'note' | 'entity';

// File Types
export type FileType = 'pdf' | 'txt' | 'json' | 'jpg' | 'png' | 'csv';

// Connection Line Style
export type ConnectionStyle = 'red-string' | 'golden-thread';

// AI Provider
export type AIProvider = 'openai' | 'anthropic';

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
  mode: 'chat' | 'connect' | 'analyze_symbol' | 'extract_entities';
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
