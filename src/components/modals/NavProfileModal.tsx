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

      // Try to fetch user from API first (to get updated avatar)
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

      // Fallback to NextAuth session data if API call fails
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
    // Fetch storage data
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
    // Clear JWT token
    localStorage.removeItem("token");
    // Sign out from NextAuth
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
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md max-h-[85vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              {/* Header with Profile */}
              <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 pt-6 pb-12 px-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="relative group">
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden ring-4 ring-white/30 hover:ring-white/50 transition-all cursor-pointer"
                    >
                      {user?.avatar ? (
                        <Image src={user.avatar} alt="" width={80} height={80} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-white" />
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    </button>
                    <button
                      onClick={() => setIsAvatarModalOpen(true)}
                      className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    >
                      <Camera className="w-4 h-4 text-primary-600" />
                    </button>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {user?.name || 'User'}
                    </h2>
                    <p className="text-sm text-primary-100 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Storage Card */}
              <div className="px-6 -mt-6 relative z-10">
                <div className="bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700 p-4 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5 text-primary-500" />
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">Storage</span>
                    </div>
                    <span className="text-sm font-medium text-surface-500">
                      {storageData.percentage < 0.1 && storageData.used > 0 
                        ? '<0.1' 
                        : storageData.percentage.toFixed(1)}% used
                    </span>
                  </div>
                  <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${storageData.used > 0 ? Math.max(storageData.percentage, 2) : 0}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                    />
                  </div>
                  <p className="text-xs text-surface-500">
                    {formatBytes(storageData.used)} of {formatBytes(storageData.total)} used
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 pt-4 overflow-y-auto space-y-4">
                {/* File Stats */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Your Files</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{fileCounts.total}</p>
                        <p className="text-xs text-surface-500">Total Files</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Star className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{fileCounts.starred}</p>
                        <p className="text-xs text-surface-500">Starred</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{fileCounts.shared}</p>
                        <p className="text-xs text-surface-500">Shared</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-surface-900 dark:text-white">{fileCounts.trashed}</p>
                        <p className="text-xs text-surface-500">Trashed</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">Account Info</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-surface-500" />
                        <span className="text-sm text-surface-600 dark:text-surface-400">Member since</span>
                      </div>
                      <span className="text-sm font-medium text-surface-900 dark:text-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-4 h-4 text-surface-500" />
                        <span className="text-sm text-surface-600 dark:text-surface-400">Plan</span>
                      </div>
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-1 rounded-lg">
                        Free Plan
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-2">
                <button
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Update Photo
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4" />
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
