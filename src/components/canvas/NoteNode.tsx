"use client";

import { memo, useCallback, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  CheckCheck,
  MapPinned,
  NotebookPen,
  Palette,
  SquarePen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { NodeData, NoteFontSize } from "@/types";
import { cn } from "@/lib/utils";
import { useResizable, ResizeHandle } from "@/hooks/useResizable";
import { NODE_DIMENSIONS } from "@/lib/workspaceConstraints";

// ─── Color palette ────────────────────────────────────────────────────────────

const NOTE_COLORS = [
  { value: "#eab308", bg: "rgba(234,179,8,0.12)",   border: "rgba(234,179,8,0.35)"   }, // yellow
  { value: "#f97316", bg: "rgba(249,115,22,0.12)",  border: "rgba(249,115,22,0.35)"  }, // orange
  { value: "#ef4444", bg: "rgba(239,68,68,0.12)",   border: "rgba(239,68,68,0.35)"   }, // red
  { value: "#ec4899", bg: "rgba(236,72,153,0.12)",  border: "rgba(236,72,153,0.35)"  }, // pink
  { value: "#a855f7", bg: "rgba(168,85,247,0.12)",  border: "rgba(168,85,247,0.35)"  }, // purple
  { value: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.35)"  }, // blue
  { value: "#14b8a6", bg: "rgba(20,184,166,0.12)",  border: "rgba(20,184,166,0.35)"  }, // teal
  { value: "#22c55e", bg: "rgba(34,197,94,0.12)",   border: "rgba(34,197,94,0.35)"   }, // green
] as const;

// Deterministic fallback color from node ID
function defaultColorFor(id: string): string {
  const idx = Math.abs(
    id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  ) % NOTE_COLORS.length;
  return NOTE_COLORS[idx].value;
}

function colorConfig(accent: string) {
  return NOTE_COLORS.find((c) => c.value === accent) ?? NOTE_COLORS[0];
}

// ─── Font size map ────────────────────────────────────────────────────────────

const FONT_SIZE_CLASS: Record<NoteFontSize, string> = {
  sm: "text-xs leading-relaxed",
  md: "text-sm leading-relaxed",
  lg: "text-base leading-relaxed",
};

// ─── Component ────────────────────────────────────────────────────────────────

function NoteNode({ data, selected, width, height }: NodeProps<{ [key: string]: unknown }>) {
  const nodeData = data as unknown as NodeData;

  const [isEditing, setIsEditing]     = useState(false);
  const [editContent, setEditContent] = useState(nodeData.content);
  const [editLabel, setEditLabel]     = useState(nodeData.label);
  const [showStyling, setShowStyling] = useState(false);

  // Derive active color/size (stored in metadata, fallback to deterministic)
  const activeColor    = nodeData.metadata.noteColor ?? defaultColorFor(nodeData.id);
  const activeFontSize = (nodeData.metadata.noteFontSize as NoteFontSize) ?? "md";
  const cfg = colorConfig(activeColor);

  // ── Resize ──────────────────────────────────────────────────────────────────

  const handleResize = useCallback((w: number, h: number) => {
    const event = new CustomEvent("resizeNode", {
      detail: { nodeId: nodeData.id, width: w, height: h },
    });
    window.dispatchEvent(event);
  }, [nodeData.id]);

  const { size, handleMouseDown } = useResizable({
    initialWidth:  typeof width  === "number" ? width  : NODE_DIMENSIONS.note.defaultWidth,
    initialHeight: typeof height === "number" ? height : NODE_DIMENSIONS.note.defaultHeight,
    minWidth:  NODE_DIMENSIONS.note.minWidth,
    maxWidth:  NODE_DIMENSIONS.note.maxWidth,
    minHeight: NODE_DIMENSIONS.note.minHeight,
    maxHeight: NODE_DIMENSIONS.note.maxHeight,
    onResize: handleResize,
  });

  // ── Events ──────────────────────────────────────────────────────────────────

  const dispatchMeta = useCallback((meta: Partial<NodeData["metadata"]>) => {
    const event = new CustomEvent("updateNodeMeta", {
      detail: { nodeId: nodeData.id, metadata: meta },
    });
    window.dispatchEvent(event);
  }, [nodeData.id]);

  const handleColorChange = (color: string) => {
    dispatchMeta({ noteColor: color });
    setShowStyling(false);
  };

  const handleSizeChange = (fontSize: NoteFontSize) => {
    dispatchMeta({ noteFontSize: fontSize });
  };

  const handlePin = () => {
    window.dispatchEvent(new CustomEvent("pinNode", { detail: { nodeId: nodeData.id } }));
  };

  const handleDelete = () => {
    window.dispatchEvent(new CustomEvent("deleteNode", { detail: { nodeId: nodeData.id } }));
  };

  const handleSaveContent = () => {
    window.dispatchEvent(new CustomEvent("updateNodeContent", {
      detail: { nodeId: nodeData.id, content: editContent, label: editLabel },
    }));
    setIsEditing(false);
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border shadow-lg transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeData.metadata.isPinned && "ring-1 ring-revelation-gold"
      )}
      style={{
        width:  typeof size.width  === "number" ? `${size.width}px`  : size.width,
        height: typeof size.height === "number" ? `${size.height}px` : size.height,
        background: cfg.bg,
        borderColor: cfg.border,
      }}
    >
      {/* Resize handles */}
      <ResizeHandle onMouseDown={handleMouseDown} direction="se" />
      <ResizeHandle onMouseDown={handleMouseDown} direction="e"  />
      <ResizeHandle onMouseDown={handleMouseDown} direction="s"  />

      {/* Connection handles */}
      <Handle type="target"  position={Position.Left}   id="left"         className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !left-[-7px] !top-[38%]" />
      <Handle type="source"  position={Position.Left}   id="left-source"  className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !left-[-7px] !top-[62%]" />
      <Handle type="source"  position={Position.Right}  id="right"        className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !right-[-7px] !top-[38%]" />
      <Handle type="target"  position={Position.Right}  id="right-target" className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !right-[-7px] !top-[62%]" />
      <Handle type="target"  position={Position.Top}    id="top"          className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !top-[-7px] !left-[38%]" />
      <Handle type="source"  position={Position.Top}    id="top-source"   className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !top-[-7px] !left-[62%]" />
      <Handle type="source"  position={Position.Bottom} id="bottom"       className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !bottom-[-7px] !left-[38%]" />
      <Handle type="target"  position={Position.Bottom} id="bottom-target" className="!w-3 !h-3 !bg-blue-500 dark:!bg-red-500 !border-2 !border-background !bottom-[-7px] !left-[62%]" />

      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-t-xl flex-shrink-0"
        style={{ background: activeColor }}
      >
        <div className="flex items-center gap-2">
          <NotebookPen className="w-3.5 h-3.5 text-white/90" strokeWidth={2.2} />
          <span className="text-[11px] text-white font-semibold truncate max-w-[100px]">
            {isEditing ? "Edit Note" : nodeData.label}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {/* Styling popover */}
          <Popover open={showStyling} onOpenChange={setShowStyling}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20"
                title="Note style"
              >
                <Palette className="w-3 h-3" strokeWidth={2.2} />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-52 p-3"
              side="bottom"
              align="end"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              {/* Color swatches */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
                Color
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {NOTE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleColorChange(c.value)}
                    className={cn(
                      "w-5 h-5 rounded-full border-2 transition-all",
                      activeColor === c.value
                        ? "border-white scale-125 shadow-md"
                        : "border-transparent hover:scale-110"
                    )}
                    style={{ background: c.value }}
                    title={c.value}
                  />
                ))}
              </div>

              {/* Font size */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
                Text Size
              </p>
              <div className="flex gap-1">
                {(["sm", "md", "lg"] as NoteFontSize[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSizeChange(s)}
                    className={cn(
                      "flex-1 py-1 rounded text-[11px] font-medium transition-colors",
                      activeFontSize === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/70"
                    )}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Edit */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20"
            onClick={() => setIsEditing(!isEditing)}
            title="Edit"
          >
            <SquarePen className="w-3 h-3" strokeWidth={2.2} />
          </Button>

          {/* Pin */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white/70 hover:text-white hover:bg-white/20"
            onClick={handlePin}
            title="Pin"
          >
            <MapPinned
              className={cn("w-3 h-3", nodeData.metadata.isPinned && "text-revelation-gold")}
              strokeWidth={2.2}
            />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 text-white/70 hover:text-red-200 hover:bg-white/20"
            onClick={handleDelete}
            title="Delete"
          >
            <X className="w-3 h-3" strokeWidth={2.2} />
          </Button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 overflow-hidden p-3">
        {isEditing ? (
          <div className="space-y-2 h-full flex flex-col">
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Note title..."
              className="h-8 text-xs bg-background/50 flex-shrink-0"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Write your note..."
              className={cn("flex-1 bg-background/50 resize-none", FONT_SIZE_CLASS[activeFontSize])}
              autoFocus
            />
            <Button size="sm" onClick={handleSaveContent} className="h-7 text-xs flex-shrink-0 w-full">
              <CheckCheck className="w-3 h-3 mr-1.5" strokeWidth={2.2} />
              Save
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              "text-card-foreground whitespace-pre-wrap h-full overflow-auto",
              FONT_SIZE_CLASS[activeFontSize]
            )}
          >
            {nodeData.content || (
              <span className="text-muted-foreground/60 italic text-xs">
                Click ✏ to add content…
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: date */}
      {nodeData.metadata.date && (
        <div
          className="px-3 py-1.5 text-[9px] text-muted-foreground font-mono flex-shrink-0"
          style={{ borderTop: `1px solid ${cfg.border}` }}
        >
          {new Date(nodeData.metadata.date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

export default memo(NoteNode);
