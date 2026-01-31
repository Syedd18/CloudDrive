"use client";

import { useState } from "react";
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
  List,
  ChevronRight,
  MessageCircle,
  Book,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type HelpSection = "getting-started" | "features" | "faq";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I upload files?",
    answer: "Click the &apos;Upload File&apos; button in the sidebar or drag and drop files directly into the main area. You can upload multiple files at once.",
  },
  {
    question: "How much storage do I have?",
    answer: "You have 15GB of free storage. You can see your current usage in the storage indicator at the bottom of the sidebar.",
  },
  {
    question: "Can I recover deleted files?",
    answer: "Yes! Deleted files are moved to Trash where they stay for 30 days. Go to Trash and click &apos;Restore&apos; to recover files.",
  },
  {
    question: "How do I share files with others?",
    answer: "Right-click on any file and select &apos;Share&apos;. You can generate a shareable link or share directly with other users.",
  },
  {
    question: "Are my files secure?",
    answer: "Absolutely. All files are encrypted during transfer and at rest. Only you and people you share with can access your files.",
  },
];



const features = [
  {
    icon: Upload,
    title: "Upload Files",
    description: "Drag & drop or click to upload files of any type",
  },
  {
    icon: FolderPlus,
    title: "Create Folders",
    description: "Organize your files with folders and subfolders",
  },
  {
    icon: Star,
    title: "Star Important Files",
    description: "Mark files as starred for quick access",
  },
  {
    icon: Share2,
    title: "Share with Anyone",
    description: "Generate shareable links or share with users",
  },
  {
    icon: Search,
    title: "Quick Search",
    description: "Find any file instantly with powerful search",
  },
  {
    icon: Eye,
    title: "Preview Files",
    description: "Preview images, videos, PDFs, and documents",
  },
  {
    icon: Download,
    title: "Download Anytime",
    description: "Download files individually or in bulk",
  },
  {
    icon: Trash2,
    title: "Trash & Restore",
    description: "Deleted files can be restored within 30 days",
  },
];

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const [activeSection, setActiveSection] = useState<HelpSection>("getting-started");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const sections = [
    { id: "getting-started", label: "Getting Started", icon: Book },
    { id: "features", label: "Features", icon: Grid3X3 },
    { id: "faq", label: "FAQ", icon: MessageCircle },
  ] as const;

  // Use portal to render modal at document root level
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-surface-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Help Center
                  </h2>
                  <p className="text-sm text-surface-500">
                    Learn how to use Cloud Drive effectively
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
              {/* Section Tabs - Desktop */}
              <div className="w-52 border-r border-surface-200 dark:border-surface-700 p-3 hidden sm:block flex-shrink-0">
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

                {/* Support Link */}
                <div className="mt-6 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <p className="text-xs font-medium text-surface-900 dark:text-white mb-1">
                    Need more help?
                  </p>
                  <p className="text-xs text-surface-500 mb-3">
                    Contact our support team
                  </p>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=clouddrivecontact@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs font-medium text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Get Support
                  </a>
                </div>
              </div>

              {/* Mobile Section Tabs */}
              <div className="sm:hidden flex-shrink-0 px-3 pt-2 pb-2 border-b border-surface-200 dark:border-surface-700 overflow-x-auto">
                <div className="flex gap-1.5">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                        activeSection === section.id
                          ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                          : "text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
                      )}
                    >
                      <section.icon className="w-3.5 h-3.5" />
                      <span className="hidden xs:inline">{section.label}</span>
                      <span className="xs:hidden">{section.label.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Help Content */}
              <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {activeSection === "getting-started" && (
                    <motion.div
                      key="getting-started"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4 sm:space-y-6"
                    >
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white mb-2">
                          Welcome to Cloud Drive! 👋
                        </h3>
                        <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                          Cloud Drive is your secure cloud storage solution. Store, organize, and share 
                          your files from anywhere. Here&apos;s how to get started:
                        </p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            step: 1,
                            title: "Upload your first file",
                            description: "Click the &apos;Upload File&apos; button or drag and drop files into the main area.",
                          },
                          {
                            step: 2,
                            title: "Create folders to organize",
                            description: "Use &apos;New Folder&apos; to create folders and keep your files organized.",
                          },
                          {
                            step: 3,
                            title: "Star important files",
                            description: "Right-click any file and select &apos;Star&apos; for quick access later.",
                          },
                          {
                            step: 4,
                            title: "Share with others",
                            description: "Share files or folders with anyone using shareable links.",
                          },
                        ].map((item) => (
                          <div
                            key={item.step}
                            className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50"
                          >
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-surface-900 dark:text-white mb-0.5 sm:mb-1">
                                {item.title}
                              </h4>
                              <p className="text-xs text-surface-500 leading-relaxed">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "features" && (
                    <motion.div
                      key="features"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white mb-3 sm:mb-4">
                        Features
                      </h3>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
                        {features.map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                          >
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                              <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                              <h4 className="text-xs sm:text-sm font-semibold text-surface-900 dark:text-white mb-0.5">
                                {feature.title}
                              </h4>
                              <p className="text-xs text-surface-500 leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {activeSection === "faq" && (
                    <motion.div
                      key="faq"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">
                        Frequently Asked Questions
                      </h3>
                      <div className="space-y-2">
                        {faqs.map((faq, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                            >
                              <span className="text-sm font-medium text-surface-900 dark:text-white pr-4">
                                {faq.question}
                              </span>
                              <ChevronRight
                                className={cn(
                                  "w-5 h-5 text-surface-400 transition-transform shrink-0",
                                  expandedFaq === index && "rotate-90"
                                )}
                              />
                            </button>
                            <AnimatePresence>
                              {expandedFaq === index && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-4 pb-4 text-sm text-surface-600 dark:text-surface-400 leading-relaxed border-t border-surface-100 dark:border-surface-800 pt-3">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
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

  // Only render portal on client side
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}
