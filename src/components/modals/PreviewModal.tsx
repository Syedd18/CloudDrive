"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  X,
  Download,
  Share2,
  Edit3,
  Star,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Video,
  File,
} from "lucide-react";
import { FileItem } from "@/types";
import { formatFileSize, formatDate, cn, isEditableFile } from "@/lib/utils";
import { ShareModal } from "@/components/modals/ShareModal";
import toast from "react-hot-toast";

interface PreviewModalProps {
  file: FileItem;
  onClose: () => void;
  onEdit?: (file: FileItem) => void;
}

export function PreviewModal({ file, onClose, onEdit }: PreviewModalProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleDownload = async () => {
    try {
      toast.loading("Preparing download...", { id: `download-${file.id}` });

      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/download?direct=true`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to download file");
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = file.name;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+?)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Download started", { id: `download-${file.id}` });
    } catch (error) {
      toast.error("Failed to download file", { id: `download-${file.id}` });
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const renderPreview = () => {
    switch (file.type) {
      case "image":
        return (
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950">
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
          <div className="flex-1 flex items-center justify-center p-4 bg-slate-950">
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
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-red-50 dark:bg-red-950/20 flex items-center justify-center border border-red-200 dark:border-red-900/40">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                PDF preview is available in the full version
              </p>
              <button
                onClick={handleDownload}
                className="mt-4 flex items-center justify-center gap-1.5 h-8 px-3 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download to view</span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <File className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                Preview not available for this file type
              </p>
              <button
                onClick={handleDownload}
                className="mt-4 flex items-center justify-center gap-1.5 h-8 px-3 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
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
        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-2 sm:inset-4 md:inset-8 bg-white dark:bg-slate-900 rounded-lg shadow-xl z-[60] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                file.type === "image" && "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 text-indigo-550",
                file.type === "video" && "bg-rose-50 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 text-rose-550",
                file.type === "pdf" && "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50 text-red-550",
                file.type === "document" && "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 text-blue-550",
                file.type === "spreadsheet" && "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 text-emerald-550",
                file.type === "presentation" && "bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900/50 text-amber-550"
              )}
            >
              {file.type === "image" && <ImageIcon className="w-4 h-4" />}
              {file.type === "video" && <Video className="w-4 h-4" />}
              {file.type === "pdf" && <FileText className="w-4 h-4" />}
              {file.type === "document" && <FileText className="w-4 h-4" />}
              {file.type === "spreadsheet" && <FileSpreadsheet className="w-4 h-4" />}
              {file.type === "presentation" && <Presentation className="w-4 h-4" />}
              {!["image", "video", "pdf", "document", "spreadsheet", "presentation"].includes(file.type) && (
                <File className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xs font-bold text-slate-900 dark:text-white truncate leading-snug">
                {file.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-400 font-medium">
                <span>{formatDate(file.modified)}</span>
                <span>•</span>
                <span>{formatFileSize(file.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {file.type !== "folder" && isEditableFile(file.name, file.mimeType) && (
              <button
                onClick={() => onEdit?.(file)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-blue-500 transition-colors"
                title="Edit file"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => {
                toast.success(file.starred ? "Removed from starred" : "Added to starred");
              }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Star file"
            >
              <Star
                className={cn(
                  "w-4 h-4",
                  file.starred ? "text-amber-500 fill-amber-500" : "text-slate-400"
                )}
              />
            </button>
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        {renderPreview()}

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-500">
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold block mb-0.5">Type</span>
              <span className="text-slate-700 dark:text-white capitalize">
                {file.type}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold block mb-0.5">Size</span>
              <span className="text-slate-700 dark:text-white">
                {formatFileSize(file.size)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold block mb-0.5">Modified</span>
              <span className="text-slate-700 dark:text-white">
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
                <span className="text-slate-400 uppercase tracking-wider text-[9px] font-bold block mb-0.5">Shared</span>
                <span className="text-indigo-600 dark:text-indigo-400">
                  Public shared link active
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} file={file} />
    </AnimatePresence>
  );
}
