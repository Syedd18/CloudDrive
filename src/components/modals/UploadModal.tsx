"use client";

import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileUp, CheckCircle, AlertCircle, File } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import toast from "react-hot-toast";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "complete" | "error";
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: "uploading" as const,
      }));

      setUploadingFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress
      newFiles.forEach((uploadingFile, index) => {
        const simulateProgress = () => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === uploadingFile.file
                    ? { ...f, progress: 100, status: "complete" }
                    : f
                )
              );
            } else {
              setUploadingFiles((prev) =>
                prev.map((f) =>
                  f.file === uploadingFile.file ? { ...f, progress } : f
                )
              );
            }
          }, 200 + Math.random() * 300);
        };
        setTimeout(simulateProgress, index * 200);
      });

      // Add to main files list after a delay
      setTimeout(() => {
        onUpload(acceptedFiles);
      }, 2000);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  const handleClose = () => {
    if (uploadingFiles.some((f) => f.status === "uploading")) {
      toast.error("Please wait for uploads to complete");
      return;
    }
    setUploadingFiles([]);
    onClose();
  };

  const completedCount = uploadingFiles.filter(
    (f) => f.status === "complete"
  ).length;

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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={handleClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[450px] md:w-[500px] max-h-[80vh] sm:max-h-[75vh] bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl border border-surface-200/50 dark:border-surface-700/50 flex flex-col"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-surface-200/60 dark:border-surface-700/50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Upload files
                  </h2>
                  {uploadingFiles.length > 0 && (
                    <p className="text-xs text-surface-500 mt-0.5">
                      {completedCount} of {uploadingFiles.length} complete
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
                  isDragActive
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-surface-300 dark:border-surface-700 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-3 text-center">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                      isDragActive
                        ? "bg-primary-100 dark:bg-primary-900/30"
                        : "bg-surface-100 dark:bg-surface-800"
                    )}
                  >
                    <FileUp
                      className={cn(
                        "w-7 h-7 transition-colors",
                        isDragActive
                          ? "text-primary-500"
                          : "text-surface-500 dark:text-surface-400"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-surface-900 dark:text-white font-medium text-sm">
                      {isDragActive
                        ? "Drop files here"
                        : "Drag & drop files here"}
                    </p>
                    <p className="text-xs text-surface-500 mt-1">
                      or click to browse from your computer
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Progress List */}
              {uploadingFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-xs font-medium text-surface-700 dark:text-surface-300">
                    Uploading files
                  </h3>
                  {uploadingFiles.map((uploadingFile, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl"
                    >
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          uploadingFile.status === "complete"
                            ? "bg-success-50 dark:bg-success-500/20"
                            : uploadingFile.status === "error"
                            ? "bg-danger-50 dark:bg-danger-500/20"
                            : "bg-surface-100 dark:bg-surface-700"
                        )}
                      >
                        {uploadingFile.status === "complete" ? (
                          <CheckCircle className="w-5 h-5 text-success-500" />
                        ) : uploadingFile.status === "error" ? (
                          <AlertCircle className="w-5 h-5 text-danger-500" />
                        ) : (
                          <File className="w-5 h-5 text-surface-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {uploadingFile.file.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          {formatFileSize(uploadingFile.file.size)}
                        </p>
                        {uploadingFile.status === "uploading" && (
                          <div className="mt-2 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${uploadingFile.progress}%`,
                              }}
                              className="h-full bg-primary-500 rounded-full"
                            />
                          </div>
                        )}
                      </div>
                      {uploadingFile.status === "uploading" && (
                        <span className="text-xs text-surface-500">
                          {Math.round(uploadingFile.progress)}%
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 sm:p-5 border-t border-surface-200/60 dark:border-surface-700/50 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 bg-surface-50/50 dark:bg-surface-800/30">
              <button onClick={handleClose} className="btn-secondary w-full sm:w-auto order-2 sm:order-1">
                {uploadingFiles.length > 0 &&
                completedCount === uploadingFiles.length
                  ? "Done"
                  : "Cancel"}
              </button>
              {uploadingFiles.length === 0 && (
                <button {...getRootProps()} className="btn-primary w-full sm:w-auto order-1 sm:order-2">
                  <Upload className="w-4 h-4" />
                  Select files
                </button>
              )}
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
