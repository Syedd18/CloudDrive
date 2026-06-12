"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardDrive,
  Star,
  Clock,
  Trash2,
  Edit3,
  FilePlus,
  Users,
  Plus,
  ChevronLeft,
  FolderPlus,
  Cloud,
  HelpCircle,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { HelpModal } from "@/components/modals/HelpModal";
import { QuickSummarizerModal } from "@/components/modals/QuickSummarizerModal";

interface SidebarProps {
  isOpen: boolean;
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onClose: () => void;
  onUploadClick?: () => void;
  onFolderClick?: () => void;
  onEditorClick?: () => void;
  onCreateFileClick?: () => void;
}

interface StorageInfo {
  used: number;
  total: number;
}

const navItems = [
  { id: "My Files", icon: HardDrive, label: "My Files" },
  { id: "Starred", icon: Star, label: "Starred" },
  { id: "Recent", icon: Clock, label: "Recent" },
  { id: "Shared", icon: Users, label: "Shared with me" },
  { id: "Trash", icon: Trash2, label: "Trash" },
];

export function Sidebar({
  isOpen,
  currentFolder,
  onFolderChange,
  onClose,
  onUploadClick,
  onFolderClick,
  onEditorClick,
  onCreateFileClick,
}: SidebarProps) {
  const [storage, setStorage] = useState<StorageInfo>({ used: 0, total: 15 * 1024 * 1024 * 1024 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isQuickSummarizerOpen, setIsQuickSummarizerOpen] = useState(false);

  useEffect(() => {
    loadStorageInfo();
  }, []);

  const loadStorageInfo = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/storage", {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStorage({
          used: data.storage?.used || 0,
          total: data.storage?.total || 15 * 1024 * 1024 * 1024,
        });
      }
    } catch (error) {
      console.error("Failed to load storage info:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const storagePercentage = Math.min((storage.used / storage.total) * 100, 100);
  const isStorageLow = storagePercentage > 90;
  const isStorageWarning = storagePercentage > 75;

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-40 lg:z-0 w-[240px]",
          "top-0 left-0",
          "bg-slate-50 dark:bg-slate-900/40",
          "border-r border-slate-200 dark:border-slate-800",
          "flex flex-col",
          "transition-transform duration-200 ease-in-out",
          // Mobile: stop above bottom nav (64px + safe area). Desktop: full height
          "h-[calc(100dvh-4rem)] lg:h-[calc(100vh-4rem)]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Header - Close button only */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white">CloudDrive</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Upload Button */}
        <div className="p-4 pb-2 flex-shrink-0">
          <button
            onClick={onUploadClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New File</span>
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-4 flex gap-2 flex-shrink-0">
          <button
            onClick={onFolderClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
            <span>New Folder</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-2 flex-1 overflow-y-auto space-y-6">
          {/* Files section */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Files</p>
            <ul className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentFolder === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => onFolderChange(item.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left",
                        "text-xs font-semibold",
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-4 h-4 flex-shrink-0 transition-colors",
                          isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tools section */}
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Tools</p>
            <ul className="space-y-0.5">
              <li>
                <button
                  onClick={() => setIsQuickSummarizerOpen(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="truncate">AI Summarizer</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onEditorClick}
                  disabled={!onEditorClick}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
                    !onEditorClick && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Edit3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">Workspace Editor</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onCreateFileClick}
                  disabled={!onCreateFileClick}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-150 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200",
                    !onCreateFileClick && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <FilePlus className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="truncate">Create Document</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Storage Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/20 flex-shrink-0">
          <div className="rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-3 shadow-sm">
            {isLoading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Storage</span>
                  <span className="font-bold text-slate-500 dark:text-slate-400">
                    {storagePercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${storagePercentage}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      isStorageLow ? "bg-red-500" : isStorageWarning ? "bg-amber-500" : "bg-indigo-600 dark:bg-indigo-500"
                    )}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{formatFileSize(storage.used)} used</span>
                  <span>{formatFileSize(storage.total)}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Links */}
          <div className="flex items-center gap-1 mt-2.5">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modals */}
      <QuickSummarizerModal
        isOpen={isQuickSummarizerOpen}
        onClose={() => setIsQuickSummarizerOpen(false)}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </>
  );
}
