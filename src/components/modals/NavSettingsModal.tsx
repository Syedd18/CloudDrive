"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
import { useTheme } from "@/components/providers/ThemeProvider";

interface NavSettingsModalProps {
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

export function NavSettingsModal({ isOpen, onClose }: NavSettingsModalProps) {
  const { theme: currentTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [activeSection, setActiveSection] = useState<"appearance" | "preferences" | "privacy">("appearance");
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("driveSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...parsed, theme: currentTheme });
      } catch {
        // Use defaults if parsing fails
      }
    } else {
      setSettings({ ...defaultSettings, theme: currentTheme });
    }
  }, [currentTheme]);

  const handleSettingChange = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem("driveSettings", JSON.stringify(newSettings));
    
    if (key === "theme") {
      setTheme(value as ThemeOption);
    }
    
    if (key === "defaultView") {
      window.dispatchEvent(new CustomEvent("viewModeChange", { detail: value }));
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const sections = [
    { id: "appearance", label: "Appearance", icon: Sun },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "privacy", label: "Privacy & Data", icon: Shield },
  ] as const;

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ touchAction: 'none' }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] mx-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center flex-shrink-0">
                  <Settings className="w-4 h-4 text-indigo-650" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Settings
                  </h2>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-0.5 uppercase tracking-wider">
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
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Saved</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Section Tabs - Desktop */}
              <div className="w-44 border-r border-slate-200 dark:border-slate-800 p-3 hidden sm:block flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/10">
                <nav className="space-y-0.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left",
                        activeSection === section.id
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-855 dark:hover:bg-slate-850"
                      )}
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>
              </div>

              {/* Mobile Section Tabs */}
              <div className="sm:hidden px-3 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-[10px] font-bold transition-all whitespace-nowrap min-w-0",
                        activeSection === section.id
                          ? "bg-white dark:bg-slate-700 text-indigo-650 dark:text-indigo-400 shadow-sm"
                          : "text-slate-500"
                      )}
                    >
                      <section.icon className="w-3.5 h-3.5" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content */}
              <div className="flex-1 p-5 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeSection === "appearance" && (
                    <motion.div
                      key="appearance"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.1 }}
                      className="space-y-5"
                    >
                      {/* Theme Selection */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2.5">
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
                                "flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg border transition-all text-center",
                                settings.theme === option.id
                                  ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-455"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                              )}
                            >
                              <option.icon className={cn(
                                "w-5 h-5",
                                settings.theme === option.id ? "text-indigo-605 dark:text-indigo-400" : "text-slate-400"
                              )} />
                              <span className="text-xs font-bold mt-1">
                                {option.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Default View */}
                      <div>
                        <h3 className="text-xs font-bold text-slate-405 dark:text-slate-400 uppercase tracking-wider mb-2.5">
                          Default View Mode
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          {[
                            { id: "grid", icon: Grid3X3, label: "Grid Layout" },
                            { id: "list", icon: List, label: "List Table" },
                          ].map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleSettingChange("defaultView", option.id as ViewOption)}
                              className={cn(
                                "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                                settings.defaultView === option.id
                                  ? "border-indigo-505 bg-indigo-50/20 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-455"
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-900/50"
                              )}
                            >
                              <option.icon className={cn(
                                "w-4 h-4",
                                settings.defaultView === option.id ? "text-indigo-605 dark:text-indigo-400" : "text-slate-400"
                              )} />
                              <span className="text-xs font-bold">
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
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.1 }}
                      className="space-y-3"
                    >
                      {[
                        {
                          key: "notifications",
                          icon: settings.notifications ? Bell : BellOff,
                          label: "Notifications",
                          description: "Get notifications for uploads and sharing updates",
                        },
                        {
                          key: "confirmBeforeDelete",
                          icon: Trash2,
                          label: "Confirm before delete",
                          description: "Display warning modal before trashing files",
                        },
                        {
                          key: "autoDownloadOnClick",
                          icon: Download,
                          label: "Auto-download on tap",
                          description: "Download file files on click instead of preview",
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/10"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-750 flex items-center justify-center flex-shrink-0">
                              <setting.icon className="w-4 h-4 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-850 dark:text-slate-200 leading-snug">
                                {setting.label}
                              </p>
                              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium leading-none mt-0.5 truncate">
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
                              "relative w-9 h-5 rounded-full transition-colors flex-shrink-0 focus:outline-none",
                              settings[setting.key as keyof SettingsState]
                                ? "bg-indigo-606 bg-indigo-600"
                                : "bg-slate-200 dark:bg-slate-750"
                            )}
                          >
                            <motion.div
                              layout
                              className={cn(
                                "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm",
                                settings[setting.key as keyof SettingsState]
                                  ? "right-0.5"
                                  : "left-0.5"
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
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.1 }}
                      className="space-y-4"
                    >
                      <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-white dark:bg-slate-850 border border-slate-250 dark:border-slate-750 flex items-center justify-center flex-shrink-0">
                          <Shield className="w-4 h-4 text-indigo-650" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                            Your workspace data is secure
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-tight">
                            Files are stored securely. Privacy keys are encrypted.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Data Options
                        </h4>
                        <p className="text-[10px] text-slate-500 mb-3 font-medium">
                          Reset your preferences back to default variables.
                        </p>
                        <button
                          onClick={() => {
                            localStorage.removeItem("driveSettings");
                            setSettings(defaultSettings);
                            setSaved(true);
                            setTimeout(() => setSaved(false), 2000);
                          }}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-655 text-slate-600 dark:text-slate-350 transition-colors shadow-sm"
                        >
                          Reset settings cache
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
