"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateFolder: (name: string) => Promise<void>;
}

export function CreateFolderModal({
  isOpen,
  onClose,
  onCreateFolder,
}: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      setIsCreating(true);
      await onCreateFolder(folderName.trim());
      setFolderName("");
      onClose();
    } catch (error) {
      console.error("Failed to create folder:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setFolderName("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center flex-shrink-0">
                    <FolderPlus className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    New Folder
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-5">
                <div className="mb-4">
                  <label
                    htmlFor="folderName"
                    className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2"
                  >
                    Folder name
                  </label>
                  <input
                    id="folderName"
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Untitled folder"
                    disabled={isCreating}
                    autoFocus
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150 disabled:opacity-50"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-305 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !folderName.trim()}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Creating...</span>
                      </>
                    ) : (
                      "Create"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
