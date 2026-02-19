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
  Database,
  Upload,
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

          const fileItem = createFileItem(file);
          try {
            const content = await readFileContent(file);
            const thumbnail = await createThumbnail(file);

            const completeFileItem: FileItem = {
              ...fileItem,
              content,
              thumbnail,
            };

            await saveFile(completeFileItem);
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
        return <FileScan className="w-4 h-4" style={{ color: "#f87171" }} strokeWidth={2.2} />;
      case "jpg":
      case "png":
        return <ImagePlay className="w-4 h-4" style={{ color: "#4ade80" }} strokeWidth={2.2} />;
      case "json":
        return <FileJson className="w-4 h-4" style={{ color: "#fbbf24" }} strokeWidth={2.2} />;
      case "csv":
        return <FileChartColumn className="w-4 h-4" style={{ color: "#60a5fa" }} strokeWidth={2.2} />;
      default:
        return <FileScan className="w-4 h-4" style={{ color: "#9ca3af" }} strokeWidth={2.2} />;
    }
  };

  const getFileTypeColor = (type: FileType): string => {
    switch (type) {
      case "pdf": return "#f87171";
      case "jpg":
      case "png": return "#4ade80";
      case "json": return "#fbbf24";
      case "csv": return "#60a5fa";
      default: return "#9ca3af";
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
      if (fileSort === "name") return a.name.localeCompare(b.name);
      if (fileSort === "size") return b.size - a.size;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

    return results;
  }, [files, searchQuery, fileFilter, fileSort]);

  return (
    <div className="h-full flex flex-col bg-[#0d0d0f] overflow-hidden">
      {/* Premium Header */}
      <div className="relative px-4 pt-4 pb-3 border-b border-white/[0.06] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#e8622a]/[0.06] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8622a]/35 to-transparent" />

        <div className="relative flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(232,98,42,0.25) 0%, rgba(232,98,42,0.08) 100%)",
                boxShadow: "0 0 12px rgba(232,98,42,0.15), inset 0 1px 0 rgba(255,255,255,0.07)",
                border: "1px solid rgba(232,98,42,0.28)",
              }}
            >
              <Database className="w-4 h-4 text-[#e8622a]" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-mono font-bold text-[13px] text-white tracking-tight leading-none">
                The Archives
              </h2>
              <p className="text-[9px] text-[#e8622a]/70 tracking-[0.12em] uppercase font-medium mt-0.5">
                Research Materials
              </p>
            </div>
          </div>
          <Link
            href="/landing"
            className="h-7 w-7 flex items-center justify-center rounded-md text-white/25 hover:text-[#e8622a] hover:bg-[#e8622a]/10 transition-all"
            title="Back to Home"
          >
            <House className="w-3.5 h-3.5" strokeWidth={2.2} />
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="relative mt-3">
          <div className="flex rounded-lg p-0.5 bg-white/[0.04] border border-white/[0.06]">
            {[
              { value: "files", icon: FolderOpenDot, label: "Files" },
              { value: "entities", icon: Fingerprint, label: "Entities" },
              { value: "search", icon: Waypoints, label: "Graph" },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-[10px] font-medium transition-all",
                  activeTab === value
                    ? "text-[#e8622a]"
                    : "text-white/30 hover:text-white/50"
                )}
                style={activeTab === value ? {
                  background: "linear-gradient(135deg, rgba(232,98,42,0.18) 0%, rgba(232,98,42,0.08) 100%)",
                  border: "1px solid rgba(232,98,42,0.22)",
                  boxShadow: "0 0 8px rgba(232,98,42,0.1)",
                } : {}}
                onClick={() => setActiveTab(value)}
              >
                <Icon className="w-3 h-3" strokeWidth={2.2} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "files" && (
          <div className="h-full flex flex-col">
            {/* Search + Filters */}
            <div className="px-4 py-2.5 border-b border-white/[0.05] space-y-2">
              <div className="relative">
                <ScanSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" strokeWidth={2.2} />
                <input
                  placeholder="Search files…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 pl-9 pr-3 text-[11px] rounded-md outline-none transition-all text-white/70 placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(232,98,42,0.4)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  }}
                />
              </div>

              {/* Sort buttons */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {[
                    { value: "recent", label: "Recent", icon: ArrowDownUp },
                    { value: "name", label: "Name", icon: null },
                    { value: "size", label: "Size", icon: null },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      className={cn(
                        "h-6 px-2 rounded text-[10px] font-medium flex items-center gap-1 transition-all border",
                        fileSort === value
                          ? "bg-[#e8622a]/15 border-[#e8622a]/30 text-[#e8622a]"
                          : "bg-transparent border-transparent text-white/30 hover:text-white/50 hover:border-white/[0.08]"
                      )}
                      onClick={() => setFileSort(value as FileSort)}
                    >
                      {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={2.2} />}
                      {label}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-white/20 px-1.5 py-0.5 rounded border border-white/[0.07]">
                  {filteredFiles.length}
                </span>
              </div>

              {/* Type filter chips */}
              <div className="flex flex-wrap gap-1">
                {[
                  { value: "all", label: "All" },
                  { value: "pdf", label: "PDF" },
                  { value: "image", label: "Images" },
                  { value: "text", label: "Text" },
                  { value: "data", label: "Data" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "h-5 px-2 rounded-full text-[9px] font-medium tracking-wide transition-all border",
                      fileFilter === option.value
                        ? "bg-[#e8622a]/15 border-[#e8622a]/35 text-[#e8622a]"
                        : "bg-transparent border-white/[0.07] text-white/25 hover:text-white/45 hover:border-white/[0.14]"
                    )}
                    onClick={() => setFileFilter(option.value as FileFilter)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Upload Zone */}
            <div
              className={cn(
                "mx-3 my-2.5 p-4 rounded-xl transition-all duration-200 cursor-pointer",
                "flex flex-col items-center justify-center gap-2",
              )}
              style={{
                border: isDragging
                  ? "1px dashed rgba(232,98,42,0.6)"
                  : "1px dashed rgba(255,255,255,0.1)",
                background: isDragging
                  ? "rgba(232,98,42,0.08)"
                  : "rgba(255,255,255,0.02)",
                transform: isDragging ? "scale(1.01)" : "scale(1)",
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              )}
                style={{
                  background: isDragging ? "rgba(232,98,42,0.2)" : "rgba(255,255,255,0.05)",
                  border: isDragging ? "1px solid rgba(232,98,42,0.4)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#e8622a]" strokeWidth={2.2} />
                ) : (
                  <Upload
                    className="w-4 h-4 transition-colors"
                    strokeWidth={2.2}
                    style={{ color: isDragging ? "#e8622a" : "rgba(255,255,255,0.3)" }}
                  />
                )}
              </div>
              <p className="text-[11px] text-center leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
                {isUploading ? "Processing files..." : "Drop files or"}{" "}
                <label className="cursor-pointer hover:underline" style={{ color: "#e8622a" }}>
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
              <p className="text-[9px] tracking-wider uppercase" style={{ color: "rgba(255,255,255,0.18)" }}>
                PDF · TXT · JSON · JPG · PNG · CSV
              </p>
            </div>

            {/* Upload Progress */}
            {(isUploading || uploadSummary) && (
              <div className="mx-3 mb-2 rounded-xl border border-white/[0.07] p-3"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {isUploading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-[#e8622a]" strokeWidth={2.2} />
                    ) : uploadSummary?.failed || uploadSummary?.rejected ? (
                      <CircleAlert className="w-3 h-3 text-amber-400" strokeWidth={2.2} />
                    ) : (
                      <CircleCheckBig className="w-3 h-3 text-emerald-400" strokeWidth={2.2} />
                    )}
                    {isUploading ? "Uploading files" : "Upload complete"}
                  </div>
                  <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {uploadSummary?.processed || 0}/{uploadSummary?.total || 0}
                  </span>
                </div>

                <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${isUploading ? uploadProgress : 100}%`,
                      background: "linear-gradient(90deg, #e8622a 0%, #f97316 100%)",
                      boxShadow: "0 0 8px rgba(232,98,42,0.4)",
                    }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    +{uploadSummary?.accepted || 0} added
                  </span>
                  {(uploadSummary?.duplicates || 0) > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.09] text-white/35">
                      {uploadSummary?.duplicates} duplicate
                    </span>
                  )}
                  {(uploadSummary?.rejected || 0) > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                      {uploadSummary?.rejected} unsupported
                    </span>
                  )}
                  {(uploadSummary?.failed || 0) > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400">
                      {uploadSummary?.failed} failed
                    </span>
                  )}
                </div>

                {uploadSummary?.currentFile && (
                  <p className="mt-1.5 truncate text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                    {uploadSummary.currentFile}
                  </p>
                )}
                {!isUploading && uploadSummary?.done && (
                  <div className="mt-2 flex justify-end">
                    <button
                      className="text-[10px] px-2 py-0.5 rounded text-white/30 hover:text-white/50 transition-colors"
                      onClick={() => setUploadSummary(null)}
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* File List */}
            <ScrollArea className="flex-1 px-3">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <FolderOpenDot className="w-5 h-5" style={{ color: "rgba(255,255,255,0.2)" }} strokeWidth={2.2} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {files.length === 0 ? "No files uploaded" : "No matching files"}
                  </p>
                  <p className="text-[11px] mt-1.5" style={{ color: "rgba(255,255,255,0.15)" }}>
                    Drop files above to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-1 pb-4 pt-1">
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
                      className="group flex items-center gap-3 p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all duration-150"
                      style={{
                        border: "1px solid transparent",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = `${getFileTypeColor(file.type)}20`;
                        e.currentTarget.style.borderLeftColor = `${getFileTypeColor(file.type)}60`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }}
                    >
                      {/* Thumbnail or Icon */}
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{
                          background: `${getFileTypeColor(file.type)}12`,
                          border: `1px solid ${getFileTypeColor(file.type)}25`,
                        }}
                      >
                        {file.thumbnail ? (
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          getFileIconComponent(file.type)
                        )}
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-medium truncate leading-tight" style={{ color: "rgba(255,255,255,0.75)" }}>
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase tracking-wider font-semibold"
                            style={{ color: getFileTypeColor(file.type) + "90" }}
                          >
                            {file.type}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                          <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="h-6 w-6 rounded-md flex items-center justify-center transition-all"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(232,98,42,0.12)";
                            e.currentTarget.style.color = "#e8622a";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                          }}
                          title="Open viewer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFile(file);
                          }}
                        >
                          <ArrowUpRightFromSquare className="w-3 h-3" strokeWidth={2.2} />
                        </button>
                        <button
                          className="h-6 w-6 rounded-md flex items-center justify-center transition-all"
                          style={{ color: "rgba(255,255,255,0.3)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                            e.currentTarget.style.color = "#f87171";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "rgba(255,255,255,0.3)";
                          }}
                          title="Remove from list"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(file.id);
                          }}
                        >
                          <Trash className="w-3 h-3" strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Stats Footer */}
            <div className="px-4 py-2.5 border-t border-white/[0.05]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {files.length} file{files.length !== 1 ? "s" : ""} stored
                </span>
                <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>
                  {files.reduce((acc, f) => acc + f.size, 0) > 1024 * 1024
                    ? `${(files.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024)).toFixed(1)} MB`
                    : `${(files.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(0)} KB`}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "entities" && (
          <EntityPanel
            onEntityClick={onEntityClick}
            onAddToCanvas={onAddEntityToCanvas}
          />
        )}

        {activeTab === "search" && (
          <GraphSearch onResultClick={onEntityClick} />
        )}
      </div>
    </div>
  );
}
