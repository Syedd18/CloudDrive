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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-surface-800 rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Share &ldquo;{file.name}&rdquo;
                  </h2>
                  <p className="text-sm text-surface-500 mt-0.5">
                    {file.type === "folder" ? "Folder" : "File"} sharing options
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-surface-200 dark:border-surface-700">
                <button
                  onClick={() => setActiveTab("people")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === "people"
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  Share with people
                  {activeTab === "people" && (
                    <motion.div
                      layoutId="shareTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("link")}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                    activeTab === "link"
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white"
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Get link
                  {activeTab === "link" && (
                    <motion.div
                      layoutId="shareTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Email Input */}
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                          Add people
                        </label>
                        <div className="flex gap-2">
                          <div className="flex-1 flex flex-wrap gap-1.5 p-2 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-transparent transition-all">
                            {emails.map((e) => (
                              <span
                                key={e}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg text-sm"
                              >
                                {e}
                                <button
                                  onClick={() => handleRemoveEmail(e)}
                                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
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
                              className="flex-1 min-w-[150px] bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 outline-none py-1"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Permission Selector */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-surface-600 dark:text-surface-400">
                          Permission
                        </span>
                        <div className="relative">
                          <button
                            onClick={() => setShowPermissionDropdown(!showPermissionDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg text-sm font-medium text-surface-700 dark:text-surface-300 transition-colors"
                          >
                            {permission === "view" ? (
                              <>
                                <Eye className="w-4 h-4" />
                                Can view
                              </>
                            ) : (
                              <>
                                <Edit3 className="w-4 h-4" />
                                Can edit
                              </>
                            )}
                            <ChevronDown className="w-4 h-4" />
                          </button>

                          <AnimatePresence>
                            {showPermissionDropdown && (
                              <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-surface-700 rounded-xl shadow-lg border border-surface-200 dark:border-surface-600 overflow-hidden z-10"
                              >
                                <button
                                  onClick={() => {
                                    setPermission("view");
                                    setShowPermissionDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors ${
                                    permission === "view" ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300"
                                  }`}
                                >
                                  <Eye className="w-4 h-4" />
                                  Can view
                                </button>
                                <button
                                  onClick={() => {
                                    setPermission("edit");
                                    setShowPermissionDropdown(false);
                                  }}
                                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors ${
                                    permission === "edit" ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300"
                                  }`}
                                >
                                  <Edit3 className="w-4 h-4" />
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
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-surface-300 dark:disabled:bg-surface-600 text-white rounded-xl font-medium transition-colors disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Share
                          </>
                        )}
                      </button>

                      {/* Shared Users List */}
                      {sharedUsers.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                          <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                            People with access
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {sharedUsers.map((user) => (
                              <div
                                key={user.email}
                                className="flex items-center justify-between py-2 px-3 bg-surface-50 dark:bg-surface-900 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                                    {user.email[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-surface-900 dark:text-white">
                                      {user.email}
                                    </p>
                                    <p className="text-xs text-surface-500">
                                      {user.canEdit ? "Can edit" : "Can view"}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveShare(user.email)}
                                  className="p-1.5 text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/30 rounded-lg transition-colors"
                                  title="Remove access"
                                >
                                  <Trash2 className="w-4 h-4" />
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
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4"
                    >
                      {/* Link Access */}
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                          Link access
                        </label>
                        
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              setLinkAccess("restricted");
                              handleUpdateLinkAccess();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              linkAccess === "restricted"
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              linkAccess === "restricted"
                                ? "bg-primary-100 dark:bg-primary-900/40"
                                : "bg-surface-100 dark:bg-surface-700"
                            }`}>
                              <Lock className={`w-5 h-5 ${
                                linkAccess === "restricted"
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-500"
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className={`font-medium ${
                                linkAccess === "restricted"
                                  ? "text-primary-700 dark:text-primary-300"
                                  : "text-surface-700 dark:text-surface-300"
                              }`}>
                                Restricted
                              </p>
                              <p className="text-xs text-surface-500">
                                Only people you share with can access
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => {
                              setLinkAccess("anyone");
                              handleUpdateLinkAccess();
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                              linkAccess === "anyone"
                                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${
                              linkAccess === "anyone"
                                ? "bg-primary-100 dark:bg-primary-900/40"
                                : "bg-surface-100 dark:bg-surface-700"
                            }`}>
                              <Globe className={`w-5 h-5 ${
                                linkAccess === "anyone"
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-500"
                              }`} />
                            </div>
                            <div className="text-left">
                              <p className={`font-medium ${
                                linkAccess === "anyone"
                                  ? "text-primary-700 dark:text-primary-300"
                                  : "text-surface-700 dark:text-surface-300"
                              }`}>
                                Anyone with the link
                              </p>
                              <p className="text-xs text-surface-500">
                                Anyone on the internet with the link can access
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Link Permission (when anyone can access) */}
                      {linkAccess === "anyone" && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-surface-600 dark:text-surface-400">
                            Link permission
                          </span>
                          <div className="relative">
                            <button
                              onClick={() => setShowLinkPermissionDropdown(!showLinkPermissionDropdown)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-surface-100 dark:bg-surface-700 hover:bg-surface-200 dark:hover:bg-surface-600 rounded-lg text-sm font-medium text-surface-700 dark:text-surface-300 transition-colors"
                            >
                              {linkPermission === "view" ? (
                                <>
                                  <Eye className="w-4 h-4" />
                                  Can view
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-4 h-4" />
                                  Can edit
                                </>
                              )}
                              <ChevronDown className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {showLinkPermissionDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-surface-700 rounded-xl shadow-lg border border-surface-200 dark:border-surface-600 overflow-hidden z-10"
                                >
                                  <button
                                    onClick={() => {
                                      setLinkPermission("view");
                                      setShowLinkPermissionDropdown(false);
                                      handleUpdateLinkAccess();
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors ${
                                      linkPermission === "view" ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300"
                                    }`}
                                  >
                                    <Eye className="w-4 h-4" />
                                    Can view
                                  </button>
                                  <button
                                    onClick={() => {
                                      setLinkPermission("edit");
                                      setShowLinkPermissionDropdown(false);
                                      handleUpdateLinkAccess();
                                    }}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors ${
                                      linkPermission === "edit" ? "text-primary-600 dark:text-primary-400" : "text-surface-700 dark:text-surface-300"
                                    }`}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                    Can edit
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}

                      {/* Copy Link */}
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl">
                          <Link2 className="w-4 h-4 text-surface-400 flex-shrink-0" />
                          <input
                            type="text"
                            readOnly
                            value={shareLink}
                            className="flex-1 bg-transparent text-sm text-surface-700 dark:text-surface-300 outline-none truncate"
                          />
                        </div>
                        <button
                          onClick={handleCopyLink}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                            copied
                              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                              : "bg-primary-600 hover:bg-primary-700 text-white"
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>

                      {/* Info */}
                      <p className="text-xs text-surface-500 text-center">
                        {linkAccess === "restricted"
                          ? "Only people you've shared with can use this link"
                          : "Anyone with this link can access the file"}
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
