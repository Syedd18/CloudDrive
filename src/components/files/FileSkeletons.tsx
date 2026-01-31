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
      className={cn("skeleton", className)}
    />
  );
}

export function FileCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="card rounded-2xl overflow-hidden"
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] relative bg-surface-100 dark:bg-surface-800/50">
        <Skeleton className="absolute inset-0 rounded-none" />
        {/* Icon placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" delay={index} />
        </div>
      </div>

      {/* Info area */}
      <div className="p-3 sm:p-4 space-y-2.5">
        <Skeleton className="h-4 w-3/4 rounded-lg" delay={index + 1} />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 rounded-md" delay={index + 2} />
          <Skeleton className="h-3 w-12 rounded-md hidden sm:block" delay={index + 3} />
        </div>
      </div>
    </motion.div>
  );
}

export function FileListSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="grid grid-cols-12 gap-4 px-4 py-3.5 border-b border-surface-200/40 dark:border-surface-700/40 last:border-b-0"
    >
      {/* Icon + Name */}
      <div className="col-span-6 flex items-center gap-3">
        <Skeleton className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex-shrink-0" delay={index} />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-lg" delay={index + 1} />
          <Skeleton className="h-3 w-1/3 rounded-md sm:hidden" delay={index + 2} />
        </div>
      </div>

      {/* Modified */}
      <div className="col-span-2 hidden md:flex items-center">
        <Skeleton className="h-3.5 w-20 rounded-md" delay={index + 2} />
      </div>

      {/* Size */}
      <div className="col-span-2 hidden sm:flex items-center">
        <Skeleton className="h-3.5 w-14 rounded-md" delay={index + 3} />
      </div>

      {/* Actions */}
      <div className="col-span-6 sm:col-span-2 flex items-center justify-end gap-1">
        <Skeleton className="w-8 h-8 rounded-lg" delay={index + 4} />
        <Skeleton className="w-8 h-8 rounded-lg hidden sm:block" delay={index + 5} />
      </div>
    </motion.div>
  );
}

// Full page loading skeleton
export function PageSkeleton() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Header skeleton */}
      <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-surface-200/60 dark:border-surface-800/60">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="w-20 h-4 rounded-md" />
          <Skeleton className="w-3 h-3 rounded" />
          <Skeleton className="w-24 h-4 rounded-md" />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-36 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
            <Skeleton className="w-20 h-9 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
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
    <div className="w-64 h-full flex flex-col bg-white dark:bg-surface-900 border-r border-surface-200/60 dark:border-surface-800/60 p-4">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-24 h-5 rounded-md" />
      </div>

      {/* Nav items */}
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <Skeleton className="w-5 h-5 rounded-md" delay={i} />
            <Skeleton className="w-20 h-4 rounded-md" delay={i + 1} />
          </div>
        ))}
      </div>

      {/* Divider */}
      <Skeleton className="h-px w-full my-4 rounded-none" />

      {/* Storage */}
      <div className="mt-auto space-y-3">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Navbar skeleton
export function NavbarSkeleton() {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200/60 dark:border-surface-800/60 bg-white/80 dark:bg-surface-900/80">
      {/* Left */}
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl lg:hidden" />
        <Skeleton className="w-32 h-5 rounded-md hidden lg:block" />
      </div>

      {/* Search */}
      <Skeleton className="flex-1 max-w-2xl h-11 rounded-2xl mx-4" />

      {/* Right */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-24 h-9 rounded-xl hidden md:block" />
        <Skeleton className="w-9 h-9 rounded-xl" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </div>
  );
}
