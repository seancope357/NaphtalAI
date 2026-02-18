"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Pin, X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText, Sparkles, FileWarning } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={closeFile}
      />
      
      {/* Viewer Container */}
      <div className="relative z-10 flex flex-col max-w-[90vw] max-h-[90vh] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
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
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
                disabled={scale <= 0.3}
              >
                <ZoomOut className="w-4 h-4" />
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
                <ZoomIn className="w-4 h-4" />
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
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground min-w-14 text-center">Pg {pageNumber}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
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
              <Sparkles className="w-4 h-4 mr-1" />
              Analyze
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="bg-revelation-gold text-background hover:bg-revelation-gold/90"
              onClick={handlePin}
            >
              <Pin className="w-4 h-4 mr-1" />
              Pin to Canvas
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-muted/10">
          {/* PDF Placeholder - will use iframe for PDFs */}
          {isPdf && (
            <div className="w-full h-full overflow-auto flex items-start justify-center p-4">
              {pdfSource ? (
                <iframe
                  src={buildPdfViewerUrl(pdfSource, pageNumber, scale * 100)}
                  title={currentFile.name}
                  className="border border-border rounded-lg shadow-lg bg-white transition-all"
                  style={{
                    width: `${Math.max(70, Math.round(scale * 100))}%`,
                    minWidth: "560px",
                    height: `${Math.max(680, Math.round(scale * 980))}px`,
                  }}
                />
              ) : (
                <div className="text-center p-8">
                  <FileWarning className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Could not render this PDF preview
                  </p>
                  <p className="text-xs text-muted-foreground/70 mb-4">
                    You can still pin this document to the canvas.
                  </p>
                  <Button variant="outline" size="sm" onClick={handlePin}>
                    <Pin className="w-4 h-4 mr-2" />
                    Pin to Canvas
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Image Preview */}
          {isImage && fileContent && (
            <img
              src={fileContent as string}
              alt={currentFile.name}
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: "center",
                maxHeight: "70vh",
                objectFit: "contain"
              }}
              className="shadow-lg rounded max-w-full"
            />
          )}
          
          {/* Text Preview */}
          {isText && fileContent && (
            <pre 
              className="font-mono text-sm text-card-foreground bg-muted/30 p-4 rounded-lg overflow-auto border border-border"
              style={{ 
                maxWidth: "60vw",
                maxHeight: "60vh"
              }}
            >
              {typeof fileContent === "string" 
                ? fileContent.substring(0, 5000) + (fileContent.length > 5000 ? "\n\n... (truncated)" : "")
                : "Binary content"}
            </pre>
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
