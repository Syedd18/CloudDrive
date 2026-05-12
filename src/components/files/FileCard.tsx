"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MoreHorizontal,
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
  ExternalLink,
  Sparkles,
  Info,
  Check,
  X,
} from "lucide-react";
import { FileItem } from "@/types";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";
import { ShareModal } from "@/components/modals/ShareModal";
import { SummaryModal } from "@/components/modals/SummaryModal";
import { isEditableFile } from "@/lib/utils";
import toast from "react-hot-toast";

// Extension-based color configuration
const extensionColors: Record<string, { bg: string; icon: string; gradient: string }> = {
  // Spreadsheets - Green family
  csv: { bg: "bg-green-50 dark:bg-green-950/30", icon: "text-green-600 dark:text-green-400", gradient: "from-green-500 to-green-600" },
  xlsx: { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-emerald-600" },
  xls: { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-emerald-600" },
  
  // PDF - Red
  pdf: { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", gradient: "from-red-500 to-red-600" },
  
  // Presentations - Dark red/Orange
  pptx: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-red-500" },
  ppt: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-red-500" },
  
  // Documents - Blue family
  doc: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  docx: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  txt: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", gradient: "from-slate-400 to-slate-600" },
  rtf: { bg: "bg-sky-50 dark:bg-sky-950/30", icon: "text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-sky-600" },
  odt: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  
  // Images - Purple/Pink family
  jpg: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-pink-500" },
  jpeg: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-pink-500" },
  png: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", icon: "text-fuchsia-600 dark:text-fuchsia-400", gradient: "from-fuchsia-500 to-pink-500" },
  gif: { bg: "bg-pink-50 dark:bg-pink-950/30", icon: "text-pink-600 dark:text-pink-400", gradient: "from-pink-500 to-rose-500" },
  svg: { bg: "bg-violet-50 dark:bg-violet-950/30", icon: "text-violet-600 dark:text-violet-400", gradient: "from-violet-500 to-purple-500" },
  webp: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-purple-500" },
  ico: { bg: "bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-orange-500" },
  bmp: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", gradient: "from-rose-500 to-pink-500" },
  
  // Videos - Rose/Pink family
  mp4: { bg: "bg-rose-50 dark:bg-rose-950/30", icon: "text-rose-600 dark:text-rose-400", gradient: "from-rose-500 to-red-500" },
  mov: { bg: "bg-pink-50 dark:bg-pink-950/30", icon: "text-pink-600 dark:text-pink-400", gradient: "from-pink-500 to-rose-500" },
  avi: { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-500 dark:text-red-400", gradient: "from-red-400 to-rose-500" },
  mkv: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-pink-500" },
  webm: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", icon: "text-fuchsia-600 dark:text-fuchsia-400", gradient: "from-fuchsia-500 to-rose-500" },
  wmv: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-indigo-500" },
  flv: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-red-500" },
  
  // Audio - Cyan/Teal family
  mp3: { bg: "bg-cyan-50 dark:bg-cyan-950/30", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-teal-500" },
  wav: { bg: "bg-teal-50 dark:bg-teal-950/30", icon: "text-teal-600 dark:text-teal-400", gradient: "from-teal-500 to-cyan-500" },
  ogg: { bg: "bg-emerald-50 dark:bg-emerald-950/30", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-teal-500" },
  flac: { bg: "bg-sky-50 dark:bg-sky-950/30", icon: "text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-cyan-500" },
  aac: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-cyan-500" },
  m4a: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-blue-500" },
  
  // Archives - Slate/Gray family
  zip: { bg: "bg-amber-50 dark:bg-amber-950/30", icon: "text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-yellow-500" },
  rar: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-violet-500" },
  "7z": { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", gradient: "from-slate-500 to-gray-600" },
  tar: { bg: "bg-stone-50 dark:bg-stone-950/30", icon: "text-stone-600 dark:text-stone-400", gradient: "from-stone-500 to-gray-600" },
  gz: { bg: "bg-zinc-50 dark:bg-zinc-950/30", icon: "text-zinc-600 dark:text-zinc-400", gradient: "from-zinc-500 to-slate-600" },
  
  // Code files - Various vibrant colors
  js: { bg: "bg-yellow-50 dark:bg-yellow-950/30", icon: "text-yellow-600 dark:text-yellow-400", gradient: "from-yellow-400 to-amber-500" },
  ts: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  jsx: { bg: "bg-cyan-50 dark:bg-cyan-950/30", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-400 to-blue-500" },
  tsx: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-400 to-cyan-500" },
  py: { bg: "bg-yellow-50 dark:bg-yellow-950/30", icon: "text-yellow-600 dark:text-yellow-400", gradient: "from-blue-500 to-yellow-500" },
  java: { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", gradient: "from-red-500 to-orange-500" },
  cpp: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-700 dark:text-blue-400", gradient: "from-blue-600 to-indigo-600" },
  c: { bg: "bg-gray-50 dark:bg-gray-950/30", icon: "text-gray-600 dark:text-gray-400", gradient: "from-gray-500 to-blue-500" },
  html: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-red-500" },
  css: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-purple-500" },
  json: { bg: "bg-yellow-50 dark:bg-yellow-950/30", icon: "text-yellow-700 dark:text-yellow-400", gradient: "from-yellow-500 to-amber-500" },
  xml: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-400 to-amber-500" },
  md: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-600 dark:text-slate-400", gradient: "from-slate-500 to-gray-600" },
  sql: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-yellow-500" },
  php: { bg: "bg-indigo-50 dark:bg-indigo-950/30", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-purple-500" },
  rb: { bg: "bg-red-50 dark:bg-red-950/30", icon: "text-red-600 dark:text-red-400", gradient: "from-red-500 to-rose-500" },
  go: { bg: "bg-cyan-50 dark:bg-cyan-950/30", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-blue-500" },
  rs: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-700 dark:text-orange-400", gradient: "from-orange-600 to-red-600" },
  swift: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-red-500" },
  kt: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-violet-500" },
  
  // Executable/System files
  exe: { bg: "bg-slate-50 dark:bg-slate-950/30", icon: "text-slate-700 dark:text-slate-400", gradient: "from-slate-600 to-gray-700" },
  msi: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-700 dark:text-blue-400", gradient: "from-blue-600 to-indigo-600" },
  dmg: { bg: "bg-gray-50 dark:bg-gray-950/30", icon: "text-gray-600 dark:text-gray-400", gradient: "from-gray-500 to-slate-600" },
  iso: { bg: "bg-neutral-50 dark:bg-neutral-950/30", icon: "text-neutral-600 dark:text-neutral-400", gradient: "from-neutral-500 to-gray-600" },
  
  // Design files
  psd: { bg: "bg-blue-50 dark:bg-blue-950/30", icon: "text-blue-700 dark:text-blue-400", gradient: "from-blue-600 to-indigo-700" },
  ai: { bg: "bg-orange-50 dark:bg-orange-950/30", icon: "text-orange-700 dark:text-orange-400", gradient: "from-orange-600 to-amber-600" },
  sketch: { bg: "bg-yellow-50 dark:bg-yellow-950/30", icon: "text-yellow-600 dark:text-yellow-400", gradient: "from-yellow-500 to-orange-500" },
  figma: { bg: "bg-purple-50 dark:bg-purple-950/30", icon: "text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-pink-500" },
  xd: { bg: "bg-fuchsia-50 dark:bg-fuchsia-950/30", icon: "text-fuchsia-600 dark:text-fuchsia-400", gradient: "from-fuchsia-500 to-purple-500" },
};

// Helper to get file extension
function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

// Get colors based on extension or fall back to type
export function getFileColors(file: FileItem): { bg: string; icon: string; gradient: string } {
  const ext = getFileExtension(file.name);
  
  if (ext && extensionColors[ext]) {
    return extensionColors[ext];
  }
  
  // Fallback to type-based colors
  return fileTypeColors[file.type] || fileTypeColors.file;
}

interface FileCardProps {
  file: FileItem;
  isSelected: boolean;
  onSelect: (id: string, event?: any) => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onDelete: () => void;
  onStar: () => void;
  onRename: (name: string) => void;
  onEdit?: () => void;
  onPreview?: () => void;
  onDetails?: () => void;
  isInTrash?: boolean;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  viewMode?: "grid" | "list";
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

const fileTypeColors: Record<FileItem["type"], { bg: string; icon: string; gradient: string }> = {
  folder: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-500 dark:text-amber-400",
    gradient: "from-amber-400 to-orange-500",
  },
  document: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-500 dark:text-blue-400",
    gradient: "from-blue-400 to-blue-600",
  },
  spreadsheet: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    icon: "text-emerald-500 dark:text-emerald-400",
    gradient: "from-emerald-400 to-emerald-600",
  },
  presentation: {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    icon: "text-orange-500 dark:text-orange-400",
    gradient: "from-orange-400 to-red-500",
  },
  pdf: {
    bg: "bg-red-50 dark:bg-red-950/30",
    icon: "text-red-500 dark:text-red-400",
    gradient: "from-red-400 to-rose-600",
  },
  image: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    icon: "text-purple-500 dark:text-purple-400",
    gradient: "from-purple-400 to-pink-500",
  },
  video: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    icon: "text-pink-500 dark:text-pink-400",
    gradient: "from-pink-400 to-rose-500",
  },
  audio: {
    bg: "bg-cyan-50 dark:bg-cyan-950/30",
    icon: "text-cyan-500 dark:text-cyan-400",
    gradient: "from-cyan-400 to-teal-500",
  },
  archive: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    icon: "text-slate-500 dark:text-slate-400",
    gradient: "from-slate-400 to-slate-600",
  },
  file: {
    bg: "bg-surface-50 dark:bg-surface-900/30",
    icon: "text-surface-500 dark:text-surface-400",
    gradient: "from-surface-400 to-surface-600",
  },
};

import React from "react";

export const FileCard = React.forwardRef<HTMLDivElement, FileCardProps>(({
  file,
  isSelected,
  onSelect,
  onClick,
  onDoubleClick,
  onDelete,
  onStar,
  onRename,
  onEdit,
  onPreview,
  onDetails,
  isInTrash = false,
  onRestore,
  onPermanentDelete,
  viewMode = "grid",
}, ref) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuCoords, setMenuCoords] = useState<{ top: number; right: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [isHovered, setIsHovered] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTriggered = useRef(false); // Use ref for immediate sync check
  const menuRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const justOpenedRef = useRef(false);
  const Icon = fileTypeIcons[file.type];
  const colors = getFileColors(file);

  const calculateMenuPosition = useCallback(() => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const menuHeight = 380; // Increased to account for all menu items
      // w-52 on mobile (208px), w-56 on desktop (224px)
      const menuWidth = window.innerWidth < 640 ? 208 : 224;
      
      let top: number;
      
      // Check if menu fits below
      if (spaceBelow >= menuHeight) {
        top = rect.bottom + 4;
      } 
      // Check if menu fits above
      else if (spaceAbove >= menuHeight) {
        top = rect.top - menuHeight - 4;
      }
      // If neither fits, position to maximize visible area and ensure it doesn't go off-screen
      else {
        // Place where there's more space, but ensure minimum 8px from edges
        if (spaceBelow > spaceAbove) {
          top = Math.min(rect.bottom + 4, window.innerHeight - menuHeight - 8);
        } else {
          top = Math.max(8, rect.top - menuHeight - 4);
        }
      }
      
      // Ensure top is never negative
      top = Math.max(8, top);
      
      // For mobile, center the menu or position from left if needed
      let right = window.innerWidth - rect.right;
      
      // If menu would go off the left edge, adjust position
      if (window.innerWidth - right < menuWidth + 8) {
        // Position from left instead
        right = Math.max(8, window.innerWidth - menuWidth - 8);
      }
      
      right = Math.max(8, right);

      setMenuCoords({ top, right });
      return { top, right };
    }
    return null;
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    function handleClickOutside(event: MouseEvent) {
      if (justOpenedRef.current) {
        justOpenedRef.current = false;
        return;
      }

      const target = event.target as Node;
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
      const lastDot = file.name.lastIndexOf(".");
      const selectEnd = lastDot > 0 ? lastDot : file.name.length;
      inputRef.current.setSelectionRange(0, selectEnd);
    }
  }, [isRenaming, file.name]);

  const handleRename = () => {
    if (newName.trim() && newName !== file.name) {
      onRename(newName.trim());
      toast.success("Renamed successfully");
    }
    setIsRenaming(false);
    setNewName(file.name);
  };

  const handleDownload = async () => {
    if (file.type === "folder") {
      toast.error("Cannot download folders");
      setShowMenu(false);
      return;
    }

    try {
      setShowMenu(false);
      const toastId = `download-${file.id}`;
      toast.loading("Preparing download...", { id: toastId });

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // Use direct download to get proper filename
      const response = await fetch(`/api/files/${file.id}/download?direct=true`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to download file");

      // Get filename from Content-Disposition header or use file.name
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = file.name;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started", { id: toastId });
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleShare = async () => {
    setShowMenu(false);
    setIsShareModalOpen(true);
  };

  const handleSummary = async () => {
    setShowMenu(false);
    setIsSummaryModalOpen(true);
  };

  const handleDelete = () => {
    onDelete();
    toast.success("Moved to trash");
    setShowMenu(false);
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = calculateMenuPosition();
    justOpenedRef.current = true;
    setShowMenu((prev) => !prev);
    if (coords) setMenuCoords(coords);
  };

  // Touch handlers for long-press selection on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsLongPressing(false);
    longPressTriggered.current = false; // Reset the ref
    
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true; // Set ref immediately (sync)
      setIsLongPressing(true);
      // Vibrate for haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      // Trigger selection on long press
      onClick(e as unknown as React.MouseEvent);
    }, 500); // 500ms for long press
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPos.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      
      // Cancel long press if user moved finger significantly (scrolling)
      if (dx > 10 || dy > 10) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    
    // Mobile: Long press toggles selection, tap does nothing (use 3-dot menu for preview)
    // This prevents accidental taps while scrolling
    
    setIsLongPressing(false);
    longPressTriggered.current = false;
    touchStartPos.current = null;
  };

  const handleTouchCancel = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPressing(false);
    touchStartPos.current = null;
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  // Track if we're using touch (to prevent click from firing after touch)
  const isTouchDevice = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    // Skip click handling if this was a touch interaction (touch already handled it)
    if (isTouchDevice.current) {
      isTouchDevice.current = false;
      return;
    }
    // Desktop: normal click to select
    onClick(e);
  };

  const handleDoubleClick = () => {
    // Desktop: double-click to open
    onDoubleClick();
  };

  const handleTouchStartWrapper = (e: React.TouchEvent) => {
    isTouchDevice.current = true;
    handleTouchStart(e);
  };

  // Quick action bar items
  const quickActions = isInTrash
    ? [
        { icon: RotateCcw, label: "Restore", onClick: () => { onRestore?.(); }, color: "text-emerald-500" },
        { icon: Trash2, label: "Delete", onClick: () => { onPermanentDelete?.(); }, color: "text-danger-500" },
      ]
    : [
        { icon: FileText, label: "View Summary", onClick: () => onDetails?.(), color: "text-purple-500", hidden: true, mobileHidden: true },
        { icon: Edit3, label: "Edit", onClick: () => onEdit?.(), color: "text-blue-500", disabled: !isEditableFile(file.name, file.mimeType) },
        { icon: Star, label: file.starred ? "Unstar" : "Star", onClick: onStar, active: file.starred },
        { icon: Download, label: "Download", onClick: handleDownload, disabled: file.type === "folder", mobileHidden: true },
        { icon: Share2, label: "Share", onClick: handleShare, hidden: true, mobileHidden: true },
        { icon: MoreHorizontal, label: "More", onClick: handleMenuToggle, isMenuButton: true },
      ];

  // Grid View
  if (viewMode === "grid") {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -4 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "file-card group relative cursor-pointer",
          "rounded-2xl overflow-hidden",
          "transition-all duration-300 ease-out",
          isSelected && "ring-2 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-surface-900",
          isLongPressing && "scale-95 ring-2 ring-primary-400"
        )}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStartWrapper}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
        {/* Selection Checkbox */}
        <div
          className={cn(
            "absolute top-3 left-3 z-20 pointer-events-auto transition-opacity duration-200",
            (isSelected || isHovered) ? "opacity-100" : "opacity-0"
          )}
          title="Select this file"
        >
          <input 
            type="checkbox"
            checked={isSelected}
            disabled={isInTrash}
            className="w-5 h-5 rounded cursor-pointer accent-primary-500 shadow-sm"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSelect && onSelect(file.id, e.nativeEvent as any)}
          />
        </div>

        {/* Thumbnail / Icon Area */}
        <div className={cn(
          "relative aspect-[4/3] overflow-hidden",
          colors.bg
        )}>
          {file.thumbnail ? (
            <>
              <NextImage
                src={file.thumbnail}
                alt={file.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={isHovered ? { scale: 1.1, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                  "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center",
                  "bg-gradient-to-br shadow-lg",
                  colors.gradient
                )}
              >
                <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <AnimatePresence>
              {file.starred && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-7 h-7 rounded-full bg-amber-400 shadow-lg flex items-center justify-center"
                >
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-1.5 z-10">
            {/* Mobile-only more button - always visible */}
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="lg:hidden w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white/95 dark:bg-surface-800/95 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-surface-700 transition-colors border border-surface-200/50 dark:border-surface-700/50"
            >
              <MoreHorizontal className="w-4 h-4 text-surface-600 dark:text-surface-300" />
            </button>
            {file.shared && (
              <div className="w-7 h-7 rounded-full bg-primary-500 shadow-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Quick Action Bar - appears on hover on desktop, always visible on mobile */}
          <AnimatePresence>
            {(isHovered || isSelected) && !isRenaming && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-2 left-2 right-2"
              >
                <div className="flex items-center justify-center gap-1.5 p-2 sm:p-2.5 rounded-2xl bg-white/95 dark:bg-surface-800/95 backdrop-blur-sm shadow-xl border border-surface-200/50 dark:border-surface-700/50">
                  {quickActions.map((action, idx) => {
                    const ActionIcon = action.icon;
                    const isMenuBtn = (action as any).isMenuButton;
                    return (
                      !(action as any).hidden && (
                      <div key={idx} className={cn((action as any).mobileHidden && "hidden sm:block")}>
                        <Tooltip content={action.label} side="top">
                          <button
                            ref={isMenuBtn ? menuButtonRef : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(e);
                            }}
                            disabled={(action as any).disabled}
                            className={cn(
                              "w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-xl transition-all duration-150",
                              "hover:bg-surface-100 dark:hover:bg-surface-700",
                              "disabled:opacity-40 disabled:cursor-not-allowed",
                              (action as any).color,
                              (action as any).active ? "text-amber-500 hover:text-amber-600" : "text-surface-600 hover:text-surface-900"
                            )}
                          >
                            <ActionIcon
                              className={cn(
                                "w-4 h-4",
                                (action as any).active && "fill-amber-500",
                                (action as any).color
                              )}
                            />
                          </button>
                        </Tooltip>
                      </div>
                      )
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* File Info */}
        <div className="p-3 sm:p-4 bg-white dark:bg-surface-800/50">
          <div className="space-y-1.5">
            {isRenaming ? (
              <div className="flex items-center gap-1.5">
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
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    "flex-1 px-2 py-1 text-sm font-medium rounded-lg",
                    "bg-surface-100 dark:bg-surface-700",
                    "border-2 border-primary-500",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  )}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRename(); }}
                  className="p-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setNewName(file.name); setIsRenaming(false); }}
                  className="p-1.5 rounded-lg bg-surface-200 dark:bg-surface-600 hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <h3 className="text-sm font-medium text-surface-900 dark:text-white truncate leading-tight">
                {file.name}
              </h3>
            )}
            
            {/* AI Tags display in Grid View */}
            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {file.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 truncate max-w-[60px]">
                    {tag}
                  </span>
                ))}
                {file.tags.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400">
                    +{file.tags.length - 2}
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 mt-1">
              <span>{formatDate(file.modified)}</span>
              {file.size > 0 && (
                <>
                  <span className="text-surface-300 dark:text-surface-600">•</span>
                  <span>{formatFileSize(file.size)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-2 left-2 w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center shadow-lg z-10"
            >
              <Check className="w-3.5 h-3.5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu */}
        {showMenu && menuCoords && typeof window !== "undefined" && createPortal(
          <ContextMenu
            menuRef={menuRef}
            menuCoords={menuCoords}
            file={file}
            isInTrash={isInTrash}
            onClose={() => setShowMenu(false)}
            onStar={onStar}
            onRename={() => { setIsRenaming(true); setShowMenu(false); }}
            onEditContent={onEdit}
            onShare={handleShare}
            onSummary={handleSummary}
            onDownload={handleDownload}
            onDelete={handleDelete}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
            onPreview={onPreview}
            onDetails={onDetails}
          />,
          document.body
        )}

        {/* Share Modal */}
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          file={file}
        />

        {/* Summary Modal */}
        <SummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => setIsSummaryModalOpen(false)}
          file={file}
        />
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "file-card group relative cursor-pointer",
        "flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl",
        "transition-all duration-200",
        isSelected && "ring-2 ring-primary-500 bg-primary-50/50 dark:bg-primary-950/20"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0",
        "bg-gradient-to-br shadow-sm",
        colors.gradient
      )}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <div className="flex items-center gap-2">
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
              onClick={(e) => e.stopPropagation()}
              className="flex-1 px-2 py-1 text-sm font-medium bg-surface-100 dark:bg-surface-700 rounded-lg border-2 border-primary-500 focus:outline-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleRename(); }}
              className="p-1.5 rounded-lg bg-primary-500 text-white"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-medium text-surface-900 dark:text-white truncate">
              {file.name}
            </h3>
            <div className="flex items-center gap-2 sm:gap-3 text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              <span>{formatDate(file.modified)}</span>
              {file.size > 0 && <span className="hidden sm:inline">{formatFileSize(file.size)}</span>}
            </div>
          </>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        {file.starred && (
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
        )}
        {file.shared && (
          <Users className="w-4 h-4 text-primary-500" />
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        "flex items-center gap-1.5 transition-opacity duration-200",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {quickActions.slice(0, -1).map((action, idx) => {
          const ActionIcon = action.icon;
          return (
            <Tooltip key={idx} content={action.label} side="top">
              <button
                onClick={(e) => { e.stopPropagation(); action.onClick(e); }}
                disabled={(action as any).disabled}
                className={cn(
                  "w-9 h-9 flex items-center justify-center rounded-xl transition-colors",
                  "hover:bg-surface-100 dark:hover:bg-surface-700",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <ActionIcon
                  className={cn(
                    "w-4 h-4 text-surface-500",
                    (action as any).active && "text-amber-500 fill-amber-500"
                  )}
                />
              </button>
            </Tooltip>
          );
        })}
        <button
          ref={menuButtonRef}
          onClick={handleMenuToggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700"
        >
          <MoreHorizontal className="w-4 h-4 text-surface-500" />
        </button>
      </div>

      {/* Context Menu */}
      {showMenu && menuCoords && typeof window !== "undefined" && createPortal(
        <ContextMenu
          menuRef={menuRef}
          menuCoords={menuCoords}
          file={file}
          isInTrash={isInTrash}
          onClose={() => setShowMenu(false)}
          onStar={onStar}
          onRename={() => { setIsRenaming(true); setShowMenu(false); }}
          onShare={handleShare}
          onSummary={handleSummary}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onRestore={onRestore}
          onPermanentDelete={onPermanentDelete}
          onPreview={onPreview}
          onDetails={onDetails}
        />,
        document.body
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        file={file}
      />

      {/* Summary Modal */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        file={file}
      />
    </motion.div>
  );
});

FileCard.displayName = "FileCard";

// Context Menu Component
interface ContextMenuProps {
  menuRef: React.RefObject<HTMLDivElement>;
  menuCoords: { top: number; right: number };
  file: FileItem;
  isInTrash: boolean;
  onClose: () => void;
  onStar: () => void;
  onRename: () => void;
  onEditContent?: () => void;
  onShare: () => void;
  onSummary: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  onPreview?: () => void;
  onDetails?: () => void;
}

function ContextMenu({
  menuRef,
  menuCoords,
  file,
  isInTrash,
  onClose,
  onStar,
  onRename,
  onEditContent,
  onShare,
  onSummary,
  onDownload,
  onDelete,
  onRestore,
  onPermanentDelete,
  onDetails,
  onPreview,
}: ContextMenuProps) {
  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        position: "fixed",
        top: menuCoords.top,
        right: menuCoords.right,
        maxHeight: "calc(100vh - 16px)",
        maxWidth: "calc(100vw - 16px)",
      }}
      className="w-52 sm:w-56 dropdown-menu p-1.5 z-[100] overflow-y-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {isInTrash ? (
        <>
          <MenuItem
            icon={RotateCcw}
            label="Restore"
            iconColor="text-emerald-500"
            onClick={() => { onRestore?.(); onClose(); }}
          />
          <div className="dropdown-divider" />
          <MenuItem
            icon={Trash2}
            label="Delete forever"
            variant="danger"
            onClick={() => { onPermanentDelete?.(); onClose(); }}
          />
        </>
      ) : (
        <>
          {onPreview && file.type !== "folder" && (
            <MenuItem
              icon={ExternalLink}
              label="Preview"
              onClick={() => { onPreview(); onClose(); }}
            />
          )}
          <MenuItem
            icon={Star}
            label={file.starred ? "Remove star" : "Add star"}
            iconColor={file.starred ? "text-amber-500" : undefined}
            iconFill={file.starred}
            onClick={() => { onStar(); onClose(); }}
          />
          <MenuItem
            icon={Edit3}
            label="Rename"
            shortcut="F2"
            onClick={onRename}
          />
          <MenuItem
            icon={Edit3}
            label="Edit content"
              disabled={!isEditableFile(file.name, file.mimeType)}
            onClick={() => { onEditContent?.(); onClose(); }}
          />
          <MenuItem
            icon={Sparkles}
            label="AI Summary"
            iconColor="text-purple-500"
            disabled={file.type === "folder"}
            onClick={() => { onSummary(); onClose(); }}
          />
          <MenuItem
            icon={Share2}
            label="Share"
            onClick={() => { onShare(); onClose(); }}
          />
          <MenuItem
            icon={Download}
            label="Download"
            disabled={file.type === "folder"}
            onClick={() => { onDownload(); }}
          />
          <MenuItem
            icon={Copy}
            label="Copy link"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
              toast.success("Link copied!");
              onClose();
            }}
          />
          <MenuItem
            icon={Info}
            label="Details"
            onClick={() => {
              onDetails?.();
              onClose();
            }}
          />
          <div className="dropdown-divider" />
          <MenuItem
            icon={Trash2}
            label="Move to trash"
            variant="danger"
            shortcut="Del"
            onClick={onDelete}
          />
        </>
      )}
    </motion.div>
  );
}

// Menu Item Component
interface MenuItemProps {
  icon: typeof File;
  label: string;
  shortcut?: string;
  iconColor?: string;
  iconFill?: boolean;
  variant?: "default" | "danger";
  disabled?: boolean;
  onClick: () => void;
}

function MenuItem({
  icon: Icon,
  label,
  shortcut,
  iconColor,
  iconFill,
  variant = "default",
  disabled,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant === "danger"
          ? "dropdown-item-danger"
          : "dropdown-item"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4",
          variant === "danger" ? "" : iconColor || "text-surface-400",
          iconFill && "fill-current"
        )}
      />
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <kbd className="kbd text-[10px]">{shortcut}</kbd>
      )}
    </button>
  );
}
