"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  delay?: number;
}

function Skeleton({ className, delay = 0 }: SkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.05 }}
      className={cn("bg-slate-200 dark:bg-slate-800 animate-pulse", className)}
    />
  );
}

export function FileCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm"
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] relative bg-slate-50 dark:bg-slate-950/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-12 h-12 rounded-lg" delay={index} />
        </div>
      </div>

      {/* Info area */}
      <div className="p-3 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4 rounded" delay={index + 1} />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-2.5 w-16 rounded" delay={index + 2} />
          <Skeleton className="h-2.5 w-10 rounded hidden sm:block" delay={index + 3} />
        </div>
      </div>
    </motion.div>
  );
}

export function FileListSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800/80 last:border-b-0"
    >
      {/* Icon + Name */}
      <div className="col-span-6 flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" delay={index} />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3.5 w-2/3 rounded" delay={index + 1} />
          <Skeleton className="h-2.5 w-1/3 rounded sm:hidden" delay={index + 2} />
        </div>
      </div>

      {/* Modified */}
      <div className="col-span-2 hidden md:flex items-center">
        <Skeleton className="h-3 w-16 rounded" delay={index + 2} />
      </div>

      {/* Size */}
      <div className="col-span-2 hidden sm:flex items-center">
        <Skeleton className="h-3 w-12 rounded" delay={index + 3} />
      </div>

      {/* Actions */}
      <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-1">
        <Skeleton className="w-6 h-6 rounded" delay={index + 4} />
        <Skeleton className="w-6 h-6 rounded hidden sm:block" delay={index + 5} />
      </div>
    </motion.div>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      {/* Header skeleton */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="w-3.5 h-3.5 rounded" />
          <Skeleton className="w-16 h-3.5 rounded" />
          <Skeleton className="w-2.5 h-2.5 rounded" />
          <Skeleton className="w-20 h-3.5 rounded" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-8 rounded-lg" />
            <Skeleton className="w-20 h-8 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <FileCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Sidebar skeleton
export function SidebarSkeleton() {
  return (
    <div className="w-[240px] h-full flex flex-col bg-slate-50 dark:bg-slate-900/40 border-r border-slate-200 dark:border-slate-800 p-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-6">
        <Skeleton className="w-7 h-7 rounded-lg" />
        <Skeleton className="w-20 h-4 rounded" />
      </div>

      {/* Nav items */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2">
            <Skeleton className="w-4 h-4 rounded" delay={i} />
            <Skeleton className="w-16 h-3.5 rounded" delay={i + 1} />
          </div>
        ))}
      </div>

      {/* Storage */}
      <div className="mt-auto space-y-2">
        <Skeleton className="h-3 w-12 rounded" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
    </div>
  );
}

// Navbar skeleton
export function NavbarSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg lg:hidden" />
        <Skeleton className="w-24 h-4 rounded hidden lg:block" />
      </div>

      {/* Search */}
      <Skeleton className="flex-1 max-w-2xl h-9 rounded-lg mx-4" />

      {/* Right */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-8 rounded-lg hidden sm:block" />
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-7 h-7 rounded-full" />
      </div>
    </div>
  );
}
