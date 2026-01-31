"use client";

import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Star,
  Clock,
  Trash2,
  Users,
  Search,
  Filter,
  FileX,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  folder: string;
  onUploadClick?: () => void;
  hasFilter?: boolean;
  onClearFilter?: () => void;
}

const folderConfig: Record<
  string,
  {
    icon: typeof FolderOpen;
    title: string;
    description: string;
    gradient: string;
    showUpload: boolean;
  }
> = {
  "My Files": {
    icon: FolderOpen,
    title: "No files yet",
    description: "Upload your first file or create a folder to get started",
    gradient: "from-primary-400 to-primary-600",
    showUpload: true,
  },
  Starred: {
    icon: Star,
    title: "No starred files",
    description: "Star important files to find them quickly here",
    gradient: "from-amber-400 to-orange-500",
    showUpload: false,
  },
  Recent: {
    icon: Clock,
    title: "No recent activity",
    description: "Files you've recently accessed will appear here",
    gradient: "from-emerald-400 to-teal-500",
    showUpload: false,
  },
  Trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Files you delete will appear here for 30 days",
    gradient: "from-slate-400 to-slate-600",
    showUpload: false,
  },
  Shared: {
    icon: Users,
    title: "No shared files",
    description: "Files shared with you or by you will appear here",
    gradient: "from-purple-400 to-pink-500",
    showUpload: false,
  },
};

const defaultConfig = {
  icon: FolderOpen,
  title: "This folder is empty",
  description: "Upload files or create folders to get started",
  gradient: "from-surface-400 to-surface-600",
  showUpload: true,
};

export function EmptyState({
  folder,
  onUploadClick,
  hasFilter,
  onClearFilter,
}: EmptyStateProps) {
  const config = folderConfig[folder] || defaultConfig;
  const Icon = config.icon;

  // Filter empty state
  if (hasFilter) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center justify-center py-16 sm:py-24"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="relative"
        >
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-800 flex items-center justify-center shadow-xl">
            <Filter className="w-12 h-12 sm:w-16 sm:h-16 text-surface-400 dark:text-surface-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-warning-500 flex items-center justify-center shadow-lg">
            <FileX className="w-5 h-5 text-white" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-6 sm:mt-8 text-center"
        >
          <h3 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white">
            No matching files
          </h3>
          <p className="mt-2 text-sm sm:text-base text-surface-500 dark:text-surface-400 max-w-sm">
            Try adjusting your filter to find what you&apos;re looking for
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          onClick={onClearFilter}
          className="mt-6 btn-primary"
        >
          <Filter className="w-4 h-4" />
          Clear filter
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col items-center justify-center py-16 sm:py-24"
    >
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, duration: 0.3, type: "spring", bounce: 0.4 }}
        className="relative"
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl blur-2xl opacity-30",
            `bg-gradient-to-br ${config.gradient}`
          )}
        />

        {/* Main icon container */}
        <motion.div
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut",
          }}
          className={cn(
            "relative w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center shadow-2xl",
            `bg-gradient-to-br ${config.gradient}`
          )}
        >
          <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute -top-3 -right-3 w-6 h-6 rounded-lg bg-white dark:bg-surface-800 shadow-lg flex items-center justify-center"
        >
          <div className="w-2 h-2 rounded-full bg-primary-500" />
        </motion.div>
      </motion.div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="mt-6 sm:mt-8 text-center"
      >
        <h3 className="text-lg sm:text-xl font-semibold text-surface-900 dark:text-white">
          {config.title}
        </h3>
        <p className="mt-2 text-sm sm:text-base text-surface-500 dark:text-surface-400 max-w-sm">
          {config.description}
        </p>
      </motion.div>

      {/* Action Button */}
      {config.showUpload && onUploadClick && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="mt-6 flex flex-col sm:flex-row items-center gap-3"
        >
          <button onClick={onUploadClick} className="btn-primary">
            <Upload className="w-4 h-4" />
            Upload files
          </button>
          <span className="text-sm text-surface-400">or</span>
          <button className="btn-secondary">
            <Plus className="w-4 h-4" />
            New folder
          </button>
        </motion.div>
      )}

      {/* Keyboard hint */}
      {config.showUpload && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="mt-6 text-xs text-surface-400 dark:text-surface-500"
        >
          Tip: Drag and drop files anywhere to upload
        </motion.p>
      )}
    </motion.div>
  );
}
