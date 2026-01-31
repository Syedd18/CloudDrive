"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  File,
  Pause,
  Play,
  XCircle,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

export interface UploadItem {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "pending" | "uploading" | "paused" | "complete" | "completed" | "error";
  error?: string;
}

interface UploadStatusPanelProps {
  uploads: UploadItem[];
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onClearCompleted?: () => void;
}

export function UploadStatusPanel({
  uploads,
  onPause,
  onResume,
  onCancel,
  onRetry,
  onClearCompleted,
}: UploadStatusPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const completedCount = uploads.filter(u => u.status === "complete" || u.status === "completed").length;
  const inProgressCount = uploads.filter(u => u.status === "uploading" || u.status === "pending").length;
  const errorCount = uploads.filter(u => u.status === "error").length;
  const totalProgress = uploads.length > 0
    ? uploads.reduce((sum, u) => sum + u.progress, 0) / uploads.length
    : 0;

  const getStatusIcon = (status: UploadItem["status"]) => {
    switch (status) {
      case "complete":
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-success-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-danger-500" />;
      case "uploading":
        return <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />;
      case "paused":
        return <Pause className="w-4 h-4 text-warning-500" />;
      default:
        return <File className="w-4 h-4 text-surface-400" />;
    }
  };

  const getStatusText = () => {
    if (inProgressCount > 0) {
      return `Uploading ${inProgressCount} file${inProgressCount > 1 ? "s" : ""}...`;
    }
    if (errorCount > 0) {
      return `${errorCount} upload${errorCount > 1 ? "s" : ""} failed`;
    }
    if (completedCount > 0) {
      return `${completedCount} upload${completedCount > 1 ? "s" : ""} complete`;
    }
    return "No uploads";
  };

  if (uploads.length === 0 || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
      className="upload-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-200/60 dark:border-surface-200/40">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 flex-1 min-w-0 hover:bg-surface-100/50 dark:hover:bg-surface-100/30 -ml-2 px-2 py-1 rounded-lg transition-colors"
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            inProgressCount > 0 && "bg-primary-100 dark:bg-primary-500/15",
            errorCount > 0 && inProgressCount === 0 && "bg-danger-100 dark:bg-danger-500/15",
            completedCount > 0 && inProgressCount === 0 && errorCount === 0 && "bg-success-100 dark:bg-success-500/15"
          )}>
            {inProgressCount > 0 ? (
              <Upload className="w-4 h-4 text-primary-500" />
            ) : errorCount > 0 ? (
              <AlertCircle className="w-4 h-4 text-danger-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-success-500" />
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-surface-900 dark:text-surface-900 truncate">
              {getStatusText()}
            </p>
            {inProgressCount > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span className="text-xs text-surface-500 font-medium">
                  {Math.round(totalProgress)}%
                </span>
              </div>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-surface-400 flex-shrink-0" />
          ) : (
            <ChevronUp className="w-4 h-4 text-surface-400 flex-shrink-0" />
          )}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-2 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-100 transition-colors"
          aria-label="Close upload panel"
        >
          <X className="w-4 h-4 text-surface-500" />
        </button>
      </div>

      {/* Upload List */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="max-h-[280px] overflow-y-auto scrollbar-thin">
              {uploads.map((upload, index) => (
                <motion.div
                  key={upload.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 px-4 py-3 border-b border-surface-100 dark:border-surface-200/40 last:border-b-0 hover:bg-surface-50/50 dark:hover:bg-surface-100/30 transition-colors"
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {getStatusIcon(upload.status)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-surface-900 dark:text-surface-900 truncate">
                      {upload.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-surface-500">
                        {formatFileSize(upload.size)}
                      </span>
                      {upload.status === "uploading" && (
                        <>
                          <span className="text-xs text-surface-400">•</span>
                          <span className="text-xs text-primary-500 font-medium">
                            {upload.progress}%
                          </span>
                        </>
                      )}
                      {upload.status === "error" && upload.error && (
                        <>
                          <span className="text-xs text-surface-400">•</span>
                          <span className="text-xs text-danger-500">
                            {upload.error}
                          </span>
                        </>
                      )}
                    </div>
                    {/* Progress Bar */}
                    {upload.status === "uploading" && (
                      <div className="mt-2 h-1 bg-surface-200 dark:bg-surface-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {upload.status === "uploading" && onPause && (
                      <button
                        onClick={() => onPause(upload.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-200 transition-colors"
                        aria-label="Pause upload"
                      >
                        <Pause className="w-3.5 h-3.5 text-surface-500" />
                      </button>
                    )}
                    {upload.status === "paused" && onResume && (
                      <button
                        onClick={() => onResume(upload.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-200 transition-colors"
                        aria-label="Resume upload"
                      >
                        <Play className="w-3.5 h-3.5 text-surface-500" />
                      </button>
                    )}
                    {upload.status === "error" && onRetry && (
                      <button
                        onClick={() => onRetry(upload.id)}
                        className="p-1.5 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-200 transition-colors text-primary-500"
                        aria-label="Retry upload"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {(upload.status === "uploading" || upload.status === "pending" || upload.status === "paused") && onCancel && (
                      <button
                        onClick={() => onCancel(upload.id)}
                        className="p-1.5 rounded-lg hover:bg-danger-100 dark:hover:bg-danger-500/10 transition-colors"
                        aria-label="Cancel upload"
                      >
                        <XCircle className="w-3.5 h-3.5 text-danger-500" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Actions */}
            {completedCount > 0 && (
              <div className="px-4 py-2.5 border-t border-surface-200/60 dark:border-surface-200/40 bg-surface-50/50 dark:bg-surface-100/30">
                <button
                  onClick={onClearCompleted}
                  className="text-xs text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Clear completed
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
