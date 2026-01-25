"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { FileItem } from "@/types";
import { cn, formatFileSize, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface FileListItemProps {
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
  folder: "text-amber-500",
  document: "text-blue-500",
  spreadsheet: "text-emerald-500",
  presentation: "text-orange-500",
  pdf: "text-red-500",
  image: "text-purple-500",
  video: "text-pink-500",
  audio: "text-cyan-500",
  archive: "text-gray-500",
  file: "text-surface-500",
};

export function FileListItem({
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
}: FileListItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<'top' | 'bottom'>('bottom');
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(file.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const Icon = fileTypeIcons[file.type];

  // Calculate menu position based on available space
  const calculateMenuPosition = () => {
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 180; // Approximate menu height
      setMenuPosition(spaceBelow < menuHeight ? 'top' : 'bottom');
    }
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

  return (
    <div
      className={cn(
        "group grid grid-cols-12 gap-4 px-4 py-3.5 items-center cursor-pointer",
        "border-b border-surface-100/80 dark:border-surface-800/50 last:border-0",
        "transition-all duration-150",
        isSelected
          ? "bg-primary-50/80 dark:bg-primary-500/10"
          : "hover:bg-surface-50 dark:hover:bg-surface-800/30"
      )}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      {/* Name Column */}
      <div className="col-span-5 sm:col-span-6 flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-surface-100 dark:bg-surface-800/80"
          )}
        >
          <Icon className={cn("w-5 h-5", fileTypeColors[file.type])} />
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
              "p-2 rounded-lg transition-all duration-200",
              "hover:bg-surface-100 dark:hover:bg-surface-700",
              "opacity-0 group-hover:opacity-100",
              showMenu && "opacity-100"
            )}
          >
            <MoreVertical className="w-4 h-4 text-surface-400" />
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
                right: menuButtonRef.current 
                  ? window.innerWidth - menuButtonRef.current.getBoundingClientRect().right 
                  : 0,
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
                      toast.success("Share link copied");
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-surface-400" />
                    Share
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
    </div>
  );
}
