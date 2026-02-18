"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useFileStore, createFileItem } from "@/stores/fileStore";
import { saveFile, readFileContent, createThumbnail, getFile } from "@/lib/indexedDb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownUp,
  ArrowUpRightFromSquare,
  CircleAlert,
  CircleCheckBig,
  FileChartColumn,
  FileJson,
  FileScan,
  FolderArchive,
  FolderOpenDot,
  Fingerprint,
  HardDriveUpload,
  House,
  ImagePlay,
  Loader2,
  ScanSearch,
  Trash,
  Waypoints,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { FileItem, FileType } from "@/types";
import { useViewerStore } from "@/stores/viewerStore";
import EntityPanel from "./EntityPanel";
import GraphSearch from "./GraphSearch";
import { useEntityStore, type Entity } from "@/stores/entityStore";

interface ArchivesSidebarProps {
  onDragStart: (file: FileItem) => void;
  onEntityClick: (entity: Entity) => void;
  onAddEntityToCanvas: (entity: Entity) => void;
}

type FileFilter = "all" | "pdf" | "image" | "text" | "data";
type FileSort = "recent" | "name" | "size";

interface UploadSummary {
  total: number;
  processed: number;
  accepted: number;
  rejected: number;
  duplicates: number;
  failed: number;
  currentFile?: string;
  done: boolean;
}

