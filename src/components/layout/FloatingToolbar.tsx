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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConnectionStyle } from "@/types";
import { useCanvasStore } from "@/stores/canvasStore";
import { SHORTCUT_CHEATSHEET } from "@/hooks/useKeyboardShortcuts";
import { Slider } from "@/components/ui/slider";

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
  } = useCanvasStore();

  const hasSelection = selectedNodes.length > 0;
  const hasMultiSelection = selectedNodes.length > 1;
  const hasDistributeSelection = selectedNodes.length > 2;

  return (
    <TooltipProvider>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-0.5 bg-card/95 backdrop-blur-md border border-border/80 rounded-xl p-1 shadow-xl">
          {/* Undo/Redo */}
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
            <TooltipContent side="top">
              <p className="text-xs">Undo (Ctrl+Z)</p>
            </TooltipContent>
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
            <TooltipContent side="top">
              <p className="text-xs">Redo (Ctrl+Shift+Z)</p>
            </TooltipContent>
          </Tooltip>

          {/* Droopiness control */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.35355 2.64645C3.15829 2.45118 2.84171 2.45118 2.64645 2.64645C2.45118 2.84171 2.45118 3.15829 2.64645 3.35355L7.5 8.20711L12.3536 3.35355C12.5488 3.15829 12.5488 2.84171 12.3536 2.64645C12.1583 2.45118 11.8417 2.45118 11.6464 2.64645L7.5 6.79289L3.35355 2.64645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Droopiness</p>
                <Slider
                  defaultValue={[droopiness]}
                  onValueChange={(value) => setDroopiness(value[0])}
                  max={1}
                  step={0.05}
                />
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Add Note */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onAddNote}
              >
                <NotebookPen className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Add Note</p>
            </TooltipContent>
          </Tooltip>

          {/* Duplicate */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={duplicateSelected}
                disabled={!hasSelection}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Duplicate (Ctrl+D)</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Alignment Tools */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!hasMultiSelection}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" side="top">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground px-1">Align</p>
                <div className="grid grid-cols-6 gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('left')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignLeft className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Left</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('center')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignCenter className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Center</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('right')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignRight className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Right</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('top')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignStartVertical className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Top</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('middle')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignCenterVertical className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Middle</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => alignSelected('bottom')}
                        disabled={!hasMultiSelection}
                      >
                        <AlignEndVertical className="w-3.5 h-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Align Bottom</TooltipContent>
                  </Tooltip>
                </div>
                
                <div className="border-t border-border my-1" />
                
                <p className="text-xs font-medium text-muted-foreground px-1">Distribute</p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => distributeSelected('horizontal')}
                    disabled={!hasDistributeSelection}
                  >
                    Horizontal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    onClick={() => distributeSelected('vertical')}
                    disabled={!hasDistributeSelection}
                  >
                    Vertical
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Zoom Controls */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomOut}
              >
                <ZoomOut className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onZoomIn}
              >
                <ZoomIn className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onFitView}
              >
                <SquareArrowOutUpRight className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Fit View</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Grid Toggle */}
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
            <TooltipContent side="top">
              <p className="text-xs">Toggle Grid</p>
            </TooltipContent>
          </Tooltip>

          {/* Connection Style */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8 transition-colors",
                  connectionStyle === "red-string" && "text-red-400 bg-red-500/10",
                  connectionStyle === "golden-thread" && "text-primary bg-primary/10"
                )}
                onClick={() =>
                  onConnectionStyleChange(
                    connectionStyle === "red-string" ? "golden-thread" : "red-string"
                  )
                }
              >
                <Waypoints className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">
                {connectionStyle === "red-string" ? "Red String" : "Golden Thread"}
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Export */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onExportCanvas}
              >
                <HardDriveDownload className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Export Canvas</p>
            </TooltipContent>
          </Tooltip>

          {/* Delete */}
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
            <TooltipContent side="top">
              <p className="text-xs">Delete (Del)</p>
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-5 bg-primary/20 mx-0.5" />

          {/* Keyboard Shortcuts */}
          <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
              >
                <Keyboard className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" side="top">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Keyboard Shortcuts</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowShortcuts(false)}
                >
                  <X className="w-3 h-3" strokeWidth={2.2} />
                </Button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {SHORTCUT_CHEATSHEET.map((category) => (
                  <div key={category.category}>
                    <p className="text-xs font-medium text-muted-foreground mb-1.5">
                      {category.category}
                    </p>
                    <div className="space-y-1">
                      {category.shortcuts.map((shortcut, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-card-foreground">
                            {shortcut.description}
                          </span>
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
