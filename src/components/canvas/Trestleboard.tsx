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
  useViewport,
  ReactFlowProvider,
  type NodeChange,
  type EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { v4 as uuidv4 } from "uuid";

import DocumentNode from "./DocumentNode";
import NoteNode from "./NoteNode";
import EntityNode from "./EntityNode";
import CustomEdge from "./CustomEdge";
import FloatingToolbar from "@/components/layout/FloatingToolbar";

import { useCanvasStore, createNoteNode, createEdge } from "@/stores/canvasStore";
import type { FileItem, CanvasNode, CanvasEdge, Stroke, NodeData } from "@/types";
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

// ─── Drawing layer ────────────────────────────────────────────────────────────

function DrawingLayer() {
  const { x: vpX, y: vpY, zoom } = useViewport();
  const { strokes } = useCanvasStore();

  return (
    <g transform={`translate(${vpX},${vpY}) scale(${zoom})`}>
      {strokes.map((stroke) => (
        <polyline
          key={stroke.id}
          points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke={stroke.color}
          strokeWidth={stroke.strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={stroke.opacity}
          style={{ pointerEvents: "none" }}
        />
      ))}
    </g>
  );
}

// ─── Inner canvas ─────────────────────────────────────────────────────────────

function TrestleboardInner({ onNodeSelect, onAnalyzeRequest, onOpenFile }: TrestleboardProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
  const { x: vpX, y: vpY, zoom } = useViewport();
  const [connectionNotice, setConnectionNotice] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

  const [gridColor] = useState<string>(() => {
    if (typeof window === "undefined") return "#404040";
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue("--muted-foreground")
      .trim();
    return color || "#404040";
  });

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
    drawMode,
    drawColor,
    drawSize,
    addStroke,
    deleteStroke,
    strokes,
  } = useCanvasStore();

  const [localNodes, setLocalNodes] = useNodesState(nodes);
  const [localEdges, setLocalEdges] = useEdgesState(edges);

  useEffect(() => { setLocalNodes(nodes); }, [nodes, setLocalNodes]);
  useEffect(() => { setLocalEdges(edges); }, [edges, setLocalEdges]);

  // ── Node changes ────────────────────────────────────────────────────────────

  const onNodesChange = useCallback(
    (changes: NodeChange<CanvasNode>[]) => {
      const updatedNodes = applyNodeChanges(changes, localNodes);
      setLocalNodes(updatedNodes);
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          updateNodePosition(change.id, change.position);
        }
      });
      const selectedIds = updatedNodes.filter((n) => n.selected).map((n) => n.id);
      setSelectedNodes(selectedIds);
      onNodeSelect(selectedIds);
    },
    [localNodes, setLocalNodes, updateNodePosition, setSelectedNodes, onNodeSelect]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<CanvasEdge>[]) => {
      setLocalEdges(applyEdgeChanges(changes, localEdges));
    },
    [localEdges, setLocalEdges]
  );

  // ── Connections ─────────────────────────────────────────────────────────────

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const sourceNode = localNodes.find((n) => n.id === connection.source);
        const targetNode = localNodes.find((n) => n.id === connection.target);
        const validation = validateConnection(sourceNode, targetNode, localEdges);

        if (!validation.valid) {
          setConnectionNotice(validation.reason || "Invalid connection.");
          return;
        }

        const resolveHandle = (
          source: CanvasNode | undefined,
          target: CanvasNode | undefined,
          req: Connection
        ) => {
          if (req.sourceHandle && req.targetHandle) {
            return { sourceHandle: req.sourceHandle, targetHandle: req.targetHandle };
          }
          if (!source || !target) {
            return { sourceHandle: req.sourceHandle || "right", targetHandle: req.targetHandle || "left" };
          }
          const sw = (typeof source.width  === "number" ? source.width  : 320) / 2;
          const sh = (typeof source.height === "number" ? source.height : 240) / 2;
          const tw = (typeof target.width  === "number" ? target.width  : 320) / 2;
          const th = (typeof target.height === "number" ? target.height : 240) / 2;
          const sc = { x: source.position.x + sw, y: source.position.y + sh };
          const tc = { x: target.position.x + tw, y: target.position.y + th };
          const dx = tc.x - sc.x;
          const dy = tc.y - sc.y;
          if (Math.abs(dx) >= Math.abs(dy)) {
            return { sourceHandle: dx >= 0 ? "right" : "bottom", targetHandle: dx >= 0 ? "left" : "top" };
          }
          return { sourceHandle: dy >= 0 ? "bottom" : "right", targetHandle: dy >= 0 ? "top" : "left" };
        };

        const { sourceHandle, targetHandle } = resolveHandle(sourceNode, targetNode, connection);
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

  // ── File drop ────────────────────────────────────────────────────────────────

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
        const storedFile = await getFile(file.id);
        const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
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
    const t = window.setTimeout(() => setConnectionNotice(null), 2600);
    return () => window.clearTimeout(t);
  }, [connectionNotice]);

  // ── Custom events ────────────────────────────────────────────────────────────

  useEffect(() => {
    const resolveNode = (id: string) => nodes.find((n) => n.id === id || n.data.id === id);
    const resolveId   = (id: string) => resolveNode(id)?.id ?? id;

    const handleAnalyzeNode = (e: CustomEvent<{ nodeId: string }>) => {
      onAnalyzeRequest(resolveId(e.detail.nodeId));
    };

    const handlePinNode = (e: CustomEvent<{ nodeId: string }>) => {
      const node = resolveNode(e.detail.nodeId);
      if (node) updateNode(node.id, { metadata: { ...node.data.metadata, isPinned: !node.data.metadata.isPinned } });
    };

    const handleDeleteNode = (e: CustomEvent<{ nodeId: string }>) => {
      deleteNode(resolveId(e.detail.nodeId));
    };

    const handleUpdateNodeContent = (e: CustomEvent<{ nodeId: string; content: string; label: string }>) => {
      updateNode(resolveId(e.detail.nodeId), { content: e.detail.content, label: e.detail.label });
    };

    // NEW: updateNodeMeta — updates arbitrary metadata fields without touching content/label
    const handleUpdateNodeMeta = (e: CustomEvent<{ nodeId: string; metadata: Partial<NodeData["metadata"]> }>) => {
      const node = resolveNode(e.detail.nodeId);
      if (node) {
        updateNode(node.id, { metadata: { ...node.data.metadata, ...e.detail.metadata } });
      }
    };

    const handleUpdateEdgeLabel = (e: CustomEvent<{ edgeId: string; label: string }>) => {
      updateEdge(e.detail.edgeId, { label: e.detail.label });
    };

    const handleResizeNode = (e: CustomEvent<{ nodeId: string; width: number; height: number }>) => {
      updateNodeSize(resolveId(e.detail.nodeId), { width: e.detail.width, height: e.detail.height });
    };

    const handleOpenFile = (e: CustomEvent<{ fileId: string }>) => {
      onOpenFile?.(e.detail.fileId);
    };

    window.addEventListener("analyzeNode",        handleAnalyzeNode        as EventListener);
    window.addEventListener("pinNode",            handlePinNode            as EventListener);
    window.addEventListener("deleteNode",         handleDeleteNode         as EventListener);
    window.addEventListener("updateNodeContent",  handleUpdateNodeContent  as EventListener);
    window.addEventListener("updateNodeMeta",     handleUpdateNodeMeta     as EventListener);
    window.addEventListener("updateEdgeLabel",    handleUpdateEdgeLabel    as EventListener);
    window.addEventListener("resizeNode",         handleResizeNode         as EventListener);
    window.addEventListener("openFile",           handleOpenFile           as EventListener);

    return () => {
      window.removeEventListener("analyzeNode",       handleAnalyzeNode        as EventListener);
      window.removeEventListener("pinNode",           handlePinNode            as EventListener);
      window.removeEventListener("deleteNode",        handleDeleteNode         as EventListener);
      window.removeEventListener("updateNodeContent", handleUpdateNodeContent  as EventListener);
      window.removeEventListener("updateNodeMeta",    handleUpdateNodeMeta     as EventListener);
      window.removeEventListener("updateEdgeLabel",   handleUpdateEdgeLabel    as EventListener);
      window.removeEventListener("resizeNode",        handleResizeNode         as EventListener);
      window.removeEventListener("openFile",          handleOpenFile           as EventListener);
    };
  }, [nodes, updateNode, deleteNode, updateEdge, updateNodeSize, onAnalyzeRequest, onOpenFile]);

  // ── Toolbar callbacks ────────────────────────────────────────────────────────

  const handleAddNote = useCallback(() => {
    const note = createNoteNode({ x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 });
    addNode(note);
  }, [addNode]);

  const handleFitView = useCallback(() => {
    fitView({ padding: WORKSPACE_GRID.fitViewPadding });
  }, [fitView]);

  const handleClearCanvas = useCallback(() => {
    if (confirm("Clear the canvas? This cannot be undone.")) {
      setNodes([]);
      setEdges([]);
    }
  }, [setNodes, setEdges]);

  const handleExportCanvas = useCallback(() => {
    const blob = new Blob(
      [JSON.stringify({ nodes: localNodes, edges: localEdges, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `naphtalai-canvas-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [localNodes, localEdges]);

  // ── Drawing events ───────────────────────────────────────────────────────────

  const handleSvgMouseDown = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (drawMode === "select") return;
      e.stopPropagation();

      if (drawMode === "draw") {
        const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
        const stroke: Stroke = {
          id: uuidv4(),
          color: drawColor,
          strokeWidth: drawSize,
          opacity: 1,
          points: [flowPos],
          createdAt: Date.now(),
        };
        setCurrentStroke(stroke);
        setIsDrawing(true);
      }
    },
    [drawMode, drawColor, drawSize, screenToFlowPosition]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!isDrawing || drawMode !== "draw" || !currentStroke) return;
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      setCurrentStroke((prev) =>
        prev ? { ...prev, points: [...prev.points, flowPos] } : null
      );
    },
    [isDrawing, drawMode, currentStroke, screenToFlowPosition]
  );

  const handleSvgMouseUp = useCallback(() => {
    if (drawMode === "draw" && currentStroke && currentStroke.points.length > 1) {
      addStroke(currentStroke);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [drawMode, currentStroke, addStroke]);

  const handleSvgMouseLeave = useCallback(() => {
    // Finalize stroke if mouse leaves canvas
    if (drawMode === "draw" && currentStroke && currentStroke.points.length > 1) {
      addStroke(currentStroke);
    }
    setCurrentStroke(null);
    setIsDrawing(false);
  }, [drawMode, currentStroke, addStroke]);

  const handleSvgClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (drawMode !== "erase") return;
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const eraseRadius = 20;
      strokes.forEach((stroke) => {
        const near = stroke.points.some(
          (p) => Math.sqrt((p.x - flowPos.x) ** 2 + (p.y - flowPos.y) ** 2) <= eraseRadius
        );
        if (near) deleteStroke(stroke.id);
      });
    },
    [drawMode, strokes, deleteStroke, screenToFlowPosition]
  );

  // Cursor style for draw overlay
  const drawCursor =
    drawMode === "draw"  ? "crosshair" :
    drawMode === "erase" ? "cell"      :
    "default";

  const isInDrawMode = drawMode !== "select";

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div ref={reactFlowWrapper} className="w-full h-full relative p-1.5 md:p-2 bg-background">
      <div className="relative w-full h-full rounded-lg border border-border/70 overflow-hidden bg-background/80 backdrop-blur-sm">
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
          // Disable pan/drag when in draw or erase mode
          panOnDrag={!isInDrawMode}
          nodesDraggable={!isInDrawMode}
          defaultEdgeOptions={{ type: "customEdge", animated: false }}
          proOptions={{ hideAttribution: true }}
          className="bg-background/80"
        >
          {showGrid && (
            <Background color={gridColor} gap={gridSize} size={1.5} className="!bg-background" />
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
                case "fileNode":   return "#1e3a8a";
                case "noteNode":   return "#eab308";
                case "entityNode": return "#ef4444";
                default:           return "#64748b";
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
                {strokes.length > 0 && ` • ${strokes.length} annotation${strokes.length !== 1 ? "s" : ""}`}
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

        {/* ── Drawing SVG overlay ── */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{
            pointerEvents: isInDrawMode ? "all" : "none",
            cursor: isInDrawMode ? drawCursor : "default",
            zIndex: 10,
          }}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseLeave}
          onClick={handleSvgClick}
        >
          <g transform={`translate(${vpX},${vpY}) scale(${zoom})`}>
            {/* Committed strokes */}
            {strokes.map((stroke) => (
              <polyline
                key={stroke.id}
                points={stroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
                stroke={stroke.color}
                strokeWidth={stroke.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={stroke.opacity}
              />
            ))}
            {/* Active stroke being drawn */}
            {currentStroke && (
              <polyline
                points={currentStroke.points.map((p) => `${p.x},${p.y}`).join(" ")}
                stroke={currentStroke.color}
                strokeWidth={currentStroke.strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={currentStroke.opacity}
              />
            )}
          </g>
        </svg>
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
