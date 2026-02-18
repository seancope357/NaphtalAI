"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  ArrowUpRightFromSquare,
  FileChartColumn,
  FileJson,
  FileScan,
  ImagePlay,
  MapPinned,
  ScanSearch,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeData } from "@/types";
import { cn } from "@/lib/utils";
import { useResizable, ResizeHandle } from "@/hooks/useResizable";
import { NODE_DIMENSIONS } from "@/lib/workspaceConstraints";
import { buildPdfBlobUrl, buildPdfViewerUrl, getReadableContentPreview, inferFileTypeFromName } from "@/lib/fileContent";
import { getFile } from "@/lib/indexedDb";

function DocumentNode({ data, selected, width, height }: NodeProps<{ [key: string]: unknown }>) {
  const nodeData = data as unknown as NodeData;
  const [pdfSource, setPdfSource] = useState<string | null>(null);
  const fileType = nodeData.metadata.fileType || inferFileTypeFromName(nodeData.label);
  const isPdf = fileType === "pdf";

  const getFileIcon = () => {
    if (fileType === "pdf") return <FileScan className="w-5 h-5" strokeWidth={2.2} />;
    if (fileType === "jpg" || fileType === "png") return <ImagePlay className="w-5 h-5" strokeWidth={2.2} />;
    if (fileType === "json") return <FileJson className="w-5 h-5" strokeWidth={2.2} />;
    if (fileType === "csv") return <FileChartColumn className="w-5 h-5" strokeWidth={2.2} />;
    return <FileScan className="w-5 h-5" strokeWidth={2.2} />;
  };

  const handleAnalyze = () => {
    const event = new CustomEvent("analyzeNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handlePin = () => {
    const event = new CustomEvent("pinNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    const event = new CustomEvent("deleteNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleResize = useCallback((width: number, height: number) => {
    const event = new CustomEvent("resizeNode", {
      detail: { nodeId: nodeData.id, width, height },
    });
    window.dispatchEvent(event);
  }, [nodeData.id]);

  const { size, handleMouseDown } = useResizable({
    initialWidth: typeof width === "number" ? width : NODE_DIMENSIONS.file.defaultWidth,
    initialHeight: typeof height === "number" ? height : NODE_DIMENSIONS.file.defaultHeight,
    minWidth: NODE_DIMENSIONS.file.minWidth,
    maxWidth: NODE_DIMENSIONS.file.maxWidth,
    minHeight: NODE_DIMENSIONS.file.minHeight,
    maxHeight: NODE_DIMENSIONS.file.maxHeight,
    onResize: handleResize,
  });

  useEffect(() => {
    if (!isPdf || !nodeData.fileId) return;

    let isMounted = true;
    let localBlobUrl: string | null = null;

    const loadPdf = async () => {
      const storedFile = await getFile(nodeData.fileId!);
      const source = buildPdfBlobUrl(storedFile?.content);
      if (!isMounted) {
        if (source?.startsWith("blob:")) URL.revokeObjectURL(source);
        return;
      }
      if (source?.startsWith("blob:")) {
        localBlobUrl = source;
      }
      setPdfSource(source);
    };

    loadPdf().catch(() => setPdfSource(null));

    return () => {
      isMounted = false;
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [isPdf, nodeData.fileId]);

  const resolvedPdfSource = isPdf ? pdfSource : null;

  const handleOpenViewer = () => {
    if (nodeData.fileId) {
      const event = new CustomEvent("openFile", { detail: { fileId: nodeData.fileId } });
      window.dispatchEvent(event);
    }
  };

  const previewText = useMemo(
    () =>
      nodeData.previewContent ||
      getReadableContentPreview(nodeData.content, fileType) ||
      "Open this source to inspect details.",
    [nodeData.previewContent, nodeData.content, fileType]
  );

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-xl shadow-lg relative overflow-hidden",
        "transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
      style={{
        width: typeof size.width === "number" ? `${size.width}px` : size.width,
        height: typeof size.height === "number" ? `${size.height}px` : size.height,
      }}
    >
      {/* Resize Handles */}
      <ResizeHandle onMouseDown={handleMouseDown} direction="se" />
      <ResizeHandle onMouseDown={handleMouseDown} direction="e" />
      <ResizeHandle onMouseDown={handleMouseDown} direction="s" />

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background !left-[-7px]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background !right-[-7px]"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="text-primary">{getFileIcon()}</div>
          <span className="text-[11px] text-muted-foreground font-mono uppercase tracking-wider">Source</span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleOpenViewer}
            title="Open in viewer"
          >
            <ArrowUpRightFromSquare className="w-3 h-3" strokeWidth={2.2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handlePin}
          >
            <MapPinned
              className={cn(
                "w-3 h-3",
                nodeData.metadata.isPinned
                  ? "text-revelation-gold fill-current"
                  : "text-muted-foreground"
              )}
              strokeWidth={2.2}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      {/* Preview */}
      <div className="px-3 pt-3">
        <div
          className={cn(
            "relative rounded-lg border border-border/80 bg-muted/20 overflow-hidden",
            "h-[clamp(180px,45%,420px)]"
          )}
        >
          {resolvedPdfSource ? (
            <iframe
              src={buildPdfViewerUrl(resolvedPdfSource, 1, 100)}
              title={`${nodeData.label} preview`}
              className="w-full h-full border-0 pointer-events-none bg-white"
            />
          ) : nodeData.thumbnail ? (
            <img
              src={nodeData.thumbnail}
              alt={nodeData.label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileScan className="w-8 h-8 text-muted-foreground/40" strokeWidth={2.2} />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pb-2">
        <h3 className="font-display font-semibold text-sm text-card-foreground truncate mb-1.5">
          {nodeData.label}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-3 mb-2 min-h-[3.25rem]">{previewText}</p>

        {/* Tags */}
        {nodeData.metadata.tags && nodeData.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {nodeData.metadata.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant="default"
            className="flex-1 h-8 text-xs bg-lodge-blue hover:bg-lodge-blue/90"
            onClick={handleAnalyze}
          >
            <ScanSearch className="w-3 h-3 mr-1" strokeWidth={2.2} />
            Analyze
          </Button>
        </div>
      </div>

      {/* Date */}
      {nodeData.metadata.date && (
        <div className="px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground font-mono">
          {new Date(nodeData.metadata.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default memo(DocumentNode);
