"use client";

import { useCallback, useRef, useEffect, useState } from "react";
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
import { getReadableContentPreview } from "@/lib/fileContent";
import { validateConnection } from "@/lib/connectionRules";
import { WORKSPACE_GRID } from "@/lib/workspaceConstraints";

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
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  // Read grid color from design system CSS variable
  const [gridColor] = useState<string>(() => {
    if (typeof window === "undefined") return "#404040";
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")
      .trim();
    return color || "#404040";
  });

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

  const [localNodes, setLocalNodes] = useNodesState(nodes);
  const [localEdges, setLocalEdges] = useEdgesState(edges);

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
        const sourceNode = localNodes.find((node) => node.id === connection.source);
        const targetNode = localNodes.find((node) => node.id === connection.target);
        const validation = validateConnection(sourceNode, targetNode, localEdges);

        if (!validation.valid) {
          setConnectionNotice(validation.reason || "Invalid connection.");
          return;
        }

        const resolveHandle = (
          source: CanvasNode | undefined,
          target: CanvasNode | undefined,
          requested: Connection
        ) => {
          if (requested.sourceHandle && requested.targetHandle) {
            return {
              sourceHandle: requested.sourceHandle,
              targetHandle: requested.targetHandle,
            };
          }

          if (!source || !target) {
            return {
              sourceHandle: requested.sourceHandle || "right",
              targetHandle: requested.targetHandle || "left",
            };
          }

          const sourceWidth = (typeof source.width === "number" ? source.width : 320) / 2;
          const sourceHeight = (typeof source.height === "number" ? source.height : 240) / 2;
          const targetWidth = (typeof target.width === "number" ? target.width : 320) / 2;
          const targetHeight = (typeof target.height === "number" ? target.height : 240) / 2;

          const sourceCenter = {
            x: source.position.x + sourceWidth,
            y: source.position.y + sourceHeight,
          };
          const targetCenter = {
            x: target.position.x + targetWidth,
            y: target.position.y + targetHeight,
          };

          const dx = targetCenter.x - sourceCenter.x;
          const dy = targetCenter.y - sourceCenter.y;

          if (Math.abs(dx) >= Math.abs(dy)) {
            return {
              sourceHandle: dx >= 0 ? "right" : "bottom",
              targetHandle: dx >= 0 ? "left" : "top",
            };
          }

          return {
            sourceHandle: dy >= 0 ? "bottom" : "right",
            targetHandle: dy >= 0 ? "top" : "left",
          };
        };

        const { sourceHandle, targetHandle } = resolveHandle(
          sourceNode,
          targetNode,
          connection
        );

        const newEdge = createEdge(
          connection.source,
          connection.target,
          validation.label,
          connectionStyle,
          {
            semanticType: validation.semanticType,
            sourceNodeType: sourceNode?.data.type,
            targetNodeType: targetNode?.data.type,
            logicRule: validation.logicRule,
            confidence: 0.85,
          },
          sourceHandle,
          targetHandle
        );
        addStoreEdge(newEdge);
        setConnectionNotice(null);
      }
    },
    [connectionStyle, addStoreEdge, localNodes, localEdges]
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
          width: 360,
          height: 440,
          data: {
            id: `node-${file.id}`,
            type: "file",
            label: file.name,
            content: typeof storedFile?.content === "string"
              ? getReadableContentPreview(storedFile.content, file.type)
              : getReadableContentPreview(undefined, file.type),
            previewContent: typeof storedFile?.content === "string"
              ? getReadableContentPreview(storedFile.content, file.type)
              : getReadableContentPreview(undefined, file.type),
            thumbnail: storedFile?.thumbnail || file.thumbnail,
            fileId: file.id,
            metadata: {
              source: file.name,
              date: new Date().toISOString(),
              tags: [],
              fileType: file.type,
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

  useEffect(() => {
    if (!connectionNotice) return;
    const timeout = window.setTimeout(() => setConnectionNotice(null), 2600);
    return () => window.clearTimeout(timeout);
  }, [connectionNotice]);

  // Handle custom events
  useEffect(() => {
    const resolveNode = (incomingId: string) =>
      nodes.find((n) => n.id === incomingId || n.data.id === incomingId);

    const resolveNodeId = (incomingId: string) => resolveNode(incomingId)?.id ?? incomingId;

    const handleAnalyzeNode = (e: CustomEvent<{ nodeId: string }>) => {
      onAnalyzeRequest(resolveNodeId(e.detail.nodeId));
    };

    const handlePinNode = (e: CustomEvent<{ nodeId: string }>) => {
      const node = resolveNode(e.detail.nodeId);
      if (node) {
        updateNode(node.id, {
          metadata: {
            ...node.data.metadata,
            isPinned: !node.data.metadata.isPinned,
          },
        });
      }
    };

    const handleDeleteNode = (e: CustomEvent<{ nodeId: string }>) => {
      deleteNode(resolveNodeId(e.detail.nodeId));
    };

    const handleUpdateNodeContent = (e: CustomEvent<{ nodeId: string; content: string; label: string }>) => {
      updateNode(resolveNodeId(e.detail.nodeId), {
        content: e.detail.content,
        label: e.detail.label,
      });
    };

    const handleUpdateEdgeLabel = (e: CustomEvent<{ edgeId: string; label: string }>) => {
      updateEdge(e.detail.edgeId, { label: e.detail.label });
    };

    const handleResizeNode = (e: CustomEvent<{ nodeId: string; width: number; height: number }>) => {
      updateNodeSize(resolveNodeId(e.detail.nodeId), {
        width: e.detail.width,
        height: e.detail.height,
      });
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
    fitView({ padding: WORKSPACE_GRID.fitViewPadding });
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
    <div ref={reactFlowWrapper} className="w-full h-full relative p-1.5 md:p-2 bg-background">
      <div className="w-full h-full rounded-lg border border-border/70 overflow-hidden bg-background/80 backdrop-blur-sm">
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
        fitViewOptions={{ padding: WORKSPACE_GRID.fitViewPadding }}
        minZoom={WORKSPACE_GRID.minZoom}
        maxZoom={WORKSPACE_GRID.maxZoom}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        defaultEdgeOptions={{
          type: "customEdge",
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-background/80"
      >
        {showGrid && (
          <Background
            color={gridColor}
            gap={gridSize}
            size={1.5}
            className="!bg-background"
          />
        )}

        <Controls
          className="!bg-card/95 !border-border !rounded-md !shadow-md"
          showZoom={false}
          showFitView={false}
          showInteractive={false}
        />

        <MiniMap
          className="!bg-card/95 !border-border !rounded-md"
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
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md px-3 py-1.5 min-w-[205px]">
            <h1 className="font-display font-semibold text-card-foreground text-xs tracking-tight">
              Canvas
            </h1>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {localNodes.length} assets • {localEdges.length} structured links
            </p>
          </div>
        </Panel>

        {connectionNotice && (
          <Panel position="top-right">
            <div className="bg-card/95 border border-border rounded-lg px-3 py-2 shadow-lg">
              <p className="text-[11px] text-card-foreground">{connectionNotice}</p>
            </div>
          </Panel>
        )}
      </ReactFlow>
      </div>

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
