"use client";

import { motion } from "framer-motion";

export function FileCardSkeleton() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-[#161b22] rounded-2xl overflow-hidden border border-surface-200/60 dark:border-surface-700/50"
    >
      {/* Thumbnail skeleton */}
      <div className="aspect-[4/3] skeleton" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        <div className="h-4 skeleton rounded-lg w-3/4" />
        <div className="flex items-center gap-2">
          <div className="h-3 skeleton rounded-md w-16" />
          <div className="w-1 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
          <div className="h-3 skeleton rounded-md w-12" />
        </div>
      </div>
    </motion.div>
  );
}

export function FileListSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3.5 items-center border-b border-surface-100 dark:border-surface-800/50 last:border-b-0">
      <div className="col-span-5 sm:col-span-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-4 skeleton rounded-md w-[70%] max-w-[180px]" />
          <div className="h-3 skeleton rounded-md w-[40%] max-w-[100px] sm:hidden" />
        </div>
      </div>
      <div className="col-span-3 sm:col-span-2 hidden sm:block">
        <div className="h-3.5 skeleton rounded-md w-[80%] max-w-[90px]" />
      </div>
      <div className="col-span-2 hidden sm:block">
        <div className="h-3.5 skeleton rounded-md w-[60%] max-w-[70px]" />
      </div>
      <div className="col-span-4 sm:col-span-2 flex justify-end gap-1.5">
        <div className="w-8 h-8 skeleton rounded-lg" />
        <div className="w-8 h-8 skeleton rounded-lg hidden sm:block" />
      </div>
    </div>
  );
}

export function FileGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4">
      {[...Array(count)].map((_, i) => (
        <FileCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FileListGroupSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="bg-white dark:bg-[#161b22] rounded-2xl shadow-sm border border-surface-200/60 dark:border-surface-700/50 overflow-hidden">
      {/* Header skeleton */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
        <div className="col-span-5 sm:col-span-6">
          <div className="h-3 skeleton rounded w-12" />
        </div>
        <div className="col-span-3 sm:col-span-2 hidden sm:block">
          <div className="h-3 skeleton rounded w-16" />
        </div>
        <div className="col-span-2 hidden sm:block">
          <div className="h-3 skeleton rounded w-10" />
        </div>
        <div className="col-span-4 sm:col-span-2">
          <div className="h-3 skeleton rounded w-14 ml-auto" />
        </div>
      </div>

      {/* List items */}
      {[...Array(count)].map((_, i) => (
        <FileListSkeleton key={i} />
      ))}
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="w-[280px] h-full bg-white dark:bg-[#0d1117] border-r border-surface-200/60 dark:border-surface-800/60 flex flex-col">
      {/* New button skeleton */}
      <div className="px-4 pt-6 pb-3">
        <div className="h-12 skeleton rounded-2xl" />
      </div>

      {/* Quick actions skeleton */}
      <div className="px-4 pb-5 flex gap-2">
        <div className="flex-1 h-10 skeleton rounded-xl" />
        <div className="flex-1 h-10 skeleton rounded-xl" />
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-surface-200/60 dark:border-surface-800/60" />

      {/* Nav items skeleton */}
      <div className="flex-1 px-3 py-3 space-y-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 skeleton rounded-xl" />
        ))}
      </div>

      {/* Storage skeleton */}
      <div className="p-4 border-t border-surface-200/60 dark:border-surface-800/60">
        <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
          <div className="h-4 skeleton rounded w-20 mb-2" />
          <div className="h-1.5 skeleton rounded-full mb-2" />
          <div className="h-3 skeleton rounded w-32" />
        </div>
      </div>
    </div>
  );
}
