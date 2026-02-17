import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { CanvasNode, CanvasEdge, NodeData, EdgeData, ConnectionStyle } from "@/types";

// History entry for undo/redo
interface HistoryEntry {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  action: string;
  timestamp: number;
}

interface CanvasState {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  selectedNodes: string[];
  selectedEdges: string[];
  connectionStyle: ConnectionStyle;
  droopiness: number;
  
  // History for undo/redo
  history: HistoryEntry[];
  historyIndex: number;
  maxHistorySize: number;
  
  // Grid settings
  snapToGrid: boolean;
  gridSize: number;
  showGrid: boolean;
  
  // Node Actions
  addNode: (node: CanvasNode) => void;
  addNodes: (nodes: CanvasNode[]) => void;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
  updateNodeSize: (id: string, size: { width: number; height: number }) => void;
  deleteNode: (id: string) => void;
  setNodes: (nodes: CanvasNode[]) => void;
  
  // Edge Actions
  addEdge: (edge: CanvasEdge) => void;
  updateEdge: (id: string, data: Partial<EdgeData>) => void;
  deleteEdge: (id: string) => void;
  setEdges: (edges: CanvasEdge[]) => void;
  
  // Selection Actions
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Settings
  setConnectionStyle: (style: ConnectionStyle) => void;
  setDroopiness: (droopiness: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  
  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  pushHistory: (action: string) => void;
  clearHistory: () => void;
  
  // Bulk operations
  duplicateSelected: () => void;
  deleteSelected: () => void;
  alignSelected: (direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeSelected: (direction: 'horizontal' | 'vertical') => void;
  
  // Utility
  getNodeById: (id: string) => CanvasNode | undefined;
  getNodesByIds: (ids: string[]) => CanvasNode[];
  getSelectedNodeData: () => NodeData[];
  snapPosition: (position: { x: number; y: number }) => { x: number; y: number };
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodes: [],
  selectedEdges: [],
  connectionStyle: "red-string",
  droopiness: 0,
  
  // History
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,
  
  // Grid
  snapToGrid: true,
  gridSize: 20,
  showGrid: true,
  
  // Helper to save history
  pushHistory: (action: string) => {
    const { nodes, edges, history, historyIndex, maxHistorySize } = get();
    
    const entry: HistoryEntry = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      action,
      timestamp: Date.now(),
    };
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(entry);
    
    // Limit history size
    if (newHistory.length > maxHistorySize) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },
  
  // Node Actions
  addNode: (node) => {
    set((state) => ({
      nodes: [...state.nodes, node],
    }));
    get().pushHistory('add_node');
  },
  
  addNodes: (nodes) => {
    set((state) => ({
      nodes: [...state.nodes, ...nodes],
    }));
    get().pushHistory('add_nodes');
  },
  
  updateNode: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));
  },
  
  updateNodePosition: (id, position) => {
    const { snapToGrid, gridSize, snapPosition } = get();
    const finalPosition = snapToGrid ? snapPosition(position) : position;
    
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position: finalPosition } : node
      ),
    }));
  },
  
  updateNodeSize: (id, size) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, ...size } : node
      ),
    }));
  },
  
  deleteNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
      selectedNodes: state.selectedNodes.filter((nid) => nid !== id),
    }));
    get().pushHistory('delete_node');
  },
  
  setNodes: (nodes) => set({ nodes }),
  
  // Edge Actions
  addEdge: (edge) => {
    set((state) => ({
      edges: [...state.edges, edge],
    }));
    get().pushHistory('add_edge');
  },
  
  updateEdge: (id, data) =>
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, ...data } }
          : edge
      ),
    })),
  
  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
    get().pushHistory('delete_edge');
  },
  
  setEdges: (edges) => set({ edges }),
  
  // Selection Actions
  setSelectedNodes: (ids) => set({ selectedNodes: ids }),
  
  setSelectedEdges: (ids) => set({ selectedEdges: ids }),
  
  clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),
  
  selectAll: () => {
    const { nodes, edges } = get();
    set({
      selectedNodes: nodes.map((n) => n.id),
      selectedEdges: edges.map((e) => e.id),
    });
  },
  
  // Settings
  setConnectionStyle: (style) => set({ connectionStyle: style }),
  setDroopiness: (droopiness) => set({ droopiness }),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setGridSize: (size) => set({ gridSize: size }),
  setShowGrid: (show) => set({ showGrid: show }),
  
  // History Actions
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const entry = history[historyIndex - 1];
      set({
        nodes: JSON.parse(JSON.stringify(entry.nodes)),
        edges: JSON.parse(JSON.stringify(entry.edges)),
        historyIndex: historyIndex - 1,
      });
    }
  },
  
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const entry = history[historyIndex + 1];
      set({
        nodes: JSON.parse(JSON.stringify(entry.nodes)),
        edges: JSON.parse(JSON.stringify(entry.edges)),
        historyIndex: historyIndex + 1,
      });
    }
  },
  
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().history.length - 1,
  
  clearHistory: () => set({ history: [], historyIndex: -1 }),
  
  // Bulk operations
  duplicateSelected: () => {
    const { nodes, selectedNodes } = get();
    const selectedNodesData = nodes.filter((n) => selectedNodes.includes(n.id));
    
    const newNodes = selectedNodesData.map((node) => ({
      ...JSON.parse(JSON.stringify(node)),
      id: uuidv4(),
      position: {
        x: node.position.x + 40,
        y: node.position.y + 40,
      },
      data: {
        ...node.data,
        id: uuidv4(),
      },
      selected: false,
    }));
    
    set((state) => ({
      nodes: [...state.nodes, ...newNodes],
      selectedNodes: newNodes.map((n) => n.id),
    }));
    get().pushHistory('duplicate');
  },
  
  deleteSelected: () => {
    const { selectedNodes, selectedEdges } = get();
    set((state) => ({
      nodes: state.nodes.filter((n) => !selectedNodes.includes(n.id)),
      edges: state.edges.filter(
        (e) => !selectedEdges.includes(e.id) && 
              !selectedNodes.includes(e.source) && 
              !selectedNodes.includes(e.target)
      ),
      selectedNodes: [],
      selectedEdges: [],
    }));
    get().pushHistory('delete_selected');
  },
  
  alignSelected: (direction) => {
    const { nodes, selectedNodes } = get();
    if (selectedNodes.length < 2) return;
    
    const selectedNodesData = nodes.filter((n) => selectedNodes.includes(n.id));
    
    // Calculate bounds
    const positions = selectedNodesData.map((n) => n.position);
    const minX = Math.min(...positions.map((p) => p.x));
    const maxX = Math.max(...positions.map((p) => p.x));
    const minY = Math.min(...positions.map((p) => p.y));
    const maxY = Math.max(...positions.map((p) => p.y));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    const updatedNodes = nodes.map((node) => {
      if (!selectedNodes.includes(node.id)) return node;
      
      let newPos = { ...node.position };
      
      switch (direction) {
        case 'left':
          newPos.x = minX;
          break;
        case 'center':
          newPos.x = centerX;
          break;
        case 'right':
          newPos.x = maxX;
          break;
        case 'top':
          newPos.y = minY;
          break;
        case 'middle':
          newPos.y = centerY;
          break;
        case 'bottom':
          newPos.y = maxY;
          break;
      }
      
      return { ...node, position: newPos };
    });
    
    set({ nodes: updatedNodes });
    get().pushHistory('align');
  },
  
  distributeSelected: (direction) => {
    const { nodes, selectedNodes } = get();
    if (selectedNodes.length < 3) return;
    
    const selectedNodesData = nodes.filter((n) => selectedNodes.includes(n.id));
    
    if (direction === 'horizontal') {
      const sorted = [...selectedNodesData].sort((a, b) => a.position.x - b.position.x);
      const minX = sorted[0].position.x;
      const maxX = sorted[sorted.length - 1].position.x;
      const spacing = (maxX - minX) / (sorted.length - 1);
      
      const updatedNodes = nodes.map((node) => {
        const idx = sorted.findIndex((n) => n.id === node.id);
        if (idx === -1) return node;
        return {
          ...node,
          position: {
            ...node.position,
            x: minX + spacing * idx,
          },
        };
      });
      
      set({ nodes: updatedNodes });
    } else {
      const sorted = [...selectedNodesData].sort((a, b) => a.position.y - b.position.y);
      const minY = sorted[0].position.y;
      const maxY = sorted[sorted.length - 1].position.y;
      const spacing = (maxY - minY) / (sorted.length - 1);
      
      const updatedNodes = nodes.map((node) => {
        const idx = sorted.findIndex((n) => n.id === node.id);
        if (idx === -1) return node;
        return {
          ...node,
          position: {
            ...node.position,
            y: minY + spacing * idx,
          },
        };
      });
      
      set({ nodes: updatedNodes });
    }
    
    get().pushHistory('distribute');
  },
  
  // Utility
  getNodeById: (id) => get().nodes.find((node) => node.id === id),
  
  getNodesByIds: (ids) =>
    get().nodes.filter((node) => ids.includes(node.id)),
  
  getSelectedNodeData: () =>
    get()
      .nodes.filter((node) => get().selectedNodes.includes(node.id))
      .map((node) => node.data),
  
  snapPosition: (position) => {
    const { gridSize } = get();
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  },
}));

