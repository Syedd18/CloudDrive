"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Star,
  Clock,
  Trash2,
  Users,
  Upload,
  FolderPlus,
  Camera,
  FileUp,
  X,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

interface MobileNavProps {
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  onUploadClick: () => void;
  onNewFolderClick?: () => void;
}

const navItems = [
  { id: "My Files", icon: Home, label: "Home" },
  { id: "Starred", icon: Star, label: "Starred" },
  { id: "Recent", icon: Clock, label: "Recent" },
  { id: "Shared", icon: Users, label: "Shared" },
  { id: "Trash", icon: Trash2, label: "Trash" },
];

const fabActions = [
  { id: "upload", icon: FileUp, label: "Upload file", color: "bg-primary-500" },
  { id: "folder", icon: FolderPlus, label: "New folder", color: "bg-emerald-500" },
  { id: "camera", icon: Camera, label: "Take photo", color: "bg-purple-500" },
];

export function MobileNav({
  currentFolder,
  onFolderChange,
  onUploadClick,
  onNewFolderClick,
}: MobileNavProps) {
  const [fabOpen, setFabOpen] = useState(false);

  const handleAction = (actionId: string) => {
    setFabOpen(false);
    switch (actionId) {
      case "upload":
        onUploadClick();
        break;
      case "folder":
        onNewFolderClick?.();
        break;
      case "camera":
        // TODO: Implement camera capture
        break;
    }
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
        <div className="glass border-t border-surface-200/50 dark:border-surface-800/50">
          <div className="flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentFolder === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onFolderChange(item.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center w-16 h-full",
                    "transition-all duration-200"
                  )}
                >
                  {/* Active indicator */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        layoutId="mobile-nav-indicator"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-2 top-1 h-1 rounded-full bg-primary-500"
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isActive
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-surface-500 dark:text-surface-400"
                      )}
                    />
                  </motion.div>
                  <span
                    className={cn(
                      "text-[10px] mt-1 font-medium transition-colors",
                      isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-surface-500 dark:text-surface-400"
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* FAB Backdrop */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB Actions */}
      <div className="lg:hidden fixed right-4 bottom-20 z-50 flex flex-col-reverse items-center gap-3">
        <AnimatePresence>
          {fabOpen &&
            fabActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { delay: index * 0.05 },
                }}
                exit={{
                  opacity: 0,
                  y: 20,
                  scale: 0.8,
                  transition: { delay: (fabActions.length - index - 1) * 0.05 },
                }}
                className="flex items-center gap-3"
              >
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 + 0.1 } }}
                  exit={{ opacity: 0, x: 10 }}
                  className="px-3 py-1.5 rounded-lg bg-surface-900/90 dark:bg-white/90 text-white dark:text-surface-900 text-sm font-medium shadow-lg"
                >
                  {action.label}
                </motion.span>
                <button
                  onClick={() => handleAction(action.id)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg",
                    action.color,
                    "text-white hover:scale-105 active:scale-95 transition-transform"
                  )}
                >
                  <action.icon className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          onClick={() => setFabOpen(!fabOpen)}
          animate={{ rotate: fabOpen ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-primary-500 to-primary-600",
            "shadow-xl shadow-primary-500/30",
            "text-white hover:scale-105 active:scale-95 transition-all",
            fabOpen && "from-surface-600 to-surface-700 shadow-surface-500/20"
          )}
        >
          {fabOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Plus className="w-6 h-6" />
          )}
        </motion.button>
      </div>
    </>
  );
}
