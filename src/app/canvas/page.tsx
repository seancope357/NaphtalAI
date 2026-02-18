"use client";

import { useCallback, useState } from "react";
import { PanelsTopLeft, Crosshair, Waypoints, LayoutGrid } from "lucide-react";

import ArchivesSidebar from "@/components/layout/ArchivesSidebar";
import OverseerSidebar from "@/components/layout/OverseerSidebar";
import DocumentViewer from "@/components/layout/DocumentViewer";
import Trestleboard from "@/components/canvas/Trestleboard";
import { ModeToggle } from "@/components/mode-toggle";
import { useCanvasStore, createEntityNode, createEdge, createDocumentNode } from "@/stores/canvasStore";
import { useChatStore, createAssistantMessage } from "@/stores/chatStore";
import { useFileStore } from "@/stores/fileStore";
import { useEntityStore, type Entity, type EntityType } from "@/stores/entityStore";
import { useViewerStore } from "@/stores/viewerStore";
import { getFile } from "@/lib/indexedDb";
import { getReadableContentPreview, inferFileTypeFromName, isBinaryPreview } from "@/lib/fileContent";
import { WORKSPACE_LAYOUT } from "@/lib/workspaceConstraints";
import type { FileItem, ExtractedEntity } from "@/types";

import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";


