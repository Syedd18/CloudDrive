"use client";

import { useState, useEffect } from "react";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Calendar,
  HardDrive,
  FileText,
  Star,
  Trash2,
  Share2,
  Edit3,
  Check,
  Camera,
} from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
}

interface StorageStats {
  storage: {
    used: number;
    total: number;
    percentage: number;
  };
  counts: {
    total: number;
    starred: number;
    trashed: number;
    shared: number;

  };
}

export function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadStats();
      setEditedName(user.name);
    }
  }, [isOpen, user]);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/storage", {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveName = async () => {
    // In a real app, you would save this to the backend
    setIsEditing(false);
    // For now, just close editing mode
  };

  const statCards = [
    {
      icon: FileText,
      label: "Total Files",
      value: stats?.counts.total || 0,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-500/20",
    },
    {
      icon: Star,
      label: "Starred",
      value: stats?.counts.starred || 0,
      color: "text-amber-500",
      bg: "bg-amber-100 dark:bg-amber-500/20",
    },
    {
      icon: Share2,
      label: "Shared",
      value: stats?.counts.shared || 0,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-500/20",
    },
    {
      icon: Trash2,
      label: "In Trash",
      value: stats?.counts.trashed || 0,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-500/20",
    },
  ];

  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
            {/* Header with gradient */}
            <div className="relative h-24 sm:h-32 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 overflow-hidden flex-shrink-0">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIHN0cm9rZS13aWR0aD0iMiIvPjwvZz48L3N2Zz4=')] opacity-30" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Avatar */}
              <div className="relative -mt-12 sm:-mt-16 px-4 sm:px-6">
                <div className="relative w-20 h-20 sm:w-28 sm:h-28 mx-auto">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-4 ring-white dark:ring-surface-900 shadow-xl overflow-hidden">
                    {user.avatar ? (
                      <NextImage
                        src={user.avatar}
                        alt={user.name}
                        width={112}
                        height={112}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="text-2xl sm:text-4xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-7 h-7 sm:w-8 sm:h-8 bg-white dark:bg-surface-800 rounded-full shadow-lg flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">
                    <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-surface-600 dark:text-surface-400" />
                  </button>
                </div>
              </div>

              {/* User Info */}
              <div className="px-4 sm:px-6 pt-3 sm:pt-4 pb-2 text-center">
                {isEditing ? (
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="text-lg sm:text-xl font-bold text-center bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white px-3 sm:px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 w-full max-w-[200px]"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-surface-900 dark:text-white">
                      {user.name}
                    </h2>
                    <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-surface-400" />
                  </button>
                </div>
              )}
              <p className="text-xs sm:text-sm text-surface-500 mt-1 flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
              </p>
            </div>

            {/* Stats Grid */}
            <div className="px-4 sm:px-6 py-3 sm:py-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                {isLoading
                  ? Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <div
                          key={i}
                          className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                        >
                          <div className="h-8 w-8 sm:h-10 sm:w-10 skeleton rounded-xl mb-2" />
                          <div className="h-5 sm:h-6 w-10 sm:w-12 skeleton rounded mb-1" />
                          <div className="h-3 sm:h-4 w-14 sm:w-16 skeleton rounded" />
                        </div>
                      ))
                  : statCards.map((stat) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                      >
                        <div
                          className={cn(
                            "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2",
                            stat.bg
                          )}
                        >
                          <stat.icon className={cn("w-4 h-4 sm:w-5 sm:h-5", stat.color)} />
                        </div>
                        <p className="text-xl sm:text-2xl font-bold text-surface-900 dark:text-white">
                          {stat.value}
                        </p>
                        <p className="text-xs text-surface-500">{stat.label}</p>
                      </motion.div>
                    ))}
              </div>
            </div>

            {/* Storage Usage */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                    <span className="text-xs sm:text-sm font-medium text-surface-900 dark:text-white">
                      Storage Used
                    </span>
                  </div>
                  {stats && (
                    <span className="text-xs sm:text-sm font-medium text-primary-500">
                      {stats.storage.percentage.toFixed(1)}%
                    </span>
                  )}
                </div>
                {isLoading ? (
                  <div className="h-2.5 sm:h-3 skeleton rounded-full" />
                ) : (
                  <>
                    <div className="h-2.5 sm:h-3 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stats?.storage.percentage || 0}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                      />
                    </div>
                    <p className="text-xs text-surface-500">
                      <span className="font-medium text-surface-700 dark:text-surface-300">
                        {formatFileSize(stats?.storage.used || 0)}
                      </span>
                      {" "}of {formatFileSize(stats?.storage.total || 0)} used
                    </p>
                  </>
                )}
              </div>
            </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
