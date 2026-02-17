"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { StickyNote, Pin, X, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NodeData } from "@/types";
import { cn } from "@/lib/utils";

function NoteNode({ data, selected }: NodeProps) {
  const nodeData = data as NodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(nodeData.content);
  const [editLabel, setEditLabel] = useState(nodeData.label);

  const handlePin = () => {
    const event = new CustomEvent("pinNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleDelete = () => {
    const event = new CustomEvent("deleteNode", { detail: { nodeId: nodeData.id } });
    window.dispatchEvent(event);
  };

  const handleSaveContent = () => {
    const event = new CustomEvent("updateNodeContent", {
      detail: { nodeId: nodeData.id, content: editContent, label: editLabel },
    });
    window.dispatchEvent(event);
    setIsEditing(false);
  };

  const noteColors = [
    { bg: "bg-yellow-100/10", border: "border-yellow-500/30", accent: "bg-yellow-500" },
    { bg: "bg-blue-100/10", border: "border-blue-500/30", accent: "bg-blue-500" },
    { bg: "bg-green-100/10", border: "border-green-500/30", accent: "bg-green-500" },
    { bg: "bg-pink-100/10", border: "border-pink-500/30", accent: "bg-pink-500" },
    { bg: "bg-orange-100/10", border: "border-orange-500/30", accent: "bg-orange-500" },
  ];

  const colorIndex = Math.abs(
    nodeData.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % noteColors.length;
  const noteColor = noteColors[colorIndex];

  return (
    <div
      className={cn(
        "border rounded-lg shadow-lg min-w-[180px] max-w-[240px]",
        noteColor.bg,
        noteColor.border,
        "transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-primary/70 !border-2 !border-background"
      />

      {/* Header */}
      <div className={cn("flex items-center justify-between px-3 py-1.5 rounded-t-lg", noteColor.accent)}>
        <div className="flex items-center gap-2">
          <StickyNote className="w-4 h-4 text-background" />
          <span className="text-xs text-background font-medium">{isEditing ? 'Edit Note' : nodeData.label}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-background"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-background"
            onClick={handlePin}
          >
            <Pin
              className={cn(
                "w-3 h-3",
                nodeData.metadata.isPinned && "fill-current"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-red-300"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Note title..."
              className="h-8 text-sm bg-background/50"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[80px] text-sm bg-background/50"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSaveContent}
              className="w-full h-7"
            >
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
          </div>
        ) : (
          <div className="text-sm text-card-foreground whitespace-pre-wrap min-h-[40px]">
            {nodeData.content || (
              <span className="text-muted-foreground italic">
                Click edit to add content...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date */}
      {nodeData.metadata.date && (
        <div className="px-3 py-1 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
          {new Date(nodeData.metadata.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default memo(NoteNode);
