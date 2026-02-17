"use client";

import { useEffect, useCallback } from "react";
import { useCanvasStore } from "@/stores/canvasStore";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts() {
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    deleteSelected,
    duplicateSelected,
    selectAll,
    clearSelection,
    setSnapToGrid,
    snapToGrid,
    setShowGrid,
    showGrid,
  } = useCanvasStore();

  const shortcuts: KeyboardShortcut[] = [
    // Undo/Redo
    {
      key: "z",
      ctrl: true,
      action: () => canUndo() && undo(),
      description: "Undo",
    },
    {
      key: "z",
      ctrl: true,
      shift: true,
      action: () => canRedo() && redo(),
      description: "Redo",
    },
    {
      key: "y",
      ctrl: true,
      action: () => canRedo() && redo(),
      description: "Redo",
    },
    
    // Selection
    {
      key: "a",
      ctrl: true,
      action: selectAll,
      description: "Select all",
    },
    {
      key: "Escape",
      action: clearSelection,
      description: "Clear selection",
    },
    
    // Delete
    {
      key: "Delete",
      action: deleteSelected,
      description: "Delete selected",
    },
    {
      key: "Backspace",
      action: deleteSelected,
      description: "Delete selected",
    },
    
    // Duplicate
    {
      key: "d",
      ctrl: true,
      action: duplicateSelected,
      description: "Duplicate selected",
    },
    
    // Grid
    {
      key: "g",
      ctrl: true,
      action: () => setSnapToGrid(!snapToGrid),
      description: "Toggle snap to grid",
    },
    {
      key: "g",
      ctrl: true,
      shift: true,
      action: () => setShowGrid(!showGrid),
      description: "Toggle grid visibility",
    },
  ];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch;
      });

      if (matchingShortcut) {
        e.preventDefault();
        e.stopPropagation();
        matchingShortcut.action();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts };
}

export const SHORTCUT_CHEATSHEET = [
  {
    category: "History",
    shortcuts: [
      { keys: ["Ctrl", "Z"], description: "Undo" },
      { keys: ["Ctrl", "Shift", "Z"], description: "Redo" },
      { keys: ["Ctrl", "Y"], description: "Redo" },
    ],
  },
  {
    category: "Selection",
    shortcuts: [
      { keys: ["Ctrl", "A"], description: "Select all" },
      { keys: ["Esc"], description: "Clear selection" },
      { keys: ["Ctrl", "D"], description: "Duplicate selected" },
    ],
  },
  {
    category: "Editing",
    shortcuts: [
      { keys: ["Delete"], description: "Delete selected" },
      { keys: ["Backspace"], description: "Delete selected" },
    ],
  },
  {
    category: "View",
    shortcuts: [
      { keys: ["Ctrl", "G"], description: "Toggle snap to grid" },
      { keys: ["Ctrl", "Shift", "G"], description: "Toggle grid" },
    ],
  },
  {
    category: "Canvas",
    shortcuts: [
      { keys: ["Scroll"], description: "Pan canvas" },
      { keys: ["Ctrl", "Scroll"], description: "Zoom in/out" },
      { keys: ["Drag"], description: "Move nodes" },
      { keys: ["Shift", "Click"], description: "Multi-select" },
    ],
  },
];
