"use client";

import { memo, useState, useCallback } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileText, ImageIcon, FileCode, FileSpreadsheet, Pin, X, Sparkles, Maximize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeData } from "@/types";
import { cn } from "@/lib/utils";
import { useResizable, ResizeHandle } from "@/hooks/useResizable";

function DocumentNode({ data, selected }: NodeProps<{ [key: string]: unknown }>) {
  const nodeData = data as unknown as NodeData;
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = () => {
    const source = nodeData.metadata.source?.toLowerCase() || "";
    if (source.endsWith(".pdf")) return <FileText className="w-5 h-5" />;
    if (source.match(/\.(jpg|jpeg|png|gif)$/)) return <ImageIcon className="w-5 h-5" />;
    if (source.endsWith(".json")) return <FileCode className="w-5 h-5" />;
    if (source.endsWith(".csv")) return <FileSpreadsheet className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
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
    initialWidth: 280,
    minWidth: 200,
    maxWidth: 500,
    onResize: handleResize,
  });

  const handleOpenViewer = () => {
    if (nodeData.fileId) {
      const event = new CustomEvent("openFile", { detail: { fileId: nodeData.fileId } });
      window.dispatchEvent(event);
    }
  };

  return (
    <div
      className={cn(
        "group bg-card border border-border rounded-lg shadow-lg relative",
        "transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
      style={{ width: `${size.width}px` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Resize Handles */}
      <ResizeHandle onMouseDown={handleMouseDown} direction="se" />
      <ResizeHandle onMouseDown={handleMouseDown} direction="e" />

      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-lodge-blue !border-2 !border-background"
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
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 rounded-t-lg">
        <div className="flex items-center gap-2">
          <div className="text-primary">{getFileIcon()}</div>
          <span className="text-xs text-muted-foreground font-mono uppercase">
            Document
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleOpenViewer}
            title="Open in viewer"
          >
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handlePin}
          >
            <Pin
              className={cn(
                "w-3 h-3",
                nodeData.metadata.isPinned
                  ? "text-revelation-gold fill-current"
                  : "text-muted-foreground"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Thumbnail */}
      {nodeData.thumbnail && (
        <div className="aspect-video bg-muted relative overflow-hidden">
          <img
            src={nodeData.thumbnail}
            alt={nodeData.label}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm text-card-foreground truncate mb-1">
          {nodeData.label}
        </h3>

        {nodeData.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {nodeData.content.substring(0, 100)}...
          </p>
        )}

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
            className="flex-1 h-7 text-xs bg-lodge-blue hover:bg-lodge-blue/90"
            onClick={handleAnalyze}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Analyze
          </Button>
        </div>
      </div>

      {/* Date */}
      {nodeData.metadata.date && (
        <div className="px-3 py-1 border-t border-border text-[10px] text-muted-foreground font-mono rounded-b-lg">
          {new Date(nodeData.metadata.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default memo(DocumentNode);
