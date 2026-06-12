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
    setIsEditing(false);
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
            className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-50"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header Cover */}
              <div className="relative h-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg shadow-sm transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto pb-4">
                {/* Avatar */}
                <div className="relative -mt-10 px-6">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full rounded-full bg-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-md overflow-hidden">
                      {user.avatar ? (
                        <NextImage
                          src={user.avatar}
                          alt={user.name}
                          width={80}
                          height={80}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <Camera className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="px-6 pt-3 pb-2 text-center">
                  {isEditing ? (
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="h-8 px-2.5 text-xs font-semibold text-center border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 w-full max-w-[180px]"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveName}
                        className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {user.name}
                      </h2>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-1 flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[200px] sm:max-w-none">{user.email}</span>
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="px-6 py-3">
                  <div className="grid grid-cols-2 gap-3">
                    {isLoading
                      ? Array(4)
                          .fill(0)
                          .map((_, i) => (
                            <div
                              key={i}
                              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                            >
                              <div className="h-7 w-7 bg-slate-200 dark:bg-slate-800 rounded mb-2 animate-pulse" />
                              <div className="h-4 w-10 bg-slate-200 dark:bg-slate-800 rounded mb-1 animate-pulse" />
                              <div className="h-3 w-14 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                            </div>
                          ))
                      : statCards.map((stat) => {
                          const Icon = stat.icon;
                          let frameColor = "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400";
                          if (stat.label === "Starred") {
                            frameColor = "bg-amber-50 dark:bg-amber-950/20 text-amber-500";
                          } else if (stat.label === "Shared") {
                            frameColor = "bg-purple-50 dark:bg-purple-950/20 text-purple-500";
                          } else if (stat.label === "In Trash") {
                            frameColor = "bg-rose-50 dark:bg-rose-950/20 text-rose-500";
                          }
                          return (
                            <motion.div
                              key={stat.label}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                            >
                              <div
                                className={cn(
                                  "w-7 h-7 rounded-lg flex items-center justify-center mb-2.5",
                                  frameColor
                                )}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {stat.value}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
                            </motion.div>
                          );
                        })}
                  </div>
                </div>

                {/* Storage Usage */}
                <div className="px-6 pb-2">
                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Storage Used
                        </span>
                      </div>
                      {stats && (
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                          {stats.storage.percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
                    ) : (
                      <>
                        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${stats?.storage.percentage || 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-indigo-600 rounded-full"
                          />
                        </div>
                        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                          <span className="text-slate-700 dark:text-slate-300 font-bold">
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
