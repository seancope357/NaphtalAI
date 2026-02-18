import type { NodeType } from "@/types";

export const WORKSPACE_LAYOUT = {
  panels: {
    left: { defaultSize: 19, minSize: 16, maxSize: 30 },
    center: { defaultSize: 58, minSize: 36 },
    right: { defaultSize: 23, minSize: 18, maxSize: 34 },
  },
  panelHandleWidth: "0.375rem",
  viewportPadding: 24,
} as const;

export const WORKSPACE_GRID = {
  defaultSize: 24,
  minZoom: 0.2,
  maxZoom: 2.5,
  fitViewPadding: 0.12,
} as const;

export const NODE_DIMENSIONS = {
  file: {
    defaultWidth: 360,
    defaultHeight: 440,
    minWidth: 280,
    maxWidth: 720,
    minHeight: 260,
    maxHeight: 1080,
  },
  note: {
    defaultWidth: 280,
    defaultHeight: 280,
    minWidth: 220,
    maxWidth: 420,
    minHeight: 180,
    maxHeight: 760,
  },
  entity: {
    defaultWidth: 220,
    defaultHeight: 190,
    minWidth: 190,
    maxWidth: 320,
    minHeight: 150,
    maxHeight: 360,
  },
} as const;

export function getNodeDimension(type: NodeType) {
  return NODE_DIMENSIONS[type];
}
