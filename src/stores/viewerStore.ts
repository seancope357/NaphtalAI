import { create } from "zustand";
import type { FileItem } from "@/types";

interface ViewerState {
  isOpen: boolean;
  currentFile: FileItem | null;
  fileContent: string | ArrayBuffer | null;
  
  // Actions
  openFile: (file: FileItem, content: string | ArrayBuffer) => void;
  closeFile: () => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  isOpen: false,
  currentFile: null,
  fileContent: null,
  
  openFile: (file, content) =>
    set({
      isOpen: true,
      currentFile: file,
      fileContent: content,
    }),
  
  closeFile: () =>
    set({
      isOpen: false,
      currentFile: null,
      fileContent: null,
    }),
}));
