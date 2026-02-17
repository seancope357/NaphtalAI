"use client";

import { useCallback, useState, useRef } from "react";
import { useFileStore, createFileItem } from "@/stores/fileStore";
import { saveFile, readFileContent, createThumbnail } from "@/lib/indexedDb";
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
    <div className="h-full flex flex-col bg-neumo-bg border-r border-border/50 shadow-neumo-flat">
      {/* Header */}
      <div className="px-6 pt-6 pb-5 border-b border-border/50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2.5">
            <Archive className="w-5 h-5 text-revelation-gold" />
            <h2 className="font-display font-semibold text-sidebar-foreground">
              The Archives
            </h2>
          </div>
          <Link
            href="/landing"
            className="p-2.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Back to Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mb-5">
          Research materials & entities
        </p>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-11 bg-neumo-bg shadow-neumo-flat">
            <TabsTrigger value="files" className="text-xs bg-neumo-bg shadow-neumo-convex hover:shadow-neumo-concave">
              <FolderOpen className="w-3 h-3 mr-1.5" />
              Files
            </TabsTrigger>
            <TabsTrigger value="entities" className="text-xs bg-neumo-bg shadow-neumo-convex hover:shadow-neumo-concave">
              <Hash className="w-3 h-3 mr-1.5" />
              Entities
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs bg-neumo-bg shadow-neumo-convex hover:shadow-neumo-concave">
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
              <div className="px-5 py-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-sm bg-neumo-bg shadow-neumo-concave"
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div
                className={cn(
                  "m-5 p-6 border-2 border-dashed rounded-lg transition-colors",
                  "flex flex-col items-center justify-center gap-2",
                  isDragging
                    ? "border-revelation-gold bg-revelation-gold/10"
                    : "border-border/50 hover:border-primary/60 bg-neumo-bg"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload
                  className={cn(
                    "w-5 h-5",
                    isDragging ? "text-revelation-gold" : "text-muted-foreground"
                  )}
                />
                <p className="text-xs text-muted-foreground text-center">
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
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-4" />
                    <p className="text-sm text-muted-foreground">
                      {files.length === 0 ? "No files uploaded" : "No matching files"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-2">
                      Double-click files to view
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 pb-5 pt-1">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        className={cn(
                          "group flex items-start gap-4 p-4 rounded-lg",
                          "bg-neumo-bg shadow-neumo-flat",
                          "cursor-grab active:cursor-grabbing",
                          "hover:shadow-neumo-concave transition-all",
                          "cursor-pointer"
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Thumbnail or Icon */}
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          <p className="text-xs font-medium text-card-foreground truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 uppercase">
                              {file.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="neumo"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Stats Footer */}
              <div className="px-6 py-4 border-t border-border/50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{files.length} files</span>
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
