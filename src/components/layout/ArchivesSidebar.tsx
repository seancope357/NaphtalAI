"use client";

import { useCallback, useState, useRef } from "react";
import { useFileStore, createFileItem } from "@/stores/fileStore";
import { saveFile, readFileContent, createThumbnail, getFile } from "@/lib/indexedDb";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Archive,
  Upload,
  FileText,
  ImageIcon,
  FileCode,
  FileSpreadsheet,
  Trash2,
  GripVertical,
  Search,
  FolderOpen,
  Hash,
  GitBranch,
  Home,
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

export default function ArchivesSidebar({
  onDragStart,
  onEntityClick,
  onAddEntityToCanvas,
}: ArchivesSidebarProps) {
  const { files, addFile, removeFile, isUploading, setUploading } = useFileStore();
  const { openFile } = useViewerStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("files");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      setUploading(true);

      try {
        for (const file of Array.from(fileList)) {
          const fileItem = createFileItem(file); // Basic metadata
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
        }
      } catch (error) {
        console.error("Error processing file:", error);
      } finally {
        setUploading(false);
      }
    },
    [addFile, setUploading]
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
        return <FileText className="w-4 h-4 text-red-400" />;
      case "jpg":
      case "png":
        return <ImageIcon className="w-4 h-4 text-green-400" />;
      case "json":
        return <FileCode className="w-4 h-4 text-yellow-400" />;
      case "csv":
        return <FileSpreadsheet className="w-4 h-4 text-blue-400" />;
      default:
        return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-sidebar/90 backdrop-blur-sm">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-sidebar-border/80">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center ring-1 ring-primary/30">
              <Archive className="w-3.5 h-3.5 text-primary" />
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
            <Home className="w-3.5 h-3.5" />
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
              className="text-[11px] data-[state=active]:bg-sidebar data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <FolderOpen className="w-3 h-3 mr-1.5" />
              Files
            </TabsTrigger>
            <TabsTrigger
              value="entities"
              className="text-[11px] data-[state=active]:bg-sidebar data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <Hash className="w-3 h-3 mr-1.5" />
              Entities
            </TabsTrigger>
            <TabsTrigger
              value="search"
              className="text-[11px] data-[state=active]:bg-sidebar data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              <GitBranch className="w-3 h-3 mr-1.5" />
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
              <div className="px-4 py-2.5 border-b border-sidebar-border/80">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/60" />
                  <Input
                    placeholder="Search files…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-[11px] bg-sidebar-accent/30 border-sidebar-border focus-visible:ring-primary/40 focus-visible:border-primary/50"
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div
                className={cn(
                  "mx-4 my-2.5 p-4 border border-dashed rounded-lg transition-all duration-200 cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  isDragging
                    ? "border-primary bg-primary/8 scale-[1.01]"
                    : "border-primary/20 hover:border-primary/50 hover:bg-primary/5"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={cn(
                  "w-7 h-7 rounded-md flex items-center justify-center transition-colors",
                  isDragging ? "bg-primary/20" : "bg-muted/60"
                )}>
                  <Upload
                    className={cn(
                      "w-4 h-4 transition-colors",
                      isDragging ? "text-primary" : "text-muted-foreground/60"
                    )}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground/70 text-center leading-relaxed">
                  Drop files or{" "}
                  <label className="text-primary cursor-pointer hover:underline">
                    browse
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
              </div>

              {/* File List */}
              <ScrollArea className="flex-1 px-4">
                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-10 h-10 rounded-lg bg-muted/60 flex items-center justify-center mb-4">
                      <FolderOpen className="w-5 h-5 text-muted-foreground/50" />
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

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
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
