"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Sparkles, Loader2, Copy, Download, FileText } from "lucide-react";
import toast from "react-hot-toast";
import type { FileItem } from "@/types";

interface QuickSummarizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files?: FileItem[];
}

export function QuickSummarizerModal({ isOpen, onClose, files = [] }: QuickSummarizerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"upload" | "select">("upload");
  const [selectedFile, setSelectedFile] = useState<File | FileItem | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  const SUPPORTED_EXTENSIONS = ["pdf", "docx", "txt", "md", "js", "ts", "jsx", "tsx", "html", "css", "json", "py", "csv"];

  // Check if file is supported
  const isFileSupported = (fileName: string): boolean => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    return ext ? SUPPORTED_EXTENSIONS.includes(ext) : false;
  };

  const filteredFiles = files.filter(f => f.type !== "folder" && isFileSupported(f.name));

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isFileSupported(file.name)) {
      toast.error(`Unsupported file type. Supported: ${SUPPORTED_EXTENSIONS.join(", ")}`);
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error("File size must be less than 50MB");
      return;
    }

    setSelectedFile(file);
    setSummary("");
  };

  const handleSummarize = async () => {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    
    try {
      if (selectedFile instanceof File) {
        formData.append("file", selectedFile);
        const response = await fetch("/api/summarize", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to summarize");
        }

        const data = await response.json();
        setSummary(data.summary);
        toast.success("Summary generated!");
      } else {
        // Selected from existing files
        const response = await fetch(`/api/files/${selectedFile.id}/summarize`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to summarize");
        }

        const data = await response.json();
        setSummary(data.summary);
        toast.success("Summary generated!");
      }
    } catch (error) {
      console.error("Summarization error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to summarize file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `summary_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Summary downloaded!");
  };

  if (!mounted) {
    return null;
  }

  const fileName = selectedFile instanceof File ? selectedFile.name : (selectedFile as FileItem)?.name;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Quick Summarizer
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {!summary ? (
                <>
                  {/* Mode Tabs */}
                  <div className="flex gap-1.5 border-b border-slate-200 dark:border-slate-800">
                    <button
                      onClick={() => { setMode("upload"); setSelectedFile(null); setSummary(""); }}
                      className={`px-4 py-2.5 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                        mode === "upload"
                          ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                          : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload File
                    </button>
                    {filteredFiles.length > 0 && (
                      <button
                        onClick={() => { setMode("select"); setSelectedFile(null); setSummary(""); }}
                        className={`px-4 py-2.5 text-xs font-bold transition-colors relative flex items-center gap-1.5 ${
                          mode === "select"
                            ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        My Files
                      </button>
                    )}
                  </div>

                  {/* Upload Mode */}
                  {mode === "upload" && (
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-550 transition-colors"
                      >
                        <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                          Supported formats: PDF, DOCX, TXT, MD, Python, JS, HTML, CSS, JSON, CSV (Max size 50MB)
                        </p>
                      </div>

                      {selectedFile instanceof File && (
                        <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-lg">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            Selected: {selectedFile.name}
                          </p>
                          <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                            Size: {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select Mode */}
                  {mode === "select" && (
                    <div>
                      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                        {filteredFiles.map(file => (
                          <button
                            key={file.id}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedFile && (selectedFile as FileItem).id === file.id
                                ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                            }`}
                          >
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </button>
                        ))}
                      </div>
                      {filteredFiles.length === 0 && (
                        <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-6">
                          No supported files found in your drive
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summarize Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={!selectedFile || isLoading}
                    className="w-full flex items-center justify-center gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Generate Summary</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Summary Display */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      File: <span className="font-bold text-slate-900 dark:text-white">{fileName}</span>
                    </p>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                        {summary}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>

                  {/* New Summary Button */}
                  <button
                    onClick={() => { setSummary(""); setSelectedFile(null); setMode("upload"); }}
                    className="w-full flex items-center justify-center h-9 bg-indigo-50/50 hover:bg-indigo-100/50 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold transition-colors shadow-sm"
                  >
                    Summarize Another File
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