export default function Home() {
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);

  const {
    nodes,
    edges,
    addNode,
    addNodes,
    addEdge,
    getNodeById,
    getNodesByIds,
    showGrid,
    setShowGrid,
  } = useCanvasStore();

  const { addMessage, setLoading } = useChatStore();
  const { files } = useFileStore();
  const { openFile } = useViewerStore();
  const {
    addEntity,
    addEntities,
    addConnection,
    entities,
    setExtracting,
  } = useEntityStore();

  // Handle drag start from file sidebar
  const handleDragStart = useCallback((file: FileItem) => {
    // File is being dragged
  }, []);

  const getAnalyzableContent = useCallback((content: string) => {
    if (isBinaryPreview(content)) {
      return "Binary visual asset attached. Use direct visual inspection instead of text extraction.";
    }
    return content;
  }, []);

  // Handle node selection
  const handleNodeSelect = useCallback((nodeIds: string[]) => {
    setSelectedNodes(nodeIds);
  }, []);

  // Extract entities from file content
  const extractEntitiesFromFile = useCallback(
    async (file: FileItem, content: string) => {
      setExtracting(true);

      try {
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: [content],
            query: "Extract all named entities from this document.",
            mode: "extract_entities",
          }),
        });

        const data = await response.json();

        if (data.success && data.result.entities) {
          const extractedEntities = data.result.entities as ExtractedEntity[];

          // Add entities to the entity store
          const newEntities = extractedEntities.map((e) => ({
            name: e.name,
            type: e.type as EntityType,
            aliases: e.aliases || [],
            description: e.context || "",
            sourceIds: [file.id],
            metadata: {
              confidence: 0.8,
              context: e.context,
            },
          }));

          const addedEntities = addEntities(newEntities);

          // Add connections if provided
          if (data.result.connections) {
            data.result.connections.forEach((conn: any) => {
              const sourceEntity = addedEntities.find(
                (e) => e.name.toLowerCase() === conn.sourceName.toLowerCase()
              );
              const targetEntity = addedEntities.find(
                (e) => e.name.toLowerCase() === conn.targetName.toLowerCase()
              );

              if (sourceEntity && targetEntity) {
                addConnection({
                  sourceEntityId: sourceEntity.id,
                  targetEntityId: targetEntity.id,
                  type: conn.type || "associated_with",
                  strength: conn.confidence || 0.5,
                  sourceIds: [file.id],
                  description: conn.label || "",
                });
              }
            });
          }

          return addedEntities;
        }
      } catch (error) {
        console.error("Entity extraction error:", error);
      } finally {
        setExtracting(false);
      }

      return [];
    },
    [addEntities, addConnection, setExtracting]
  );

  // Handle AI analysis request
  const handleAnalyzeRequest = useCallback(async (nodeId: string) => {
    const node = getNodeById(nodeId);
    if (!node) return;

    setLoading(true);

    try {
      // Get file content if it's a file node
      let content = node.data.content;
      if (node.data.fileId) {
        const storedFile = await getFile(node.data.fileId);
        if (storedFile && typeof storedFile.content === "string") {
          content = getAnalyzableContent(storedFile.content);
        }
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: [content],
          query: "Analyze this document and provide a summary of key findings.",
          mode: "chat",
        }),
      });

      const data = await response.json();

      if (data.success) {
        addMessage(createAssistantMessage(data.result));
      } else {
        addMessage(
          createAssistantMessage(
            "I apologize, but I encountered an error analyzing this document. Please try again."
          )
        );
      }
    } catch (error) {
      console.error("Analysis error:", error);
      addMessage(
        createAssistantMessage(
          "An error occurred while analyzing the document. Please check your connection and try again."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [getNodeById, addMessage, setLoading, getAnalyzableContent]);

  // Handle AI analysis from the Overseer sidebar
  const handleAnalyze = useCallback(
    async (
      mode: string,
      nodeIds?: string[],
      provider?: "openai" | "anthropic",
      openAIKey?: string,
      anthropicKey?: string,
      customQuery?: string
    ) => {
      if (!nodeIds || nodeIds.length === 0) return;

      setLoading(true);
      const nodesToAnalyze = getNodesByIds(nodeIds);
      const selectedNodeSet = new Set(nodeIds);

      try {
        // Gather content from nodes
        const contexts: string[] = [];

        for (const node of nodesToAnalyze) {
          let content = node.data.content;

          // For file nodes, get full content from IndexedDB
          if (node.data.fileId) {
            const storedFile = await getFile(node.data.fileId);
            if (storedFile && typeof storedFile.content === "string") {
              content = getAnalyzableContent(storedFile.content);
            }
          }

          contexts.push(`[${node.data.label}]\n${content}`);
        }

        const relatedEdges = edges.filter(
          (edge) => selectedNodeSet.has(edge.source) || selectedNodeSet.has(edge.target)
        );
        const expandedNodeIds = new Set(nodeIds);
        relatedEdges.forEach((edge) => {
          expandedNodeIds.add(edge.source);
          expandedNodeIds.add(edge.target);
        });

        const graphNodes = nodes
          .filter((node) => expandedNodeIds.has(node.id))
          .map((node) => ({
            id: node.id,
            type: node.data.type,
            label: node.data.label,
            source: node.data.metadata?.source,
            tags: node.data.metadata?.tags || [],
          }));

        const graphEdges = edges
          .filter((edge) => expandedNodeIds.has(edge.source) && expandedNodeIds.has(edge.target))
          .map((edge) => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.data?.label,
            semanticType: edge.data?.semanticType,
            logicRule: edge.data?.logicRule,
            confidence: edge.data?.confidence,
            sourceHandle: edge.sourceHandle || undefined,
            targetHandle: edge.targetHandle || undefined,
          }));
        const resolvedQuery =
          customQuery?.trim() ||
          (mode === "extract_entities"
            ? "Extract all named entities from these documents."
            : mode === "connect"
            ? "Find connections between these documents."
            : mode === "analyze_symbol"
            ? "Identify and analyze any symbolic references."
            : mode === "presentation"
            ? "Create a source-cited slide deck outline from this graph-constrained research context."
            : mode === "report"
            ? "Create a source-cited research report from this graph-constrained research context."
            : "Provide a summary and analysis.");

        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: contexts,
            query: resolvedQuery,
            mode,
            graph: {
              nodes: graphNodes,
              edges: graphEdges,
              selectedNodeIds: nodeIds,
            },
            provider,
            openAIKey,
            anthropicKey,
          }),
        });

        const data = await response.json();

        if (data.success) {
          // Handle entity extraction
          if (
            (mode === "extract_entities" || mode === "connect") &&
            typeof data.result === "object" &&
            "entities" in data.result
          ) {
            const extractedEntities = data.result.entities;
            const connections = data.result.connections || [];
            const sourceNodeId = nodeIds[0];
            const sourceNode = getNodeById(sourceNodeId);

            // Create entity nodes on canvas
            const newNodes = extractedEntities.map((entity: ExtractedEntity, index: number) => {
              const angle = (index / extractedEntities.length) * Math.PI * 2;
              const radius = 200;
              const sourcePosition = sourceNode?.position || { x: 300, y: 300 };

              return createEntityNode(
                entity.name,
                entity.type,
                {
                  x: sourcePosition.x + Math.cos(angle) * radius,
                  y: sourcePosition.y + Math.sin(angle) * radius,
                },
                sourceNode?.data.label,
                entity.context
              );
            });

            addNodes(newNodes);

            // Create edges from source to entities
            newNodes.forEach((entityNode) => {
              const edge = createEdge(sourceNodeId, entityNode.id, "contains");
              addEdge(edge);
            });

            // Also add to entity store
            const storeEntities = extractedEntities.map((e: ExtractedEntity) => ({
              name: e.name,
              type: e.type as EntityType,
              aliases: [],
              description: e.context || "",
              sourceIds: [sourceNode?.data.fileId || ""],
              metadata: { context: e.context },
            }));
            addEntities(storeEntities);

            addMessage(
              createAssistantMessage(
                `I found ${extractedEntities.length} entities. They have been added to both the canvas and the entity registry.`
              )
            );
          } else {
            // Regular chat response
            addMessage(
              createAssistantMessage(
                typeof data.result === "string"
                  ? data.result
                  : JSON.stringify(data.result, null, 2)
              )
            );
          }
        } else {
          const validationIssues = Array.isArray(data?.details?.issues)
            ? data.details.issues
            : [];
          const issuePreview = validationIssues
            .slice(0, 3)
            .map((issue: any, index: number) => {
              const missing = Array.isArray(issue?.missing) ? issue.missing.join(" + ") : "citations";
              return `${index + 1}. ${issue?.slide || "Slide"} -> missing ${missing}`;
            })
            .join("\n");
          const detailsMessage =
            typeof data?.details?.message === "string"
              ? data.details.message
              : typeof data?.error === "string"
              ? data.error
              : "I encountered an error processing your request. Please try again.";

          addMessage(
            createAssistantMessage(
              issuePreview ? `${detailsMessage}\n\n${issuePreview}` : detailsMessage
            )
          );
        }
      } catch (error) {
        console.error("Analysis error:", error);
        addMessage(
          createAssistantMessage(
            "An error occurred during analysis. Please try again."
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [getNodesByIds, getNodeById, addNodes, addEdge, addEntities, addMessage, setLoading, getAnalyzableContent, edges, nodes]
  );

  // Handle pinning document to canvas from viewer
  const handlePinToCanvas = useCallback(
    async (file: FileItem, thumbnail: string | undefined, position: { x: number; y: number }) => {
      // Get full content from IndexedDB
      const storedFile = await getFile(file.id);
      const content = storedFile && typeof storedFile.content === "string"
        ? getReadableContentPreview(storedFile.content, file.type)
        : getReadableContentPreview(undefined, file.type);

      const node = createDocumentNode(
        file.id,
        file.name,
        position,
        thumbnail || storedFile?.thumbnail,
        content
      );

      addNode(node);

      // Auto-extract entities from the document
      if (storedFile && typeof storedFile.content === "string" && !isBinaryPreview(storedFile.content)) {
        addMessage(createAssistantMessage(
          `Document "${file.name}" has been pinned to the canvas. I'm now extracting entities...`
        ));
        
        // Extract entities in background
        const extractedEntities = await extractEntitiesFromFile(file, storedFile.content);
        
        if (extractedEntities.length > 0) {
          addMessage(createAssistantMessage(
            `Found ${extractedEntities.length} entities from "${file.name}". Check the Entities tab to view them.`
          ));
        }
      }
    },
    [addNode, addMessage, extractEntitiesFromFile]
  );

  // Handle entity click
  const handleEntityClick = useCallback((entity: Entity) => {
    // Focus on entity in the UI
    addMessage(createAssistantMessage(
      `**${entity.name}** (${entity.type})\n\n${entity.description || "No description available."}\n\nFound in ${entity.sourceIds.length} document(s).`
    ));
  }, [addMessage]);

  // Handle adding entity to canvas
  const handleAddEntityToCanvas = useCallback((entity: Entity) => {
    const position = {
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    };

    const node = createEntityNode(
      entity.name,
      entity.type as 'person' | 'location' | 'date' | 'symbol' | 'organization',
      position,
      undefined,
      entity.description
    );

    addNode(node);
  }, [addNode]);

  // Handle analyze from viewer
  const handleAnalyzeFromViewer = useCallback(
    async (file: FileItem, content: string) => {
      setLoading(true);

      try {
        const safeContent = getAnalyzableContent(content);
        const response = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            context: [safeContent],
            query: "Provide a comprehensive analysis of this document.",
            mode: "chat",
          }),
        });

        const data = await response.json();

        if (data.success) {
          addMessage(createAssistantMessage(data.result));
        }
      } catch (error) {
        console.error("Analysis error:", error);
      } finally {
        setLoading(false);
      }
    },
    [addMessage, setLoading, getAnalyzableContent]
  );

  const handleOpenFileFromCanvas = useCallback(
    async (fileId: string) => {
      const stored = await getFile(fileId);
      if (!stored) return;

      const fileMeta = files.find((file) => file.id === fileId) || {
        id: fileId,
        name: stored.name,
        type: inferFileTypeFromName(stored.name) || "txt",
        size: stored.size,
        uploadedAt: new Date(stored.uploadedAt),
        thumbnail: stored.thumbnail,
      };

      openFile(fileMeta, stored.content);
    },
    [files, openFile]
  );

  return (
    <main className="h-screen w-screen overflow-hidden bg-background p-2 md:p-3">
      <div className="h-full min-h-0 rounded-xl border border-border/70 bg-card/25 shadow-xl overflow-hidden flex flex-col">
        <header className="h-11 md:h-12 shrink-0 border-b border-border/70 px-3 md:px-4 flex items-center justify-between bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center shrink-0">
              <PanelsTopLeft className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs md:text-sm font-semibold tracking-tight text-foreground truncate">NaphtalAI Research Workspace</h1>
              <p className="hidden lg:block text-[10px] text-muted-foreground truncate">Structured evidence mapping and analysis canvas</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-card text-[10px]">
                <Crosshair className="w-3 h-3 text-primary" strokeWidth={2.2} />
                <span className="text-muted-foreground">{nodes.length} nodes</span>
              </div>
              <div className="inline-flex items-center gap-1.5 h-6 px-2 rounded-md border border-border bg-card text-[10px]">
                <Waypoints className="w-3 h-3 text-primary" strokeWidth={2.2} />
                <span className="text-muted-foreground">{edges.length} links</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold transition-colors ${
                showGrid
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.2} />
              {showGrid ? "Grid On" : "Grid Off"}
            </button>
            <ModeToggle className="border-border bg-card text-foreground hover:bg-accent" />
          </div>
        </header>

        <div className="flex-1 min-h-0">
          <PanelGroup direction="horizontal">
            <Panel
              defaultSize={WORKSPACE_LAYOUT.panels.left.defaultSize}
              minSize={WORKSPACE_LAYOUT.panels.left.minSize}
              maxSize={WORKSPACE_LAYOUT.panels.left.maxSize}
            >
              <ArchivesSidebar
                onDragStart={handleDragStart}
                onEntityClick={handleEntityClick}
                onAddEntityToCanvas={handleAddEntityToCanvas}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-sidebar-border/80 hover:bg-primary/40 transition-colors duration-200 cursor-col-resize" />
            <Panel
              defaultSize={WORKSPACE_LAYOUT.panels.center.defaultSize}
              minSize={WORKSPACE_LAYOUT.panels.center.minSize}
            >
              <Trestleboard
                onNodeSelect={handleNodeSelect}
                onAnalyzeRequest={handleAnalyzeRequest}
                onOpenFile={handleOpenFileFromCanvas}
              />
            </Panel>
            <PanelResizeHandle className="w-1.5 bg-sidebar-border/80 hover:bg-primary/40 transition-colors duration-200 cursor-col-resize" />
            <Panel
              defaultSize={WORKSPACE_LAYOUT.panels.right.defaultSize}
              minSize={WORKSPACE_LAYOUT.panels.right.minSize}
              maxSize={WORKSPACE_LAYOUT.panels.right.maxSize}
            >
              <OverseerSidebar onAnalyze={handleAnalyze} />
            </Panel>
          </PanelGroup>
        </div>
      </div>

      {/* Document Viewer Overlay */}
      <DocumentViewer
        onPinToCanvas={handlePinToCanvas}
        onAnalyze={handleAnalyzeFromViewer}
      />
    </main>
  );
}
