"use client";

import { useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type OnConnect,
  type NodeTypes,
  type EdgeTypes,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import DocumentNode from "./DocumentNode";
import NoteNode from "./NoteNode";
import EntityNode from "./EntityNode";
import CustomEdge from "./CustomEdge";
import FloatingToolbar from "@/components/layout/FloatingToolbar";

import { useCanvasStore, createNoteNode, createEdge } from "@/stores/canvasStore";
import type { FileItem, CanvasNode, CanvasEdge } from "@/types";
import { getFile } from "@/lib/indexedDb";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const nodeTypes: NodeTypes = {
  fileNode: DocumentNode,
  noteNode: NoteNode,
  entityNode: EntityNode,
};

const edgeTypes: EdgeTypes = {
  customEdge: CustomEdge,
};

interface TrestleboardProps {
  onNodeSelect: (nodeIds: string[]) => void;
  onAnalyzeRequest: (nodeId: string) => void;
  onOpenFile?: (fileId: string) => void;
}

function TrestleboardInner({ onNodeSelect, onAnalyzeRequest, onOpenFile }: TrestleboardProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();

  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    addNode,
    addEdge: addStoreEdge,
    updateNode,
    updateNodePosition,
    updateNodeSize,
    deleteNode,
    updateEdge,
    connectionStyle,
    setConnectionStyle,
    setSelectedNodes,
    showGrid,
    gridSize,
    snapToGrid,
  } = useCanvasStore();

  const [localNodes, setLocalNodes, onNodesChangeBase] = useNodesState(nodes);
  const [localEdges, setLocalEdges, onEdgesChangeBase] = useEdgesState(edges);

  // Sync store to local state
  useEffect(() => {
    setLocalNodes(nodes);
  }, [nodes, setLocalNodes]);

  useEffect(() => {
    setLocalEdges(edges);
  }, [edges, setLocalEdges]);

  // Handle node changes
  const onNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      const updatedNodes = applyNodeChanges(changes, localNodes);
      setLocalNodes(updatedNodes);

      // Update store positions
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });

      // Handle selection
      const selectedIds = updatedNodes
        .filter((n) => n.selected)
        .map((n) => n.id);
      setSelectedNodes(selectedIds);
      onNodeSelect(selectedIds);
    },
    [localNodes, setLocalNodes, updateNodePosition, setSelectedNodes, onNodeSelect]
  );

  // Handle edge changes
  const onEdgesChange = useCallback(
    (changes: EdgeChange<CanvasEdge>[]) => {
      setLocalEdges(applyEdgeChanges(changes, localEdges));
    },
    [localEdges, setLocalEdges]
  );

  // Handle new connections
  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const newEdge = createEdge(
          connection.source,
          connection.target,
          undefined,
          connectionStyle
        );
        addStoreEdge(newEdge);
      }
    },
    [connectionStyle, addStoreEdge]
  );

  // Handle file drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();

      const filesData = event.dataTransfer.getData("application/json");
      if (!filesData) return;

      try {
        const file = JSON.parse(filesData) as FileItem;

        // Get file content from IndexedDB
        const storedFile = await getFile(file.id);

        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        // Create document node
        const node: CanvasNode = {
          id: `node-${file.id}`,
          type: "fileNode",
          position,
          data: {
            id: `node-${file.id}`,
            type: "file",
            label: file.name,
            content: typeof storedFile?.content === "string"
              ? storedFile.content.substring(0, 2000)
              : "",
            thumbnail: storedFile?.thumbnail || file.thumbnail,
            fileId: file.id,
            metadata: {
              source: file.name,
              date: new Date().toISOString(),
              tags: [],
              isPinned: false,
            },
          },
        };

        addNode(node);
      } catch (error) {
        console.error("Error dropping file:", error);
      }
    },
    [screenToFlowPosition, addNode]
  );

  // Handle custom events
  useEffect(() => {
    const handleAnalyzeNode = (e: CustomEvent<{ nodeId: string }>) => {
      onAnalyzeRequest(e.detail.nodeId);
    };

    const handlePinNode = (e: CustomEvent<{ nodeId: string }>) => {
      const node = nodes.find((n) => n.data.id === e.detail.nodeId || n.id === e.detail.nodeId);
      if (node) {
        updateNode(node.data.id, {
          metadata: {
            ...node.data.metadata,
            isPinned: !node.data.metadata.isPinned,
          },
        });
      }
    };

    const handleDeleteNode = (e: CustomEvent<{ nodeId: string }>) => {
      deleteNode(e.detail.nodeId);
    };

    const handleUpdateNodeContent = (e: CustomEvent<{ nodeId: string; content: string }>) => {
      updateNode(e.detail.nodeId, { content: e.detail.content });
    };

    const handleUpdateEdgeLabel = (e: CustomEvent<{ edgeId: string; label: string }>) => {
      updateEdge(e.detail.edgeId, { label: e.detail.label });
    };

    const handleResizeNode = (e: CustomEvent<{ nodeId: string; width: number; height: number }>) => {
      updateNodeSize(e.detail.nodeId, { width: e.detail.width, height: e.detail.height });
    };

    const handleOpenFile = (e: CustomEvent<{ fileId: string }>) => {
      onOpenFile?.(e.detail.fileId);
    };

    window.addEventListener("analyzeNode", handleAnalyzeNode as EventListener);
    window.addEventListener("pinNode", handlePinNode as EventListener);
    window.addEventListener("deleteNode", handleDeleteNode as EventListener);
    window.addEventListener("updateNodeContent", handleUpdateNodeContent as EventListener);
    window.addEventListener("updateEdgeLabel", handleUpdateEdgeLabel as EventListener);
    window.addEventListener("resizeNode", handleResizeNode as EventListener);
    window.addEventListener("openFile", handleOpenFile as EventListener);

    return () => {
      window.removeEventListener("analyzeNode", handleAnalyzeNode as EventListener);
      window.removeEventListener("pinNode", handlePinNode as EventListener);
      window.removeEventListener("deleteNode", handleDeleteNode as EventListener);
      window.removeEventListener("updateNodeContent", handleUpdateNodeContent as EventListener);
      window.removeEventListener("updateEdgeLabel", handleUpdateEdgeLabel as EventListener);
      window.removeEventListener("resizeNode", handleResizeNode as EventListener);
      window.removeEventListener("openFile", handleOpenFile as EventListener);
    };
  }, [nodes, updateNode, deleteNode, updateEdge, updateNodeSize, onAnalyzeRequest, onOpenFile]);

  // Toolbar actions
  const handleAddNote = useCallback(() => {
    const { x, y } = { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 };
    const noteNode = createNoteNode({ x, y });
    addNode(noteNode);
  }, [addNode]);

  const handleFitView = useCallback(() => {
    fitView({ padding: 0.2 });
  }, [fitView]);

  const handleClearCanvas = useCallback(() => {
    if (confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleExportCanvas = useCallback(() => {
    const canvasData = {
      nodes: localNodes,
      edges: localEdges,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(canvasData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `naphtalai-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [localNodes, localEdges]);

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative">
      <ReactFlow
        nodes={localNodes}
        edges={localEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "customEdge",
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        {showGrid && (
          <Background
            color="#fbbf24"
            gap={gridSize}
            size={1.5}
            className="!bg-background"
          />
        )}

        <Controls
          className="!bg-card !border-border !rounded-lg !shadow-lg"
          showZoom={false}
          showFitView={false}
          showInteractive={false}
        />

        <MiniMap
          className="!bg-card !border-border !rounded-lg"
          nodeColor={(node) => {
            switch (node.type) {
              case "fileNode":
                return "#1e3a8a";
              case "noteNode":
                return "#eab308";
              case "entityNode":
                return "#ef4444";
              default:
                return "#64748b";
            }
          }}
          maskColor="rgba(15, 23, 42, 0.8)"
        />

        <Panel position="top-center">
          <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2">
            <h1 className="font-display font-semibold text-card-foreground text-sm">
              The Trestleboard
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {localNodes.length} nodes • {localEdges.length} connections
            </p>
          </div>
        </Panel>
      </ReactFlow>

      <FloatingToolbar
        onAddNote={handleAddNote}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        onFitView={handleFitView}
        onClearCanvas={handleClearCanvas}
        onExportCanvas={handleExportCanvas}
        connectionStyle={connectionStyle}
        onConnectionStyleChange={setConnectionStyle}
      />
    </div>
  );
}

export default function Trestleboard(props: TrestleboardProps) {
  return (
    <ReactFlowProvider>
      <TrestleboardInner {...props} />
    </ReactFlowProvider>
  );
}
