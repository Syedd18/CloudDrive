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
  FileUp,
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
  { id: "My Files", icon: HardDrive, label: "My Files", color: "text-blue-500" },
  { id: "Starred", icon: Star, label: "Starred", color: "text-amber-500" },
  { id: "Recent", icon: Clock, label: "Recent", color: "text-emerald-500" },
  { id: "Shared", icon: Users, label: "Shared with me", color: "text-purple-500" },
  { id: "Trash", icon: Trash2, label: "Trash", color: "text-surface-500" },
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
          "fixed lg:relative z-50 lg:z-0 w-[280px]",
          "top-0 left-0",
          "bg-white dark:bg-[#0d1117]",
          "border-r border-surface-200/60 dark:border-surface-800/60",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          // Mobile: stop above bottom nav (64px + safe area). Desktop: full height
          "h-[calc(100dvh-4rem)] lg:h-screen",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Mobile Header - Close button only */}
        <div className="lg:hidden flex items-center justify-between p-3 border-b border-surface-200/60 dark:border-surface-800/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-surface-900 dark:text-white">CloudDrive</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Close menu"
          >
            <ChevronLeft className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>
        </div>

        {/* New Button */}
        <div className="px-3 lg:px-4 pt-3 lg:pt-4 pb-2 lg:pb-3 flex-shrink-0">
          <motion.button
            onClick={onUploadClick}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full btn-primary py-3 lg:py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New</span>
          </motion.button>
        </div>

        {/* Quick Actions */}
        <div className="px-3 lg:px-4 pb-3 lg:pb-4 flex gap-2 flex-shrink-0">
          <button
            onClick={onFolderClick}
            className="flex-1 btn-secondary py-2.5 text-sm gap-1.5 hover:border-primary-300 dark:hover:border-primary-700"
          >
            <FolderPlus className="w-4 h-4 text-amber-500" />
            <span>Folder</span>
          </button>
          <button
            onClick={onUploadClick}
            className="flex-1 btn-secondary py-2.5 text-sm gap-1.5 hover:border-primary-300 dark:hover:border-primary-700"
          >
            <FileUp className="w-4 h-4 text-blue-500" />
            <span>Upload</span>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 lg:mx-4 border-t border-surface-200/60 dark:border-surface-800/60 flex-shrink-0" />

        {/* Navigation */}
        <nav className="px-3 py-2">
          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id;

              return (
                <li key={item.id}>
                  <motion.button
                    onClick={() => onFolderChange(item.id)}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 focus-ring",
                      "text-sm font-medium",
                      isActive
                        ? "bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 shadow-sm"
                        : "text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/60"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors flex-shrink-0",
                        isActive ? "text-primary-500" : item.color
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </li>
              );
            })}
            <li>
              <motion.button
                onClick={() => setIsQuickSummarizerOpen(true)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 focus-ring",
                  "text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/60"
                )}
              >
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span className="truncate">Summarize</span>
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={onEditorClick}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 focus-ring",
                  "text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/60",
                  !onEditorClick && "opacity-50 cursor-not-allowed"
                )}
                disabled={!onEditorClick}
              >
                <Edit3 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <span className="truncate">Editor</span>
              </motion.button>
            </li>
            <li>
              <motion.button
                onClick={onCreateFileClick}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 focus-ring",
                  "text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/60",
                  !onCreateFileClick && "opacity-50 cursor-not-allowed"
                )}
                disabled={!onCreateFileClick}
              >
                <FilePlus className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="truncate">New File</span>
              </motion.button>
            </li>
          </ul>
        </nav>

        {/* Spacer to push storage to bottom */}
        <div className="flex-1" />

        {/* Storage Section - Premium Design */}
        <div className="p-3 lg:p-4 mt-auto">
          <div className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent",
            "dark:from-primary-400/15 dark:via-primary-500/10 dark:to-surface-800/50",
            "border border-primary-200/50 dark:border-primary-500/20",
            "p-3 lg:p-4"
          )}>
            {/* Decorative background circles */}
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-primary-400/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary-500/10 rounded-full blur-xl" />
            
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 skeleton rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 skeleton rounded-full w-full" />
                  <div className="h-3 skeleton rounded w-16" />
                </div>
              </div>
            ) : (
              <div className="relative z-10">
                {/* Header with icon */}
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    "shadow-sm",
                    isStorageLow
                      ? "bg-danger-100 dark:bg-danger-500/20"
                      : isStorageWarning
                        ? "bg-warning-100 dark:bg-warning-500/20"
                        : "bg-primary-100 dark:bg-primary-500/20"
                  )}>
                    <Cloud className={cn(
                      "w-5 h-5",
                      isStorageLow ? "text-danger-500" :
                      isStorageWarning ? "text-warning-500" :
                      "text-primary-500"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-semibold text-surface-800 dark:text-surface-200">
                        Storage
                      </span>
                      <span className={cn(
                        "text-xs font-bold px-1.5 py-0.5 rounded-full",
                        isStorageLow
                          ? "bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400"
                          : isStorageWarning
                            ? "bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400"
                            : "bg-primary-100 text-primary-600 dark:bg-primary-500/20 dark:text-primary-400"
                      )}>
                        {storagePercentage < 0.1 && storage.used > 0
                          ? '<0.1'
                          : storagePercentage.toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      {formatFileSize(storage.used)} of {formatFileSize(storage.total)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar - Enhanced */}
                <div className="h-2.5 bg-surface-200/80 dark:bg-surface-700/80 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${storage.used > 0 ? Math.max(storagePercentage, 2) : 0}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full shadow-sm",
                      isStorageLow
                        ? "bg-gradient-to-r from-danger-400 via-danger-500 to-danger-600"
                        : isStorageWarning
                          ? "bg-gradient-to-r from-warning-400 via-warning-500 to-warning-600"
                          : "bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600"
                    )}
                  />
                </div>

                {/* Upgrade hint - Desktop only */}
                <div className="hidden lg:block mt-3 pt-3 border-t border-primary-200/30 dark:border-primary-500/10">
                  <p className="text-[11px] text-surface-500 dark:text-surface-400 leading-relaxed">
                    {isStorageLow ? (
                      <span className="text-danger-500 font-medium">Storage almost full!</span>
                    ) : isStorageWarning ? (
                      <span className="text-warning-600 dark:text-warning-400">Running low on space</span>
                    ) : (
                      <span>Free plan • 15 GB included</span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Quick Links - Desktop only */}
          <div className="mt-3 hidden lg:flex gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/80 transition-all duration-200 active:scale-95"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:hover:text-surface-200 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800/80 transition-all duration-200 active:scale-95"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modals - Desktop only */}
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
