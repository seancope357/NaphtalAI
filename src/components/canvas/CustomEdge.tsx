"use client";

import { memo, useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/stores/canvasStore";
import type { EdgeData } from "@/types";

const getDroopyPath = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  droopiness = 0,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  droopiness?: number;
}) => {
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const sag = distance * droopiness;

  const cp1x = sourceX + dx * 0.25;
  const cp2x = sourceX + dx * 0.75;
  const cp1y = sourceY + sag;
  const cp2y = targetY + sag;

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2 + sag * 0.7;

  return {
    path: `M ${sourceX},${sourceY} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${targetX},${targetY}`,
    labelX,
    labelY,
  };
};


function CustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const droopiness = useCanvasStore((state) => state.droopiness);
  const edgeData = data as EdgeData;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(edgeData.label || "");
  const [edgePath, labelX, labelY] = droopiness > 0
    ? (() => {
        const gravityPath = getDroopyPath({ sourceX, sourceY, targetX, targetY, droopiness });
        return [gravityPath.path, gravityPath.labelX, gravityPath.labelY] as const;
      })()
    : getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
      });

  const edgeColor = edgeData.style === "golden-thread" ? "#f59e0b" : "#ef4444";

  const handleLabelSubmit = () => {
    const event = new CustomEvent("updateEdgeLabel", {
      detail: { edgeId: id, label },
    });
    window.dispatchEvent(event);
    setIsEditing(false);
  };

  const onEdgeClick = (evt: React.MouseEvent) => {
    evt.stopPropagation();
    if (edgeData.label !== undefined) {
      setIsEditing(true);
    }
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: edgeColor,
          strokeWidth: selected ? 3 : 2,
        }}
      />
      
      {/* Glow effect for animated edges */}
      {edgeData.isAnimated && (
        <BaseEdge
          path={edgePath}
          style={{
            stroke: edgeColor,
            strokeWidth: 4,
            opacity: 0.3,
            filter: `drop-shadow(0 0 6px ${edgeColor})`,
          }}
        />
      )}
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className={cn(
            "nodrag nopan",
            edgeData.isAnimated && "animate-pulse"
          )}
        >
          {isEditing ? (
            <div className="flex items-center gap-1 bg-card border border-border rounded-md p-1 shadow-lg">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Relationship..."
                className="h-6 w-24 text-xs bg-transparent border-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLabelSubmit();
                  if (e.key === "Escape") setIsEditing(false);
                }}
                onBlur={handleLabelSubmit}
              />
            </div>
          ) : (
            edgeData.label && (
              <button
                onClick={onEdgeClick}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-medium border shadow-sm",
                  "transition-all duration-200",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-card-foreground border-border hover:border-primary"
                )}
              >
                {edgeData.label}
              </button>
            )
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default memo(CustomEdge);
