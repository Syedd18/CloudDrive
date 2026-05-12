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
  ArrowUpDown,
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
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

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
      // If clicking the file naturally, act as a toggle (additive) since we added checkboxes
      if (event.shiftKey && selectedFiles.length > 0) {
        // Shift + click: range selection
        const lastSelected = selectedFiles[selectedFiles.length - 1];
        const lastIndex = sortedFiles.findIndex((f) => f.id === lastSelected);
        const currentIndex = sortedFiles.findIndex((f) => f.id === fileId);
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = sortedFiles.slice(start, end + 1).map((f) => f.id);
        onSelectionChange(Array.from(new Set([...selectedFiles, ...rangeIds])));
      } else {
        // Normal click acts as additive (toggle) because we have dedicated checkboxes now
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

  return (
    <main
      {...getRootProps()}
      className={cn(
        "flex-1 flex flex-col overflow-hidden relative",
        "bg-surface-50 dark:bg-surface-950"
      )}
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
            <div className="absolute inset-0 bg-primary-500/10 dark:bg-primary-500/20 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 bg-white dark:bg-surface-800 rounded-3xl p-10 shadow-2xl border-2 border-dashed border-primary-500"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow"
                >
                  <Upload className="w-10 h-10 text-white" />
                </motion.div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-surface-900 dark:text-white">
                    Drop files to upload
                  </p>
                  <p className="text-sm text-surface-500 mt-1">
                    Upload to <span className="font-medium">{currentFolder}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl">
        {/* Breadcrumb */}
        <SimpleBreadcrumb
          items={breadcrumbPath || [{ id: "home", name: currentFolder }]}
          onNavigate={onBreadcrumbNavigate}
          className="mb-4"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Stats */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
              {currentFolder}
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
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
              {sortedFiles.length === 0 && "Empty"}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Empty Trash Button */}
            {currentFolder === "Trash" && sortedFiles.length > 0 && (
              <button
                onClick={onEmptyTrash}
                className="btn-secondary text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/50 border-danger-200 dark:border-danger-800"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Empty Trash</span>
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                ref={sortButtonRef}
                onClick={() => {
                  setShowSortMenu(!showSortMenu);
                  setShowFilterMenu(false);
                }}
                className={cn(
                  "group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl border transition-all duration-200",
                  "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700",
                  showSortMenu 
                    ? "bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-md" 
                    : "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700"
                )}
              >
                <div className={cn(
                  "p-1 sm:p-1.5 rounded-lg transition-colors",
                  showSortMenu 
                    ? "bg-primary-100 dark:bg-primary-900/50" 
                    : "bg-surface-100 dark:bg-surface-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50"
                )}>
                  {sortOrder === "asc" ? (
                    <SortAsc className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                      showSortMenu ? "text-primary-600 dark:text-primary-400" : "text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    )} />
                  ) : (
                    <SortDesc className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                      showSortMenu ? "text-primary-600 dark:text-primary-400" : "text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                    )} />
                  )}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider leading-none">Sort by</span>
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-200 leading-tight">
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface-400 transition-transform duration-200",
                  showSortMenu && "rotate-180"
                )} />
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => {
                  setShowFilterMenu(!showFilterMenu);
                  setShowSortMenu(false);
                }}
                className={cn(
                  "group flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-xl border transition-all duration-200",
                  "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700",
                  showFilterMenu || filterType !== "all"
                    ? "bg-primary-50 dark:bg-primary-950/50 border-primary-300 dark:border-primary-700 shadow-md" 
                    : "bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700"
                )}
              >
                <div className={cn(
                  "p-1 sm:p-1.5 rounded-lg transition-colors",
                  showFilterMenu || filterType !== "all"
                    ? "bg-primary-100 dark:bg-primary-900/50" 
                    : "bg-surface-100 dark:bg-surface-700 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50"
                )}>
                  <Filter className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors",
                    showFilterMenu || filterType !== "all"
                      ? "text-primary-600 dark:text-primary-400" 
                      : "text-surface-500 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                  )} />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-[10px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider leading-none">Filter</span>
                  <span className="text-sm font-semibold text-surface-700 dark:text-surface-200 leading-tight">
                    {filterType === "all" ? "All files" : filterOptions.find((o) => o.value === filterType)?.label}
                  </span>
                </div>
                {filterType !== "all" && (
                  <span className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[10px] font-bold text-white bg-primary-500 rounded-full">
                    1
                  </span>
                )}
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface-400 transition-transform duration-200",
                  showFilterMenu && "rotate-180"
                )} />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
              <Tooltip content="Grid view" side="bottom">
                <button
                  onClick={() => onViewModeChange("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "grid"
                      ? "bg-white dark:bg-surface-700 shadow-soft text-primary-600 dark:text-primary-400"
                      : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  )}
                  aria-label="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip content="List view" side="bottom">
                <button
                  onClick={() => onViewModeChange("list")}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    viewMode === "list"
                      ? "bg-white dark:bg-surface-700 shadow-soft text-primary-600 dark:text-primary-400"
                      : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                  )}
                  aria-label="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Selection Bar */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-200/50 dark:border-primary-800/50">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {selectedFiles.length} selected
                </span>
                <div className="hidden sm:block h-4 w-px bg-primary-200 dark:bg-primary-700" />
                
                {/* Selection controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectionChange([])}
                    className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => onSelectionChange(sortedFiles.map((f) => f.id))}
                    className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Select all
                  </button>
                </div>
                
                {/* Batch Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                  {currentFolder !== "Trash" && (
                    <>
                      {/* Star Selected */}
                      <Tooltip content="Star selected" side="bottom">
                        <button
                          onClick={() => onBatchStar?.(selectedFiles)}
                          className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-surface-800 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors shadow-sm border border-primary-200/50 dark:border-primary-800/50"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      
                      {/* Download Selected */}
                      <Tooltip content="Download selected" side="bottom">
                        <button
                          onClick={() => onBatchDownload?.(selectedFiles)}
                          className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors shadow-sm border border-primary-200/50 dark:border-primary-800/50"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      
                      {/* Move to Trash */}
                      <Tooltip content="Move to trash" side="bottom">
                        <button
                          onClick={() => onBatchDelete?.(selectedFiles)}
                          className="p-1.5 sm:p-2 rounded-lg bg-white dark:bg-surface-800 text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors shadow-sm border border-primary-200/50 dark:border-primary-800/50"
                        >
                          <Trash2 className="w-4 h-4" />
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
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {isLoading ? (
          // Skeleton Loaders
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <FileCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <FileListSkeleton key={i} />
              ))}
            </div>
          )
        ) : sortedFiles.length === 0 ? (
          // Empty State
          <EmptyState
            folder={currentFolder}
            onUploadClick={onUploadClick}
            hasFilter={filterType !== "all"}
            onClearFilter={() => setFilterType("all")}
          />
        ) : viewMode === "grid" ? (
          // Grid View
          <LayoutGroup>
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4"
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
          <div className="card rounded-2xl overflow-hidden">
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-surface-200/60 dark:border-surface-700/50 bg-surface-50 dark:bg-surface-800/50 text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
              <div className="col-span-6 flex items-center gap-2">
                <button
                  onClick={() => handleSort("name")}
                  className={cn(
                    "flex items-center gap-1 hover:text-surface-700 dark:hover:text-surface-200 transition-colors",
                    sortBy === "name" && "text-primary-600 dark:text-primary-400"
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
                    "flex items-center gap-1 hover:text-surface-700 dark:hover:text-surface-200 transition-colors",
                    sortBy === "modified" && "text-primary-600 dark:text-primary-400"
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
                    "flex items-center gap-1 hover:text-surface-700 dark:hover:text-surface-200 transition-colors",
                    sortBy === "size" && "text-primary-600 dark:text-primary-400"
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
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                onClick={() => setShowSortMenu(false)}
              />
              {/* Sort Dropdown Menu */}
              <motion.div
                ref={sortDropdownRef}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="fixed w-[calc(100%-2rem)] sm:w-64 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-2 z-[9999]"
                style={{
                  top: window.innerWidth >= 640 ? sortDropdownPos.top : 'auto',
                  right: window.innerWidth >= 640 ? sortDropdownPos.right : 16,
                  bottom: window.innerWidth < 640 ? 16 : 'auto',
                  left: window.innerWidth < 640 ? 16 : 'auto',
                }}
              >
                <div className="px-3 py-2 mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Sort by</p>
                  <button
                    onClick={() => setShowSortMenu(false)}
                    className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                  >
                    <X className="w-4 h-4 text-surface-400" />
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
                          "w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]",
                          isActive 
                            ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300" 
                            : "text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          isActive 
                            ? "bg-primary-100 dark:bg-primary-900/50" 
                            : "bg-surface-100 dark:bg-surface-700"
                        )}>
                          <OptionIcon className={cn(
                            "w-4 h-4",
                            isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-400"
                          )} />
                        </div>
                        <span className={cn(
                          "flex-1 text-left font-medium text-sm",
                          isActive && "font-semibold"
                        )}>{option.label}</span>
                        {isActive && (
                          <div className="flex items-center gap-1">
                            <div className="p-1 rounded-md bg-primary-100 dark:bg-primary-900/50">
                              {sortOrder === "asc" ? (
                                <SortAsc className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                              ) : (
                                <SortDesc className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                              )}
                            </div>
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
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                onClick={() => setShowFilterMenu(false)}
              />
              {/* Filter Dropdown Menu */}
              <motion.div
                ref={filterDropdownRef}
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="fixed w-[calc(100%-2rem)] sm:w-64 bg-white dark:bg-surface-800 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 p-2 z-[9999]"
                style={{
                  top: window.innerWidth >= 640 ? filterDropdownPos.top : 'auto',
                  right: window.innerWidth >= 640 ? filterDropdownPos.right : 16,
                  bottom: window.innerWidth < 640 ? 16 : 'auto',
                  left: window.innerWidth < 640 ? 16 : 'auto',
                }}
              >
                <div className="px-3 py-2 mb-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider">Filter by type</p>
                  <div className="flex items-center gap-2">
                    {filterType !== "all" && (
                      <button
                        onClick={() => {
                          setFilterType("all");
                          setShowFilterMenu(false);
                        }}
                        className="text-xs font-medium text-danger-600 dark:text-danger-400 hover:underline"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => setShowFilterMenu(false)}
                      className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      <X className="w-4 h-4 text-surface-400" />
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
                          "w-full flex items-center gap-3 px-3 py-3 sm:py-2.5 rounded-xl transition-all duration-150 active:scale-[0.98]",
                          isActive 
                            ? "bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300" 
                            : "text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                        )}
                      >
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          isActive 
                            ? "bg-primary-100 dark:bg-primary-900/50" 
                            : "bg-surface-100 dark:bg-surface-700"
                        )}>
                          <OptionIcon className={cn(
                            "w-4 h-4",
                            isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-400"
                          )} />
                        </div>
                        <span className={cn(
                          "flex-1 text-left font-medium text-sm",
                          isActive && "font-semibold"
                        )}>{option.label}</span>
                        {isActive && (
                          <Check className="w-4 h-4 text-primary-500" />
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