export default function ArchivesSidebar({
  onDragStart,
  onEntityClick,
  onAddEntityToCanvas,
}: ArchivesSidebarProps) {
  const {
    files,
    addFile,
    removeFile,
    isUploading,
    uploadProgress,
    setUploadProgress,
    setUploading,
  } = useFileStore();
  const { openFile } = useViewerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("files");
  const [fileFilter, setFileFilter] = useState<FileFilter>("all");
  const [fileSort, setFileSort] = useState<FileSort>("recent");
  const [uploadSummary, setUploadSummary] = useState<UploadSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      const incomingFiles = Array.from(fileList);
      if (!incomingFiles.length) return;

      const supportedExtensions = new Set(["pdf", "txt", "json", "jpg", "jpeg", "png", "csv"]);
      const knownFileKeys = new Set(files.map((file) => `${file.name}::${file.size}`));

      setUploading(true);
      setUploadProgress(0);
      setUploadSummary({
        total: incomingFiles.length,
        processed: 0,
        accepted: 0,
        rejected: 0,
        duplicates: 0,
        failed: 0,
        currentFile: undefined,
        done: false,
      });

      let accepted = 0;
      let rejected = 0;
      let duplicates = 0;
      let failed = 0;
      let processed = 0;

      try {
        for (const file of incomingFiles) {
          const extension = file.name.split(".").pop()?.toLowerCase() || "";
          const isSupported = supportedExtensions.has(extension);
          const fileKey = `${file.name}::${file.size}`;
          const duplicateExists = knownFileKeys.has(fileKey);

          if (!isSupported) {
            rejected += 1;
            processed += 1;
            setUploadProgress(Math.round((processed / incomingFiles.length) * 100));
            setUploadSummary({
              total: incomingFiles.length,
              processed,
              accepted,
              rejected,
              duplicates,
              failed,
              currentFile: file.name,
              done: false,
            });
            continue;
          }

          if (duplicateExists) {
            duplicates += 1;
            processed += 1;
            setUploadProgress(Math.round((processed / incomingFiles.length) * 100));
            setUploadSummary({
              total: incomingFiles.length,
              processed,
              accepted,
              rejected,
              duplicates,
              failed,
              currentFile: file.name,
              done: false,
            });
            continue;
          }

          setUploadSummary({
            total: incomingFiles.length,
            processed,
            accepted,
            rejected,
            duplicates,
            failed,
            currentFile: file.name,
            done: false,
          });

          const fileItem = createFileItem(file); // Basic metadata
          try {
            const content = await readFileContent(file);
            const thumbnail = await createThumbnail(file);

            const completeFileItem: FileItem = {
              ...fileItem,
              content,
              thumbnail,
            };

            // Save to IndexedDB
            await saveFile(completeFileItem);

            // Add to store
            addFile(completeFileItem);
            knownFileKeys.add(fileKey);
            accepted += 1;
          } catch (error) {
            console.error("Error processing file:", error);
            failed += 1;
          } finally {
            processed += 1;
            setUploadProgress(Math.round((processed / incomingFiles.length) * 100));
            setUploadSummary({
              total: incomingFiles.length,
              processed,
              accepted,
              rejected,
              duplicates,
              failed,
              currentFile: file.name,
              done: false,
            });
          }
        }
      } catch (error) {
        console.error("Error processing file:", error);
      } finally {
        setUploadSummary({
          total: incomingFiles.length,
          processed,
          accepted,
          rejected,
          duplicates,
          failed,
          currentFile: undefined,
          done: true,
        });
        setUploadProgress(100);
        setUploading(false);
      }
    },
    [addFile, files, setUploadProgress, setUploading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const fileList = e.dataTransfer.files;
      if (fileList.length > 0) {
        handleFileUpload(fileList);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    e.dataTransfer.setData("application/json", JSON.stringify(file));
    e.dataTransfer.effectAllowed = "move";
    onDragStart(file);
  };

  const handleOpenFile = useCallback(async (file: FileItem) => {
    const stored = await getFile(file.id);
    if (stored?.content) {
      openFile(file, stored.content);
      return;
    }
    if (file.content) {
      openFile(file, file.content);
    }
  }, [openFile]);



  const getFileIconComponent = (type: FileType) => {
    switch (type) {
      case "pdf":
        return <FileScan className="w-4 h-4 text-red-400" strokeWidth={2.2} />;
      case "jpg":
      case "png":
        return <ImagePlay className="w-4 h-4 text-green-400" strokeWidth={2.2} />;
      case "json":
        return <FileJson className="w-4 h-4 text-yellow-400" strokeWidth={2.2} />;
      case "csv":
        return <FileChartColumn className="w-4 h-4 text-blue-400" strokeWidth={2.2} />;
      default:
        return <FileScan className="w-4 h-4 text-gray-400" strokeWidth={2.2} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = useMemo(() => {
    let results = files.filter((file) => {
      const queryMatch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!queryMatch) return false;

      if (fileFilter === "all") return true;
      if (fileFilter === "pdf") return file.type === "pdf";
      if (fileFilter === "image") return file.type === "jpg" || file.type === "png";
      if (fileFilter === "text") return file.type === "txt";
      if (fileFilter === "data") return file.type === "json" || file.type === "csv";

      return true;
    });

    results = [...results].sort((a, b) => {
      if (fileSort === "name") {
        return a.name.localeCompare(b.name);
      }
      if (fileSort === "size") {
        return b.size - a.size;
      }
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    return results;
  }, [files, searchQuery, fileFilter, fileSort]);

  return (
    <div className="h-full flex flex-col bg-sidebar/90 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-sidebar-border/80">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
              <FolderArchive className="w-3.5 h-3.5 text-primary" strokeWidth={2.2} />
            </div>
            <h2 className="font-display font-semibold text-sm text-sidebar-foreground tracking-tight">
              The Archives
            </h2>
          </div>
          <Link
            href="/landing"
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200"
            title="Back to Home"
          >
            <House className="w-3.5 h-3.5" strokeWidth={2.2} />
          </Link>
        </div>
        <p className="text-[11px] text-muted-foreground/70 mt-1.5 mb-3 pl-8">
          Research materials & entities
        </p>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8 bg-muted/40 p-0.5">
            <TabsTrigger
              value="files"
              className="text-[11px] font-semibold text-sidebar-foreground/85 hover:text-sidebar-foreground dark:text-sidebar-foreground/90 dark:hover:text-white data-[state=active]:bg-sidebar data-[state=active]:text-sidebar-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <FolderOpenDot className="w-3 h-3 mr-1.5" strokeWidth={2.2} />
              Files
            </TabsTrigger>
            <TabsTrigger
              value="entities"
              className="text-[11px] font-semibold text-sidebar-foreground/85 hover:text-sidebar-foreground dark:text-sidebar-foreground/90 dark:hover:text-white data-[state=active]:bg-sidebar data-[state=active]:text-sidebar-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Fingerprint className="w-3 h-3 mr-1.5" strokeWidth={2.2} />
              Entities
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="text-[11px] font-semibold text-sidebar-foreground/85 hover:text-sidebar-foreground dark:text-sidebar-foreground/90 dark:hover:text-white data-[state=active]:bg-sidebar data-[state=active]:text-sidebar-foreground dark:data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              <Waypoints className="w-3 h-3 mr-1.5" strokeWidth={2.2} />
              Graph
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Files Tab */}
          <TabsContent value="files" className="h-full m-0 data-[state=inactive]:hidden">
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="px-4 py-2.5 border-b border-sidebar-border/80 space-y-2.5">
                <div className="relative">
                  <ScanSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" strokeWidth={2.2} />
                  <Input
                    placeholder="Search files…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-[11px] bg-sidebar-accent/30 border-sidebar-border focus-visible:ring-primary/40 focus-visible:border-primary/50"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant={fileSort === "recent" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setFileSort("recent")}
                    >
                      <ArrowDownUp className="h-3 w-3 mr-1" strokeWidth={2.2} />
                      Recent
                    </Button>
                    <Button
                      type="button"
                      variant={fileSort === "name" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setFileSort("name")}
                    >
                      Name
                    </Button>
                    <Button
                      type="button"
                      variant={fileSort === "size" ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setFileSort("size")}
                    >
                      Size
                    </Button>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {filteredFiles.length} visible
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: "all", label: "All" },
                    { value: "pdf", label: "PDF" },
                    { value: "image", label: "Images" },
                    { value: "text", label: "Text" },
                    { value: "data", label: "Data" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      type="button"
                      variant={fileFilter === option.value ? "secondary" : "ghost"}
                      size="sm"
                      className="h-6 px-2 text-[10px]"
                      onClick={() => setFileFilter(option.value as FileFilter)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Upload Zone */}
              <div
                className={cn(
                  "mx-4 my-2.5 p-4 border border-dashed rounded-lg transition-all duration-200 cursor-pointer",
                  "flex flex-col items-center justify-center gap-2.5",
                  isDragging
                    ? "border-primary bg-primary/8 scale-[1.01]"
                    : "border-primary/30 hover:border-primary/55 hover:bg-primary/5",
                  isUploading && "opacity-90"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center transition-colors",
                  isDragging ? "bg-primary/20" : "bg-muted/60"
                )}>
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" strokeWidth={2.2} />
                  ) : (
                    <HardDriveUpload
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isDragging ? "text-primary" : "text-muted-foreground/60"
                      )}
                      strokeWidth={2.2}
                    />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                  {isUploading ? "Processing files..." : "Drop files anywhere in this zone or"}
                  {" "}
                  <label className="text-primary cursor-pointer hover:underline">
                    choose files
                    <Input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.txt,.json,.jpg,.jpeg,.png,.csv"
                      className="hidden"
                      onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                    />
                  </label>
                </p>
                <p className="text-[10px] text-muted-foreground/55 text-center">
                  Supports: PDF, TXT, JSON, JPG, PNG, CSV
                </p>
              </div>

              {(isUploading || uploadSummary) && (
                <div className="mx-4 mb-2 rounded-lg border border-sidebar-border/80 bg-card/70 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sidebar-foreground">
                      {isUploading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" strokeWidth={2.2} />
                      ) : uploadSummary?.failed || uploadSummary?.rejected ? (
                        <CircleAlert className="w-3.5 h-3.5 text-amber-500" strokeWidth={2.2} />
                      ) : (
                        <CircleCheckBig className="w-3.5 h-3.5 text-green-500" strokeWidth={2.2} />
                      )}
                      {isUploading ? "Uploading files" : "Upload complete"}
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {uploadSummary?.processed || 0}/{uploadSummary?.total || 0}
                    </span>
                  </div>

                  <Progress value={isUploading ? uploadProgress : 100} className="mt-2 h-1.5" />

                  <div className="mt-2 flex flex-wrap items-center gap-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      +{uploadSummary?.accepted || 0} added
                    </Badge>
                    {(uploadSummary?.duplicates || 0) > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {uploadSummary?.duplicates || 0} duplicate
                      </Badge>
                    )}
                    {(uploadSummary?.rejected || 0) > 0 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {uploadSummary?.rejected || 0} unsupported
                      </Badge>
                    )}
                    {(uploadSummary?.failed || 0) > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        {uploadSummary?.failed || 0} failed
                      </Badge>
                    )}
                  </div>

                  {uploadSummary?.currentFile && (
                    <p className="mt-2 truncate text-[10px] text-muted-foreground">
                      Current: {uploadSummary.currentFile}
                    </p>
                  )}
                  {!isUploading && uploadSummary?.done && (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[10px]"
                        onClick={() => setUploadSummary(null)}
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* File List */}
              <ScrollArea className="flex-1 px-4">
                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center mb-4">
                      <FolderOpenDot className="w-5 h-5 text-muted-foreground/50" strokeWidth={2.2} />
                    </div>
                    <p className="text-sm text-muted-foreground/70">
                      {files.length === 0 ? "No files uploaded" : "No matching files"}
                    </p>
                    <p className="text-xs text-muted-foreground/40 mt-1.5">
                      Drop files above to begin
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pb-4 pt-1">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        onDoubleClick={() => handleOpenFile(file)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleOpenFile(file);
                        }}
                        role="button"
                        tabIndex={0}
                        title="Double-click to open full viewer"
                        className={cn(
                          "group flex items-center gap-3 p-3 rounded-lg",
                          "bg-transparent border border-transparent",
                          "cursor-grab active:cursor-grabbing",
                          "hover:bg-card/60 hover:border-primary/20 transition-all duration-200",
                          "border-l-2 border-l-transparent hover:border-l-primary/50"
                        )}
                      >
                        {/* Thumbnail or Icon */}
                        <div className="w-9 h-9 rounded-md bg-muted/60 flex items-center justify-center flex-shrink-0 overflow-hidden border border-border/40">
                          {file.thumbnail ? (
                            <img
                              src={file.thumbnail}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getFileIconComponent(file.type)
                          )}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-sidebar-foreground truncate leading-tight">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-medium">{file.type}</span>
                            <span className="text-[9px] text-muted-foreground/40">·</span>
                            <span className="text-[9px] text-muted-foreground/50">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            title="Open viewer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenFile(file);
                            }}
                          >
                            <ArrowUpRightFromSquare className="w-3 h-3" strokeWidth={2.2} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                            title="Remove from list"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                          >
                            <Trash className="w-3 h-3" strokeWidth={2.2} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Stats Footer */}
              <div className="px-5 py-3 border-t border-sidebar-border">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/50">
                  <span>{files.length} file{files.length !== 1 ? "s" : ""}</span>
                  <span>
                    {files.reduce((acc, f) => acc + f.size, 0) > 1024 * 1024
                      ? `${(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                      : `${(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(0)} KB`}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Entities Tab */}
          <TabsContent value="entities" className="h-full m-0 data-[state=inactive]:hidden">
            <EntityPanel
              onEntityClick={onEntityClick}
              onAddToCanvas={onAddEntityToCanvas}
            />
          </TabsContent>

          {/* Graph Search Tab */}
          <TabsContent value="search" className="h-full m-0 data-[state=inactive]:hidden">
            <GraphSearch onResultClick={onEntityClick} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
