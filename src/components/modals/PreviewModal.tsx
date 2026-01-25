"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Download,
  Share2,
  Trash2,
  Star,
  Maximize2,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";
import { FileItem } from "@/types";
import { formatFileSize, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface PreviewModalProps {
  file: FileItem;
  onClose: () => void;
}

export function PreviewModal({ file, onClose }: PreviewModalProps) {
  const canPreview = ["image", "video", "pdf"].includes(file.type);

  const handleDownload = async () => {
    try {
      toast.loading("Preparing download...", { id: `download-${file.id}` });

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/download`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to get download URL");
      }

      const { downloadUrl } = await response.json();
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started", { id: `download-${file.id}` });
    } catch (error) {
      toast.error("Failed to download file", { id: `download-${file.id}` });
    }
  };

  const handleShare = () => {
    toast.success("Share link copied to clipboard");
  };

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-surface-950">
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={file.thumbnail || "/placeholder.jpg"}
                alt={file.name}
                fill
                className="object-contain rounded-lg"
                sizes="100vw"
              />
            </div>
          </div>
        );
      case "video":
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-surface-950">
            <video
              src={file.thumbnail}
              controls
              className="max-w-full max-h-full rounded-lg"
              poster={file.thumbnail}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case "pdf":
        return (
          <div className="flex-1 flex items-center justify-center p-8 bg-surface-100 dark:bg-surface-800">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-surface-600 dark:text-surface-400">
                PDF preview is available in the full version
              </p>
              <button className="mt-4 btn-primary">
                <Download className="w-4 h-4" />
                Download to view
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                <File className="w-10 h-10 text-surface-400" />
              </div>
              <p className="text-surface-600 dark:text-surface-400">
                Preview not available for this file type
              </p>
              <button onClick={handleDownload} className="mt-4 btn-primary">
                <Download className="w-4 h-4" />
                Download file
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-2 sm:inset-4 md:inset-8 bg-white dark:bg-surface-900 rounded-2xl sm:rounded-3xl shadow-2xl z-[60] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-surface-200 dark:border-surface-800">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0",
                file.type === "image" &&
                  "bg-purple-100 dark:bg-purple-900/30 text-purple-500",
                file.type === "video" &&
                  "bg-pink-100 dark:bg-pink-900/30 text-pink-500",
                file.type === "pdf" &&
                  "bg-red-100 dark:bg-red-900/30 text-red-500",
                file.type === "document" &&
                  "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
                file.type === "spreadsheet" &&
                  "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500",
                file.type === "presentation" &&
                  "bg-orange-100 dark:bg-orange-900/30 text-orange-500"
              )}
            >
              {file.type === "image" && <ImageIcon className="w-5 h-5" />}
              {file.type === "video" && <Video className="w-5 h-5" />}
              {file.type === "pdf" && <FileText className="w-5 h-5" />}
              {file.type === "document" && <FileText className="w-5 h-5" />}
              {file.type === "spreadsheet" && (
                <FileSpreadsheet className="w-5 h-5" />
              )}
              {file.type === "presentation" && (
                <Presentation className="w-5 h-5" />
              )}
              {!["image", "video", "pdf", "document", "spreadsheet", "presentation"].includes(file.type) && (
                <File className="w-5 h-5 text-surface-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-sm sm:text-lg font-semibold text-surface-900 dark:text-white truncate">
                {file.name}
              </h2>
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-surface-500">
                <span className="hidden sm:inline">{formatDate(file.modified)}</span>
                <span className="hidden sm:inline">•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-2">
            <button
              onClick={() => {
                toast.success(file.starred ? "Removed from starred" : "Added to starred");
              }}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Star
                className={cn(
                  "w-5 h-5",
                  file.starred
                    ? "text-amber-400 fill-amber-400"
                    : "text-surface-400"
                )}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Share2 className="w-5 h-5 text-surface-400" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <Download className="w-5 h-5 text-surface-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        {renderPreview()}

        {/* Footer with file details */}
        <div className="p-3 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
          <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 sm:gap-y-2 text-xs sm:text-sm">
            <div>
              <span className="text-surface-500">Type:</span>
              <span className="ml-1 sm:ml-2 text-surface-900 dark:text-white capitalize">
                {file.type}
              </span>
            </div>
            <div>
              <span className="text-surface-500">Size:</span>
              <span className="ml-1 sm:ml-2 text-surface-900 dark:text-white">
                {formatFileSize(file.size)}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-surface-500">Modified:</span>
              <span className="ml-1 sm:ml-2 text-surface-900 dark:text-white">
                {new Date(file.modified).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {file.shared && (
              <div>
                <span className="text-surface-500">Shared with:</span>
                <span className="ml-2 text-surface-900 dark:text-white">
                  {file.sharedWith?.length || 0} people
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
