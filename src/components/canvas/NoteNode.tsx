"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CheckCheck, MapPinned, NotebookPen, SquarePen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { NodeData } from "@/types";
import { cn } from "@/lib/utils";
import { NODE_DIMENSIONS } from "@/lib/workspaceConstraints";

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
        "border rounded-xl shadow-lg w-[280px] min-h-[220px] p-1",
        noteColor.bg,
        noteColor.border,
        "transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
      style={{
        minWidth: `${NODE_DIMENSIONS.note.minWidth}px`,
        maxWidth: `${NODE_DIMENSIONS.note.maxWidth}px`,
      }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !left-[-7px] !top-[38%]"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !left-[-7px] !top-[62%]"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !right-[-7px] !top-[38%]"
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !right-[-7px] !top-[62%]"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !top-[-7px] !left-[38%]"
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !top-[-7px] !left-[62%]"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !bottom-[-7px] !left-[38%]"
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-target"
        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !bottom-[-7px] !left-[62%]"
      />

      {/* Header */}
      <div className={cn("flex items-center justify-between px-4 py-2 rounded-t-lg", noteColor.accent)}>
        <div className="flex items-center gap-2.5">
          <NotebookPen className="w-4 h-4 text-background" strokeWidth={2.2} />
          <span className="text-xs text-background font-medium">{isEditing ? 'Edit Note' : nodeData.label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-background"
            onClick={() => setIsEditing(!isEditing)}
          >
            <SquarePen className="w-3 h-3" strokeWidth={2.2} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-background"
            onClick={handlePin}
          >
            <MapPinned
              className={cn(
                "w-3 h-3",
                nodeData.metadata.isPinned && "text-revelation-gold"
              )}
              strokeWidth={2.2}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-background/70 hover:text-red-300"
            onClick={handleDelete}
          >
            <X className="w-3 h-3" strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Note title..."
              className="h-9 text-sm bg-background/50"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your note..."
              className="min-h-[100px] text-sm bg-background/50"
              autoFocus
            />
            <Button
              size="sm"
              onClick={handleSaveContent}
              className="w-full h-8"
            >
              <CheckCheck className="w-3 h-3 mr-1.5" strokeWidth={2.2} />
              Save
            </Button>
          </div>
        ) : (
          <div className="text-sm text-card-foreground whitespace-pre-wrap min-h-[60px]">
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
        <div className="px-4 py-2 border-t border-border/50 text-[10px] text-muted-foreground font-mono">
          {new Date(nodeData.metadata.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default memo(NoteNode);
