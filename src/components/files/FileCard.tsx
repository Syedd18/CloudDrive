"use client";

import { useState, useRef, useEffect } from "react";
import NextImage from "next/image";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  MoreVertical,
  Star,
  Download,
  Trash2,
  Share2,
  Edit3,
  Copy,
  Folder,
  FileText,
  FileSpreadsheet,
  Presentation,
  File,
  Image,
  Video,
  Music,
  Archive,
  FileType,
  Users,
  RotateCcw,
} from "lucide-react";
import { FileItem } from "@/types";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onStar: () => void;
  onRename: (name: string) => void;
  isInTrash?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
}

const fileTypeIcons: Record<FileItem["type"], typeof File> = {
  folder: Folder,
  document: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  pdf: FileType,
  image: Image,
  video: Video,
  audio: Music,
  archive: Archive,
  file: File,
};

const fileTypeColors: Record<FileItem["type"], string> = {
  folder: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  document: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  spreadsheet: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  presentation: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  pdf: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  image: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  video: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  audio: "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400",
  archive: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  file: "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400",
};

export function FileCard({
  file,
  isSelected,
  onClick,
  onDoubleClick,
  onDelete,
  onStar,
  onRename,
  isInTrash = false,
  onRestore,
  onPermanentDelete,
}: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number; position: 'top' | 'bottom' } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justOpenedRef = useRef(false);
  const Icon = fileTypeIcons[file.type];

  // Calculate menu position and absolute coordinates based on available space
  const calculateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 280; // Approximate menu height
      const position: 'top' | 'bottom' = spaceBelow < menuHeight ? 'top' : 'bottom';

      // Compute top coordinate explicitly so we don't rely on CSS transforms
      const top = position === 'bottom' ? rect.bottom + 4 : Math.max(rect.top - menuHeight - 4, 8);
      const right = Math.max(window.innerWidth - rect.right, 8);

      setMenuPosition(position);
      setMenuCoords({ top, right, position });
      return { top, right, position };
    }

    return null;
  };

  useEffect(() => {
    if (!showMenu) return;

    function handleClickOutside(event: MouseEvent) {
      // Ignore the click that just opened the menu
      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }

      const target = event.target as Node;
      // If click is inside menu or menu button, do nothing
      if (
        (menuRef.current && menuRef.current.contains(target)) ||
        (menuButtonRef.current && menuButtonRef.current.contains(target))
      ) {
        return;
      }
      setShowMenu(false);
    }

    document.addEventListener("click", handleClickOutside, true);
    return () => document.removeEventListener("click", handleClickOutside, true);
  }, [showMenu]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(newName.trim());
      toast.success("File renamed successfully");
    }
    setIsRenaming(false);
  };

  const handleDownload = async () => {
    if (file.type === 'folder') {
      toast.error("Cannot download folders");
      setShowMenu(false);
      return;
    }

    try {
      setShowMenu(false);
      toast.loading("Preparing download...", { id: `download-${file.id}` });

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/download`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const { downloadUrl } = await response.json();
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started", { id: `download-${file.id}` });
    } catch (error) {
      toast.error("Failed to download file", { id: `download-${file.id}` });
    }
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard");
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete();
    toast.success("Moved to trash");
    setShowMenu(false);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={cn(
        "group relative bg-white dark:bg-[#161b22] rounded-2xl",
        "border-2 transition-all duration-200 cursor-pointer",
        "shadow-sm hover:shadow-md dark:shadow-none",
        isSelected
          ? "border-primary-500 ring-2 ring-primary-500/20"
          : "border-surface-200/60 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Thumbnail / Icon Area */}
      <div className="relative aspect-[4/3] sm:aspect-[4/3] rounded-t-[14px] overflow-hidden bg-surface-50 dark:bg-surface-900/50">
        {file.thumbnail ? (
          <NextImage
            src={file.thumbnail}
            alt={file.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className={cn(
                "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center",
                fileTypeColors[file.type]
              )}
            >
              <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
          </div>
        )}

        {/* Star Badge */}
        {file.starred && (
          <div className="absolute top-2 left-2">
            <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Shared Badge */}
        {file.shared && (
          <div className="absolute top-2 right-2">
            <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>

      {/* File Info */}
      <div className="p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") {
                    setNewName(file.name);
                    setIsRenaming(false);
                  }
                }}
                className="w-full px-2 py-1 text-sm font-medium bg-surface-100 dark:bg-surface-800 rounded-lg border-2 border-primary-500 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3 className="text-xs sm:text-sm font-medium text-surface-900 dark:text-surface-100 truncate">
                {file.name}
              </h3>
            )}
            <div className="flex items-center gap-1 sm:gap-2 mt-1">
              <span className="text-[10px] sm:text-xs text-surface-500 dark:text-surface-400">
                {formatDate(file.modified)}
              </span>
              {file.size > 0 && (
                <>
                  <span className="text-surface-300 dark:text-surface-600 hidden sm:inline">•</span>
                  <span className="text-[10px] sm:text-xs text-surface-500 dark:text-surface-400 hidden sm:inline">
                    {formatFileSize(file.size)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Menu Button */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onMouseDown={(e) => {
                try { e.nativeEvent && (e.nativeEvent as any).stopImmediatePropagation(); } catch {}
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.stopPropagation();
                const coords = calculateMenuPosition();
                // Set flag to indicate we just opened the menu
                justOpenedRef.current = true;
                // toggle menu visibility
                setShowMenu((prev) => !prev);
                if (coords) setMenuCoords(coords);
              }}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                "text-surface-400 hover:text-surface-600 dark:hover:text-surface-300",
                "hover:bg-surface-100 dark:hover:bg-surface-700",
                "opacity-0 group-hover:opacity-100 focus:opacity-100",
                showMenu && "opacity-100 bg-surface-100 dark:bg-surface-700"
              )}
              aria-label="File options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Context Menu - Rendered via Portal */}
      {showMenu && menuCoords && typeof window !== 'undefined' && createPortal(
        <motion.div
          ref={menuRef}
          key="context-menu"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{
            position: 'fixed',
            top: menuCoords.top,
            right: menuCoords.right,
          }}
          className="w-52 bg-white dark:bg-[#1c2128] rounded-xl shadow-xl border border-surface-200/80 dark:border-surface-700/60 py-1.5 z-[100] max-h-[60vh] overflow-y-auto"
          onMouseDown={(e) => {
            try { e.nativeEvent && (e.nativeEvent as any).stopImmediatePropagation(); } catch {}
            e.stopPropagation();
          }}
          onClick={(e) => e.stopPropagation()}
        >
                {isInTrash ? (
                  <>
                    <button
                      onClick={() => {
                        onRestore?.();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-500" />
                      Restore
                    </button>
                    <div className="h-px bg-surface-200 dark:bg-surface-700/60 my-1.5 mx-2" />
                    <button
                      onClick={() => {
                        onPermanentDelete?.();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete forever
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        onStar();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Star
                        className={cn(
                          "w-4 h-4",
                          file.starred ? "text-amber-500 fill-amber-500" : "text-surface-400"
                        )}
                      />
                      {file.starred ? "Remove star" : "Add to starred"}
                    </button>
                    <button
                      onClick={() => {
                        setIsRenaming(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 text-surface-400" />
                      Rename
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-surface-400" />
                      Share
                    </button>
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-surface-400" />
                      Download
                    </button>
                    <button
                      onClick={() => {
                        toast.success("Link copied to clipboard");
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-surface-400" />
                      Copy link
                    </button>
                    <div className="h-px bg-surface-200 dark:bg-surface-700/60 my-1.5 mx-2" />
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Move to trash
                    </button>
                  </>
                )}
        </motion.div>,
        document.body
      )}
    </motion.div>
  );
}
