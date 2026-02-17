"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UseResizableOptions {
  initialWidth?: number;
  initialHeight?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

export function useResizable({
  initialWidth = 280,
  initialHeight,
  minWidth = 150,
  minHeight = 100,
  maxWidth = 600,
  maxHeight,
  onResize,
  onResizeEnd,
}: UseResizableOptions = {}) {
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight || 'auto' });
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: 'se' | 'e' | 's') => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.currentTarget.parentElement;
      if (!target) return;

      resizeRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startWidth: target.offsetWidth,
        startHeight: target.offsetHeight,
      };

      setIsResizing(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeRef.current) return;

        const deltaX = moveEvent.clientX - resizeRef.current.startX;
        const deltaY = moveEvent.clientY - resizeRef.current.startY;

        let newWidth = resizeRef.current.startWidth;
        let newHeight = resizeRef.current.startHeight;

        if (direction.includes('e')) {
          newWidth = Math.max(minWidth, Math.min(maxWidth, resizeRef.current.startWidth + deltaX));
        }
        if (direction.includes('s')) {
          newHeight = Math.max(minHeight, maxHeight ? Math.min(maxHeight, resizeRef.current.startHeight + deltaY) : resizeRef.current.startHeight + deltaY);
        }

        setSize({ width: newWidth, height: newHeight });
        onResize?.(newWidth, newHeight);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        resizeRef.current = null;
        onResizeEnd?.(size.width, typeof size.height === 'number' ? size.height : 0);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [minWidth, minHeight, maxWidth, maxHeight, onResize, onResizeEnd, size]
  );

  return {
    size,
    setSize,
    isResizing,
    handleMouseDown,
    resizeProps: {
      style: {
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        minHeight: typeof size.height === 'number' ? `${size.height}px` : undefined,
      },
    },
  };
}

// Resize handle component
interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent, direction: 'se' | 'e' | 's') => void;
  direction: 'se' | 'e' | 's';
  className?: string;
}

export function ResizeHandle({ onMouseDown, direction, className }: ResizeHandleProps) {
  return (
    <div
      className={cn(
        "absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity",
        "flex items-center justify-center",
        direction === 'se' && "bottom-0 right-0 w-4 h-4 cursor-se-resize",
        direction === 'e' && "right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 cursor-e-resize",
        direction === 's' && "bottom-0 left-1/2 -translate-x-1/2 w-8 h-1.5 cursor-s-resize",
        className
      )}
      onMouseDown={(e) => onMouseDown(e, direction)}
    >
      {direction === 'se' && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          className="text-muted-foreground"
        >
          <path
            d="M9 1L1 9M9 5L5 9M9 9L9 9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
      {(direction === 'e' || direction === 's') && (
        <div className={cn(
          "bg-border rounded-full",
          direction === 'e' && "w-0.5 h-full",
          direction === 's' && "w-full h-0.5"
        )} />
      )}
    </div>
  );
}
