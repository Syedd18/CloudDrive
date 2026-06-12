"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
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
  LogOut,
  Camera,
} from "lucide-react";
import { AvatarUploadModal } from "./AvatarUploadModal";
import { cn } from "@/lib/utils";

interface NavProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarChange?: (avatarUrl: string) => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export function NavProfileModal({ isOpen, onClose, onAvatarChange }: NavProfileModalProps) {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [storageData, setStorageData] = useState({
    used: 0,
    total: 15 * 1024 * 1024 * 1024, // 15GB default
    percentage: 0,
  });
  const [fileCounts, setFileCounts] = useState({
    total: 0,
    starred: 0,
    trashed: 0,
    shared: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (token || session?.user) {
        try {
          const headers: Record<string, string> = {};
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
          
          const response = await fetch("/api/auth/me", {
            headers,
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            return;
          }
        } catch (error) {
          console.error("Failed to load user from API:", error);
        }
      }

      if (session?.user) {
        setUser({
          id: session.user.id || "",
          name: session.user.name || "User",
          email: session.user.email || "",
          avatar: session.user.image || undefined,
        });
      }
    };

    if (isOpen) {
      loadUser();
    }
  }, [isOpen, session]);

  useEffect(() => {
    const fetchStorageData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/storage', {
          headers,
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.storage) {
            setStorageData(data.storage);
          }
          if (data.counts) {
            setFileCounts(data.counts);
          }
        }
      } catch (error) {
        console.error('Failed to fetch storage data:', error);
      }
    };

    if (isOpen) {
      fetchStorageData();
    }
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleLogout = async () => {
    localStorage.removeItem("token");
    await signOut({ callbackUrl: "/login" });
    onClose();
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header with Profile Cover */}
              <div className="relative bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-850 pt-5 pb-10 px-5">
                <button
                  onClick={onClose}
                  className="absolute top-3.5 right-3.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-405 rounded-lg shadow-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="w-16 h-16 rounded-full bg-indigo-650 flex items-center justify-center overflow-hidden ring-4 ring-white dark:ring-slate-900 shadow-sm relative hover:opacity-95 transition-opacity"
                    >
                      {user?.avatar ? (
                        <Image src={user.avatar} alt="" width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-white" />
                      )}
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </button>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                    >
                      <Camera className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                    </button>
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {user?.name || 'User'}
                    </h2>
                    <p className="text-[10px] font-semibold text-slate-500 mt-0.5 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3" />
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage Card */}
              <div className="px-5 -mt-5 relative z-10">
                <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3.5 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-205">Storage</span>
                    </div>
                    <span className="text-xs font-bold text-indigo-650 dark:text-indigo-400">
                      {storageData.percentage < 0.1 && storageData.used > 0 
                        ? '<0.1' 
                        : storageData.percentage.toFixed(1)}% used
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storageData.used > 0 ? Math.max(storageData.percentage, 2) : 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-indigo-650 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-slate-450 dark:text-slate-500">
                    {formatBytes(storageData.used)} of {formatBytes(storageData.total)} used
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 p-5 pt-3 overflow-y-auto space-y-4">
                {/* File Stats */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2.5">Your Files</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fileCounts.total}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Files</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center shrink-0">
                        <Star className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fileCounts.starred}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Starred</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center shrink-0">
                        <Share2 className="w-3.5 h-3.5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fileCounts.shared}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Shared</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center shrink-0">
                        <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{fileCounts.starred}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Trashed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-slate-505 uppercase tracking-wider mb-2.5">Account Info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-655 text-slate-600 dark:text-slate-400">Member since</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850">
                      <div className="flex items-center gap-2">
                        <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-655 text-slate-600 dark:text-slate-400">Plan</span>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-1.5 py-0.5 rounded">
                        Free Plan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-850 space-y-2 bg-slate-50/50 dark:bg-slate-950/20">
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-full h-9 flex items-center justify-center gap-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Update Photo
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full h-9 flex items-center justify-center gap-1.5 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/10 border border-slate-200 dark:border-slate-800 text-xs font-bold text-red-600 dark:text-red-400 rounded-lg shadow-sm transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  const handleAvatarUpdate = (avatarUrl: string) => {
    setUser((prev) => prev ? { ...prev, avatar: avatarUrl } : null);
    onAvatarChange?.(avatarUrl);
  };

  return (
    <>
      {createPortal(modalContent, document.body)}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        onAvatarUpdate={handleAvatarUpdate}
        currentAvatar={user?.avatar}
      />
    </>
  );
}
