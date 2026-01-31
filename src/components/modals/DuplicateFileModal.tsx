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
          {/* Backdrop - Full screen with high z-index */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            style={{ touchAction: 'none' }}
          />

          {/* Modal Container - Centered on all devices */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "fixed z-[10000]",
              // Mobile: bottom sheet style
              "inset-x-0 bottom-0",
              // Desktop: centered with flex container
              "lg:inset-0 lg:flex lg:items-center lg:justify-center lg:p-4"
            )}
          >
            <div className={cn(
              "bg-white dark:bg-surface-900 shadow-2xl overflow-hidden",
              // Mobile: rounded top corners only, Desktop: all corners
              "rounded-t-3xl lg:rounded-2xl",
              // Desktop: constrain width and max-height
              "lg:w-full lg:max-w-md lg:max-h-[90vh] lg:overflow-y-auto",
              // Safe area padding for iOS
              "pb-safe"
            )}>
              {/* Drag handle for mobile */}
              <div className="lg:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between p-4 lg:p-5 border-b border-surface-200 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 lg:w-12 lg:h-12 rounded-2xl flex items-center justify-center",
                    "bg-gradient-to-br from-warning-100 to-warning-200",
                    "dark:from-warning-500/30 dark:to-warning-600/20"
                  )}>
                    <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base lg:text-lg text-surface-900 dark:text-white">
                      {isSingle ? "File Exists" : `${duplicates.length} Files Exist`}
                    </h3>
                    <p className="text-xs lg:text-sm text-surface-500 dark:text-surface-400">
                      Choose an action
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 lg:p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors active:scale-95"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 lg:p-5">
                {/* File info */}
                {isSingle ? (
                  <div className="p-3 lg:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 mb-4">
                    <p className="text-sm lg:text-base font-medium text-surface-900 dark:text-white truncate">
                      {firstFile.file.name}
                    </p>
                    <p className="text-xs lg:text-sm text-surface-500 mt-1">
                      {formatFileSize(firstFile.file.size)}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-32 lg:max-h-40 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                    {duplicates.map((dup, index) => (
                      <div
                        key={index}
                        className="p-2.5 lg:p-3 rounded-lg bg-surface-50 dark:bg-surface-800/50 border border-surface-200/50 dark:border-surface-700/50"
                      >
                        <p className="text-sm text-surface-900 dark:text-white truncate">
                          {dup.file.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          {formatFileSize(dup.file.size)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs lg:text-sm text-surface-600 dark:text-surface-400 mb-5 lg:mb-6 text-center">
                  {isSingle
                    ? "A file with this name already exists."
                    : "These files already exist in this folder."}
                </p>

                {/* Actions - Large touch targets for mobile */}
                <div className="space-y-2.5 lg:space-y-3">
                  <button
                    onClick={() => onReplace(duplicates)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5",
                      "py-3.5 lg:py-4 px-4 rounded-xl lg:rounded-2xl",
                      "bg-gradient-to-r from-warning-500 to-warning-600",
                      "hover:from-warning-600 hover:to-warning-700",
                      "text-white font-semibold text-sm lg:text-base",
                      "shadow-lg shadow-warning-500/25",
                      "transition-all duration-200 active:scale-[0.98]"
                    )}
                  >
                    <RefreshCw className="w-4 h-4 lg:w-5 lg:h-5" />
                    Replace {isSingle ? "Existing" : "All"}
                  </button>

                  <button
                    onClick={() => onRename(duplicates)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5",
                      "py-3.5 lg:py-4 px-4 rounded-xl lg:rounded-2xl",
                      "bg-gradient-to-r from-primary-500 to-primary-600",
                      "hover:from-primary-600 hover:to-primary-700",
                      "text-white font-semibold text-sm lg:text-base",
                      "shadow-lg shadow-primary-500/25",
                      "transition-all duration-200 active:scale-[0.98]"
                    )}
                  >
                    <Copy className="w-4 h-4 lg:w-5 lg:h-5" />
                    Keep Both
                  </button>

                  <button
                    onClick={onSkip}
                    className={cn(
                      "w-full flex items-center justify-center gap-2.5",
                      "py-3.5 lg:py-4 px-4 rounded-xl lg:rounded-2xl",
                      "bg-surface-100 dark:bg-surface-800",
                      "hover:bg-surface-200 dark:hover:bg-surface-700",
                      "text-surface-700 dark:text-surface-300",
                      "font-semibold text-sm lg:text-base",
                      "border border-surface-200 dark:border-surface-700",
                      "transition-all duration-200 active:scale-[0.98]"
                    )}
                  >
                    <SkipForward className="w-4 h-4 lg:w-5 lg:h-5" />
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
