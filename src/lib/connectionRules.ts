import type { CanvasEdge, CanvasNode, NodeType } from "@/types";

const ALLOWED_BY_SOURCE: Record<NodeType, NodeType[]> = {
  file: ["file", "entity", "note"],
  entity: ["entity", "file", "note"],
  note: ["file", "entity", "note"],
};

const SEMANTIC_BY_PAIR: Partial<Record<`${NodeType}:${NodeType}`, { semanticType: string; label: string; logicRule: string }>> = {
  "file:entity": {
    semanticType: "mentions",
    label: "mentions",
    logicRule: "Document evidence references an extracted entity.",
  },
  "entity:file": {
    semanticType: "derived_from",
    label: "derived from",
    logicRule: "Entity interpretation traces back to source evidence.",
  },
  "file:file": {
    semanticType: "references",
    label: "references",
    logicRule: "Two source documents share linked evidence or context.",
  },
  "note:file": {
    semanticType: "annotates",
    label: "annotates",
    logicRule: "Analyst note annotates a source document.",
  },
  "file:note": {
    semanticType: "annotated_by",
    label: "annotated by",
    logicRule: "Document is annotated by a structured note.",
  },
  "entity:entity": {
    semanticType: "related_to",
    label: "related",
    logicRule: "Two entities have a direct research relationship.",
  },
  "entity:note": {
    semanticType: "evidence_for",
    label: "evidence for",
    logicRule: "Entity supports an analyst note or hypothesis.",
  },
  "note:entity": {
    semanticType: "hypothesis_about",
    label: "hypothesis",
    logicRule: "Analyst note captures a hypothesis about an entity.",
  },
  "note:note": {
    semanticType: "elaborates",
    label: "elaborates",
    logicRule: "A note elaborates or extends another note.",
  },
};

const FALLBACK_SEMANTIC = {
  semanticType: "related_to",
  label: "related",
  logicRule: "General analytical relationship.",
};

interface ValidationResult {
  valid: boolean;
  reason?: string;
  semanticType: string;
  label: string;
  logicRule: string;
}

function getNodeDataType(node: CanvasNode | undefined): NodeType | null {
  if (!node) return null;
  if (node.data?.type === "file" || node.data?.type === "note" || node.data?.type === "entity") {
    return node.data.type;
  }
  return null;
}

export function validateConnection(
  sourceNode: CanvasNode | undefined,
  targetNode: CanvasNode | undefined,
  existingEdges: CanvasEdge[]
): ValidationResult {
  const sourceType = getNodeDataType(sourceNode);
  const targetType = getNodeDataType(targetNode);

  if (!sourceNode || !targetNode || !sourceType || !targetType) {
    return {
      valid: false,
      reason: "Missing source or target node metadata.",
      ...FALLBACK_SEMANTIC,
    };
  }

  if (sourceNode.id === targetNode.id) {
    return {
      valid: false,
      reason: "Self-links are disabled to keep graph logic explicit.",
      ...FALLBACK_SEMANTIC,
    };
  }

  const allowedTargets = ALLOWED_BY_SOURCE[sourceType] || [];
  if (!allowedTargets.includes(targetType)) {
    return {
      valid: false,
      reason: `Connections from ${sourceType} to ${targetType} are not allowed.`,
      ...FALLBACK_SEMANTIC,
    };
  }

  const duplicate = existingEdges.some(
    (edge) =>
      (edge.source === sourceNode.id && edge.target === targetNode.id) ||
      (edge.source === targetNode.id && edge.target === sourceNode.id)
  );

  if (duplicate) {
    return {
      valid: false,
      reason: "A connection between these nodes already exists.",
      ...FALLBACK_SEMANTIC,
    };
  }

  const semantic = SEMANTIC_BY_PAIR[`${sourceType}:${targetType}`] ?? FALLBACK_SEMANTIC;
  return {
    valid: true,
    ...semantic,
  };
}
