"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  NotebookPen,
  ZoomIn,
  ZoomOut,
  SquareArrowOutUpRight,
  Waypoints,
  Trash,
  HardDriveDownload,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Copy,
  LayoutGrid,
  Keyboard,
  X,
  MousePointer2,
  Pencil,
  Eraser,
  Slash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStyle } from "@/types";
import { useCanvasStore } from "@/stores/canvasStore";
import { SHORTCUT_CHEATSHEET } from "@/hooks/useKeyboardShortcuts";
import { Slider } from "@/components/ui/slider";

// ─── Draw palette ─────────────────────────────────────────────────────────────

const DRAW_COLORS = [
  { value: "#ffffff", label: "White"  },
  { value: "#e8622a", label: "Orange" },
  { value: "#ef4444", label: "Red"    },
  { value: "#eab308", label: "Yellow" },
  { value: "#22c55e", label: "Green"  },
  { value: "#3b82f6", label: "Blue"   },
  { value: "#a855f7", label: "Purple" },
  { value: "#ec4899", label: "Pink"   },
] as const;

const DRAW_SIZES = [
  { value: 1,  label: "XS" },
  { value: 3,  label: "S"  },
  { value: 6,  label: "M"  },
  { value: 12, label: "L"  },
] as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface FloatingToolbarProps {
  onAddNote: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onClearCanvas: () => void;
  onExportCanvas: () => void;
  connectionStyle: ConnectionStyle;
  onConnectionStyleChange: (style: ConnectionStyle) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function FloatingToolbar({
  onAddNote,
  onZoomIn,
  onZoomOut,
  onFitView,
  onClearCanvas,
  onExportCanvas,
  connectionStyle,
  onConnectionStyleChange,
}: FloatingToolbarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false);

  const {
    canUndo,
    canRedo,
    undo,
    redo,
    selectedNodes,
    duplicateSelected,
    deleteSelected,
    alignSelected,
    distributeSelected,
    droopiness,
    setDroopiness,
    snapToGrid,
    setSnapToGrid,
    showGrid,
    setShowGrid,
    // Drawing state
    drawMode,
    setDrawMode,
    drawColor,
    setDrawColor,
    drawSize,
    setDrawSize,
    strokes,
    clearStrokes,
  } = useCanvasStore();

  const hasSelection          = selectedNodes.length > 0;
  const hasMultiSelection     = selectedNodes.length > 1;
  const hasDistributeSelection = selectedNodes.length > 2;
  const isDrawMode = drawMode === "draw";
  const hasStrokes = strokes.length > 0;

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-0.5 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-1 shadow-xl">

          {/* ── Undo / Redo ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", canUndo() && "text-primary hover:text-primary")}
                onClick={undo}
                disabled={!canUndo()}
              >
                <Undo2 className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Undo (Ctrl+Z)</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", canRedo() && "text-primary hover:text-primary")}
                onClick={redo}
                disabled={!canRedo()}
              >
                <Redo2 className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Redo (Ctrl+Shift+Z)</p></TooltipContent>
          </Tooltip>

          {/* ── String gravity slider ── */}
          <div className="hidden md:flex items-center gap-2 px-2">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Gravity</p>
            <Slider
              value={[droopiness]}
              onValueChange={(v) => setDroopiness(v[0])}
              max={1}
              step={0.01}
              className="w-24"
            />
            <span className="w-8 text-right text-[10px] text-muted-foreground">{droopiness.toFixed(2)}</span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden">
                <Waypoints className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">String gravity</p>
                <Slider value={[droopiness]} onValueChange={(v) => setDroopiness(v[0])} max={1} step={0.01} />
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Add Note ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAddNote}>
                <NotebookPen className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Add Note</p></TooltipContent>
          </Tooltip>

          {/* ── Duplicate ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={duplicateSelected} disabled={!hasSelection}>
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Duplicate (Ctrl+D)</p></TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Draw Tools ── */}
          {/* Pointer / select */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", drawMode === "select" && "text-primary bg-primary/10")}
                onClick={() => setDrawMode("select")}
              >
                <MousePointer2 className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Select (pointer)</p></TooltipContent>
          </Tooltip>

          {/* Pen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", drawMode === "draw" && "text-primary bg-primary/10")}
                onClick={() => setDrawMode(drawMode === "draw" ? "select" : "draw")}
              >
                <Pencil className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Pen / draw</p></TooltipContent>
          </Tooltip>

          {/* Eraser */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", drawMode === "erase" && "text-orange-400 bg-orange-500/10")}
                onClick={() => setDrawMode(drawMode === "erase" ? "select" : "erase")}
                disabled={!hasStrokes}
              >
                <Eraser className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Erase strokes</p></TooltipContent>
          </Tooltip>

          {/* Clear all drawings */}
          {hasStrokes && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={clearStrokes}
                >
                  <Slash className="w-4 h-4" strokeWidth={2.2} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top"><p className="text-xs">Clear all drawings</p></TooltipContent>
            </Tooltip>
          )}

          {/* Pen options (color + size) — shown when pen is active */}
          {isDrawMode && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 relative"
                  title="Pen options"
                >
                  {/* Mini swatch shows current color */}
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-border/70 block"
                    style={{ background: drawColor }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3" side="top">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
                  Pen color
                </p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DRAW_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setDrawColor(c.value)}
                      title={c.label}
                      className={cn(
                        "w-5 h-5 rounded-full border-2 transition-all",
                        drawColor === c.value
                          ? "border-primary scale-125 shadow-md"
                          : "border-transparent hover:scale-110 border-border/40"
                      )}
                      style={{ background: c.value }}
                    />
                  ))}
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-2">
                  Pen size
                </p>
                <div className="flex gap-1">
                  {DRAW_SIZES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setDrawSize(s.value)}
                      className={cn(
                        "flex-1 py-1 rounded text-[11px] font-medium transition-colors",
                        drawSize === s.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/70"
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Alignment Tools ── */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={!hasMultiSelection}>
                <AlignCenter className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Align</p>
                <div className="grid grid-cols-6 gap-1">
                  {(
                    [
                      { dir: "left",   icon: AlignLeft,          label: "Align Left"   },
                      { dir: "center", icon: AlignCenter,         label: "Align Center" },
                      { dir: "right",  icon: AlignRight,          label: "Align Right"  },
                      { dir: "top",    icon: AlignStartVertical,  label: "Align Top"    },
                      { dir: "middle", icon: AlignCenterVertical, label: "Align Middle" },
                      { dir: "bottom", icon: AlignEndVertical,    label: "Align Bottom" },
                    ] as const
                  ).map(({ dir, icon: Icon, label }) => (
                    <Tooltip key={dir}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => alignSelected(dir)}
                          disabled={!hasMultiSelection}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
                <div className="border-t border-border my-1" />
                <p className="text-xs font-medium text-muted-foreground px-1">Distribute</p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => distributeSelected("horizontal")}
                    disabled={!hasDistributeSelection}
                  >
                    Horizontal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => distributeSelected("vertical")}
                    disabled={!hasDistributeSelection}
                  >
                    Vertical
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Zoom ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut}>
                <ZoomOut className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Zoom Out</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn}>
                <ZoomIn className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Zoom In</p></TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onFitView}>
                <SquareArrowOutUpRight className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Fit View</p></TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Grid Toggle ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8 transition-colors", showGrid && "text-primary bg-primary/10")}
                onClick={() => setShowGrid(!showGrid)}
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Toggle Grid</p></TooltipContent>
          </Tooltip>

          {/* ── Connection Style ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 transition-colors",
                  connectionStyle === "red-string"    && "text-red-400 bg-red-500/10",
                  connectionStyle === "golden-thread" && "text-primary bg-primary/10"
                )}
                onClick={() =>
                  onConnectionStyleChange(connectionStyle === "red-string" ? "golden-thread" : "red-string")
                }
              >
                <Waypoints className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{connectionStyle === "red-string" ? "Red String" : "Golden Thread"}</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Export ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExportCanvas}>
                <HardDriveDownload className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Export Canvas</p></TooltipContent>
          </Tooltip>

          {/* ── Delete selected ── */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                onClick={deleteSelected}
                disabled={!hasSelection}
              >
                <Trash className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top"><p className="text-xs">Delete (Del)</p></TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* ── Keyboard shortcuts ── */}
          <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Keyboard className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowShortcuts(false)}>
                  <X className="w-3 h-3" strokeWidth={2.2} />
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {SHORTCUT_CHEATSHEET.map((category) => (
                  <div key={category.category}>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">{category.category}</p>
                    <div className="space-y-1">
                      {category.shortcuts.map((shortcut, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-card-foreground">{shortcut.description}</span>
                          <div className="flex items-center gap-0.5">
                            {shortcut.keys.map((key, keyIdx) => (
                              <span key={keyIdx}>
                                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border">
                                  {key}
                                </kbd>
                                {keyIdx < shortcut.keys.length - 1 && (
                                  <span className="mx-0.5 text-muted-foreground">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </TooltipProvider>
  );
}
