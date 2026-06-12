"use client";

import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Grid3X3,
  List,
  Filter,
  SortAsc,
  SortDesc,
  Upload,
  Trash2,
  ChevronDown,
  Check,
  Calendar,
  FileText,
  HardDrive,
  Sparkles,
  Folder as FolderIcon,
  Image as ImageIcon,
  Film,
  Archive,
  X,
  Star,
  Download,
} from "lucide-react";
import { FileItem, ViewMode } from "@/types";
import { FileCard } from "@/components/files/FileCard";
import { FileListItem } from "@/components/files/FileListItem";
import { FileCardSkeleton, FileListSkeleton } from "@/components/files/FileSkeletons";
import { EmptyState } from "@/components/files/EmptyState";
import { SimpleBreadcrumb } from "@/components/ui/Breadcrumb";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn, formatFileSize } from "@/lib/utils";

interface MainContentProps {
  files: FileItem[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFileClick: (file: FileItem) => void;
  onFilePreview?: (file: FileItem) => void;
  onFileDelete: (fileId: string) => void;
  onFileRestore?: (fileId: string) => void;
  onFilePermanentDelete?: (fileId: string) => void;
  onFileStar: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onFileEdit?: (file: FileItem) => void;
  onUpload: (files: File[]) => void;
  onUploadClick?: () => void;
  onEmptyTrash?: () => void;
  onFileDetails?: (file: FileItem) => void;
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
  onBatchDelete?: (fileIds: string[]) => void;
  onBatchStar?: (fileIds: string[]) => void;
  onBatchDownload?: (fileIds: string[]) => void;
  currentFolder: string;
  isLoading: boolean;
  breadcrumbPath?: { id: string; name: string }[];
  onBreadcrumbNavigate?: (folderId: string) => void;
}

type SortField = "name" | "modified" | "size" | "type";
type FilterType = "all" | "folders" | "documents" | "images" | "media" | "archives";

const sortOptions: { value: SortField; label: string; icon: typeof FileText }[] = [
  { value: "name", label: "Name", icon: FileText },
  { value: "modified", label: "Date modified", icon: Calendar },
  { value: "size", label: "Size", icon: HardDrive },
  { value: "type", label: "Type", icon: Sparkles },
];

const filterOptions: { value: FilterType; label: string; icon: typeof FileText }[] = [
  { value: "all", label: "All files", icon: Grid3X3 },
  { value: "folders", label: "Folders", icon: FolderIcon },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "images", label: "Images", icon: ImageIcon },
  { value: "media", label: "Media", icon: Film },
  { value: "archives", label: "Archives", icon: Archive },
];

