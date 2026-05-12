"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Star,
  Download,
  Trash2,
  Share2,
  Edit3,
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
  Info,
  MoreHorizontal,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { FileItem } from "@/types";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import { ShareModal } from "@/components/modals/ShareModal";
import { SummaryModal } from "@/components/modals/SummaryModal";
import { getFileColors } from "./FileCard";
import { isEditableFile } from "@/lib/utils";
import toast from "react-hot-toast";

interface FileListItemProps {
  file: FileItem;
  isSelected: boolean;
  onSelect?: (id: string, event?: any) => void;
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

export const FileListItem = React.forwardRef<HTMLDivElement, FileListItemProps>(({
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
}, ref) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [menuRightPos, setMenuRightPos] = useState<number>(0);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressTriggered = useRef(false); // Use ref for immediate sync check
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const Icon = fileTypeIcons[file.type];
  const colors = getFileColors(file);

  // Calculate menu position based on available space
  const calculateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 300; // Increased to account for all menu items
      const menuWidth = 208; // w-52 = 13rem = 208px
      
      // Vertical positioning
      const position = spaceBelow < menuHeight ? 'top' : 'bottom';
      setMenuPosition(position);
      
      // Calculate horizontal position - ensure menu doesn't go off screen
      let right = window.innerWidth - rect.right;
      
      // If menu would go off the left edge, adjust position
      if (window.innerWidth - right < menuWidth + 8) {
        right = Math.max(8, window.innerWidth - menuWidth - 8);
      }
      
      // Ensure minimum margin from right edge
      right = Math.max(8, right);
      
      setMenuRightPos(right);
      return { right, position };
    }
    return null;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group grid grid-cols-12 gap-4 px-4 py-3.5 items-center cursor-pointer",
        "border-b border-surface-100/80 dark:border-surface-800/50 last:border-0",
        "transition-all duration-150",
        isSelected
          ? "bg-primary-50/80 dark:bg-primary-500/10"
          : "hover:bg-surface-50 dark:hover:bg-surface-800/30",
        isLongPressing && "bg-primary-100/80 dark:bg-primary-500/20"
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
          "w-8 flex items-center justify-center flex-shrink-0 transition-opacity duration-200",
          (isSelected || isHovered) ? "opacity-100" : "opacity-0"
        )}
        title="Select this file"
      >
        <input
          type="checkbox"
          checked={isSelected}
          disabled={isInTrash}
          className="w-4 h-4 rounded cursor-pointer accent-primary-500"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onSelect && onSelect(file.id, e.nativeEvent as any)}
        />
      </div>

      {/* Name Column */}
      <div className="col-span-5 sm:col-span-6 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
            colors.bg
          )}
        >
          <Icon className={cn("w-5 h-5", colors.icon)} />
        </div>
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
              className="w-full px-2 py-1 text-sm font-medium bg-white dark:bg-surface-700 rounded-lg border border-primary-500 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {file.name}
                </span>
                {file.starred && (
                  <Star className="flex-shrink-0 w-4 h-4 text-amber-400 fill-amber-400" />
                )}
                {file.shared && (
                  <Users className="flex-shrink-0 w-4 h-4 text-primary-500" />
                )}
              </div>
              
              {/* AI Tags display in List View */}
              {!isRenaming && file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 max-w-[80px] truncate">
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400">
                      +{file.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modified Column */}
      <div className="col-span-3 sm:col-span-2 hidden sm:block">
        <span className="text-sm text-surface-500">{formatDate(file.modified)}</span>
      </div>

      {/* Size Column */}
      <div className="col-span-2 hidden sm:block">
        <span className="text-sm text-surface-500">
          {file.type === "folder" ? "—" : formatFileSize(file.size)}
        </span>
      </div>

      {/* Actions Column */}
      <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1">
        {onDetails && file.type !== "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
            title="View AI Summary"
            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200"
          >
            <FileText className="w-4 h-4 text-purple-500 hover:text-purple-600 dark:hover:text-purple-400" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          disabled={!isEditableFile(file.name, file.mimeType)}
          className="p-2 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Edit3 className="w-4 h-4 text-blue-500" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar();
          }}
          className={cn(
            "p-2 rounded-lg transition-all duration-200",
            "opacity-0 group-hover:opacity-100",
            "hover:bg-surface-100 dark:hover:bg-surface-700",
            file.starred && "opacity-100"
          )}
        >
          <Star
            className={cn(
              "w-4 h-4",
              file.starred
                ? "text-amber-400 fill-amber-400"
                : "text-surface-400 hover:text-amber-400"
            )}
          />
        </button>

        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (file.type === 'folder') {
              toast.error("Cannot download folders");
              return;
            }
            try {
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
              if (!response.ok) throw new Error("Failed to get download URL");
              const { downloadUrl } = await response.json();
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
          }}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200"
        >
          <Download className="w-4 h-4 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300" />
        </button>

        {/* More Menu */}
        <div className="relative" ref={menuRef}>
          <button
            ref={menuButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              calculateMenuPosition();
              setShowMenu(!showMenu);
            }}
            className={cn(
              "p-2.5 sm:p-2 rounded-lg transition-all duration-200",
              "hover:bg-surface-100 dark:hover:bg-surface-700",
              // Always visible on mobile, hover-visible on desktop
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              showMenu && "opacity-100 bg-surface-100 dark:bg-surface-700"
            )}
          >
            <MoreVertical className="w-5 h-5 sm:w-4 sm:h-4 text-surface-500" />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'fixed',
                top: menuButtonRef.current ? 
                  (menuPosition === 'bottom' 
                    ? menuButtonRef.current.getBoundingClientRect().bottom + 4
                    : menuButtonRef.current.getBoundingClientRect().top - 4) 
                  : 0,
                right: menuRightPos,
                transform: menuPosition === 'top' ? 'translateY(-100%)' : 'none',
              }}
              className="w-52 bg-white dark:bg-[#1c2128] rounded-xl shadow-xl border border-surface-200/80 dark:border-surface-700/60 py-1.5 z-[100] max-h-[60vh] overflow-y-auto"
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
                  {onPreview && file.type !== "folder" && (
                    <button
                      onClick={() => {
                        onPreview();
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-surface-400" />
                      Preview
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onEdit?.();
                      setShowMenu(false);
                    }}
                    disabled={!isEditableFile(file.name, file.mimeType)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Edit3 className="w-4 h-4 text-blue-500" />
                    Edit
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
                    onClick={() => {
                      setIsShareModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-surface-400" />
                    Share
                  </button>
                  {file.type !== "folder" && (
                    <button
                      onClick={() => {
                        setIsSummaryModalOpen(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      AI Summary
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDetails?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                  >
                    <Info className="w-4 h-4 text-surface-400" />
                    Details
                  </button>
                  <div className="h-px bg-surface-200 dark:bg-surface-700/60 my-1.5 mx-2" />
                  <button
                    onClick={() => {
                      onDelete();
                      toast.success("Moved to trash");
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Move to trash
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
});

FileListItem.displayName = "FileListItem";
