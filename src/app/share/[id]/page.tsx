"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Download,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  File,
  Folder,
  Table,
  Presentation,
  Code,
  Archive,
  Cloud,
  User,
  Calendar,
  HardDrive,
  ExternalLink,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";

interface SharedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  mimeType: string;
  previewUrl: string | null;
  thumbnail: string | null;
  createdAt: string;
  owner: {
    name: string;
    avatar: string | null;
  };
}

const fileTypeIcons: Record<string, React.ElementType> = {
  folder: Folder,
  document: FileText,
  spreadsheet: Table,
  presentation: Presentation,
  image: FileImage,
  video: FileVideo,
  audio: FileAudio,
  code: Code,
  archive: Archive,
  pdf: FileText,
  other: File,
};

const fileTypeColors: Record<string, string> = {
  folder: "from-amber-400 to-amber-600",
  document: "from-blue-400 to-blue-600",
  spreadsheet: "from-emerald-400 to-emerald-600",
  presentation: "from-orange-400 to-orange-600",
  image: "from-pink-400 to-pink-600",
  video: "from-purple-400 to-purple-600",
  audio: "from-rose-400 to-rose-600",
  code: "from-cyan-400 to-cyan-600",
  archive: "from-gray-400 to-gray-600",
  pdf: "from-red-400 to-red-600",
  other: "from-gray-400 to-gray-600",
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function SharePage() {
  const params = useParams();
  const fileId = params?.id as string;
  
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (fileId) {
      loadSharedFile();
    }
  }, [fileId]);

  const loadSharedFile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/share/${fileId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to load shared file");
      }

      const data = await response.json();
      setFile(data.file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    try {
      setDownloading(true);
      
      const response = await fetch(`/api/share/${fileId}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to get download link");
      }

      const data = await response.json();
      
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = data.fileName || file.name;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Download started!");
    } catch (err) {
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  const IconComponent = file ? fileTypeIcons[file.type] || File : File;
  const colorClass = file ? fileTypeColors[file.type] || fileTypeColors.other : fileTypeColors.other;

  // Check if file can be previewed
  const canPreview = file?.mimeType?.startsWith("image/") || 
                     file?.mimeType === "application/pdf" ||
                     file?.mimeType?.startsWith("video/") ||
                     file?.mimeType?.startsWith("audio/");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-surface-600 dark:text-surface-400">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
            <Lock className="w-8 h-8 text-danger-600 dark:text-danger-400" />
          </div>
          <h1 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            {error}
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
          >
            <Cloud className="w-4 h-4" />
            Go to Cloud Drive
          </a>
        </motion.div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-900 dark:to-surface-950">
      {/* Header */}
      <header className="bg-white/80 dark:bg-surface-800/80 backdrop-blur-xl border-b border-surface-200 dark:border-surface-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              Cloud Drive
            </span>
          </a>
          
          <a
            href="/login"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Sign in
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl overflow-hidden"
        >
          {/* File Preview Area */}
          <div className="relative bg-surface-100 dark:bg-surface-900 min-h-[300px] flex items-center justify-center p-8">
            {canPreview && file.previewUrl ? (
              file.mimeType?.startsWith("image/") ? (
                <img
                  src={file.previewUrl}
                  alt={file.name}
                  className="max-h-[400px] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : file.mimeType?.startsWith("video/") ? (
                <video
                  src={file.previewUrl}
                  controls
                  className="max-h-[400px] max-w-full rounded-lg shadow-lg"
                />
              ) : file.mimeType?.startsWith("audio/") ? (
                <div className="w-full max-w-md">
                  <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <IconComponent className="w-12 h-12 text-white" />
                  </div>
                  <audio
                    src={file.previewUrl}
                    controls
                    className="w-full"
                  />
                </div>
              ) : file.mimeType === "application/pdf" ? (
                <iframe
                  src={file.previewUrl}
                  className="w-full h-[500px] rounded-lg"
                  title={file.name}
                />
              ) : null
            ) : (
              <div className="text-center">
                <div className={`w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-12 h-12 text-white" />
                </div>
                <p className="text-surface-500 text-sm">Preview not available</p>
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="p-6 border-t border-surface-200 dark:border-surface-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-surface-900 dark:text-white truncate">
                  {file.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-surface-500">
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4" />
                    {formatFileSize(file.size)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(file.createdAt)}
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-600 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                {downloading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download
                  </>
                )}
              </button>
            </div>

            {/* Owner Info */}
            <div className="mt-6 pt-6 border-t border-surface-200 dark:border-surface-700">
              <p className="text-sm text-surface-500 mb-2">Shared by</p>
              <div className="flex items-center gap-3">
                {file.owner.avatar ? (
                  <Image
                    src={file.owner.avatar}
                    alt={file.owner.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium">
                    {file.owner.name[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <span className="font-medium text-surface-900 dark:text-white">
                  {file.owner.name}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-surface-500 mt-8">
          Want your own cloud storage?{" "}
          <a href="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            Sign up for Cloud Drive
          </a>
        </p>
      </main>
    </div>
  );
}
