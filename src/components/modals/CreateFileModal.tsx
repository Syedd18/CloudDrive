"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FilePlus } from "lucide-react";
import toast from "react-hot-toast";

interface CreateFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingFileNames: string[];
  onCreateFile: (input: {
    name: string;
    extension: "py" | "txt" | "md" | "json";
    content: string;
  }) => Promise<void>;
}

const templates: Record<"py" | "txt" | "md" | "json", { mimeType: string; content: string }> = {
  py: {
    mimeType: "text/x-python",
    content: "# New Python file\n\nprint(\"Hello from CloudDrive\")\n",
  },
  txt: {
    mimeType: "text/plain",
    content: "",
  },
  md: {
    mimeType: "text/markdown",
    content: "# New Markdown File\n\nStart writing here...\n",
  },
  json: {
    mimeType: "application/json",
    content: "{\n  \"name\": \"new-file\"\n}\n",
  },
};

export function CreateFileModal({ isOpen, onClose, onCreateFile, existingFileNames }: CreateFileModalProps) {
  const [name, setName] = useState("script");
  const [extension, setExtension] = useState<"py" | "txt" | "md" | "json">("py");
  const [content, setContent] = useState(templates.py.content);
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState("");

  const fileName = useMemo(() => {
    const base = name.trim() || "untitled";
    return `${base}.${extension}`;
  }, [name, extension]);

  const handleClose = () => {
    if (isCreating) return;
    setNameError("");
    onClose();
  };

  const handleExtensionChange = (value: "py" | "txt" | "md" | "json") => {
    setExtension(value);
    setContent(templates[value].content);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const normalizedFileName = `${name.trim()}.${extension}`.toLowerCase();
    const hasDuplicate = existingFileNames.some(
      (existingName) => existingName.toLowerCase() === normalizedFileName
    );

    if (hasDuplicate) {
      const message = `A file named ${name.trim()}.${extension} already exists in this folder`;
      setNameError(message);
      toast.error(message);
      return;
    }

    try {
      setNameError("");
      setIsCreating(true);
      await onCreateFile({
        name: name.trim(),
        extension,
        content,
      });
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
              className="bg-white dark:bg-[#161b22] rounded-2xl shadow-2xl border border-surface-200/50 dark:border-surface-700/50 w-full max-w-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-surface-200/60 dark:border-surface-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <FilePlus className="w-5 h-5 text-blue-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">New File</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      File name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        if (nameError) setNameError("");
                      }}
                      placeholder="script"
                      disabled={isCreating}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    />
                    {nameError && (
                      <p className="mt-2 text-sm text-red-500">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Type
                    </label>
                    <select
                      value={extension}
                      onChange={(event) => handleExtensionChange(event.target.value as "py" | "txt" | "md" | "json")}
                      disabled={isCreating}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="py">Python (.py)</option>
                      <option value="txt">Text (.txt)</option>
                      <option value="md">Markdown (.md)</option>
                      <option value="json">JSON (.json)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">Will create: {fileName}</p>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Initial content
                  </label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    disabled={isCreating}
                    className="w-full h-52 px-4 py-3 rounded-xl border-2 border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800/50 text-surface-900 dark:text-white font-mono text-sm leading-6 focus:border-primary-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="btn-secondary flex-1 py-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !name.trim()}
                    className="btn-primary flex-1 py-3"
                  >
                    {isCreating ? "Creating..." : "Create & Open"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}