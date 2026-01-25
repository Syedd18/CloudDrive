"use client";

import { motion, AnimatePresence } from "framer-motion";
import { HardDrive, Star, Clock, Trash2, Plus, X, FolderPlus, FileUp, Camera } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onUploadClick: () => void;
  onFolderClick?: () => void;
}

const navItems = [
  { id: "My Drive", icon: HardDrive, label: "Drive", color: "text-blue-500" },
  { id: "Starred", icon: Star, label: "Starred", color: "text-amber-500" },
  { id: "Recent", icon: Clock, label: "Recent", color: "text-emerald-500" },
  { id: "Trash", icon: Trash2, label: "Trash", color: "text-surface-500" },
];

export function MobileNav({
  currentFolder,
  onFolderChange,
  onUploadClick,
  onFolderClick,
}: MobileNavProps) {
  const [showFab, setShowFab] = useState(false);

  return (
    <>
      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/90 dark:bg-[#0d1117]/95 backdrop-blur-xl border-t border-surface-200/60 dark:border-surface-800/60 pb-safe">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentFolder === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => onFolderChange(item.id)}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl transition-colors duration-200",
                  isActive
                    ? "text-primary-500"
                    : "text-surface-500 dark:text-surface-400 active:bg-surface-100 dark:active:bg-surface-800"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110"
                )} />
                <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="mobileNavIndicator"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary-500 rounded-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* FAB Menu Overlay */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFab(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* FAB Quick Actions */}
      <AnimatePresence>
        {showFab && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-36 right-4 z-[55] lg:hidden flex flex-col gap-3 items-end"
          >
            {/* Upload File */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
              onClick={() => {
                setShowFab(false);
                onUploadClick();
              }}
              className="flex items-center gap-3 bg-white dark:bg-[#161b22] rounded-2xl pl-4 pr-3 py-3 shadow-lg border border-surface-200/60 dark:border-surface-700/50"
            >
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">Upload file</span>
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center">
                <FileUp className="w-5 h-5 text-white" />
              </div>
            </motion.button>

            {/* New Folder */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => {
                setShowFab(false);
                onFolderClick?.();
              }}
              className="flex items-center gap-3 bg-white dark:bg-[#161b22] rounded-2xl pl-4 pr-3 py-3 shadow-lg border border-surface-200/60 dark:border-surface-700/50"
            >
              <span className="text-sm font-medium text-surface-700 dark:text-surface-200">New folder</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-white" />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button - Mobile Only */}
      <motion.button
        onClick={() => setShowFab(!showFab)}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: showFab ? 45 : 0 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "fixed bottom-[72px] right-4 z-[50] lg:hidden",
          "w-14 h-14 rounded-2xl",
          showFab 
            ? "bg-surface-800 dark:bg-surface-200" 
            : "bg-gradient-to-br from-primary-400 to-primary-600",
          "shadow-xl",
          showFab 
            ? "shadow-surface-900/30" 
            : "shadow-primary-500/40",
          "flex items-center justify-center",
          "transition-all duration-200"
        )}
        aria-label={showFab ? "Close menu" : "Add new"}
      >
        {showFab ? (
          <X className="w-6 h-6 text-white dark:text-surface-900" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </>
  );
}