// Helper function to create a document node
export function createDocumentNode(
  fileId: string,
  fileName: string,
  position: { x: number; y: number },
  thumbnail?: string,
  content?: string,
  size?: { width?: number; height?: number }
): CanvasNode {
  return {
    id: uuidv4(),
    type: "fileNode",
    position,
    width: size?.width || 280,
    height: size?.height,
    data: {
      id: uuidv4(),
      type: "file",
      label: fileName,
      content: content || "",
      thumbnail,
      fileId,
      metadata: {
        source: fileName,
        date: new Date().toISOString(),
        tags: [],
        isPinned: false,
      },
    },
  };
}

// Helper function to create a note node
export function createNoteNode(
  position: { x: number; y: number },
  content: string = ""
): CanvasNode {
  return {
    id: uuidv4(),
    type: "noteNode",
    position,
    width: 200,
    data: {
      id: uuidv4(),
      type: "note",
      label: "Note",
      content,
      metadata: {
        date: new Date().toISOString(),
        tags: [],
        isPinned: false,
      },
    },
  };
}

// Helper function to create an entity node
export function createEntityNode(
  name: string,
  entityType: 'person' | 'location' | 'date' | 'symbol' | 'organization',
  position: { x: number; y: number },
  sourceId?: string,
  context?: string
): CanvasNode {
  return {
    id: uuidv4(),
    type: "entityNode",
    position,
    width: 180,
    data: {
      id: uuidv4(),
      type: "entity",
      label: name,
      content: context || "",
      metadata: {
        entityType,
        source: sourceId,
        date: new Date().toISOString(),
        tags: [],
        isPinned: false,
      },
    },
  };
}

// Helper function to create an edge
export function createEdge(
  sourceId: string,
  targetId: string,
  label?: string,
  style: ConnectionStyle = "red-string"
): CanvasEdge {
  return {
    id: uuidv4(),
    source: sourceId,
    target: targetId,
    type: "customEdge",
    animated: false,
    data: {
      label,
      style,
      isAnimated: false,
    },
  };
}
