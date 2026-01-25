"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Upload,
  Bell,
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
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUser();
  }, [session]);

  const loadUser = async () => {
    try {
      // If user is logged in via NextAuth (Google)
      if (session?.user) {
        setUser({
          id: session.user.id || "",
          name: session.user.name || "User",
          email: session.user.email || "",
          avatar: session.user.image || undefined,
        });
        return;
      }

      // If user is logged in via JWT (email/password)
      const token = localStorage.getItem("token");
      if (!token) return;

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
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  };

  const handleLogout = async () => {
    // Check if user is logged in via NextAuth
    if (session) {
      await signOut({ callbackUrl: "/login" });
    } else {
      // JWT logout
      localStorage.removeItem("token");
      toast.success("Logged out successfully");
      router.push("/login");
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 h-16 glass border-b border-surface-200/50 dark:border-surface-800/50">
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Left Section - Logo & Menu */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:block text-lg font-semibold text-surface-900 dark:text-white">
              CloudDrive
            </span>
          </div>
        </div>

        {/* Center - Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <div
            className={cn(
              "relative flex items-center transition-all duration-200",
              searchFocused && "scale-[1.02]"
            )}
          >
            <Search
              className={cn(
                "absolute left-4 w-5 h-5 transition-colors duration-200",
                searchFocused
                  ? "text-primary-500"
                  : "text-surface-400 dark:text-surface-500"
              )}
            />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                "w-full h-11 pl-12 pr-4 rounded-2xl",
                "bg-surface-100 dark:bg-surface-800/50",
                "border-2 transition-all duration-200",
                searchFocused
                  ? "border-primary-500 bg-white dark:bg-surface-800 shadow-glow"
                  : "border-transparent hover:bg-surface-200/50 dark:hover:bg-surface-700/50",
                "text-surface-900 dark:text-white placeholder:text-surface-400 dark:placeholder:text-surface-500",
                "focus:outline-none"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 p-1 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-4 h-4 text-surface-500" />
              </button>
            )}
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Upload Button */}
          <button onClick={onUploadClick} className="btn-primary hidden sm:flex">
            <Upload className="w-4 h-4" />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* Theme Toggle */}
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

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {user && (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center ring-2 ring-surface-200 dark:ring-surface-700">
                  <span className="text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>
            )}

            <AnimatePresence>
              {showUserMenu && user && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface-800 rounded-2xl shadow-soft-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
                >
                  {/* User Info */}
                  <div className="p-4 border-b border-surface-200 dark:border-surface-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        <span className="text-xl font-semibold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-surface-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-sm text-surface-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      <User className="w-5 h-5 text-surface-500" />
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        Profile
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsSettingsOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      <Settings className="w-5 h-5 text-surface-500" />
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        Settings
                      </span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setIsHelpOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      <HelpCircle className="w-5 h-5 text-surface-500" />
                      <span className="text-sm text-surface-700 dark:text-surface-300">
                        Help & Support
                      </span>
                    </button>
                  </div>

                  <div className="p-2 border-t border-surface-200 dark:border-surface-700">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors group"
                    >
                      <LogOut className="w-5 h-5 text-surface-500 group-hover:text-danger-500" />
                      <span className="text-sm text-surface-700 dark:text-surface-300 group-hover:text-danger-500">
                        Sign Out
                      </span>
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
      />
    </header>
  );
}
