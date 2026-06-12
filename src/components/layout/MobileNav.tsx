"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Star,
  Trash2,
  Users,
  FolderPlus,
  FileUp,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onUploadClick: () => void;
  onNewFolderClick?: () => void;
}

export function MobileNav({
  currentFolder,
  onFolderChange,
  onUploadClick,
  onNewFolderClick,
}: MobileNavProps) {
  const [fabOpen, setFabOpen] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe-bottom">
        <div className="flex items-center justify-around h-14 px-2">
          {/* Home */}
          <button
            onClick={() => onFolderChange("My Files")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              currentFolder === "My Files"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Home className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1">Home</span>
          </button>

          {/* Starred */}
          <button
            onClick={() => onFolderChange("Starred")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              currentFolder === "Starred"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Star className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1">Starred</span>
          </button>

          {/* Center FAB Trigger */}
          <div className="flex-1 flex justify-center -mt-5">
            <button
              onClick={() => setFabOpen(true)}
              className="w-11 h-11 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              aria-label="Create new or upload"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Shared */}
          <button
            onClick={() => onFolderChange("Shared")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              currentFolder === "Shared"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Users className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1">Shared</span>
          </button>

          {/* Trash */}
          <button
            onClick={() => onFolderChange("Trash")}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full transition-colors",
              currentFolder === "Trash"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-[9px] font-bold mt-1">Trash</span>
          </button>
        </div>
      </nav>

      {/* Bottom Sheet Action Sheet */}
      <AnimatePresence>
        {fabOpen && (
          <>
            {/* Sheet Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
              onClick={() => setFabOpen(false)}
            />
            {/* Sheet Body */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-xl p-4 pb-8 lg:hidden shadow-2xl"
            >
              <div className="w-12 h-1 bg-slate-350 dark:bg-slate-750 rounded-full mx-auto mb-4" />
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Create or Upload</p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setFabOpen(false);
                    onUploadClick();
                  }}
                  className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-slate-850 dark:text-slate-250 text-xs font-semibold">Upload File</span>
                    <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-medium">Add photos, videos, or documents</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setFabOpen(false);
                    onNewFolderClick?.();
                  }}
                  className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-slate-700 dark:text-slate-250 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <FolderPlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <span className="block text-slate-850 dark:text-slate-250 text-xs font-semibold">New Folder</span>
                    <span className="block text-[10px] text-slate-450 dark:text-slate-500 font-medium">Create a directory to organize files</span>
                  </div>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
