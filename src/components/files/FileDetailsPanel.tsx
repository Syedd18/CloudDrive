"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  File,
  Folder,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  Star,
  StarOff,
  Calendar,
  HardDrive,
  Clock,
  Share2,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  Sparkles,
  Search,
  Edit3,
} from "lucide-react";
import { FileItem } from "@/types";
import { cn, isEditableFile } from "@/lib/utils";
import { getFileColors } from "./FileCard";
import toast from "react-hot-toast";

interface FileDetailsPanelProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onStar?: (fileId: string) => void;
  onDelete?: (fileId: string) => void;
  onDownload?: (file: FileItem) => void;
  onEdit?: (file: FileItem) => void;
}

const fileTypeIcons: Record<string, typeof File> = {
  folder: Folder,
  document: FileText,
  spreadsheet: FileText,
  presentation: FileText,
  pdf: FileText,
  image: ImageIcon,
  video: Film,
  audio: Music,
  archive: Archive,
  file: File,
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toUpperCase() || "FILE" : "FILE";
}

export function FileDetailsPanel({
  file,
  isOpen,
  onClose,
  onStar,
  onDelete,
  onDownload,
  onEdit,
}: FileDetailsPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !file) return null;

  const Icon = fileTypeIcons[file.type] || File;
  const colors = getFileColors(file);
  const extension = file.type === "folder" ? "FOLDER" : getFileExtension(file.name);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/share/${file.id}`);
    toast.success("Link copied to clipboard!");
  };

  const handleDownload = async () => {
    if (file.type === "folder") {
      toast.error("Cannot download folders");
      return;
    }
    
    if (onDownload) {
      onDownload(file);
    } else {
      // Fallback download
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/files/${file.id}/download?direct=true`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!response.ok) throw new Error("Download failed");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        toast.success("Download started");
      } catch {
        toast.error("Failed to download file");
      }
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const loadingToast = toast.loading("Generating AI Summary...");
    try {
      const response = await fetch(`/api/files/${file.id}/summarize`, {
        method: 'POST'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate");
      
      file.summary = data.summary;
      file.tags = data.tags;
      toast.success("AI Summary Generated!", { id: loadingToast });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Could not generate summary", { id: loadingToast });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const panelContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm pointer-events-auto"
          />

          {/* Panel - slides in from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-surface-900 shadow-2xl pointer-events-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary-500" />
                <h2 className="font-semibold text-surface-900 dark:text-white">
                  File Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* File Preview/Icon */}
              <div className="flex flex-col items-center">
                {file.thumbnail && file.type === "image" ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-surface-100 dark:bg-surface-800">
                    <Image
                      src={file.thumbnail}
                      alt={file.name}
                      width={800}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-12 h-12" style={{ color: colors.icon }} />
                  </div>
                )}

                {/* File Name */}
                <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white text-center break-all px-2">
                  {file.name}
                </h3>

                {/* Type Badge */}
                <div
                  className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: colors.bg, color: colors.icon }}
                >
                  {extension}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-5 gap-2">
                <button
                  onClick={() => onEdit?.(file)}
                  disabled={!isEditableFile(file.name, file.mimeType)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Edit3 className="w-5 h-5 text-blue-500" />
                  <span className="text-xs text-surface-600 dark:text-surface-400">Edit</span>
                </button>

                <button
                  onClick={() => onStar?.(file.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  {file.starred ? (
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  ) : (
                    <StarOff className="w-5 h-5 text-surface-500" />
                  )}
                  <span className="text-xs text-surface-600 dark:text-surface-400">
                    {file.starred ? "Unstar" : "Star"}
                  </span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={file.type === "folder"}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5 text-surface-500" />
                  <span className="text-xs text-surface-600 dark:text-surface-400">Download</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  <Share2 className="w-5 h-5 text-surface-500" />
                  <span className="text-xs text-surface-600 dark:text-surface-400">Share</span>
                </button>

                <button
                  onClick={() => onDelete?.(file.id)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
                >
                  <Trash2 className="w-5 h-5 text-surface-500 group-hover:text-red-500" />
                  <span className="text-xs text-surface-600 dark:text-surface-400 group-hover:text-red-500">
                    Trash
                  </span>
                </button>
              </div>

              {/* File Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                  Information
                </h4>

                <div className="space-y-3">
                  {/* Type */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                      <File className="w-5 h-5 text-surface-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-500">Type</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white capitalize">
                        {file.type}
                      </p>
                    </div>
                  </div>

                  {/* Size */}
                  {file.type !== "folder" && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <HardDrive className="w-5 h-5 text-surface-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-500">Size</p>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modified Date */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-surface-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-500">Modified</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        {formatDate(file.modified)}
                      </p>
                    </div>
                  </div>

                  {/* Starred Status */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                    <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                      <Star className={cn("w-5 h-5", file.starred ? "text-amber-500 fill-amber-500" : "text-surface-500")} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-500">Starred</p>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        {file.starred ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>

                  {/* Shared Status */}
                  {file.shared && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-500">Shared</p>
                        <p className="text-sm font-medium text-blue-500">
                          Yes
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Summary */}
                  {file.summary ? (
                    <div className="flex flex-col gap-2 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-100 dark:border-purple-800">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-purple-500" />
                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300">AI SUMMARY</p>
                      </div>
                      <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                        {file.summary}
                      </p>
                    </div>
                  ) : (
                    file.type !== 'folder' && (
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center justify-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors w-full"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-semibold">{isGeneratingSummary ? "Generating AI Summary..." : "Generate AI Summary & Tags"}</span>
                      </button>
                    )
                  )}

                  {/* AI Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-col border border-surface-200 dark:border-surface-800 gap-2 p-4 rounded-xl bg-surface-50 dark:bg-surface-800">
                      <p className="text-xs text-surface-500 font-medium">SMART TAGS</p>
                      <div className="flex flex-wrap gap-2">
                        {file.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 rounded-md bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 text-xs text-surface-600 dark:text-surface-400">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {file.shared && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                      <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                        <Share2 className="w-5 h-5 text-primary-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-surface-500">Shared</p>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">
                          Yes - Link is public
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-surface-900 dark:text-white">
                  Location
                </h4>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
                  <Folder className="w-5 h-5 text-surface-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {file.folderId ? "In folder" : "My Files (root)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-surface-200 dark:border-surface-700">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Share Link
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(panelContent, document.body);
}
