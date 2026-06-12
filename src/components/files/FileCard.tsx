"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  csv: { bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-emerald-600" },
  xlsx: { bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-emerald-600" },
  xls: { bg: "bg-emerald-50 dark:bg-emerald-950/20", icon: "text-emerald-600 dark:text-emerald-400", gradient: "from-emerald-500 to-emerald-600" },
  pdf: { bg: "bg-red-50 dark:bg-red-950/20", icon: "text-red-600 dark:text-red-400", gradient: "from-red-500 to-red-600" },
  pptx: { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-600 dark:text-amber-450", gradient: "from-amber-500 to-amber-600" },
  ppt: { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-600 dark:text-amber-455", gradient: "from-amber-500 to-amber-600" },
  doc: { bg: "bg-blue-50 dark:bg-blue-950/20", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  docx: { bg: "bg-blue-50 dark:bg-blue-950/20", icon: "text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-blue-600" },
  txt: { bg: "bg-slate-50 dark:bg-slate-900/40", icon: "text-slate-655 text-slate-500 dark:text-slate-400", gradient: "from-slate-400 to-slate-500" },
  rtf: { bg: "bg-sky-50 dark:bg-sky-950/20", icon: "text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-sky-600" },
  odt: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  jpg: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  jpeg: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  png: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  gif: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  svg: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  webp: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  ico: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  bmp: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  mp4: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  mov: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  avi: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  mkv: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  webm: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  wmv: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  flv: { bg: "bg-rose-50 dark:bg-rose-950/20", icon: "text-rose-600 dark:text-rose-455", gradient: "from-rose-500 to-rose-600" },
  mp3: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  wav: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  ogg: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  flac: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  aac: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  m4a: { bg: "bg-cyan-50 dark:bg-cyan-950/20", icon: "text-cyan-600 dark:text-cyan-400", gradient: "from-cyan-500 to-cyan-600" },
  zip: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-655 text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  rar: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  "7z": { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  tar: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  gz: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  js: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  ts: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  jsx: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  tsx: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  py: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  java: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  cpp: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  c: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  html: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  css: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  json: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  xml: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-650" },
  md: { bg: "bg-slate-50 dark:bg-slate-900/40", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-400 to-slate-500" },
  sql: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  php: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  rb: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  go: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  rs: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  swift: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  kt: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-655" },
  exe: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  msi: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  dmg: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  iso: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-500 dark:text-slate-400", gradient: "from-slate-500 to-slate-600" },
  psd: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-650 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  ai: { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-600 dark:text-amber-450", gradient: "from-amber-500 to-amber-600" },
  sketch: { bg: "bg-amber-50 dark:bg-amber-950/20", icon: "text-amber-600 dark:text-amber-450", gradient: "from-amber-500 to-amber-600" },
  figma: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
  xd: { bg: "bg-indigo-50 dark:bg-indigo-950/20", icon: "text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-indigo-600" },
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
    bg: "bg-indigo-50/50 dark:bg-indigo-950/25",
    icon: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-indigo-600",
  },
  document: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    icon: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-650",
  },
  spreadsheet: {
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    icon: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-emerald-650",
  },
  presentation: {
    bg: "bg-amber-50 dark:bg-amber-950/20",
    icon: "text-amber-605 dark:text-amber-400",
    gradient: "from-amber-500 to-amber-650",
  },
  pdf: {
    bg: "bg-red-50 dark:bg-red-950/20",
    icon: "text-red-655 text-red-600 dark:text-red-400",
    gradient: "from-red-500 to-red-600",
  },
  image: {
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    icon: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-indigo-650",
  },
  video: {
    bg: "bg-rose-50 dark:bg-rose-950/20",
    icon: "text-rose-600 dark:text-rose-455",
    gradient: "from-rose-500 to-rose-650",
  },
  audio: {
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    icon: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-cyan-650",
  },
  archive: {
    bg: "bg-slate-100 dark:bg-slate-800/50",
    icon: "text-slate-655 text-slate-500 dark:text-slate-400",
    gradient: "from-slate-500 to-slate-600",
  },
  file: {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    icon: "text-slate-500 dark:text-slate-400",
    gradient: "from-slate-400 to-slate-500",
  },
};

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
  const longPressTriggered = useRef(false);
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
      const menuHeight = 350;
      const menuWidth = 208;
      
      let top: number;
      if (spaceBelow >= menuHeight) {
        top = rect.bottom + 4;
      } else if (spaceAbove >= menuHeight) {
        top = rect.top - menuHeight - 4;
      } else {
        if (spaceBelow > spaceAbove) {
          top = Math.min(rect.bottom + 4, window.innerHeight - menuHeight - 8);
        } else {
          top = Math.max(8, rect.top - menuHeight - 4);
        }
      }
      
      top = Math.max(8, top);
      let right = window.innerWidth - rect.right;
      if (window.innerWidth - right < menuWidth + 8) {
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

      const response = await fetch(`/api/files/${file.id}/download?direct=true`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to download file");

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

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
    setIsLongPressing(false);
    longPressTriggered.current = false;
    
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setIsLongPressing(true);
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      onClick(e as unknown as React.MouseEvent);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartPos.current) {
      const touch = e.touches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);
      
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

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, []);

  const isTouchDevice = useRef(false);

  const handleClick = (e: React.MouseEvent) => {
    if (isTouchDevice.current) {
      isTouchDevice.current = false;
      return;
    }
    onClick(e);
  };

  const handleDoubleClick = () => {
    onDoubleClick();
  };

  const handleTouchStartWrapper = (e: React.TouchEvent) => {
    isTouchDevice.current = true;
    handleTouchStart(e);
  };

  const quickActions = isInTrash
    ? [
        { icon: RotateCcw, label: "Restore", onClick: () => { onRestore?.(); }, color: "text-emerald-500" },
        { icon: Trash2, label: "Delete", onClick: () => { onPermanentDelete?.(); }, color: "text-red-500" },
      ]
    : [
        { icon: FileText, label: "View Summary", onClick: () => onDetails?.(), color: "text-purple-500", hidden: true, mobileHidden: true },
        { icon: Edit3, label: "Edit", onClick: () => onEdit?.(), color: "text-blue-500", disabled: !isEditableFile(file.name, file.mimeType) },
        { icon: Star, label: file.starred ? "Unstar" : "Star", onClick: onStar, active: file.starred },
        { icon: Download, label: "Download", onClick: handleDownload, disabled: file.type === "folder", mobileHidden: true },
        { icon: Share2, label: "Share", onClick: handleShare, hidden: true, mobileHidden: true },
        { icon: MoreHorizontal, label: "More Actions", onClick: handleMenuToggle, isMenuButton: true },
      ];

  // Grid View
  if (viewMode === "grid") {
    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        whileHover={{ y: -2 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={cn(
          "file-card group relative cursor-pointer",
          "rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800",
          "bg-white dark:bg-slate-900 shadow-sm",
          "transition-all duration-150 hover:shadow hover:border-slate-300 dark:hover:border-slate-700",
          isSelected && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-950",
          isLongPressing && "scale-[0.98] ring-2 ring-indigo-400"
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
            "absolute top-2.5 left-2.5 z-20 pointer-events-auto transition-opacity duration-150",
            (isSelected || isHovered) ? "opacity-100" : "opacity-0"
          )}
          title="Select file"
        >
          <input 
            type="checkbox"
            checked={isSelected}
            disabled={isInTrash}
            className="w-4.5 h-4.5 rounded cursor-pointer accent-indigo-600 shadow-sm"
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
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <motion.div
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center shadow-sm text-white bg-gradient-to-br",
                  colors.gradient
                )}
              >
                <Icon className="w-5 h-5 text-white" />
              </motion.div>
            </div>
          )}

          {/* Star Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
            <AnimatePresence>
              {file.starred && !isSelected && !isHovered && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="w-5 h-5 rounded-full bg-amber-450 dark:bg-amber-500 shadow flex items-center justify-center text-white"
                >
                  <Star className="w-3 h-3 fill-current text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
            <button
              ref={menuButtonRef}
              onClick={handleMenuToggle}
              className="lg:hidden w-7 h-7 rounded-full bg-white/95 dark:bg-slate-800/95 shadow flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-750"
            >
              <MoreHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </button>
            {file.shared && (
              <div className="w-6 h-6 rounded-full bg-indigo-650 dark:bg-indigo-500 shadow flex items-center justify-center text-white">
                <Users className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          {/* Quick Action Overlay (Desktop) */}
          <AnimatePresence>
            {(isHovered || isSelected) && !isRenaming && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.1 }}
                className="absolute bottom-2 left-2 right-2 hidden lg:block"
              >
                <div className="flex items-center justify-center gap-1 p-1 rounded-lg bg-white/95 dark:bg-slate-900/95 shadow-lg border border-slate-200 dark:border-slate-800">
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
                                "w-7 h-7 flex items-center justify-center rounded transition-all duration-150",
                                "hover:bg-slate-100 dark:hover:bg-slate-800",
                                "disabled:opacity-40 disabled:cursor-not-allowed",
                                (action as any).active ? "text-amber-500" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                              )}
                            >
                              <ActionIcon className={cn("w-3.5 h-3.5", (action as any).active && "fill-amber-500")} />
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
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/60">
          <div className="space-y-1">
            {isRenaming ? (
              <div className="flex items-center gap-1">
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
                  className="flex-1 px-1.5 py-0.5 text-xs font-semibold rounded border border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleRename(); }}
                  className="p-1 rounded bg-indigo-650 hover:bg-indigo-700 text-white transition-colors"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-snug">
                {file.name}
              </h3>
            )}
            
            {/* AI Tags */}
            {file.tags && file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-0.5">
                {file.tags.slice(0, 2).map((tag, i) => (
                  <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 truncate max-w-[65px]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
              <span>{formatDate(file.modified)}</span>
              {file.size > 0 && (
                <>
                  <span>•</span>
                  <span>{formatFileSize(file.size)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute top-2.5 left-2.5 w-4.5 h-4.5 rounded bg-indigo-600 flex items-center justify-center shadow z-10 text-white"
            >
              <Check className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Context Menu Portal */}
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

        <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} file={file} />
        <SummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} file={file} />
      </motion.div>
    );
  }

  // List View (As fallback)
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      transition={{ duration: 0.15 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "file-card group relative cursor-pointer",
        "flex items-center gap-3 px-4 py-2 rounded-md",
        "transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40",
        isSelected && "bg-indigo-50/50 dark:bg-indigo-950/20"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white bg-gradient-to-br",
        colors.gradient
      )}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <div className="flex items-center gap-1">
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
              className="flex-1 px-1.5 py-0.5 text-xs font-semibold rounded border border-indigo-500 bg-slate-50 dark:bg-slate-800 focus:outline-none"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleRename(); }}
              className="p-1 rounded bg-indigo-650 text-white"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {file.name}
            </h3>
            <div className="flex items-center gap-2 text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
              <span>{formatDate(file.modified)}</span>
              {file.size > 0 && <span>• {formatFileSize(file.size)}</span>}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {file.starred && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
        {file.shared && <Users className="w-3.5 h-3.5 text-indigo-500" />}
      </div>

      <div className={cn(
        "flex items-center gap-1 transition-opacity duration-150",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        {quickActions.slice(0, -1).map((action, idx) => {
          const ActionIcon = action.icon;
          return (
            <Tooltip key={idx} content={action.label} side="top">
              <button
                onClick={(e) => { e.stopPropagation(); action.onClick(e); }}
                disabled={(action as any).disabled}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              >
                <ActionIcon className={cn("w-3.5 h-3.5 text-slate-400", (action as any).active && "text-amber-500 fill-amber-500")} />
              </button>
            </Tooltip>
          );
        })}
        <button
          ref={menuButtonRef}
          onClick={handleMenuToggle}
          className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

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

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} file={file} />
      <SummaryModal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} file={file} />
    </motion.div>
  );
});

