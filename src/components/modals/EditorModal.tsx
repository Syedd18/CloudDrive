"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Edit3, Loader2, Play } from "lucide-react";
import { FileItem } from "@/types";
import { cn, isCodeFile } from "@/lib/utils";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";

interface EditorModalProps {
  file: FileItem;
  onClose: () => void;
  onUpdated: () => void;
}

export function EditorModal({ file, onClose, onUpdated }: EditorModalProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState("");
  const pyodideRef = useRef<any>(null);
  const useCodeEditor = isCodeFile(file.name, file.mimeType);
  const isPython = file.name.toLowerCase().endsWith(".py");

  useEffect(() => {
    // Load file content
    const loadContent = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch(`/api/files/${file.id}/content`, {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || "Failed to load file content");
        }

        const data = await response.json();
        setContent(data.content || "");
      } catch (error) {
        toast.error("Failed to load file content");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };
    
    loadContent();
  }, [file.id, onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`/api/files/${file.id}/content`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save file content");
      }

      toast.success("File saved successfully");
      onUpdated();
    } catch (error) {
      toast.error("Failed to save file");
    } finally {
      setIsSaving(false);
    }
  };

  const getLanguage = () => {
    if (isPython) return "python";
    return "plaintext";
  };

  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[data-src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });

  const ensurePyodide = async () => {
    if (pyodideRef.current) {
      return pyodideRef.current;
    }

    await loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.1/full/pyodide.js");
    const pyodide = await (window as any).loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.1/full/",
    });
    pyodideRef.current = pyodide;
    return pyodide;
  };

  const handleRunInBrowser = async () => {
    if (!isPython) {
      toast.error("Browser run is available for Python files only");
      return;
    }

    setIsRunning(true);
    setRunOutput("");

    try {
      const pyodide = await ensurePyodide();
        const runnerBootstrap = `
        import sys, io, re, textwrap, traceback

        async def __run_user_code(source):
          old_stdout, old_stderr = sys.stdout, sys.stderr
          stdout_io, stderr_io = io.StringIO(), io.StringIO()
          sys.stdout, sys.stderr = stdout_io, stderr_io

          try:
            future_imports = re.findall(r"(?m)^from\\s+__future__\\s+import\\s+.+$", source)
            if future_imports:
              source = re.sub(r"(?m)^from\\s+__future__\\s+import\\s+.+$\\n?", "", source)
              stderr_io.write(
                "[CloudDrive note] Ignored __future__ import(s) for browser run:\\n"
                + "\\n".join(future_imports)
                + "\\n"
              )

            # Run the source inside an async wrapper so top-level await works in Pyodide.
            wrapped = "async def __clouddrive_entry__():\\n" + textwrap.indent(source, "    ")
            namespace = {"__name__": "__main__"}

            try:
              exec(wrapped, namespace)
              await namespace["__clouddrive_entry__"]()
            except RuntimeError as err:
              # Common browser case: asyncio.run() from a running event loop.
              if "asyncio.run() cannot be called from a running event loop" not in str(err):
                raise

              transformed = source
              transformed = re.sub(r"(?m)^(\\s*)def\\s+main\\s*\\(", r"\\1async def main(", transformed)
              transformed = transformed.replace("asyncio.run(", "await (")
              transformed = transformed.replace(
                'if __name__ == "__main__":\\n    main()',
                'if __name__ == "__main__":\\n    await main()'
              )

              wrapped_transformed = "async def __clouddrive_entry__():\\n" + textwrap.indent(transformed, "    ")
              namespace = {"__name__": "__main__"}
              exec(wrapped_transformed, namespace)
              await namespace["__clouddrive_entry__"]()
          except Exception:
            traceback.print_exc()
            stderr_io.write(
              "\\n\\n[CloudDrive note] Browser runner executes code inside an async wrapper. "
              "Some module-level behaviors may differ from local Python execution.\\n"
            )
          finally:
            sys.stdout, sys.stderr = old_stdout, old_stderr

          return stdout_io.getvalue() + stderr_io.getvalue()
        `;

        const normalizedRunnerBootstrap = runnerBootstrap
        .replace(/^\n/, "")
        .split("\n")
        .map((line) => line.replace(/^ {8}/, ""))
        .join("\n");

        await pyodide.runPythonAsync(normalizedRunnerBootstrap);

      pyodide.globals.set("source", content);
      const result = await pyodide.runPythonAsync("await __run_user_code(source)");
      const output = String(result || "").trim();
      setRunOutput(output || "Execution completed with no output.");
    } catch (error: any) {
      setRunOutput(error?.message || "Failed to run Python code in browser.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-2 sm:inset-4 md:inset-8 bg-surface-50 dark:bg-surface-900 rounded-lg shadow-2xl z-[75] flex flex-col overflow-hidden border border-surface-200 dark:border-surface-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                {file.name}
              </h3>
              <p className="text-sm text-surface-500">
                {isLoading
                  ? "Loading content..."
                  : useCodeEditor
                    ? "Code editor"
                    : "Text editor"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {isPython && (
              <button
                onClick={handleRunInBrowser}
                disabled={isLoading || isSaving || isRunning}
                className="btn-secondary"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Run in Browser</span>
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isLoading || isSaving}
              className="btn-primary"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-white dark:bg-[#1e1e1e]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : useCodeEditor ? (
            <Editor
              height="100%"
              language={getLanguage()}
              theme="vs-dark"
              value={content}
              onChange={(val) => setContent(val || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                scrollBeyondLastLine: false,
              }}
            />
          ) : (
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              className={cn(
                "w-full h-full resize-none outline-none border-0 p-4 sm:p-6",
                "bg-white dark:bg-[#1e1e1e] text-surface-900 dark:text-surface-100",
                "font-mono text-sm leading-6",
                "focus:ring-0"
              )}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
            />
          )}
        </div>

        {isPython && (
          <div className="border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-surface-800 dark:text-surface-200">Browser Output</p>
              <button
                onClick={() => setRunOutput("")}
                className="text-xs text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                Clear
              </button>
            </div>
            <pre className="max-h-40 overflow-auto rounded-xl bg-surface-950 text-surface-100 p-3 text-xs sm:text-sm whitespace-pre-wrap break-words">
              {runOutput || "Run the Python file to see output here."}
            </pre>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}