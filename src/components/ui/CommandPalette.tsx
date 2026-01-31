"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  HardDrive,
  Star,
  Clock,
  Trash2,
  Upload,
  FolderPlus,
  Settings,
  Moon,
  Sun,
  LogOut,
  HelpCircle,
  File,
  Folder,
  X,
  Command,
  CornerDownLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (folder: string) => void;
  onUpload: () => void;
  onNewFolder: () => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onOpenHelp?: () => void;
  files?: Array<{ id: string; name: string; type: string }>;
  onFileSelect?: (file: { id: string; name: string; type: string }) => void;
}

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  shortcut?: string[];
  action: () => void;
  group: string;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onUpload,
  onNewFolder,
  onLogout,
  onOpenSettings,
  onOpenHelp,
  files = [],
  onFileSelect,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const commands: CommandItem[] = [
    // Navigation
    {
      id: "nav-drive",
      label: "Go to My Drive",
      icon: <HardDrive className="w-4 h-4" />,
      shortcut: ["G", "D"],
      action: () => { onNavigate("My Drive"); onClose(); },
      group: "Navigation",
    },
    {
      id: "nav-starred",
      label: "Go to Starred",
      icon: <Star className="w-4 h-4" />,
      shortcut: ["G", "S"],
      action: () => { onNavigate("Starred"); onClose(); },
      group: "Navigation",
    },
    {
      id: "nav-recent",
      label: "Go to Recent",
      icon: <Clock className="w-4 h-4" />,
      shortcut: ["G", "R"],
      action: () => { onNavigate("Recent"); onClose(); },
      group: "Navigation",
    },
    {
      id: "nav-trash",
      label: "Go to Trash",
      icon: <Trash2 className="w-4 h-4" />,
      shortcut: ["G", "T"],
      action: () => { onNavigate("Trash"); onClose(); },
      group: "Navigation",
    },
    // Actions
    {
      id: "action-upload",
      label: "Upload files",
      description: "Upload new files to your drive",
      icon: <Upload className="w-4 h-4" />,
      shortcut: ["U"],
      action: () => { onUpload(); onClose(); },
      group: "Actions",
    },
    {
      id: "action-folder",
      label: "Create new folder",
      description: "Create a new folder",
      icon: <FolderPlus className="w-4 h-4" />,
      shortcut: ["N", "F"],
      action: () => { onNewFolder(); onClose(); },
      group: "Actions",
    },
    // Settings
    {
      id: "settings-theme",
      label: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      description: "Toggle between light and dark theme",
      icon: theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />,
      shortcut: ["T"],
      action: () => { toggleTheme(); onClose(); },
      group: "Settings",
    },
    {
      id: "settings-preferences",
      label: "Open Settings",
      icon: <Settings className="w-4 h-4" />,
      shortcut: [","],
      action: () => { onOpenSettings?.(); onClose(); },
      group: "Settings",
    },
    {
      id: "settings-help",
      label: "Help & Support",
      icon: <HelpCircle className="w-4 h-4" />,
      shortcut: ["?"],
      action: () => { onOpenHelp?.(); onClose(); },
      group: "Settings",
    },
    {
      id: "settings-logout",
      label: "Log out",
      icon: <LogOut className="w-4 h-4" />,
      action: () => { onLogout?.(); onClose(); },
      group: "Settings",
    },
  ];

  // Add file search results
  const fileResults: CommandItem[] = files
    .filter(file => file.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5)
    .map(file => ({
      id: `file-${file.id}`,
      label: file.name,
      icon: file.type === "folder" ? <Folder className="w-4 h-4" /> : <File className="w-4 h-4" />,
      action: () => { onClose(); },
      group: "Files",
    }));

  // Filter commands based on query
  const filteredCommands = query
    ? [...commands, ...fileResults].filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  // Group commands
  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  const allItems = Object.values(groupedCommands).flat();

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allItems.length) % allItems.length);
        break;
      case "Enter":
        e.preventDefault();
        if (allItems[selectedIndex]) {
          allItems[selectedIndex].action();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  }, [isOpen, allItems, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  // Global keyboard shortcut to open
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // This would be handled by parent
        } else {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [isOpen, onClose]);

  let itemIndex = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.175, 0.885, 0.32, 1.275] }}
            className="command-palette"
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands, files, or type a command..."
                className="command-input"
                aria-label="Command palette search"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <kbd className="kbd hidden sm:inline-flex">ESC</kbd>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors sm:hidden"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 text-surface-400" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div
              ref={listRef}
              className="max-h-[60vh] overflow-y-auto scrollbar-thin"
            >
              {Object.entries(groupedCommands).map(([group, items]) => (
                <div key={group} className="command-group">
                  <div className="command-group-title">{group}</div>
                  {items.map((item) => {
                    const currentIndex = itemIndex++;
                    return (
                      <button
                        key={item.id}
                        data-index={currentIndex}
                        onClick={item.action}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={cn(
                          "command-item w-full text-left",
                          currentIndex === selectedIndex && "bg-surface-100 dark:bg-surface-100"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                          "bg-surface-100 dark:bg-surface-200 text-surface-600 dark:text-surface-400"
                        )}>
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-surface-900 dark:text-surface-900 truncate">
                            {item.label}
                          </div>
                          {item.description && (
                            <div className="text-xs text-surface-500 dark:text-surface-400 truncate">
                              {item.description}
                            </div>
                          )}
                        </div>
                        {item.shortcut && (
                          <div className="command-shortcut">
                            {item.shortcut.map((key, i) => (
                              <kbd key={i} className="kbd">{key}</kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {allItems.length === 0 && (
                <div className="px-4 py-12 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-surface-100 dark:bg-surface-200 flex items-center justify-center">
                    <Search className="w-6 h-6 text-surface-400" />
                  </div>
                  <p className="text-sm text-surface-500">No results found</p>
                  <p className="text-xs text-surface-400 mt-1">Try a different search term</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200/60 dark:border-surface-200/40 bg-surface-50/50 dark:bg-surface-100/50">
              <div className="flex items-center gap-4 text-xs text-surface-500">
                <span className="flex items-center gap-1.5">
                  <kbd className="kbd">↑</kbd>
                  <kbd className="kbd">↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="kbd flex items-center gap-0.5">
                    <CornerDownLeft className="w-3 h-3" />
                  </kbd>
                  <span>Select</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-surface-400">
                <Command className="w-3 h-3" />
                <span>K to toggle</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
