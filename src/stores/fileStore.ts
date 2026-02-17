import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import type { FileItem, FileType } from "@/types";

interface FileState {
  files: FileItem[];
  isUploading: boolean;
  uploadProgress: number;
  
  // Actions
  addFile: (file: FileItem) => void;
  removeFile: (id: string) => void;
  updateFile: (id: string, data: Partial<FileItem>) => void;
  getFileById: (id: string) => FileItem | undefined;
  setUploadProgress: (progress: number) => void;
  setUploading: (isUploading: boolean) => void;
}

export const useFileStore = create<FileState>((set, get) => ({
  files: [],
  isUploading: false,
  uploadProgress: 0,
  
  addFile: (file) =>
    set((state) => ({
      files: [...state.files, file],
    })),
  
  removeFile: (id) =>
    set((state) => ({
      files: state.files.filter((file) => file.id !== id),
    })),
  
  updateFile: (id, data) =>
    set((state) => ({
      files: state.files.map((file) =>
        file.id === id ? { ...file, ...data } : file
      ),
    })),
  
  getFileById: (id) => get().files.find((file) => file.id === id),
  
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  
  setUploading: (isUploading) => set({ isUploading }),
}));

// Helper to determine file type from extension
export function getFileType(fileName: string): FileType {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  
  const typeMap: Record<string, FileType> = {
    pdf: "pdf",
    txt: "txt",
    json: "json",
    jpg: "jpg",
    jpeg: "jpg",
    png: "png",
    csv: "csv",
  };
  
  return typeMap[extension] || "txt";
}

// Helper to create a file item from a File object
export function createFileItem(file: File): FileItem {
  return {
    id: uuidv4(),
    name: file.name,
    type: getFileType(file.name),
    size: file.size,
    uploadedAt: new Date(),
  };
}

// Get file icon based on type
export function getFileIcon(type: FileType): string {
  const iconMap: Record<FileType, string> = {
    pdf: "📄",
    txt: "📝",
    json: "📋",
    jpg: "🖼️",
    png: "🖼️",
    csv: "📊",
  };
  return iconMap[type];
}
