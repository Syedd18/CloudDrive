"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Copy, RefreshCw } from "lucide-react";
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
  if (!isOpen || duplicates.length === 0) return null;

  const isSingle = duplicates.length === 1;
  const firstFile = duplicates[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-md z-[101]"
          >
            <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900 dark:text-white">
                      {isSingle ? "File Already Exists" : `${duplicates.length} Files Already Exist`}
                    </h3>
                    <p className="text-xs text-surface-500">
                      Choose how to handle {isSingle ? "this file" : "these files"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                {isSingle ? (
                  <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 mb-4">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {firstFile.file.name}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      {formatFileSize(firstFile.file.size)}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-2 mb-4">
                    {duplicates.map((dup, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-surface-50 dark:bg-surface-800/50"
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

                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                  {isSingle
                    ? "A file with this name already exists in this folder."
                    : "Files with these names already exist in this folder."}
                </p>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => onReplace(duplicates)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                      "bg-warning-500 hover:bg-warning-600 text-white",
                      "font-medium text-sm transition-colors"
                    )}
                  >
                    <RefreshCw className="w-4 h-4" />
                    Replace {isSingle ? "Existing File" : "All Existing Files"}
                  </button>

                  <button
                    onClick={() => onRename(duplicates)}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                      "bg-primary-500 hover:bg-primary-600 text-white",
                      "font-medium text-sm transition-colors"
                    )}
                  >
                    <Copy className="w-4 h-4" />
                    Keep Both (Rename New {isSingle ? "File" : "Files"})
                  </button>

                  <button
                    onClick={onSkip}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl",
                      "bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700",
                      "text-surface-700 dark:text-surface-300",
                      "font-medium text-sm transition-colors"
                    )}
                  >
                    Skip {isSingle ? "This File" : "These Files"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