export function MainContent({
  files,
  viewMode,
  onViewModeChange,
  onFileClick,
  onFilePreview,
  onFileDelete,
  onFileRestore,
  onFilePermanentDelete,
  onFileStar,
  onFileRename,
  onFileEdit,
  onUpload,
  onUploadClick,
  onEmptyTrash,
  onFileDetails,
  selectedFiles,
  onSelectionChange,
  onBatchDelete,
  onBatchStar,
  onBatchDownload,
  currentFolder,
  isLoading,
  breadcrumbPath,
  onBreadcrumbNavigate,
}: MainContentProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [sortBy, setSortBy] = useState<SortField>("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  
  const [sortDropdownPos, setSortDropdownPos] = useState({ top: 0, right: 0 });
  const [filterDropdownPos, setFilterDropdownPos] = useState({ top: 0, right: 0 });

  // For portal mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate dropdown positions when menus open
  useEffect(() => {
    if (showSortMenu && sortButtonRef.current) {
      const rect = sortButtonRef.current.getBoundingClientRect();
      setSortDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showSortMenu]);

  useEffect(() => {
    if (showFilterMenu && filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [showFilterMenu]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      if (showSortMenu && 
          sortButtonRef.current && !sortButtonRef.current.contains(target) &&
          sortDropdownRef.current && !sortDropdownRef.current.contains(target)) {
        setShowSortMenu(false);
      }
      if (showFilterMenu && 
          filterButtonRef.current && !filterButtonRef.current.contains(target) &&
          filterDropdownRef.current && !filterDropdownRef.current.contains(target)) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSortMenu, showFilterMenu]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDraggingOver(false);
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
      }
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });

  // Filter files
  const filteredFiles = useMemo(() => {
    let result = files.filter((f) =>
      currentFolder === "Trash" ? f.trashed : !f.trashed
    );

    if (filterType !== "all") {
      result = result.filter((f) => {
        switch (filterType) {
          case "folders":
            return f.type === "folder";
          case "documents":
            return ["document", "pdf", "spreadsheet", "presentation"].includes(f.type);
          case "images":
            return f.type === "image";
          case "media":
            return ["video", "audio"].includes(f.type);
          case "archives":
            return f.type === "archive";
          default:
            return true;
        }
      });
    }

    return result;
  }, [files, currentFolder, filterType]);

  // Sort files
  const sortedFiles = useMemo(() => {
    return [...filteredFiles].sort((a, b) => {
      // Folders always first
      if (a.type === "folder" && b.type !== "folder") return -1;
      if (a.type !== "folder" && b.type === "folder") return 1;

      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "modified":
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        case "size":
          comparison = a.size - b.size;
          break;
        case "type":
          comparison = a.type.localeCompare(b.type);
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [filteredFiles, sortBy, sortOrder]);

  const handleFileSelect = useCallback(
    (fileId: string, event: React.MouseEvent) => {
      if (event.shiftKey && selectedFiles.length > 0) {
        const lastSelected = selectedFiles[selectedFiles.length - 1];
        const lastIndex = sortedFiles.findIndex((f) => f.id === lastSelected);
        const currentIndex = sortedFiles.findIndex((f) => f.id === fileId);
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = sortedFiles.slice(start, end + 1).map((f) => f.id);
        onSelectionChange(Array.from(new Set([...selectedFiles, ...rangeIds])));
      } else {
        if (selectedFiles.includes(fileId)) {
          onSelectionChange(selectedFiles.filter((id) => id !== fileId));
        } else {
          onSelectionChange([...selectedFiles, fileId]);
        }
      }
    },
    [selectedFiles, sortedFiles, onSelectionChange]
  );

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder(field === "name" ? "asc" : "desc");
    }
    setShowSortMenu(false);
  };

  // Stats for header
  const folderCount = sortedFiles.filter((f) => f.type === "folder").length;
  const fileCount = sortedFiles.length - folderCount;
  const aiReadyCount = sortedFiles.filter((f) => f.summary || (f.tags && f.tags.length > 0)).length;
  const starredCount = sortedFiles.filter((f) => f.starred).length;
  const sharedCount = sortedFiles.filter((f) => f.shared).length;
  const totalSize = sortedFiles.reduce((sum, file) => sum + (file.type === "folder" ? 0 : file.size || 0), 0);

  const insightCards = [
    {
      label: "AI indexed",
      value: aiReadyCount,
      detail: `${Math.round((aiReadyCount / Math.max(fileCount, 1)) * 100)}% searchable`,
      icon: Sparkles,
    },
    {
      label: "Priority",
      value: starredCount,
      detail: "starred files",
      icon: Star,
    },
    {
      label: "Shared",
      value: sharedCount,
      detail: "shared items",
      icon: Download,
    },
    {
      label: "Workspace Size",
      value: formatFileSize(totalSize),
      detail: `${folderCount + fileCount} items total`,
      icon: HardDrive,
    },
  ];

  return (
    <main
      {...getRootProps()}
      className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-slate-950 transition-colors duration-200"
    >
      <input {...getInputProps()} />

      {/* Drag & Drop Overlay */}
      <AnimatePresence>
        {(isDragActive || isDraggingOver) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-indigo-500/10 dark:bg-indigo-500/20 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              className="relative z-10 bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border-2 border-dashed border-indigo-500 max-w-sm w-full mx-4 text-center"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Drop files to upload
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload to <span className="font-semibold">{currentFolder}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        {/* Breadcrumb */}
        <SimpleBreadcrumb
          items={breadcrumbPath || [{ id: "home", name: currentFolder }]}
          onNavigate={onBreadcrumbNavigate}
          className="mb-3"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Stats */}
          <div>
            <h1 className="text-lg font-bold text-slate-950 dark:text-white leading-snug">
              {currentFolder}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              {folderCount > 0 && (
                <span>
                  {folderCount} folder{folderCount !== 1 ? "s" : ""}
                  {fileCount > 0 && ", "}
                </span>
              )}
              {fileCount > 0 && (
                <span>
                  {fileCount} file{fileCount !== 1 ? "s" : ""}
                </span>
              )}
              {sortedFiles.length === 0 && "Empty Workspace"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Empty Trash Button */}
            {currentFolder === "Trash" && sortedFiles.length > 0 && (
              <button
                onClick={onEmptyTrash}
                className="flex items-center gap-1.5 h-9 px-3 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty Trash</span>
              </button>
            )}

            {/* Sort Button */}
            <div className="relative">
              <button
                ref={sortButtonRef}
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowFilterMenu(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs font-semibold shadow-sm transition-all text-slate-700 dark:text-slate-350",
                  showSortMenu 
                    ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                {sortOrder === "asc" ? <SortAsc className="w-3.5 h-3.5" /> : <SortDesc className="w-3.5 h-3.5" />}
                <span>Sort: {sortOptions.find((o) => o.value === sortBy)?.label}</span>
                <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-150", showSortMenu && "rotate-180")} />
              </button>
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu);
                  setShowSortMenu(false);
                }}
                className={cn(
                  "flex items-center gap-1.5 h-9 px-3 bg-white dark:bg-slate-900 border rounded-lg text-xs font-semibold shadow-sm transition-all text-slate-700 dark:text-slate-350",
                  showFilterMenu || filterType !== "all"
                    ? "border-indigo-500 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Filter: {filterType === "all" ? "All files" : filterOptions.find((o) => o.value === filterType)?.label}</span>
                {filterType !== "all" && (
                  <span className="flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-indigo-600 rounded-full">
                    1
                  </span>
                )}
                <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-150", showFilterMenu && "rotate-180")} />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200/80 dark:border-slate-700">
              <Tooltip content="Grid view" side="bottom">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-150",
                    viewMode === "grid"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
              <Tooltip content="List view" side="bottom">
                <button
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "p-1.5 rounded-md transition-all duration-150",
                    viewMode === "list"
                      ? "bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  )}
                  aria-label="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Intelligence Row */}
        <div className="mt-4 grid grid-cols-2 xl:grid-cols-4 gap-3">
          {insightCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 p-3 shadow-sm flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    {card.label}
                  </p>
                  <div className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {card.value}
                    </span>
                    <span className="truncate text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                      {card.detail}
                    </span>
                  </div>
                </div>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <Icon className="h-3.5 w-3.5 text-slate-600 dark:text-slate-350" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Selection Bar */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-100 dark:border-indigo-900/50">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-350">
                  {selectedFiles.length} selected
                </span>
                <div className="hidden sm:block h-3.5 w-px bg-indigo-200/60 dark:bg-indigo-900/40" />
                
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => onSelectionChange([])}
                    className="font-semibold text-indigo-600 dark:text-indigo-405 hover:underline"
                  >
                    Clear selection
                  </button>
                  <button
                    onClick={() => onSelectionChange(sortedFiles.map((f) => f.id))}
                    className="font-semibold text-indigo-600 dark:text-indigo-405 hover:underline"
                  >
                    Select all
                  </button>
                </div>
                
                <div className="flex items-center gap-1.5 ml-auto">
                  {currentFolder !== "Trash" && (
                    <>
                      <Tooltip content="Star selected" side="bottom">
                        <button
                          onClick={() => onBatchStar?.(selectedFiles)}
                          className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      
                      <Tooltip content="Download selected" side="bottom">
                        <button
                          onClick={() => onBatchDownload?.(selectedFiles)}
                          className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      
                      <Tooltip content="Move to trash" side="bottom">
                        <button
                          onClick={() => onBatchDelete?.(selectedFiles)}
                          className="p-1.5 rounded-md bg-white dark:bg-slate-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shadow-sm border border-slate-200 dark:border-slate-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 pb-24 lg:pb-8">
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <FileCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {[...Array(8)].map((_, i) => (
                <FileListSkeleton key={i} />
              ))}
            </div>
          )
        ) : sortedFiles.length === 0 ? (
          <EmptyState
            folder={currentFolder}
            onUploadClick={onUploadClick}
            hasFilter={filterType !== "all"}
            onClearFilter={() => setFilterType("all")}
          />
        ) : viewMode === "grid" ? (
          <LayoutGroup>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {sortedFiles.map((file) => (
                  <FileCard
                    key={file.id}
                    file={file}
                    isSelected={selectedFiles.includes(file.id)}
                    onSelect={(id, e) => handleFileSelect(id, e)}
                    onClick={(e) => handleFileSelect(file.id, e)}
                    onDoubleClick={() => onFileClick(file)}
                    onDelete={() => onFileDelete(file.id)}
                    onStar={() => onFileStar(file.id)}
                    onRename={(name) => onFileRename(file.id, name)}
                    onEdit={() => onFileEdit?.(file)}
                    onPreview={() => onFilePreview?.(file)}
                    onDetails={() => onFileDetails?.(file)}
                    isInTrash={currentFolder === "Trash"}
                    onRestore={() => onFileRestore?.(file.id)}
                    onPermanentDelete={() => onFilePermanentDelete?.(file.id)}
                    viewMode="grid"
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </LayoutGroup>
        ) : (
          // List View
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <div className="col-span-6 flex items-center gap-2">
                <button
                  onClick={() => handleSort("name")}
                  className={cn(
                    "flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
                    sortBy === "name" && "text-indigo-650 dark:text-indigo-400"
                  )}
                >
                  Name
                  {sortBy === "name" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="col-span-2 hidden md:flex items-center gap-1">
                <button
                  onClick={() => handleSort("modified")}
                  className={cn(
                    "flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
                    sortBy === "modified" && "text-indigo-650 dark:text-indigo-400"
                  )}
                >
                  Modified
                  {sortBy === "modified" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="col-span-2 hidden sm:flex items-center gap-1">
                <button
                  onClick={() => handleSort("size")}
                  className={cn(
                    "flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-300 transition-colors",
                    sortBy === "size" && "text-indigo-650 dark:text-indigo-400"
                  )}
                >
                  Size
                  {sortBy === "size" && (
                    sortOrder === "asc" ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                  )}
                </button>
              </div>
              <div className="col-span-6 sm:col-span-2 text-right">Actions</div>
            </div>

            <LayoutGroup>
              <AnimatePresence mode="popLayout">
                {sortedFiles.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    isSelected={selectedFiles.includes(file.id)}
                    onSelect={(id, e) => handleFileSelect(id, e)}
                    onClick={(e) => handleFileSelect(file.id, e)}
                    onDoubleClick={() => onFileClick(file)}
                    onDelete={() => onFileDelete(file.id)}
                    onStar={() => onFileStar(file.id)}
                    onRename={(name) => onFileRename(file.id, name)}
                    onEdit={() => onFileEdit?.(file)}
                    onPreview={() => onFilePreview?.(file)}
                    onDetails={() => onFileDetails?.(file)}
                    isInTrash={currentFolder === "Trash"}
                    onRestore={() => onFileRestore?.(file.id)}
                    onPermanentDelete={() => onFilePermanentDelete?.(file.id)}
                  />
                ))}
              </AnimatePresence>
            </LayoutGroup>
          </div>
        )}
      </div>

      {/* Portal-based Dropdown Menus */}
      {mounted && createPortal(
        <AnimatePresence>
          {showSortMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-transparent z-[9998]"
                onClick={() => setShowSortMenu(false)}
              />
              {/* Sort Dropdown Menu */}
              <motion.div
                ref={sortDropdownRef}
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="fixed w-[calc(100%-2rem)] sm:w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-[9999]"
                style={{
                  top: window.innerWidth >= 640 ? sortDropdownPos.top : 'auto',
                  right: window.innerWidth >= 640 ? sortDropdownPos.right : 16,
                  bottom: window.innerWidth < 640 ? 16 : 'auto',
                  left: window.innerWidth < 640 ? 16 : 'auto',
                }}
              >
                <div className="px-3 py-1.5 mb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Sort by</p>
                  <button
                    onClick={() => setShowSortMenu(false)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-slate-450 text-slate-400" />
                  </button>
                </div>
                <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                  {sortOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isActive = sortBy === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          handleSort(option.value);
                          setShowSortMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-xs font-semibold text-left",
                          isActive 
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400" 
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <OptionIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="flex-1 truncate">{option.label}</span>
                        {isActive && (
                          <div className="p-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50">
                            {sortOrder === "asc" ? (
                              <SortAsc className="w-3 h-3 text-indigo-650 dark:text-indigo-400" />
                            ) : (
                              <SortDesc className="w-3 h-3 text-indigo-650 dark:text-indigo-400" />
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}

          {showFilterMenu && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-transparent z-[9998]"
                onClick={() => setShowFilterMenu(false)}
              />
              {/* Filter Dropdown Menu */}
              <motion.div
                ref={filterDropdownRef}
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.1 }}
                className="fixed w-[calc(100%-2rem)] sm:w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-[9999]"
                style={{
                  top: window.innerWidth >= 640 ? filterDropdownPos.top : 'auto',
                  right: window.innerWidth >= 640 ? filterDropdownPos.right : 16,
                  bottom: window.innerWidth < 640 ? 16 : 'auto',
                  left: window.innerWidth < 640 ? 16 : 'auto',
                }}
              >
                <div className="px-3 py-1.5 mb-1 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter by type</p>
                  <div className="flex items-center gap-1.5">
                    {filterType !== "all" && (
                      <button
                        onClick={() => {
                          setFilterType("all");
                          setShowFilterMenu(false);
                        }}
                        className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5 max-h-[60vh] overflow-y-auto">
                  {filterOptions.map((option) => {
                    const OptionIcon = option.icon;
                    const isActive = filterType === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setFilterType(option.value);
                          setShowFilterMenu(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2.5 px-3 py-2 rounded-md transition-all duration-150 text-xs font-semibold text-left",
                          isActive 
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400" 
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        )}
                      >
                        <OptionIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        <span className="flex-1 truncate">{option.label}</span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </main>
  );
}
