"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import type { FileItem } from "@/types";

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onSummaryGenerated?: (summary: string) => void;
}

export function SummaryModal({ isOpen, onClose, file, onSummaryGenerated }: SummaryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && file) {
      if (file.summary) {
        setSummary(file.summary);
      } else {
        setSummary("");
      }
    }
  }, [isOpen, file]);

  const handleGenerateSummary = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/summarize`, {
        method: "POST",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json();
      setSummary(data.summary);
      toast.success("AI Summary generated successfully!");
      if (onSummaryGenerated) {
        onSummaryGenerated(data.summary);
      }
    } catch (error) {
      console.error("Summary generation error:", error);
      toast.error("Failed to generate AI summary.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted || !file) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-lg">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Summary
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
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  File: <span className="font-medium text-gray-900 dark:text-gray-200">{file.name}</span>
                </p>
              </div>

              {summary ? (
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
                  <div className="prose prose-sm dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {summary}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/20 mb-4">
                    <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 drop-shadow-sm" />
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
                    No Summary Yet
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    Generate an AI-powered summary to quickly understand the contents of this file.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-transparent transition-all"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : summary ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Summary
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}