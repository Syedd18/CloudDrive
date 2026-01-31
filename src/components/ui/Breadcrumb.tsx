"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Home, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate?: (id: string) => void;
  className?: string;
}

export function Breadcrumb({ items, onNavigate, className }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1 text-sm", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <Fragment key={item.id}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-surface-400 dark:text-surface-500 flex-shrink-0" />
            )}
            <motion.button
              onClick={() => !isLast && onNavigate?.(item.id)}
              whileHover={!isLast ? { x: 2 } : undefined}
              whileTap={!isLast ? { scale: 0.98 } : undefined}
              disabled={isLast}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors max-w-[150px] sm:max-w-[200px]",
                isLast
                  ? "text-surface-900 dark:text-surface-100 font-medium cursor-default"
                  : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/50 cursor-pointer"
              )}
            >
              {isFirst && (
                <Home className="w-4 h-4 flex-shrink-0" />
              )}
              {!isFirst && item.icon && (
                <span className="flex-shrink-0">{item.icon}</span>
              )}
              <span className="truncate">{item.label}</span>
            </motion.button>
          </Fragment>
        );
      })}
    </nav>
  );
}

// Simpler version for current folder display
export interface SimpleBreadcrumbProps {
  items?: { id: string; name: string }[];
  currentFolder?: string;
  onNavigate?: (folderId: string) => void;
  onHomeClick?: () => void;
  className?: string;
}

export function SimpleBreadcrumb({
  items,
  currentFolder,
  onNavigate,
  onHomeClick,
  className,
}: SimpleBreadcrumbProps) {
  // If items are provided, use them; otherwise use currentFolder
  const breadcrumbItems = items || (currentFolder ? [{ id: "root", name: currentFolder }] : []);
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm", className)}
    >
      <motion.button
        onClick={() => onHomeClick?.() || onNavigate?.("root")}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-lg text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </motion.button>
      
      {breadcrumbItems.map((item, index) => (
        <Fragment key={item.id}>
          <ChevronRight className="w-4 h-4 text-surface-300 dark:text-surface-600 flex-shrink-0" />
          {index === breadcrumbItems.length - 1 ? (
            <div className="flex items-center gap-1.5 px-2 py-1">
              <FolderOpen className="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span className="font-medium text-surface-900 dark:text-surface-100 truncate max-w-[200px]">
                {item.name}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onNavigate?.(item.id)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-colors"
            >
              <span className="truncate max-w-[150px]">{item.name}</span>
            </button>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
