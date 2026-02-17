"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  User,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Pin,
  X,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NodeData } from "@/types";
import { cn } from "@/lib/utils";

function EntityNode({ data, selected }: NodeProps<{ [key: string]: unknown }>) {
  const nodeData = data as unknown as NodeData;

  const getEntityIcon = () => {
    switch (nodeData.metadata.entityType) {
      case "person":
        return <User className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      case "date":
        return <Calendar className="w-4 h-4" />;
      case "symbol":
        return <Shield className="w-4 h-4" />;
      case "organization":
        return <Building2 className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getEntityColor = () => {
    switch (nodeData.metadata.entityType) {
      case "person":
        return "border-blue-500/50 bg-blue-500/10";
      case "location":
        return "border-green-500/50 bg-green-500/10";
      case "date":
        return "border-purple-500/50 bg-purple-500/10";
      case "symbol":
        return "border-amber-500/50 bg-amber-500/10";
      case "organization":
        return "border-cyan-500/50 bg-cyan-500/10";
      default:
        return "border-gray-500/50 bg-gray-500/10";
    }
  };

  const getEntityBadgeVariant = () => {
    switch (nodeData.metadata.entityType) {
      case "person":
        return "default";
      case "location":
        return "secondary";
      case "symbol":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handlePin = () => {
    const event = new CustomEvent("pinNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    const event = new CustomEvent("deleteNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleAnalyze = () => {
    const event = new CustomEvent("analyzeNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  return (
    <div
      className={cn(
        "border rounded-lg shadow-lg min-w-[160px] max-w-[200px]",
        "transition-all duration-200",
        getEntityColor(),
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
    >
      {/* Handles */}
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
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30">
        <div className="flex items-center gap-1.5">
          <div className="text-primary">{getEntityIcon()}</div>
          <Badge variant={getEntityBadgeVariant()} className="text-[10px] px-1 py-0 capitalize">
            {nodeData.metadata.entityType || "Entity"}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
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
            className="h-5 w-5 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-sm text-card-foreground mb-1">
          {nodeData.label}
        </h3>

        {nodeData.content && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {nodeData.content}
          </p>
        )}

        {/* Tags */}
        {nodeData.metadata.tags && nodeData.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {nodeData.metadata.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[10px] px-1 py-0"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        <Button
          size="sm"
          variant="ghost"
          className="w-full h-6 text-xs"
          onClick={handleAnalyze}
        >
          <Eye className="w-3 h-3 mr-1" />
          Investigate
        </Button>
      </div>

      {/* Source */}
      {nodeData.metadata.source && (
        <div className="px-3 py-1 border-t border-border/30 text-[10px] text-muted-foreground font-mono truncate">
          From: {nodeData.metadata.source}
        </div>
      )}
    </div>
  );
}

export default memo(EntityNode);
