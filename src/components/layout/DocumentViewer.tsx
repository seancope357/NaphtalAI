"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CircleChevronLeft,
  CircleChevronRight,
  Copy,
  Download,
  ExternalLink,
  FileScan,
  FileSearch2,
  MapPinned,
  ScanSearch,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useViewerStore } from "@/stores/viewerStore";
import type { FileItem } from "@/types";
import { buildPdfBlobUrl, buildPdfViewerUrl } from "@/lib/fileContent";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  onPinToCanvas: (file: FileItem, thumbnail: string | undefined, position: { x: number; y: number }) => void;
  onAnalyze: (file: FileItem, content: string) => void;
}

type PdfFitMode = "width" | "page";

function getTextMimeType(fileType: FileItem["type"]): string {
  if (fileType === "json") return "application/json";
  if (fileType === "csv") return "text/csv";
  return "text/plain";
}

export default function DocumentViewer({ onPinToCanvas, onAnalyze }: DocumentViewerProps) {
  const { isOpen, currentFile, fileContent, closeFile } = useViewerStore();
  const [scale, setScale] = useState(1.0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [pdfFitMode, setPdfFitMode] = useState<PdfFitMode>("width");
  const [copied, setCopied] = useState(false);

  const currentFileId = currentFile?.id;
  useEffect(() => {
    if (!currentFileId) return;

    const timer = setTimeout(() => {
      setScale(1.0);
      setPageNumber(1);
      setPageInput("1");
      setPdfFitMode("width");
      setCopied(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [currentFileId]);

  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

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

  const downloadableSource = useMemo(() => {
    if (!currentFile || !fileContent) {
      return { url: null as string | null, revoke: false };
    }

    if (currentFile.type === "pdf") {
      if (typeof fileContent === "string") {
        if (fileContent.startsWith("blob:") || fileContent.startsWith("data:")) {
          return { url: fileContent, revoke: false };
        }
        return { url: null, revoke: false };
      }
      const pdfBlob = new Blob([fileContent], { type: "application/pdf" });
      return { url: URL.createObjectURL(pdfBlob), revoke: true };
    }

    if ((currentFile.type === "jpg" || currentFile.type === "png") && typeof fileContent === "string") {
      return { url: fileContent, revoke: false };
    }

    if (typeof fileContent === "string") {
      const textBlob = new Blob([fileContent], { type: getTextMimeType(currentFile.type) });
      return { url: URL.createObjectURL(textBlob), revoke: true };
    }

    return { url: null, revoke: false };
  }, [currentFile, fileContent]);

  useEffect(() => {
    return () => {
      if (downloadableSource.revoke && downloadableSource.url?.startsWith("blob:")) {
        URL.revokeObjectURL(downloadableSource.url);
      }
    };
  }, [downloadableSource]);

  const handlePin = useCallback(() => {
    if (!currentFile) return;

    const position = {
      x: 200 + Math.random() * 200,
      y: 200 + Math.random() * 200,
    };

    const thumbnail = typeof fileContent === "string" && fileContent.startsWith("data:image")
      ? fileContent
      : undefined;

    onPinToCanvas(currentFile, thumbnail, position);
    closeFile();
  }, [currentFile, fileContent, onPinToCanvas, closeFile]);

  const handleAnalyze = useCallback(() => {
    if (!currentFile || !fileContent) return;
    onAnalyze(currentFile, typeof fileContent === "string" ? fileContent : "");
  }, [currentFile, fileContent, onAnalyze]);

  const handleOpenExternal = useCallback(() => {
    if (!downloadableSource.url) return;
    window.open(downloadableSource.url, "_blank", "noopener,noreferrer");
  }, [downloadableSource.url]);

  const handleDownload = useCallback(() => {
    if (!downloadableSource.url || !currentFile) return;
    const anchor = document.createElement("a");
    anchor.href = downloadableSource.url;
    anchor.download = currentFile.name;
    anchor.click();
  }, [downloadableSource.url, currentFile]);

  const textContent = useMemo(() => {
    if (typeof fileContent !== "string") return "";
    return fileContent;
  }, [fileContent]);

  const handleCopyText = useCallback(async () => {
    if (!textContent) return;

    try {
      await navigator.clipboard.writeText(textContent);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }, [textContent]);

  const applyPageInput = useCallback(() => {
    const parsed = Number.parseInt(pageInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1) {
      setPageInput(String(pageNumber));
      return;
    }
    setPageNumber(parsed);
  }, [pageInput, pageNumber]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

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
      } else if (e.key.toLowerCase() === "f" && currentFile?.type === "pdf") {
        setPdfFitMode((mode) => (mode === "width" ? "page" : "width"));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, pageNumber, closeFile, currentFile?.type]);

  if (!isOpen || !currentFile) return null;

  const isPdf = currentFile.type === "pdf";
  const isImage = currentFile.type === "jpg" || currentFile.type === "png";
  const isText = currentFile.type === "txt" || currentFile.type === "json" || currentFile.type === "csv";

  const textPreview = isText
    ? `${textContent.slice(0, 120000)}${textContent.length > 120000 ? "\n\n... (truncated for rendering)" : ""}`
    : "";

  const pdfViewerUrl = isPdf && pdfSource
    ? buildPdfViewerUrl(pdfSource, pageNumber, scale * 100, pdfFitMode === "width" ? "FitH" : "Fit")
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-5">
      <div
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
        onClick={closeFile}
      />

      <div className="relative z-10 flex h-[calc(100vh-1.5rem)] w-full max-w-[1760px] flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl md:h-[calc(100vh-2.5rem)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileScan className="h-5 w-5 shrink-0 text-primary" strokeWidth={2.2} />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-card-foreground">
                {currentFile.name}
              </h2>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-1 py-0 text-[10px] uppercase">
                  {currentFile.type}
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {(currentFile.size / 1024).toFixed(1)} KB
                </span>
                {isPdf && (
                  <Badge variant="outline" className="px-1 py-0 text-[10px] uppercase">
                    {pdfFitMode === "width" ? "fit width" : "fit page"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-background/70 px-1 py-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.max(s - 0.2, 0.3))}
                disabled={scale <= 0.3}
              >
                <ZoomOut className="h-4 w-4" strokeWidth={2.2} />
              </Button>
              <span className="w-12 text-center text-xs text-muted-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setScale((s) => Math.min(s + 0.2, 3))}
                disabled={scale >= 3}
              >
                <ZoomIn className="h-4 w-4" strokeWidth={2.2} />
              </Button>
            </div>

            {isPdf && (
              <div className="flex items-center gap-1 rounded-md border border-border bg-background/70 px-1 py-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber <= 1}
                >
                  <CircleChevronLeft className="h-4 w-4" strokeWidth={2.2} />
                </Button>
                <Input
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={applyPageInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyPageInput();
                    }
                  }}
                  className="h-7 w-14 px-2 text-center text-xs"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setPageNumber((p) => p + 1)}
                >
                  <CircleChevronRight className="h-4 w-4" strokeWidth={2.2} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("h-8 px-2 text-[10px]", pdfFitMode === "page" && "text-primary")}
                  onClick={() => setPdfFitMode((mode) => (mode === "width" ? "page" : "width"))}
                >
                  {pdfFitMode === "width" ? "Fit Page" : "Fit Width"}
                </Button>
              </div>
            )}

            <Button
              variant="default"
              size="sm"
              className="bg-lodge-blue hover:bg-lodge-blue/90"
              onClick={handleAnalyze}
            >
              <ScanSearch className="mr-1 h-4 w-4" strokeWidth={2.2} />
              Analyze
            </Button>

            <Button
              variant="default"
              size="sm"
              className="bg-revelation-gold text-background hover:bg-revelation-gold/90"
              onClick={handlePin}
            >
              <MapPinned className="mr-1 h-4 w-4" strokeWidth={2.2} />
              Pin to Canvas
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              title="Open in new tab"
              onClick={handleOpenExternal}
              disabled={!downloadableSource.url}
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2.2} />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              title="Download"
              onClick={handleDownload}
              disabled={!downloadableSource.url}
            >
              <Download className="h-4 w-4" strokeWidth={2.2} />
            </Button>

            {isText && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Copy text"
                onClick={handleCopyText}
                disabled={!textContent}
              >
                {copied ? <Check className="h-4 w-4" strokeWidth={2.2} /> : <Copy className="h-4 w-4" strokeWidth={2.2} />}
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeFile}
            >
              <X className="h-4 w-4" strokeWidth={2.2} />
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 overflow-hidden bg-muted/10">
          <div className="min-w-0 flex-1 overflow-auto">
            {isPdf && (
              <div className="h-full w-full p-3 md:p-4">
                {pdfViewerUrl ? (
                  <iframe
                    src={pdfViewerUrl}
                    title={currentFile.name}
                    className="h-full w-full rounded-lg border border-border bg-white shadow-lg"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                    <FileSearch2 className="mb-4 h-12 w-12 text-muted-foreground/50" strokeWidth={2.2} />
                    <p className="mb-2 text-sm text-muted-foreground">Could not render this PDF preview</p>
                    <p className="mb-4 text-xs text-muted-foreground/70">You can still pin this document to the canvas.</p>
                    <Button variant="outline" size="sm" onClick={handlePin}>
                      <MapPinned className="mr-2 h-4 w-4" strokeWidth={2.2} />
                      Pin to Canvas
                    </Button>
                  </div>
                )}
              </div>
            )}

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
                  className="max-w-full rounded border border-border/60 shadow-lg"
                />
              </div>
            )}

            {isText && fileContent && (
              <div className="flex h-full w-full items-start justify-center p-4">
                <pre
                  className="w-full max-w-[1200px] overflow-auto rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm text-card-foreground"
                  style={{ maxHeight: "calc(100vh - 230px)" }}
                >
                  {textPreview || "(empty file)"}
                </pre>
              </div>
            )}
          </div>

          <aside className="hidden w-72 shrink-0 flex-col border-l border-border bg-card/80 p-4 lg:flex">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Document Panel</h3>
            <div className="mt-3 space-y-2 text-xs">
              <div className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2">
                <div className="text-[10px] uppercase text-muted-foreground">Type</div>
                <div className="mt-1 font-medium text-foreground">{currentFile.type.toUpperCase()}</div>
              </div>
              <div className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2">
                <div className="text-[10px] uppercase text-muted-foreground">Size</div>
                <div className="mt-1 font-medium text-foreground">{(currentFile.size / 1024).toFixed(1)} KB</div>
              </div>
              <div className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2">
                <div className="text-[10px] uppercase text-muted-foreground">Quick Tips</div>
                <p className="mt-1 leading-relaxed text-muted-foreground">
                  Double-click files from Archives to open here, then pin validated sources directly to the canvas.
                </p>
              </div>
              <div className="rounded-md border border-border/80 bg-background/70 px-2.5 py-2">
                <div className="text-[10px] uppercase text-muted-foreground">Shortcuts</div>
                <div className="mt-1 space-y-1 text-muted-foreground">
                  <p>`ESC` close</p>
                  <p>`+/-` zoom</p>
                  {isPdf && <p>Left/Right page</p>}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="border-t border-border bg-muted/20 px-4 py-2">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[10px] text-muted-foreground">
            <span>ESC to close</span>
            <span>+/- to zoom</span>
            {isPdf && <span>f toggle fit</span>}
            {isPdf && <span>arrows change page</span>}
            {isText && <span>copy button copies full text</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
