"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Grid3X3,
  List,
  Filter,
  SortAsc,
  Upload,
  FolderOpen,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { FileItem, ViewMode } from "@/types";
import { FileCard } from "@/components/files/FileCard";
import { FileListItem } from "@/components/files/FileListItem";
import { FileCardSkeleton, FileListSkeleton } from "@/components/files/FileSkeletons";
import { EmptyState } from "@/components/files/EmptyState";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface MainContentProps {
  files: FileItem[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onFileClick: (file: FileItem) => void;
  onFileDelete: (fileId: string) => void;
  onFileRestore?: (fileId: string) => void;
  onFilePermanentDelete?: (fileId: string) => void;
  onFileStar: (fileId: string) => void;
  onFileRename: (fileId: string, newName: string) => void;
  onUpload: (files: File[]) => void;
  onUploadClick?: () => void;
  onEmptyTrash?: () => void;
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
  currentFolder: string;
  isLoading: boolean;
}

export function MainContent({
  files,
  viewMode,
  onViewModeChange,
  onFileClick,
  onFileDelete,
  onFileRestore,
  onFilePermanentDelete,
  onFileStar,
  onFileRename,
  onUpload,
  onUploadClick,
  onEmptyTrash,
  selectedFiles,
  onSelectionChange,
  currentFolder,
  isLoading,
}: MainContentProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "modified" | "size">("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDraggingOver(false);
      if (acceptedFiles.length > 0) {
        onUpload(acceptedFiles);
        toast.success(`${acceptedFiles.length} file(s) uploaded successfully`);
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

  // Filter out trashed files unless viewing trash
  const displayFiles = files.filter((f) =>
    currentFolder === "Trash" ? f.trashed : !f.trashed
  );

  // Sort files
  const sortedFiles = [...displayFiles].sort((a, b) => {
    // Folders first
    if (a.type === "folder" && b.type !== "folder") return -1;
    if (a.type !== "folder" && b.type === "folder") return 1;

    let comparison = 0;
    switch (sortBy) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "modified":
        comparison =
          new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
      case "size":
        comparison = a.size - b.size;
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const handleFileSelect = (fileId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Toggle selection
      if (selectedFiles.includes(fileId)) {
        onSelectionChange(selectedFiles.filter((id) => id !== fileId));
      } else {
        onSelectionChange([...selectedFiles, fileId]);
      }
    } else if (event.shiftKey && selectedFiles.length > 0) {
      // Range selection
      const lastSelected = selectedFiles[selectedFiles.length - 1];
      const lastIndex = sortedFiles.findIndex((f) => f.id === lastSelected);
      const currentIndex = sortedFiles.findIndex((f) => f.id === fileId);
      const start = Math.min(lastIndex, currentIndex);
      const end = Math.max(lastIndex, currentIndex);
      const rangeIds = sortedFiles.slice(start, end + 1).map((f) => f.id);
      onSelectionChange(Array.from(new Set([...selectedFiles, ...rangeIds])));
    } else {
      onSelectionChange([fileId]);
    }
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <main
      {...getRootProps()}
      className={cn(
        "flex-1 flex flex-col overflow-hidden",
        "bg-surface-50 dark:bg-[#0d1117]",
        "transition-colors duration-200"
      )}
    >
      <input {...getInputProps()} />

      {/* Drag Overlay */}
      <AnimatePresence>
        {(isDragActive || isDraggingOver) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-primary-500/10 dark:bg-primary-500/20 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-surface-800 rounded-3xl p-8 shadow-soft-xl border-2 border-dashed border-primary-500 flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary-500" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-surface-900 dark:text-white">
                  Drop files here
                </p>
                <p className="text-sm text-surface-500">
                  Files will be uploaded to {currentFolder}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/60 dark:bg-[#0d1117]/80 backdrop-blur-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-4">
          <FolderOpen className="w-4 h-4 text-surface-400" />
          <span className="text-surface-400">Home</span>
          <ChevronRight className="w-4 h-4 text-surface-300" />
          <span className="font-medium text-surface-900 dark:text-white">
            {currentFolder}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-surface-900 dark:text-white">
              {currentFolder}
            </h1>
            <p className="text-sm text-surface-500 mt-0.5">
              {sortedFiles.length} item{sortedFiles.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Empty Trash Button - Only show in Trash folder */}
            {currentFolder === "Trash" && sortedFiles.length > 0 && (
              <button
                onClick={onEmptyTrash}
                className="btn-secondary text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 border-danger-200 dark:border-danger-500/30"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Empty Trash</span>
              </button>
            )}
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleSort(sortBy)}
                className="btn-secondary"
              >
                <SortAsc className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </span>
              </button>
            </div>

            {/* Filter Button */}
            <button className="btn-secondary">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {/* View Toggle */}
            <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
              <button
                onClick={() => onViewModeChange("grid")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  viewMode === "grid"
                    ? "bg-white dark:bg-surface-700 shadow-soft text-primary-500"
                    : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                )}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  viewMode === "list"
                    ? "bg-white dark:bg-surface-700 shadow-soft text-primary-500"
                    : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                )}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
        {isLoading ? (
          // Skeleton Loaders
          viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
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
          <EmptyState folder={currentFolder} onUploadClick={onUploadClick} />
        ) : viewMode === "grid" ? (
          // Grid View
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {sortedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileCard
                    file={file}
                    isSelected={selectedFiles.includes(file.id)}
                    onClick={(e) => handleFileSelect(file.id, e)}
                    onDoubleClick={() => onFileClick(file)}
                    onDelete={() => onFileDelete(file.id)}
                    onStar={() => onFileStar(file.id)}
                    onRename={(name) => onFileRename(file.id, name)}
                    isInTrash={currentFolder === "Trash"}
                    onRestore={() => onFileRestore?.(file.id)}
                    onPermanentDelete={() => onFilePermanentDelete?.(file.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          // List View
          <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-surface-200/60 dark:border-surface-700/50 overflow-hidden">
            {/* List Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-surface-200/60 dark:border-surface-700/50 bg-surface-50 dark:bg-surface-800/30 text-xs font-medium text-surface-500 uppercase tracking-wider">
              <div className="col-span-5 sm:col-span-6">Name</div>
              <div className="col-span-3 sm:col-span-2 hidden sm:block">Modified</div>
              <div className="col-span-2 hidden sm:block">Size</div>
              <div className="col-span-4 sm:col-span-2 text-right">Actions</div>
            </div>

            <AnimatePresence mode="popLayout">
              {sortedFiles.map((file) => (
                <motion.div
                  key={file.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <FileListItem
                    file={file}
                    isSelected={selectedFiles.includes(file.id)}
                    onClick={(e) => handleFileSelect(file.id, e)}
                    onDoubleClick={() => onFileClick(file)}
                    onDelete={() => onFileDelete(file.id)}
                    onStar={() => onFileStar(file.id)}
                    onRename={(name) => onFileRename(file.id, name)}
                    isInTrash={currentFolder === "Trash"}
                    onRestore={() => onFileRestore?.(file.id)}
                    onPermanentDelete={() => onFilePermanentDelete?.(file.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}
