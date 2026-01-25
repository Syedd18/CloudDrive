"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  BellOff,
  Grid3X3,
  List,
  Shield,
  Download,
  Trash2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ThemeOption = "light" | "dark" | "system";
type ViewOption = "grid" | "list";

interface SettingsState {
  theme: ThemeOption;
  defaultView: ViewOption;
  notifications: boolean;
  confirmBeforeDelete: boolean;
  showHiddenFiles: boolean;
  autoDownloadOnClick: boolean;
}

const defaultSettings: SettingsState = {
  theme: "system",
  defaultView: "grid",
  notifications: true,
  confirmBeforeDelete: true,
  showHiddenFiles: false,
  autoDownloadOnClick: false,
};

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "privacy">("appearance");
  const [saved, setSaved] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("driveSettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch {
        // Use defaults if parsing fails
      }
    }
  }, []);

  const handleSettingChange = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("driveSettings", JSON.stringify(newSettings));
    
    // Apply theme immediately
    if (key === "theme") {
      applyTheme(value as ThemeOption);
    }
    
    // Show saved indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyTheme = (theme: ThemeOption) => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // System preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  };

  const sections = [
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ] as const;

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
              className="w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Settings
                  </h2>
                  <p className="text-sm text-surface-500">
                    Customize your Cloud Drive experience
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400 rounded-full text-xs font-medium"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Saved
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Section Tabs - Desktop */}
              <div className="w-48 border-r border-surface-200 dark:border-surface-700 p-3 hidden sm:block flex-shrink-0">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        activeSection === section.id
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                      )}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Section Tabs */}
              <div className="sm:hidden px-3 pt-3 pb-2 border-b border-surface-200 dark:border-surface-700 flex-shrink-0">
                <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl overflow-x-auto">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap min-w-0",
                        activeSection === section.id
                          ? "bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm"
                          : "text-surface-500"
                      )}
                    >
                      <section.icon className="w-3.5 h-3.5" />
                      {section.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeSection === "appearance" && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-5"
                    >
                      {/* Theme Selection */}
                      <div>
                        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">
                          Theme
                        </h3>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {[
                            { id: "light", icon: Sun, label: "Light" },
                            { id: "dark", icon: Moon, label: "Dark" },
                            { id: "system", icon: Monitor, label: "System" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSettingChange("theme", option.id as ThemeOption)}
                              className={cn(
                                "flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-4 rounded-xl border-2 transition-all",
                                settings.theme === option.id
                                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                  : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                              )}
                            >
                              <option.icon className={cn(
                                "w-5 h-5 sm:w-6 sm:h-6",
                                settings.theme === option.id
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-500"
                              )} />
                              <span className={cn(
                                "text-xs sm:text-sm font-medium",
                                settings.theme === option.id
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-600 dark:text-surface-400"
                              )}>
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Default View */}
                      <div>
                        <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">
                          Default View
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {[
                            { id: "grid", icon: Grid3X3, label: "Grid View" },
                            { id: "list", icon: List, label: "List View" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSettingChange("defaultView", option.id as ViewOption)}
                              className={cn(
                                "flex items-center justify-center gap-2 sm:gap-3 p-2.5 sm:p-4 rounded-xl border-2 transition-all",
                                settings.defaultView === option.id
                                  ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                  : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                              )}
                            >
                              <option.icon className={cn(
                                "w-5 h-5",
                                settings.defaultView === option.id
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-500"
                              )} />
                              <span className={cn(
                                "text-sm font-medium",
                                settings.defaultView === option.id
                                  ? "text-primary-600 dark:text-primary-400"
                                  : "text-surface-600 dark:text-surface-400"
                              )}>
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "preferences" && (
                    <motion.div
                      key="preferences"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      {/* Toggle Settings */}
                      {[
                        {
                          key: "notifications",
                          icon: settings.notifications ? Bell : BellOff,
                          label: "Notifications",
                          description: "Get notified about file uploads and shares",
                        },
                        {
                          key: "confirmBeforeDelete",
                          icon: Trash2,
                          label: "Confirm before delete",
                          description: "Show confirmation dialog before deleting files",
                        },
                        {
                          key: "autoDownloadOnClick",
                          icon: Download,
                          label: "Auto-download on click",
                          description: "Automatically download files when clicked",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                              <setting.icon className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-white">
                                {setting.label}
                              </p>
                              <p className="text-xs text-surface-500">
                                {setting.description}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleSettingChange(
                                setting.key as keyof SettingsState,
                                !settings[setting.key as keyof SettingsState]
                              )
                            }
                            className={cn(
                              "relative w-11 h-6 rounded-full transition-colors",
                              settings[setting.key as keyof SettingsState]
                                ? "bg-primary-500"
                                : "bg-surface-300 dark:bg-surface-600"
                            )}
                          >
                            <motion.div
                              layout
                              className={cn(
                                "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm",
                                settings[setting.key as keyof SettingsState]
                                  ? "right-1"
                                  : "left-1"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {activeSection === "privacy" && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">
                              Your data is secure
                            </p>
                            <p className="text-xs text-surface-500">
                              Files are encrypted and stored securely
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                        <h4 className="text-sm font-medium text-surface-900 dark:text-white mb-2">
                          Data Management
                        </h4>
                        <p className="text-xs text-surface-500 mb-4">
                          Manage your stored data and preferences
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              localStorage.removeItem("driveSettings");
                              setSettings(defaultSettings);
                              setSaved(true);
                              setTimeout(() => setSaved(false), 2000);
                            }}
                            className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg transition-colors"
                          >
                            Reset Settings
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
