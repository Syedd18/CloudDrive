"use client";

import { motion } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Star,
  Clock,
  Trash2,
  Users,
  Filter,
  FileX,
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
    showUpload: boolean;
  }
> = {
  "My Files": {
    icon: FolderOpen,
    title: "No files yet",
    description: "Upload your first file or create a folder to get started.",
    showUpload: true,
  },
  Starred: {
    icon: Star,
    title: "No starred files",
    description: "Star important files to find them quickly here.",
    showUpload: false,
  },
  Recent: {
    icon: Clock,
    title: "No recent activity",
    description: "Files you've recently accessed will appear here.",
    showUpload: false,
  },
  Trash: {
    icon: Trash2,
    title: "Trash is empty",
    description: "Files you delete will appear here for 30 days.",
    showUpload: false,
  },
  Shared: {
    icon: Users,
    title: "No shared files",
    description: "Files shared with you or by you will appear here.",
    showUpload: false,
  },
};

const defaultConfig = {
  icon: FolderOpen,
  title: "This folder is empty",
  description: "Upload files or create folders to get started.",
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="relative mb-4">
          <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
            <Filter className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center shadow">
            <FileX className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            No matching files
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            Try adjusting your search query or filters to find what you&apos;re looking for.
          </p>
        </div>

        <button
          onClick={onClearFilter}
          className="mt-4 flex items-center gap-1.5 h-8 px-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-xs font-bold shadow-sm transition-all"
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center py-20 text-center animate-fade-in"
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm">
          <Icon className="w-5 h-5 text-slate-400 dark:text-slate-500" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {config.title}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-normal">
          {config.description}
        </p>
      </div>

      {config.showUpload && onUploadClick && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-5 flex items-center gap-2"
        >
          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 h-9 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Files</span>
          </button>
        </motion.div>
      )}

      {config.showUpload && (
        <p className="mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Tip: Drag & drop files anywhere on the screen to upload instantly
        </p>
      )}
    </motion.div>
  );
}
