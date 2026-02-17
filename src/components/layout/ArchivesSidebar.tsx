"use client";

import { useCallback, useState } from "react";
import { useFileStore, createFileItem } from "@/stores/fileStore";
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
} from "lucide-react";
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

  const handleFileUpload = useCallback(
    async (fileList: FileList) => {
      setUploading(true);

      try {
        for (const file of Array.from(fileList)) {
          const fileItem = createFileItem(file);

          // Upload file to server
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("File upload failed");
          }

          const result = await response.json();

          // Add to store
          addFile({
            ...fileItem,
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
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
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 mb-1">
          <Archive className="w-5 h-5 text-revelation-gold" />
          <h2 className="font-display font-semibold text-sidebar-foreground">
            The Archives
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Research materials & entities
        </p>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-8">
            <TabsTrigger value="files" className="text-xs">
              <FolderOpen className="w-3 h-3 mr-1" />
              Files
            </TabsTrigger>
            <TabsTrigger value="entities" className="text-xs">
              <Hash className="w-3 h-3 mr-1" />
              Entities
            </TabsTrigger>
            <TabsTrigger value="search" className="text-xs">
              <GitBranch className="w-3 h-3 mr-1" />
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
              <div className="p-3 border-b border-sidebar-border">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm bg-sidebar-accent/50"
                  />
                </div>
              </div>

              {/* Upload Zone */}
              <div
                className={cn(
                  "m-3 p-3 border-2 border-dashed rounded-lg transition-colors",
                  "flex flex-col items-center justify-center gap-1.5",
                  isDragging
                    ? "border-revelation-gold bg-revelation-gold/10"
                    : "border-border hover:border-primary/50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload
                  className={cn(
                    "w-5 h-5",
                    isDragging ? "text-revelation-gold" : "text-muted-foreground"
                  )}
                />
                <p className="text-[11px] text-muted-foreground text-center">
                  Drop files or{" "}
                  <label className="text-primary cursor-pointer hover:underline">
                    browse
                    <Input
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
              <ScrollArea className="flex-1 px-3">
                {filteredFiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FolderOpen className="w-10 h-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {files.length === 0 ? "No files uploaded" : "No matching files"}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Double-click files to view
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 pb-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file)}
                        className={cn(
                          "group flex items-start gap-2 p-2 rounded-lg",
                          "bg-card/50 border border-border/50",
                          "cursor-grab active:cursor-grabbing",
                          "hover:bg-card hover:border-primary/30 transition-all",
                          "cursor-pointer"
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Thumbnail or Icon */}
                        <div className="w-9 h-9 rounded bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="secondary" className="text-[10px] px-1 py-0 uppercase">
                              {file.type}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Stats Footer */}
              <div className="p-3 border-t border-sidebar-border">
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
