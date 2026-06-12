"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  HelpCircle,
  Upload,
  FolderPlus,
  Star,
  Trash2,
  Share2,
  Search,
  Download,
  Eye,
  Grid3X3,
  ChevronRight,
  MessageCircle,
  Book,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpSection = "getting-started" | "features" | "faq";

const faqs = [
  {
    question: "How do I upload files?",
    answer: "Click the 'Upload' button in the sidebar or navbar, or drag and drop files directly into the workspace. You can upload multiple files at once.",
  },
  {
    question: "How much storage do I have?",
    answer: "You have 15GB of free storage. You can see your current usage in the storage progress bar at the bottom of the sidebar.",
  },
  {
    question: "Can I recover deleted files?",
    answer: "Yes. Deleted files are moved to the Trash directory. Go to Trash in the sidebar, right-click, and select Restore to recover your files.",
  },
  {
    question: "How do I share files?",
    answer: "Right-click on any file card or row and select 'Share'. You can manage specific email addresses or toggle public link access.",
  },
];

const features = [
  { icon: Upload, title: "Upload Files", description: "Drag & drop or click to upload" },
  { icon: FolderPlus, title: "Create Folders", description: "Organize with folders" },
  { icon: Star, title: "Star Important", description: "Mark files as starred" },
  { icon: Share2, title: "Share Files", description: "Generate shareable links" },
  { icon: Search, title: "Quick Search", description: "Find any file instantly" },
  { icon: Eye, title: "Preview Files", description: "Preview images and documents" },
  { icon: Download, title: "Download", description: "Download files anytime" },
  { icon: Trash2, title: "Trash & Restore", description: "Recover deleted files" },
];

export function NavHelpModal({ isOpen, onClose }: NavHelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>("getting-started");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sections = [
    { id: "getting-started", label: "Getting Started", icon: Book },
    { id: "features", label: "Features", icon: Grid3X3 },
    { id: "faq", label: "FAQ", icon: MessageCircle },
  ] as const;

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
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
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[80vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-indigo-650" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    Help Center
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-500">
                    Learn how to use CloudDrive effectively
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Section Tabs - Desktop */}
              <div className="w-48 border-r border-slate-200 dark:border-slate-855 border-slate-200 dark:border-slate-850 p-3 hidden sm:block flex-shrink-0 bg-slate-50/20 dark:bg-slate-950/5">
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all text-left",
                        activeSection === section.id
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400"
                          : "text-slate-500 dark:text-slate-405 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-800 dark:hover:text-slate-205"
                      )}
                    >
                      <section.icon className="w-3.5 h-3.5" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </nav>
                
                <div className="mt-6 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-850">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Need more help?
                  </p>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=clouddrivecontact@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-650 dark:text-indigo-400 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Get Support</span>
                  </a>
                </div>
              </div>

              {/* Mobile Section Tabs */}
              <div className="sm:hidden px-3 py-2 border-b border-slate-200 dark:border-slate-850 overflow-x-auto flex-shrink-0 bg-slate-50/10">
                <div className="flex gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                        activeSection === section.id
                          ? "bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400"
                          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <section.icon className="w-3.5 h-3.5" />
                      <span>{section.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Content */}
              <div className="flex-1 p-5 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeSection === "getting-started" && (
                    <motion.div
                      key="getting-started"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                          Welcome to CloudDrive 👋
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          Store, organize, and share your files from anywhere.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {[
                          { step: 1, title: "Upload your first file", desc: "Click Upload or drag and drop files into the app" },
                          { step: 2, title: "Create folders", desc: "Use 'New Folder' to structure your documents" },
                          { step: 3, title: "Star important files", desc: "Right-click and select Star to bookmark important files" },
                          { step: 4, title: "Share with others", desc: "Generate secure, shareable links to collaborate" },
                        ].map((item) => (
                          <div key={item.step} className="flex gap-3.5 p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850">
                            <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{item.title}</h4>
                              <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "features" && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Features</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {features.map((feature) => {
                          const Icon = feature.icon;
                          return (
                            <div key={feature.title} className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-855/60 dark:border-slate-850/60 hover:border-slate-300 dark:hover:border-slate-750 transition-colors">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5 text-indigo-650" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">{feature.title}</h4>
                                <p className="text-[10px] font-medium text-slate-500 leading-relaxed">{feature.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "faq" && (
                    <motion.div
                      key="faq"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">FAQ</h3>
                      <div className="space-y-2">
                        {faqs.map((faq, index) => (
                          <div key={index} className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                              className="w-full flex items-center justify-between p-3.5 text-left hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors"
                            >
                              <span className="text-xs font-bold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                              <ChevronRight className={cn("w-4 h-4 text-slate-400 transition-transform shrink-0", expandedFaq === index && "rotate-90")} />
                            </button>
                            <AnimatePresence>
                              {expandedFaq === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3.5 pb-3.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-850/50 pt-2.5">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
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
