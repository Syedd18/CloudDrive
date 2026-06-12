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
  const [summary, setSummary] = useState<string>( "");
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Summary
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
            <div className="p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  File: <span className="font-bold text-slate-900 dark:text-slate-200">{file.name}</span>
                </p>
              </div>

              {summary ? (
                <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-medium leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {summary}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 mb-3">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                    No Summary Yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Generate an AI-powered summary to quickly extract key points from this file.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-2">
              <button
                onClick={onClose}
                className="flex items-center justify-center px-4 h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
              >
                Close
              </button>
              <button
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 px-4 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : summary ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Regenerate</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Summary</span>
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
