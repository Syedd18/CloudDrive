"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Copy, RefreshCw, SkipForward } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface DuplicateFile {
  file: File;
  existingFileId: string;
  existingFileName: string;
}

interface DuplicateFileModalProps {
  isOpen: boolean;
  duplicates: DuplicateFile[];
  onClose: () => void;
  onReplace: (files: DuplicateFile[]) => void;
  onRename: (files: DuplicateFile[]) => void;
  onSkip: () => void;
}

export function DuplicateFileModal({
  isOpen,
  duplicates,
  onClose,
  onReplace,
  onRename,
  onSkip,
}: DuplicateFileModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen || duplicates.length === 0) return null;

  const isSingle = duplicates.length === 1;
  const firstFile = duplicates[0];

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[9999]"
            style={{ touchAction: 'none' }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "fixed z-[10000]",
              // Mobile: bottom sheet style
              "inset-x-0 bottom-0",
              // Desktop: centered with flex container
              "lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-4"
            )}
          >
            <div className={cn(
              "bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden",
              // Mobile: rounded top corners only, Desktop: all corners
              "rounded-t-2xl lg:rounded-lg",
              // Desktop: constrain width and max-height
              "lg:w-full lg:max-w-md lg:max-h-[90vh] lg:overflow-y-auto",
              // Safe area padding for iOS
              "pb-safe"
            )}>
              {/* Drag handle for mobile */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      {isSingle ? "File Exists" : `${duplicates.length} Files Exist`}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                {/* File info */}
                {isSingle ? (
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 mb-4">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {firstFile.file.name}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 mt-1">
                      {formatFileSize(firstFile.file.size)}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-32 lg:max-h-40 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                    {duplicates.map((dup, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                          {dup.file.name}
                        </p>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {formatFileSize(dup.file.size)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-5 text-center">
                  {isSingle
                    ? "A file with this name already exists in this directory."
                    : "These files already exist in this directory."}
                </p>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onReplace(duplicates)}
                    className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Replace {isSingle ? "Existing" : "All"}
                  </button>

                  <button
                    onClick={() => onRename(duplicates)}
                    className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Keep Both (Rename)
                  </button>

                  <button
                    onClick={onSkip}
                    className="w-full flex items-center justify-center gap-1.5 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    Skip
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
}
