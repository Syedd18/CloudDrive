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
  { id: "My Drive", icon: HardDrive, label: "My Drive", color: "text-blue-500" },
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
  const [storage, setStorage] = useState<StorageInfo>({ used: 0, total: 15 * 1024 * 1024 * 1024 }); // 15GB default
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
        // API returns { storage: { used, total, percentage }, counts: {...} }
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
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className={cn(
          "fixed lg:relative z-50 lg:z-0 h-full",
          "bg-white dark:bg-[#0d1117]",
          "border-r border-surface-200/60 dark:border-surface-800/60",
          "flex flex-col overflow-hidden",
          !isOpen && "lg:w-0"
        )}
      >
        <div className="flex flex-col h-full w-[280px]">
          {/* Close button - Mobile only */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-surface-200/60 dark:border-surface-800/60">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary-500" />
              <span className="font-semibold text-surface-900 dark:text-white">CloudDrive</span>
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
          <div className="px-4 pt-4 lg:pt-6 pb-3">
            <motion.button 
              onClick={onUploadClick}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 rounded-2xl shadow-md hover:shadow-lg hover:shadow-primary-500/20 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">New</span>
            </motion.button>
          </div>

          {/* Quick Actions */}
          <div className="px-4 pb-5 flex gap-2">
            <button 
              onClick={onFolderClick}
              className="flex-1 btn-secondary py-2.5 text-xs gap-1.5 hover:border-primary-300 dark:hover:border-primary-700"
            >
              <FolderPlus className="w-4 h-4 text-amber-500" />
              <span>Folder</span>
            </button>
            <button 
              onClick={onUploadClick}
              className="flex-1 btn-secondary py-2.5 text-xs gap-1.5 hover:border-primary-300 dark:hover:border-primary-700"
            >
              <FileUp className="w-4 h-4 text-blue-500" />
              <span>Upload</span>
            </button>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-surface-200/60 dark:border-surface-800/60" />

          {/* Navigation */}
          <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
            <ul className="space-y-1">
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
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                        "text-sm font-medium focus-ring",
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

          {/* Storage Indicator */}
          <div className="p-4 border-t border-surface-200/60 dark:border-surface-800/60">
            <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-4 skeleton rounded w-20" />
                  <div className="h-1.5 skeleton rounded-full" />
                  <div className="h-3 skeleton rounded w-32" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Cloud className={cn(
                        "w-4 h-4",
                        isStorageLow ? "text-danger-500" : isStorageWarning ? "text-amber-500" : "text-primary-500"
                      )} />
                      <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
                        Storage
                      </span>
                    </div>
                    <span className={cn(
                      "text-xs font-medium",
                      isStorageLow ? "text-danger-500" : isStorageWarning ? "text-amber-500" : "text-surface-500"
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
                            ? "bg-gradient-to-r from-amber-400 to-amber-500" 
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
                </>
              )}
            </div>

            {/* Quick Links */}
            <div className="mt-3 flex gap-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-95"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </button>
              <button 
                onClick={() => setIsHelpOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-95"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Help</span>
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Modals */}
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
