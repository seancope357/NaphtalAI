"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  CircleChevronLeft,
  CircleChevronRight,
  FileScan,
  FileSearch2,
  MapPinned,
  ScanSearch,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useViewerStore } from "@/stores/viewerStore";
import type { FileItem } from "@/types";
import { buildPdfBlobUrl, buildPdfViewerUrl } from "@/lib/fileContent";

interface DocumentViewerProps {
  onPinToCanvas: (file: FileItem, thumbnail: string | undefined, position: { x: number; y: number }) => void;
  onAnalyze: (file: FileItem, content: string) => void;
}

export default function DocumentViewer({ onPinToCanvas, onAnalyze }: DocumentViewerProps) {
  const { isOpen, currentFile, fileContent, closeFile } = useViewerStore();
  const [scale, setScale] = useState(1.0);
  const [pageNumber, setPageNumber] = useState(1);

  // Reset state when file changes - using a ref to track previous file
  const currentFileId = currentFile?.id;
  useEffect(() => {
    // Only reset if we have a file
    if (currentFileId) {
      // Use setTimeout to defer state updates
      const timer = setTimeout(() => {
        setScale(1.0);
        setPageNumber(1);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentFileId]);

  const pdfSource = useMemo(() => {
    if (!isOpen || currentFile?.type !== "pdf") return null;
    return buildPdfBlobUrl(fileContent);
  }, [isOpen, currentFile?.type, fileContent]);

  useEffect(() => {
    return () => {
      if (pdfSource?.startsWith("blob:")) {
        URL.revokeObjectURL(pdfSource);
      }
    };
  }, [pdfSource]);

  // Handle pin to canvas
  const handlePin = useCallback(() => {
    if (!currentFile) return;
    
    // Calculate position (center of visible canvas)
    const position = {
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    };
    
    // Get thumbnail from content if it's an image
    const thumbnail = typeof fileContent === "string" && fileContent.startsWith("data:image") 
      ? fileContent 
      : undefined;
    
    onPinToCanvas(currentFile, thumbnail, position);
    closeFile();
  }, [currentFile, fileContent, onPinToCanvas, closeFile]);

  // Handle analyze
  const handleAnalyze = useCallback(() => {
    if (!currentFile || !fileContent) return;
    onAnalyze(currentFile, typeof fileContent === "string" ? fileContent : "");
  }, [currentFile, fileContent, onAnalyze]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeFile();
      } else if (e.key === "ArrowLeft" && pageNumber > 1) {
        setPageNumber((p) => p - 1);
      } else if (e.key === "ArrowRight") {
        setPageNumber((p) => p + 1);
      } else if (e.key === "+" || e.key === "=") {
        setScale((s) => Math.min(s + 0.2, 3));
      } else if (e.key === "-") {
        setScale((s) => Math.max(s - 0.2, 0.3));
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pageNumber, closeFile]);

  if (!isOpen || !currentFile) return null;

  const isPdf = currentFile.type === "pdf";
  const isImage = currentFile.type === "jpg" || currentFile.type === "png";
  const isText = currentFile.type === "txt" || currentFile.type === "json" || currentFile.type === "csv";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={closeFile}
      />
      
      {/* Viewer Container */}
      <div className="relative z-10 flex h-[calc(100vh-1.5rem)] w-full max-w-[1700px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:h-[calc(100vh-2.5rem)]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-3">
            <FileScan className="w-5 h-5 text-primary" strokeWidth={2.2} />
            <div>
              <h2 className="font-display font-semibold text-card-foreground text-sm">
                {currentFile.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="text-[10px] px-1 py-0 uppercase">
                  {currentFile.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
                disabled={scale <= 0.3}
              >
                <ZoomOut className="w-4 h-4" strokeWidth={2.2} />
              </Button>
              <span className="text-xs text-muted-foreground w-12 text-center">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4" strokeWidth={2.2} />
              </Button>
            </div>

            {isPdf && (
              <div className="flex items-center gap-0.5 mr-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  <CircleChevronLeft className="w-4 h-4" strokeWidth={2.2} />
                </Button>
                <span className="text-xs text-muted-foreground min-w-14 text-center">Pg {pageNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  <CircleChevronRight className="w-4 h-4" strokeWidth={2.2} />
                </Button>
              </div>
            )}
            
            {/* Action Buttons */}
            <Button
              variant="default"
              size="sm"
              className="bg-lodge-blue hover:bg-lodge-blue/90"
              onClick={handleAnalyze}
            >
              <ScanSearch className="w-4 h-4 mr-1" strokeWidth={2.2} />
              Analyze
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="bg-revelation-gold text-background hover:bg-revelation-gold/90"
              onClick={handlePin}
            >
              <MapPinned className="w-4 h-4 mr-1" strokeWidth={2.2} />
              Pin to Canvas
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeFile}
            >
              <X className="w-4 h-4" strokeWidth={2.2} />
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-muted/10">
          {/* PDF Preview */}
          {isPdf && (
            <div className="h-full w-full p-3 md:p-4">
              {pdfSource ? (
                <iframe
                  src={buildPdfViewerUrl(pdfSource, pageNumber, scale * 100)}
                  title={currentFile.name}
                  className="h-full w-full rounded-lg border border-border bg-white shadow-lg transition-all"
                />
              ) : (
                <div className="text-center p-8">
                  <FileSearch2 className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" strokeWidth={2.2} />
                  <p className="text-sm text-muted-foreground mb-2">
                    Could not render this PDF preview
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">
                    You can still pin this document to the canvas.
                  </p>
                  <Button variant="outline" size="sm" onClick={handlePin}>
                    <MapPinned className="w-4 h-4 mr-2" strokeWidth={2.2} />
                    Pin to Canvas
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Image Preview */}
          {isImage && fileContent && (
            <div className="flex h-full w-full items-center justify-center p-4">
              <img
                src={fileContent as string}
                alt={currentFile.name}
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "center",
                  maxHeight: "calc(100vh - 210px)",
                  objectFit: "contain",
                }}
                className="max-w-full rounded shadow-lg"
              />
            </div>
          )}
          
          {/* Text Preview */}
          {isText && fileContent && (
            <div className="flex h-full w-full items-start justify-center p-4">
              <pre
                className="w-full max-w-[1200px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-card-foreground"
                style={{
                  maxHeight: "calc(100vh - 230px)",
                }}
              >
                {typeof fileContent === "string"
                  ? fileContent.substring(0, 5000) + (fileContent.length > 5000 ? "\n\n... (truncated)" : "")
                  : "Binary content"}
              </pre>
            </div>
          )}
        </div>
        
        {/* Footer with keyboard shortcuts hint */}
        <div className="px-4 py-2 border-t border-border bg-muted/20">
          <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>ESC to close</span>
            <span>+/- to zoom</span>
            {isPdf && <span>←/→ change page</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
