"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HardDrive,
  Star,
  Clock,
  Trash2,
  Users,
  Plus,
  ChevronLeft,
  FolderPlus,
  FileUp,
  Cloud,
  HelpCircle,
  Settings,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import { SettingsModal } from "@/components/modals/SettingsModal";
import { HelpModal } from "@/components/modals/HelpModal";

interface SidebarProps {
  isOpen: boolean;
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onClose: () => void;
  onUploadClick?: () => void;
  onFolderClick?: () => void;
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
}: SidebarProps) {
  const [storage, setStorage] = useState<StorageInfo>({ used: 0, total: 15 * 1024 * 1024 * 1024 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
          "top-0 left-0 bottom-0",
          "bg-white dark:bg-[#0d1117]",
          "border-r border-surface-200/60 dark:border-surface-800/60",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ height: '100dvh' }}
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

        {/* Navigation - scrollable area */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-thin">
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
          </ul>
        </nav>

        {/* Storage Indicator - Fixed at bottom */}
        <div className="p-2 lg:p-4 border-t border-surface-200/60 dark:border-surface-800/60 bg-white dark:bg-[#0d1117]">
          <div className="p-2 lg:p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-2 skeleton rounded-full flex-1" />
                <div className="h-3 skeleton rounded w-12" />
              </div>
            ) : (
              <>
                {/* Compact view for mobile */}
                <div className="flex items-center gap-2 lg:hidden">
                  <Cloud className={cn(
                    "w-4 h-4 flex-shrink-0",
                    isStorageLow ? "text-danger-500" :
                    isStorageWarning ? "text-warning-500" :
                    "text-primary-500"
                  )} />
                  <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${storage.used > 0 ? Math.max(storagePercentage, 2) : 0}%` }}
                      className={cn(
                        "h-full rounded-full",
                        isStorageLow
                          ? "bg-danger-500"
                          : isStorageWarning
                            ? "bg-warning-500"
                            : "bg-primary-500"
                      )}
                    />
                  </div>
                  <span className="text-xs text-surface-500 flex-shrink-0">
                    {formatFileSize(storage.used)} / {formatFileSize(storage.total)}
                  </span>
                </div>

                {/* Full view for desktop */}
                <div className="hidden lg:block">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cloud className={cn(
                        "w-4 h-4",
                        isStorageLow ? "text-danger-500" :
                        isStorageWarning ? "text-warning-500" :
                        "text-primary-500"
                      )} />
                      <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                        Storage
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isStorageLow ? "text-danger-500" :
                      isStorageWarning ? "text-warning-500" :
                      "text-surface-500"
                    )}>
                      {storagePercentage < 0.1 && storage.used > 0
                        ? '<0.1'
                        : storagePercentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storage.used > 0 ? Math.max(storagePercentage, 2) : 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        isStorageLow
                          ? "bg-gradient-to-r from-danger-400 to-danger-500"
                          : isStorageWarning
                            ? "bg-gradient-to-r from-warning-400 to-warning-500"
                            : "bg-gradient-to-r from-primary-400 to-primary-500"
                      )}
                    />
                  </div>

                  <p className="text-xs text-surface-500">
                    <span className="font-medium text-surface-700 dark:text-surface-300">
                      {formatFileSize(storage.used)}
                    </span>
                    {" "}of {formatFileSize(storage.total)} used
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Quick Links - Desktop only */}
          <div className="mt-3 hidden lg:flex gap-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-95 active:bg-surface-200 dark:active:bg-surface-700"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-95 active:bg-surface-200 dark:active:bg-surface-700"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modals - Desktop only */}
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
