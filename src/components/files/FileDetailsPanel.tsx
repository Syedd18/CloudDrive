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
  Share2,
  Download,
  Trash2,
  Copy,
  Info,
  Sparkles,
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
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px] pointer-events-auto"
          />

          {/* Panel - slides in from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl pointer-events-auto flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-650" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  File Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* File Preview/Icon */}
              <div className="flex flex-col items-center">
                {file.thumbnail && file.type === "image" ? (
                  <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-750">
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
                    className="w-20 h-20 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Icon className="w-10 h-10" style={{ color: colors.icon }} />
                  </div>
                )}

                {/* File Name */}
                <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white text-center break-all px-2 leading-snug">
                  {file.name}
                </h3>

                {/* Type Badge */}
                <div
                  className="mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: colors.bg, color: colors.icon }}
                >
                  {extension}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  onClick={() => onEdit?.(file)}
                  disabled={!isEditableFile(file.name, file.mimeType)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Edit3 className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Edit</span>
                </button>

                <button
                  onClick={() => onStar?.(file.id)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors"
                >
                  {file.starred ? (
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ) : (
                    <StarOff className="w-4 h-4 text-slate-550" />
                  )}
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                    {file.starred ? "Unstar" : "Star"}
                  </span>
                </button>

                <button
                  onClick={handleDownload}
                  disabled={file.type === "folder"}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Download</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-750 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">Share</span>
                </button>

                <button
                  onClick={() => onDelete?.(file.id)}
                  className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg bg-slate-50 hover:bg-red-50 dark:bg-slate-855 dark:hover:bg-red-950/20 border border-slate-200 dark:border-slate-750 transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-slate-605 group-hover:text-red-500 transition-colors" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-red-550 transition-colors">
                    Trash
                  </span>
                </button>
              </div>

              {/* File Information */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Information
                </h4>

                <div className="space-y-2">
                  {/* Type */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700/65 flex items-center justify-center flex-shrink-0">
                      <File className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">Type</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 capitalize">
                        {file.type}
                      </p>
                    </div>
                  </div>

                  {/* Size */}
                  {file.type !== "folder" && (
                    <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                      <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700/65 flex items-center justify-center flex-shrink-0">
                        <HardDrive className="w-4 h-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">Size</p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Modified Date */}
                  <div className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700/65 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 leading-none mb-1">Modified</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {formatDate(file.modified)}
                      </p>
                    </div>
                  </div>

                  {/* AI Summary */}
                  {file.summary ? (
                    <div className="flex flex-col gap-1.5 p-3.5 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/15 border border-indigo-150 dark:border-indigo-900/50">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-650" />
                        <p className="text-[9px] font-bold text-indigo-700 dark:text-indigo-350 uppercase tracking-wider">AI SUMMARY</p>
                      </div>
                      <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed font-semibold">
                        {file.summary}
                      </p>
                    </div>
                  ) : (
                    file.type !== 'folder' && (
                      <button
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        className="flex items-center justify-center gap-2 p-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/45 border border-indigo-200 dark:border-indigo-850 text-indigo-600 dark:text-indigo-400 transition-colors w-full"
                      >
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        <span className="text-xs font-semibold">{isGeneratingSummary ? "Generating AI Summary..." : "Generate AI Summary & Tags"}</span>
                      </button>
                    )
                  )}

                  {/* AI Tags */}
                  {file.tags && file.tags.length > 0 && (
                    <div className="flex flex-col gap-2 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">SMART TAGS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {file.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-600 dark:text-slate-350">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Location
                </h4>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
                  <Folder className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {file.folderId ? "In directory" : "My Files (root)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
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
