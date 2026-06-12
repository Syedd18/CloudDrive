"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  Menu,
  Moon,
  Sun,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Cloud,
  X,
  Bell,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { cn } from "@/lib/utils";
import { NavSettingsModal } from "@/components/modals/NavSettingsModal";
import { NavHelpModal } from "@/components/modals/NavHelpModal";
import { NavProfileModal } from "@/components/modals/NavProfileModal";
import { Tooltip } from "@/components/ui/Tooltip";
import toast from "react-hot-toast";

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onUploadClick: () => void;
  onMenuClick: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export function Navbar({
  searchQuery,
  onSearchChange,
  onUploadClick,
  onMenuClick,
}: NavbarProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Try to fetch user from API first (to get updated avatar)
      if (token || session?.user) {
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
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }, [session]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const handleLogout = async () => {
    if (session) {
      await signOut({ callbackUrl: "/login" });
    } else {
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // / to focus search
      if (e.key === "/" && !searchFocused && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchFocused]);

  return (
    <header className="sticky top-0 z-50 h-16 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-sm">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap leading-tight">
                CloudDrive
              </span>
              <span className="hidden xl:block text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                AI workspace
              </span>
            </div>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 min-w-0 max-w-2xl mx-2 sm:mx-4">
          <div className="relative flex items-center">
            <Search
              className={cn(
                "absolute left-3 w-4 h-4 transition-colors duration-150 pointer-events-none",
                searchFocused
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-slate-400 dark:text-slate-500"
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files, folders, and AI summaries... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-full h-9 pl-9 pr-20 rounded-lg text-sm transition-all duration-150",
                "bg-slate-50 dark:bg-slate-900/50",
                "border text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500",
                searchFocused
                  ? "border-indigo-500 bg-white dark:bg-slate-900 shadow-sm ring-2 ring-indigo-500/10"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/50 dark:hover:bg-slate-900/80",
                "focus:outline-none"
              )}
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>
              )}
              {!searchFocused && !searchQuery && (
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                  <kbd className="font-sans">/</kbd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2">
          {/* Upload Button */}
          <Tooltip content="Upload files" side="bottom">
            <button
              onClick={onUploadClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>
          </Tooltip>

          <Tooltip content="AI insights" side="bottom">
            <button
              className="hidden md:flex p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              aria-label="AI insights"
            >
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            </button>
          </Tooltip>

          <Tooltip content="Notifications" side="bottom">
            <button
              className="hidden sm:flex relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950" />
            </button>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip content={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} side="bottom">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {theme === "light" ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </Tooltip>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {user && (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-0.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-xs border border-indigo-200 dark:border-indigo-800">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            )}

            <AnimatePresence>
              {showUserMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">Signed in as</p>
                    <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsHelpOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                  <div className="p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NavSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <NavHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
      <NavProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onAvatarChange={(avatarUrl) => {
          setUser((prev) => prev ? { ...prev, avatar: avatarUrl } : null);
        }}
      />
    </header>
  );
}