FileCard.displayName = "FileCard";

interface ContextMenuProps {
  menuRef: React.RefObject<HTMLDivElement>;
  menuCoords: { top: number; right: number };
  file: FileItem;
  isInTrash?: boolean;
  onClose: () => void;
  onStar?: () => void;
  onRename: () => void;
  onEditContent?: () => void;
  onShare: () => void;
  onSummary: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  onDetails?: () => void;
  onPreview?: () => void;
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
      initial={{ opacity: 0, scale: 0.98, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.1 }}
      style={{
        position: "fixed",
        top: menuCoords.top,
        right: menuCoords.right,
        maxHeight: "calc(100vh - 16px)",
        maxWidth: "calc(100vw - 16px)",
      }}
      className="w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-1 z-[100] overflow-y-auto"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {isInTrash ? (
        <>
          <MenuItem
            icon={RotateCcw}
            label="Restore file"
            iconColor="text-emerald-500"
            onClick={() => { onRestore?.(); onClose(); }}
          />
          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
          <MenuItem
            icon={Trash2}
            label="Delete permanently"
            variant="danger"
            onClick={() => { onPermanentDelete?.(); onClose(); }}
          />
        </>
      ) : (
        <>
          {onPreview && file.type !== "folder" && (
            <MenuItem
              icon={ExternalLink}
              label="Preview file"
              onClick={() => { onPreview(); onClose(); }}
            />
          )}
          <MenuItem
            icon={Star}
            label={file.starred ? "Remove star" : "Star file"}
            iconColor={file.starred ? "text-amber-500" : undefined}
            iconFill={file.starred}
            onClick={() => { onStar?.(); onClose(); }}
          />
          <MenuItem
            icon={Edit3}
            label="Rename item"
            shortcut="F2"
            onClick={onRename}
          />
          <MenuItem
            icon={Edit3}
            label="Edit contents"
            disabled={!isEditableFile(file.name, file.mimeType)}
            onClick={() => { onEditContent?.(); onClose(); }}
          />
          <MenuItem
            icon={Sparkles}
            label="Generate summary"
            iconColor="text-purple-500"
            disabled={file.type === "folder"}
            onClick={() => { onSummary(); onClose(); }}
          />
          <MenuItem
            icon={Share2}
            label="Share link"
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
            label="Copy share link"
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
              toast.success("Link copied!");
              onClose();
            }}
          />
          <MenuItem
            icon={Info}
            label="View details"
            onClick={() => {
              onDetails?.();
              onClose();
            }}
          />
          <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
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
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors text-left",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        variant === "danger"
          ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
          : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800/60"
      )}
    >
      <Icon
        className={cn(
          "w-3.5 h-3.5 flex-shrink-0",
          variant === "danger" ? "" : iconColor || "text-slate-400",
          iconFill && "fill-current"
        )}
      />
      <span className="flex-1 truncate">{label}</span>
      {shortcut && (
        <kbd className="hidden sm:inline-block px-1 text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded leading-none">{shortcut}</kbd>
      )}
    </button>
  );
}
