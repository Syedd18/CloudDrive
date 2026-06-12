"use client";

import React, { useState, useRef, useEffect } from "react";
import {
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
  MoreVertical,
  ExternalLink,
  Sparkles,
  Check,
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
  const longPressTriggered = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const Icon = fileTypeIcons[file.type];
  const colors = getFileColors(file);

  const calculateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 300;
      const menuWidth = 208;
      
      const position = spaceBelow < menuHeight ? 'top' : 'bottom';
      setMenuPosition(position);
      
      let right = window.innerWidth - rect.right;
      if (window.innerWidth - right < menuWidth + 8) {
        right = Math.max(8, window.innerWidth - menuWidth - 8);
      }
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

  return (
    <div
      ref={ref}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group grid grid-cols-12 gap-4 px-4 py-2.5 items-center cursor-pointer",
        "border-b border-slate-100 dark:border-slate-800/80 last:border-0",
        "transition-all duration-150",
        isSelected
          ? "bg-indigo-50/50 dark:bg-indigo-950/20"
          : "hover:bg-slate-50/60 dark:hover:bg-slate-900/30",
        isLongPressing && "bg-indigo-100/50 dark:bg-indigo-950/30"
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
          "w-8 flex items-center justify-center flex-shrink-0 transition-opacity duration-150",
          (isSelected || isHovered) ? "opacity-100" : "opacity-0"
        )}
        title="Select file"
      >
        <input
          type="checkbox"
          checked={isSelected}
          disabled={isInTrash}
          className="w-4 h-4 rounded cursor-pointer accent-indigo-600"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onSelect && onSelect(file.id, e.nativeEvent as any)}
        />
      </div>

      {/* Name Column */}
      <div className="col-span-5 sm:col-span-6 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white bg-gradient-to-br",
            colors.gradient
          )}
        >
          <Icon className="w-4 h-4 text-white" />
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
              className="w-full px-2 py-0.5 text-xs font-semibold rounded border border-indigo-500 bg-slate-50 dark:bg-slate-805 dark:bg-slate-800 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </span>
                {file.starred && (
                  <Star className="flex-shrink-0 w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                )}
                {file.shared && (
                  <Users className="flex-shrink-0 w-3.5 h-3.5 text-indigo-500" />
                )}
              </div>
              
              {/* AI Tags */}
              {!isRenaming && file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {file.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 max-w-[80px] truncate">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modified Column */}
      <div className="col-span-3 sm:col-span-2 hidden sm:block">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{formatDate(file.modified)}</span>
      </div>

      {/* Size Column */}
      <div className="col-span-2 hidden sm:block">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {file.type === "folder" ? "—" : formatFileSize(file.size)}
        </span>
      </div>

      {/* Actions Column */}
      <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-0.5">
        {onDetails && file.type !== "folder" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
            title="View AI Summary"
            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
          >
            <FileText className="w-3.5 h-3.5 text-purple-500" />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          disabled={!isEditableFile(file.name, file.mimeType)}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-500" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar();
          }}
          className={cn(
            "p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
            file.starred ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          <Star
            className={cn(
              "w-3.5 h-3.5",
              file.starred
                ? "text-amber-500 fill-amber-500"
                : "text-slate-400"
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
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Download className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
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
              "p-1.5 rounded transition-all duration-150",
              "hover:bg-slate-100 dark:hover:bg-slate-800",
              "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
              showMenu && "opacity-100 bg-slate-100 dark:bg-slate-800"
            )}
          >
            <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
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
              className="w-52 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-1 z-[100] max-h-[60vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {isInTrash ? (
                <>
                  <button
                    onClick={() => {
                      onRestore?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Restore</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-805 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      onPermanentDelete?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-red-655 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete forever</span>
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
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400" />
                      <span>Preview</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onEdit?.();
                      setShowMenu(false);
                    }}
                    disabled={!isEditableFile(file.name, file.mimeType)}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsRenaming(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsShareModalOpen(true);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share</span>
                  </button>
                  {file.type !== "folder" && (
                    <button
                      onClick={() => {
                        setIsSummaryModalOpen(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-purple-650 dark:text-purple-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                      <span>AI Summary</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onDetails?.();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>Details</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      onDelete();
                      toast.success("Moved to trash");
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-semibold text-red-655 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Move to trash</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        file={file}
      />
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        file={file}
      />
    </div>
  );
});

FileListItem.displayName = "FileListItem";
