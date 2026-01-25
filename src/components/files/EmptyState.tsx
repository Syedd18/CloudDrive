"use client";

import { motion } from "framer-motion";
import { FolderOpen, Star, Clock, Trash2, Upload, FileSearch } from "lucide-react";

interface EmptyStateProps {
  folder: string;
  onUploadClick?: () => void;
}

const emptyStates: Record<
  string,
  { icon: typeof FolderOpen; title: string; description: string }
> = {
  "My Drive": {
    icon: Upload,
    title: "Your Drive is empty",
    description: "Drag files here or click the upload button to get started",
  },
  Starred: {
    icon: Star,
    title: "No starred files",
    description: "Star your important files for quick access",
  },
  Recent: {
    icon: Clock,
    title: "No recent files",
    description: "Files you've recently opened will appear here",
  },
  Shared: {
    icon: FolderOpen,
    title: "No shared files",
    description: "Files shared with you will appear here",
  },
  Trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Deleted files will appear here for 30 days",
  },
  Search: {
    icon: FileSearch,
    title: "No results found",
    description: "Try adjusting your search or filters",
  },
};

export function EmptyState({ folder, onUploadClick }: EmptyStateProps) {
  const state = emptyStates[folder] || emptyStates["My Drive"];
  const Icon = state.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4"
    >
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
            <Icon className="w-10 h-10 text-primary-500" />
          </div>
        </div>
        
        {/* Decorative elements */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800/50"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-emerald-200 dark:bg-emerald-800/50"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="absolute top-1/2 -right-6 w-3 h-3 rounded-full bg-purple-200 dark:bg-purple-800/50"
        />
      </div>

      <h2 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
        {state.title}
      </h2>
      <p className="text-surface-500 max-w-sm">{state.description}</p>

      {folder === "My Drive" && onUploadClick && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={onUploadClick}
          className="mt-6 btn-primary"
        >
          <Upload className="w-4 h-4" />
          Upload files
        </motion.button>
      )}
    </motion.div>
  );
}
