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
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50"
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0">
                    <FilePlus className="w-4 h-4 text-indigo-650" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white font-semibold">New File</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
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
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150 disabled:opacity-50"
                    />
                    {nameError && (
                      <p className="mt-1.5 text-xs text-red-500 font-semibold">{nameError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                      Type
                    </label>
                    <select
                      value={extension}
                      onChange={(event) => handleExtensionChange(event.target.value as "py" | "txt" | "md" | "json")}
                      disabled={isCreating}
                      className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-semibold text-slate-750 dark:text-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150"
                    >
                      <option value="py">Python (.py)</option>
                      <option value="txt">Text (.txt)</option>
                      <option value="md">Markdown (.md)</option>
                      <option value="json">JSON (.json)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] text-slate-450 dark:text-slate-450 font-bold mb-2">Will create: {fileName}</p>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Initial content
                  </label>
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    disabled={isCreating}
                    className="w-full h-44 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono text-xs leading-5 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isCreating}
                    className="flex-1 flex items-center justify-center h-9 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-305 transition-colors shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating || !name.trim()}
                    className="flex-1 flex items-center justify-center h-9 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
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