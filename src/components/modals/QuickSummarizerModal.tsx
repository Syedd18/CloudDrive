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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Quick Summarizer
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {!summary ? (
                <>
                  {/* Mode Tabs */}
                  <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => { setMode("upload"); setSelectedFile(null); setSummary(""); }}
                      className={`px-4 py-2 font-medium transition-colors ${
                        mode === "upload"
                          ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                      }`}
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Upload File
                    </button>
                    {filteredFiles.length > 0 && (
                      <button
                        onClick={() => { setMode("select"); setSelectedFile(null); setSummary(""); }}
                        className={`px-4 py-2 font-medium transition-colors ${
                          mode === "select"
                            ? "text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
                        }`}
                      >
                        <FileText className="w-4 h-4 inline mr-2" />
                        My Files
                      </button>
                    )}
                  </div>

                  {/* Upload Mode */}
                  {mode === "upload" && (
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileSelect}
                        className="hidden"
                        accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(",")}
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
                      >
                        <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Drop your file here or click to browse
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Supported: PDF, DOCX, TXT, MD, JavaScript, Python, HTML, CSS, JSON (max 50MB)
                        </p>
                      </div>

                      {selectedFile instanceof File && (
                        <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <p className="text-sm text-gray-900 dark:text-white font-medium">
                            Selected: {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Size: {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select Mode */}
                  {mode === "select" && (
                    <div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {filteredFiles.map(file => (
                          <button
                            key={file.id}
                            onClick={() => setSelectedFile(file)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedFile && (selectedFile as FileItem).id === file.id
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </button>
                        ))}
                      </div>
                      {filteredFiles.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400">
                          No supported files found
                        </p>
                      )}
                    </div>
                  )}

                  {/* Summarize Button */}
                  <button
                    onClick={handleSummarize}
                    disabled={!selectedFile || isLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-transparent transition-all"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Summary
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  {/* Summary Display */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      File: <span className="font-medium text-gray-900 dark:text-white">{fileName}</span>
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                      <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                        {summary}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                  </div>

                  {/* New Summary Button */}
                  <button
                    onClick={() => { setSummary(""); setSelectedFile(null); setMode("upload"); }}
                    className="w-full px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
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
