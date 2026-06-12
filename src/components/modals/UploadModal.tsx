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
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={handleClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:w-[450px] bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-4 h-4 text-indigo-650" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Upload Files
                    </h2>
                    {uploadingFiles.length > 0 && (
                      <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5">
                        {completedCount} of {uploadingFiles.length} complete
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 min-h-0">
                {/* Dropzone */}
                <div
                  {...getRootProps()}
                  className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 transition-all duration-150 cursor-pointer text-center",
                    isDragActive
                      ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                        isDragActive
                          ? "bg-indigo-100 dark:bg-indigo-950/50"
                          : "bg-slate-50 dark:bg-slate-950"
                      )}
                    >
                      <FileUp
                        className={cn(
                          "w-6 h-6 transition-colors",
                          isDragActive ? "text-indigo-600" : "text-slate-400 dark:text-slate-500"
                        )}
                      />
                    </div>
                    <div>
                      <p className="text-slate-900 dark:text-slate-100 font-semibold text-xs">
                        {isDragActive ? "Drop files here" : "Drag & drop files here"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium">
                        or click to browse from your computer
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Progress List */}
                {uploadingFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      Uploading files
                    </h3>
                    <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1">
                      {uploadingFiles.map((uploadingFile, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20"
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800",
                              uploadingFile.status === "complete" && "bg-emerald-50 dark:bg-emerald-950/20",
                              uploadingFile.status === "error" && "bg-red-50 dark:bg-red-950/20"
                            )}
                          >
                            {uploadingFile.status === "complete" ? (
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                            ) : uploadingFile.status === "error" ? (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <File className="w-4 h-4 text-slate-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                              {uploadingFile.file.name}
                            </p>
                            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium">
                              {formatFileSize(uploadingFile.file.size)}
                            </p>
                            {uploadingFile.status === "uploading" && (
                              <div className="mt-1.5 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${uploadingFile.progress}%`,
                                  }}
                                  className="h-full bg-indigo-600 rounded-full"
                                />
                              </div>
                            )}
                          </div>
                          {uploadingFile.status === "uploading" && (
                            <span className="text-[10px] font-bold text-slate-500">
                              {Math.round(uploadingFile.progress)}%
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex-shrink-0 px-5 py-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2 bg-slate-50/50 dark:bg-slate-900/10">
                <button
                  onClick={handleClose}
                  className="flex-1 sm:flex-initial flex items-center justify-center h-9 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-305 transition-colors shadow-sm"
                >
                  {uploadingFiles.length > 0 && completedCount === uploadingFiles.length ? "Done" : "Cancel"}
                </button>
                {uploadingFiles.length === 0 && (
                  <button
                    {...getRootProps()}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-4 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Files</span>
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
