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
    <header className="sticky top-0 z-50 h-16 glass border-b border-surface-200/50 dark:border-surface-800/50">
      <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-3">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft hover-lift">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-semibold text-surface-900 dark:text-white tracking-tight">
              CloudDrive
            </span>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-2 sm:mx-4">
          <div
            className={cn(
              "relative flex items-center transition-all duration-200",
              searchFocused && "scale-[1.01]"
            )}
          >
            <Search
              className={cn(
                "absolute left-4 w-5 h-5 transition-colors duration-200 pointer-events-none",
                searchFocused
                  ? "text-primary-500"
                  : "text-surface-400 dark:text-surface-500"
              )}
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-full h-11 pl-12 pr-24 rounded-2xl",
                "bg-surface-100 dark:bg-surface-800/50",
                "border-2 transition-all duration-200",
                searchFocused
                  ? "border-primary-500 bg-white dark:bg-surface-800 shadow-glow"
                  : "border-transparent hover:bg-surface-200/50 dark:hover:bg-surface-700/50",
                "text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500",
                "focus:outline-none"
              )}
            />
            <div className="absolute right-3 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4 text-surface-500" />
                </button>
              )}
              {!searchFocused && !searchQuery && (
                <div className="hidden sm:flex items-center gap-1 text-surface-400">
                  <kbd className="kbd">/</kbd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Upload Button */}
          <Tooltip content="Upload files" side="bottom">
            <button
              onClick={onUploadClick}
              className="btn-primary hidden sm:flex shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Upload</span>
            </button>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip content={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} side="bottom">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {theme === "light" ? (
                    <Moon className="w-5 h-5 text-surface-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-surface-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>
          </Tooltip>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {user && (
              <Tooltip content="Account" side="bottom">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-full ring-2 ring-surface-200 dark:ring-surface-700 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 min-w-[32px] min-h-[32px] shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-surface-200 dark:ring-surface-700">
                      <span className="text-sm font-semibold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>
              </Tooltip>
            )}

            <AnimatePresence>
              {showUserMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15, ease: [0.175, 0.885, 0.32, 1.275] }}
                  className="absolute right-0 mt-2 w-72 dropdown-menu p-0 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 bg-surface-50 dark:bg-surface-100/50 border-b border-surface-200/60 dark:border-surface-200/40">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 min-w-[48px] min-h-[48px] shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 min-w-[48px] min-h-[48px] shrink-0 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                          <span className="text-xl font-semibold text-white">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-surface-900 dark:text-surface-900 truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-surface-500 dark:text-surface-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-1.5">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileOpen(true);
                      }}
                      className="dropdown-item"
                    >
                      <User className="w-4 h-4 text-surface-500" />
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsSettingsOpen(true);
                      }}
                      className="dropdown-item"
                    >
                      <Settings className="w-4 h-4 text-surface-500" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsHelpOpen(true);
                      }}
                      className="dropdown-item"
                    >
                      <HelpCircle className="w-4 h-4 text-surface-500" />
                      <span>Help & Support</span>
                    </button>
                  </div>

                  <div className="dropdown-divider" />

                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="dropdown-item-danger"
                    >
                      <LogOut className="w-4 h-4" />
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
