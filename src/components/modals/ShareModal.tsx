"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Link2,
  Mail,
  Users,
  Copy,
  Check,
  Globe,
  Lock,
  UserPlus,
  Trash2,
  ChevronDown,
  Eye,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import type { FileItem } from "@/types";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
  onShareUpdate?: () => void;
}

interface SharedUser {
  email: string;
  canEdit: boolean;
  createdAt: string;
}

type LinkAccess = "restricted" | "anyone";
type Permission = "view" | "edit";

export function ShareModal({ isOpen, onClose, file, onShareUpdate }: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"people" | "link">("people");
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [permission, setPermission] = useState<Permission>("view");
  const [linkAccess, setLinkAccess] = useState<LinkAccess>("restricted");
  const [linkPermission, setLinkPermission] = useState<Permission>("view");
  const [isLoading, setIsLoading] = useState(false);
  const [sharedUsers, setSharedUsers] = useState<SharedUser[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");
  const [showPermissionDropdown, setShowPermissionDropdown] = useState(false);
  const [showLinkPermissionDropdown, setShowLinkPermissionDropdown] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && file) {
      // Generate share link
      setShareLink(`${window.location.origin}/share/${file.id}`);
      
      // Load existing shares and link settings
      loadSharedUsers();
      loadLinkSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, file]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closing
      setEmail("");
      setEmails([]);
      setPermission("view");
      setCopied(false);
    }
  }, [isOpen]);

  const loadLinkSettings = async () => {
    if (!file) return;

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/share/link`, {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setLinkAccess(data.isPublic ? "anyone" : "restricted");
        setLinkPermission(data.canEdit ? "edit" : "view");
      }
    } catch (error) {
      console.error("Failed to load link settings:", error);
    }
  };

  const loadSharedUsers = async () => {
    if (!file) return;
    
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/share`, {
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSharedUsers(data.shares || []);
      }
    } catch (error) {
      console.error("Failed to load shared users:", error);
    }
  };

  const handleAddEmail = () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emails.includes(trimmedEmail)) {
      toast.error("Email already added");
      return;
    }

    setEmails([...emails, trimmedEmail]);
    setEmail("");
    emailInputRef.current?.focus();
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    } else if (e.key === "Backspace" && !email && emails.length > 0) {
      // Remove last email on backspace when input is empty
      setEmails(emails.slice(0, -1));
    }
  };

  const handleShare = async () => {
    if (emails.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    if (!file) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/share`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          emails,
          canEdit: permission === "edit",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to share file");
      }

      toast.success(`Shared with ${emails.length} ${emails.length === 1 ? "person" : "people"}`);
      setEmails([]);
      loadSharedUsers();
      onShareUpdate?.();
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Failed to share file");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShare = async (emailToRemove: string) => {
    if (!file) return;

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/share`, {
        method: "DELETE",
        headers,
        credentials: "include",
        body: JSON.stringify({ email: emailToRemove }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove share");
      }

      toast.success("Access removed");
      loadSharedUsers();
      onShareUpdate?.();
    } catch (error) {
      console.error("Remove share error:", error);
      toast.error("Failed to remove access");
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleUpdateLinkAccess = async () => {
    if (!file) return;

    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/files/${file.id}/share/link`, {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({
          access: linkAccess,
          canEdit: linkPermission === "edit",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update link settings");
      }

      toast.success("Link settings updated");
    } catch (error) {
      console.error("Update link error:", error);
      toast.error("Failed to update link settings");
    }
  };

  if (!mounted || !file) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000]">
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
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl w-full max-w-lg pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Share &ldquo;{file.name}&rdquo;
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    {file.type === "folder" ? "Folder" : "File"} sharing options
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <button
                  onClick={() => setActiveTab("people")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-colors relative ${
                    activeTab === "people"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Share with people
                  {activeTab === "people" && (
                    <motion.div
                      layoutId="shareTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("link")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold transition-colors relative ${
                    activeTab === "link"
                      ? "text-indigo-600 dark:text-indigo-400"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Get link
                  {activeTab === "link" && (
                    <motion.div
                      layoutId="shareTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
                    />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === "people" ? (
                    <motion.div
                      key="people"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {/* Email Input */}
                      <div>
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                          Add people
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex flex-wrap gap-1.5 p-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                            {emails.map((e) => (
                              <span
                                key={e}
                                className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30 rounded text-xs font-semibold"
                              >
                                {e}
                                <button
                                  onClick={() => handleRemoveEmail(e)}
                                  className="hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded p-0.5 transition-colors"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            ))}
                            <input
                              ref={emailInputRef}
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              onKeyDown={handleKeyDown}
                              placeholder={emails.length === 0 ? "Enter email addresses..." : ""}
                              className="flex-1 min-w-[150px] bg-transparent text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none py-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permission Selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Permission
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                            className="flex items-center gap-1.5 h-8 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            {permission === "view" ? (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Can view
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-3.5 h-3.5" />
                                Can edit
                              </>
                            )}
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          </button>

                          <AnimatePresence>
                            {showPermissionDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPermission("view");
                                    setShowPermissionDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                                    permission === "view" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10" : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  Can view
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPermission("edit");
                                    setShowPermissionDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                                    permission === "edit" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10" : "text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Can edit
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Share Button */}
                      <button
                        onClick={handleShare}
                        disabled={emails.length === 0 || isLoading}
                        className="w-full flex items-center justify-center gap-1.5 h-9 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-500 text-white rounded-lg text-xs font-bold shadow-sm transition-colors disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            Share
                          </>
                        )}
                      </button>

                      {/* Shared Users List */}
                      {sharedUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                            People with access
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {sharedUsers.map((user) => (
                              <div
                                key={user.email}
                                className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 rounded-lg"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                    {user.email[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                      {user.email}
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500">
                                      {user.canEdit ? "Can edit" : "Can view"}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveShare(user.email)}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors flex-shrink-0"
                                  title="Remove access"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="link"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      {/* Link Access */}
                      <div className="space-y-2.5">
                        <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          Link access
                        </label>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setLinkAccess("restricted");
                              handleUpdateLinkAccess();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              linkAccess === "restricted"
                                ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              linkAccess === "restricted"
                                ? "bg-indigo-100/50 dark:bg-indigo-950/30"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}>
                              <Lock className={`w-4 h-4 ${
                                linkAccess === "restricted"
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-slate-500"
                              }`} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className={`text-xs font-bold ${
                                linkAccess === "restricted"
                                  ? "text-indigo-600 dark:text-indigo-300"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}>
                                Restricted
                              </p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">
                                Only people with explicit access can open
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setLinkAccess("anyone");
                              handleUpdateLinkAccess();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                              linkAccess === "anyone"
                                ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10"
                                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              linkAccess === "anyone"
                                ? "bg-indigo-100/50 dark:bg-indigo-950/30"
                                : "bg-slate-100 dark:bg-slate-800"
                            }`}>
                              <Globe className={`w-4 h-4 ${
                                linkAccess === "anyone"
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-slate-500"
                              }`} />
                            </div>
                            <div className="text-left min-w-0">
                              <p className={`text-xs font-bold ${
                                linkAccess === "anyone"
                                  ? "text-indigo-600 dark:text-indigo-300"
                                  : "text-slate-800 dark:text-slate-200"
                              }`}>
                                Anyone with the link
                              </p>
                              <p className="text-[10px] font-medium text-slate-500 truncate">
                                Anyone on the internet with the link can access
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Link Permission (when anyone can access) */}
                      {linkAccess === "anyone" && (
                        <div className="flex items-center justify-between py-1 border-t border-slate-200/50 dark:border-slate-800/50 pt-3">
                          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            Link permission
                          </span>
                          <div className="relative">
                            <button
                              onClick={() => setShowLinkPermissionDropdown(!showLinkPermissionDropdown)}
                              className="flex items-center gap-1.5 h-8 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors"
                            >
                              {linkPermission === "view" ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  Can view
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-3.5 h-3.5" />
                                  Can edit
                                </>
                              )}
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            <AnimatePresence>
                              {showLinkPermissionDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
                                >
                                  <button
                                    onClick={() => {
                                      setLinkPermission("view");
                                      setShowLinkPermissionDropdown(false);
                                      handleUpdateLinkAccess();
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                                      linkPermission === "view" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10" : "text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Can view
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLinkPermission("edit");
                                      setShowLinkPermissionDropdown(false);
                                      handleUpdateLinkAccess();
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${
                                      linkPermission === "edit" ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/10" : "text-slate-700 dark:text-slate-300"
                                    }`}
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    Can edit
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Copy Link */}
                      <div className="flex gap-2 pt-2">
                        <div className="flex-1 flex items-center gap-2 px-3 h-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                          <Link2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="flex-1 bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none truncate"
                          />
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className={`flex items-center gap-1.5 px-4 h-9 rounded-lg font-bold text-xs transition-colors shadow-sm ${
                            copied
                              ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium text-center">
                        {linkAccess === "restricted"
                          ? "Only people you've shared with can use this link"
                          : "Anyone on the internet with this link can access the file"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
