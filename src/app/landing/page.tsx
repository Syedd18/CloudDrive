"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Cloud, 
  Search, 
  ArrowRight, 
  Sparkles, 
  Shield, 
  Share2, 
  Code, 
  FileText, 
  Terminal, 
  Check, 
  Menu, 
  X,
  Database,
  ArrowUpRight,
  BrainCircuit,
  Lock,
  HardDrive,
  Users,
  Star,
  Activity,
  ChevronRight,
  FilePlus,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "summary" | "python">("search");
  
  // Simulated search query for showcase
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleDemoSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);
    setTimeout(() => {
      setIsSearching(false);
      setSearchResults([
        "Q2 Financial Results Draft.xlsx (Matches context: 'revenue growth and operational overhead')",
        "project_milestones.md (Matches tag: #milestones, context: 'deliverables list')",
        "cloud_architecture_v2.png (Matches context: 'database replication topology')"
      ]);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden transition-colors duration-300">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      
      {/* Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-gradient-to-b from-indigo-500/10 via-purple-500/5 to-transparent rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[1600px] -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Cloud className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Cloud<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300">Drive</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-200">
              <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">Interactive Demo</a>
              <a href="#pricing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-bold text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center px-4 h-9.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-650/10 hover:shadow-indigo-650/20 hover:-translate-y-0.5 transition-all duration-150"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-6 py-5 space-y-5 shadow-lg"
            >
              <div className="flex flex-col gap-3.5">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 py-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Features
                </a>
                <a 
                  href="#demo" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 py-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Interactive Demo
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-bold text-slate-600 dark:text-slate-300 py-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Pricing
                </a>
              </div>
              <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-900">
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-center h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-36 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          
          {/* Tagline Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/60 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6 hover:scale-102 transition-transform shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Personal Cloud Workspace</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-5xl mx-auto font-sans"
          >
            Your Workspace. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-650 via-indigo-500 to-purple-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Organized by Intelligence.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed font-medium"
          >
            CloudDrive combines secure, large object storage with deep AI document parsing. Ask natural language questions, generate instant summaries, execute code in sandboxes, and share securely.
          </motion.p>

          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 h-11.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all duration-150"
            >
              <span>Get Started For Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#demo" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 h-11.5 border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-350 hover:-translate-y-0.5 transition-all duration-150 shadow-sm"
            >
              <span>Explore Interactive Demo</span>
            </a>
          </motion.div>

          {/* Premium Floating Mockup Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-5xl mt-16 md:mt-20 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl bg-white dark:bg-slate-900/60 p-2.5 shadow-2xl backdrop-blur-md relative"
          >
            {/* Window control buttons */}
            <div className="absolute top-4 left-5 flex gap-1.5 z-20">
              <span className="w-3 h-3 rounded-full bg-red-400/80 block" />
              <span className="w-3 h-3 rounded-full bg-amber-400/80 block" />
              <span className="w-3 h-3 rounded-full bg-green-400/80 block" />
            </div>

            {/* Dashboard Container Mock */}
            <div className="rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/80 border border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row h-[340px] sm:h-[400px] md:h-[480px] lg:h-[540px] text-left">
              {/* Mock Sidebar */}
              <div className="w-full sm:w-48 md:w-52 border-b sm:border-b-0 sm:border-r border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 p-4 pt-10 flex flex-col gap-5 shrink-0 hidden sm:flex">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Storage</span>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>My Files</span>
                    <span>12 files</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="w-[35%] h-full bg-indigo-600 rounded-full" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Navigation</span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>My Drive</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850">
                      <Star className="w-3.5 h-3.5" />
                      <span>Starred</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-500 dark:text-slate-400 rounded-lg text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-850">
                      <Users className="w-3.5 h-3.5" />
                      <span>Shared</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-1.5">
                  <button className="w-full flex items-center justify-center gap-1.5 h-8 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                    <FilePlus className="w-3.5 h-3.5" />
                    <span>Create Document</span>
                  </button>
                </div>
              </div>

              {/* Mock Main Pane */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900/10">
                {/* Mock Header */}
                <div className="h-11 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between px-4">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Recent Documents</span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">⌘</span>
                    <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">K</span>
                  </div>
                </div>

                {/* Mock Content list */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  <div className="p-3 border border-slate-200/80 dark:border-slate-800/85 rounded-xl bg-white/50 dark:bg-slate-900/30 flex items-center justify-between hover:border-slate-350 dark:hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">marketing_strategy.md</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Updated 2h ago • 14.5 KB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100/50 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">#growth</span>
                      <span className="text-[9px] bg-purple-50 dark:bg-purple-950/50 border border-purple-100/50 dark:border-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">#strategy</span>
                    </div>
                  </div>

                  <div className="p-3 border border-indigo-500/30 dark:border-indigo-500/40 rounded-xl bg-indigo-50/10 dark:bg-indigo-950/10 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full w-1 bg-indigo-500" />
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center text-indigo-600">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">q2_financials.xlsx</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Updated 5h ago • 120.2 KB</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI Summary
                      </span>
                    </div>
                  </div>

                  <div className="p-3 border border-slate-200/80 dark:border-slate-800/85 rounded-xl bg-white/50 dark:bg-slate-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-900 dark:text-white">user_onboarding.py</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-semibold">Updated 1d ago • 2.8 KB</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">108 lines</span>
                  </div>
                </div>
              </div>

              {/* Mock Inspector Details Panel */}
              <div className="w-72 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900/40 p-4 pt-10 flex flex-col gap-4 shrink-0 hidden lg:flex">
                <div className="border-b border-slate-150 dark:border-slate-900 pb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">AI Assistant Insights</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">q2_financials.xlsx</p>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col gap-1 bg-indigo-50/30 dark:bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-100/40 dark:border-indigo-900/20">
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      Instant Analysis
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 leading-relaxed font-semibold">
                      This document outlines Q2 projections showing a 14% increase in sales. Operational costs increased by $4.5k.
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400">Extracted Tags</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">#q2-report</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">#financials</span>
                      <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded font-bold">#projections</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Demonstration Section */}
      <section id="demo" className="py-20 md:py-28 bg-white dark:bg-slate-900/20 border-y border-slate-200/50 dark:border-slate-900/50 transition-colors">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Experience the Intelligence
            </h2>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-450 mt-2 max-w-lg mx-auto">
              Test out the interactive widgets below to see how CloudDrive indexes and executes documents.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center border-b border-slate-200 dark:border-slate-800 mb-8 max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab("search")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all duration-150 ${
                activeTab === "search" 
                  ? "border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Semantic Search
            </button>
            <button 
              onClick={() => setActiveTab("summary")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all duration-150 ${
                activeTab === "summary" 
                  ? "border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              AI Summarizer
            </button>
            <button 
              onClick={() => setActiveTab("python")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all duration-150 ${
                activeTab === "python" 
                  ? "border-indigo-650 text-indigo-650 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-450 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Python Execution
            </button>
          </div>

          {/* Tab Content Display */}
          <div className="bg-slate-950 dark:bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "search" && (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Semantic AI Query Engine</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-450 px-2.5 py-0.5 rounded font-bold">Try searching below</span>
                  </div>

                  <form onSubmit={handleDemoSearch} className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. 'design mockups' or 'revenue summary'"
                      className="flex-1 h-10 px-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center"
                    >
                      {isSearching ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Search"
                      )}
                    </button>
                  </form>

                  <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 min-h-[140px] flex flex-col justify-center transition-all">
                    {searchResults.length === 0 && !isSearching && (
                      <p className="text-xs text-slate-500 text-center font-medium leading-relaxed max-w-sm mx-auto">
                        Type a query above (e.g. &apos;design&apos; or &apos;revenue&apos;) and hit Search to see semantic results mapping in action.
                      </p>
                    )}
                    {isSearching && (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                        <span className="text-xs font-bold">Searching document semantic vectors...</span>
                      </div>
                    )}
                    {searchResults.length > 0 && !isSearching && (
                      <div className="space-y-2">
                        {searchResults.map((res, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 font-semibold bg-slate-950 p-2.5 rounded-lg border border-slate-850">
                            <span className="text-indigo-400 font-black">[{idx+1}]</span>
                            <span>{res}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "summary" && (
                <motion.div 
                  key="summary"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">AI Contextual Summarization</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-350">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Source Document (contracts_final.pdf)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                        &quot;This agreement is entered into on 2026-06-12 between CloudDrive Inc. and partner entities... Section 4.2 details metadata processing warranties. Liability is capped at $15,000 for standard tier accounts, except in cases of gross negligence. Section 9.1 mandates mediation before arbitration in Delaware.&quot;
                      </p>
                    </div>
                    <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                          <BrainCircuit className="w-3.5 h-3.5" />
                          <span>AI Key Points Summary</span>
                        </div>
                        <ul className="text-[10.5px] text-slate-300 list-disc pl-4 space-y-1.5 font-bold">
                          <li>Parties: CloudDrive Inc. & partners (dated June 12, 2026).</li>
                          <li>Liability cap: set at $15,000 max.</li>
                          <li>Dispute resolution: Delaware-based mediation required first.</li>
                        </ul>
                      </div>
                      <div className="text-[9px] text-indigo-400/80 font-bold mt-2">Generated in 180ms • Verified accurate</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "python" && (
                <motion.div 
                  key="python"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Pyodide Sandbox Workspace</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs bg-slate-900 border border-slate-850 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pb-2 border-b border-slate-800">
                      <span>Interactive Python Terminal</span>
                      <span className="text-indigo-400">Status: Sandbox Loaded</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> <span className="text-indigo-400">import</span> math</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> data = [23.4, 45.1, 12.8, 98.2]</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> mean = sum(data) / len(data)</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> print(f<span className="text-amber-500">&quot;Average file metrics: &#123;mean&#125;&quot;</span>)</p>
                      <p className="text-emerald-450 mt-2 font-bold">Average file metrics: 44.875</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-32 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Designed for high performance.
          </h2>
          <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
            Experience cloud storage that does more than just host files. CloudDrive provides the tools to search, analyze, and build dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <BrainCircuit className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Vector Search & Context</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Query files using natural language. The AI searches document indices, metadata, and contents to show contextual alignments instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <Code className="w-5 h-5 text-indigo-605 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Code Editor & Sandbox</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Write, edit, and compile code files within the integrated Monaco Editor. Run Python scripts locally in-browser using secure Pyodide sandboxes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <Share2 className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Granular Sharing Controls</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Generate password-protected links, edit permission scopes (viewer/editor), and restrict access with custom expiration thresholds.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <Shield className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AES-256 Encryption</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              We encrypt all uploaded files in transit and at rest using standard AES-256 protocols. Your files remain yours, entirely secure.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <Database className="w-5 h-5 text-indigo-655 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Upload Presigning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Bypass server upload size caps. Files upload directly to secure cloud storage buckets using presigned URLs for speed and reliability.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-6.5 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-800 hover:-translate-y-1 transition-all duration-200">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/50 dark:border-indigo-900/20 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Modern Adaptive Layout</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed font-semibold">
              Quickly toggle grid and table list views, adjust sidebar layouts, collapse detail inspector panels, and change theme preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 bg-slate-100/50 dark:bg-slate-900/20 border-t border-slate-200/50 dark:border-slate-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
              Simple, transparent pricing.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">
              Choose the tier that matches your cloud storage and processing requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-md md:max-w-2xl lg:max-w-none mx-auto items-stretch">
            {/* Free */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Personal</h3>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Free Tier</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">$0</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">/ month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>5 GB Cloud Storage</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Standard file sharing</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Monaco Editor integration</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-905 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400 rounded-2xl p-8 flex flex-col justify-between shadow-lg relative hover:-translate-y-1 transition-all duration-200">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full bg-indigo-650 text-white text-[9px] font-black uppercase tracking-wider shadow">
                Popular
              </div>
              <div>
                <h3 className="text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Workspace</h3>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Pro Tier</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">$8</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1.5">/ month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-xs text-slate-650 dark:text-slate-300 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>100 GB Cloud Storage</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-650 dark:text-slate-300 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>AI vector semantic search</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-650 dark:text-slate-300 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Unlimited AI summaries & tags</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-650 dark:text-slate-300 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Python Code Execution Sandboxes</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Enterprise</h3>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-1">Scale Tier</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Custom</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Unlimited cloud storage</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>SAML Single Sign-On (SSO)</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-350 font-semibold">
                    <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>Dedicated support SLA</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-905 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 transition-all shadow-sm"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden border-t border-slate-200/50 dark:border-slate-900/50 transition-colors">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight sm:text-4xl">
            Build your intelligent workspace today.
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4 max-w-md mx-auto leading-relaxed">
            Get started for free. Upgrade whenever you need advanced vector search capabilities, Python sandbox terminals, or larger storage files.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-6 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 transition-all duration-150"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900/50 py-12 transition-colors relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center shadow-sm">
              <Cloud className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-extrabold text-xs tracking-wider text-slate-900 dark:text-white uppercase">
              Cloud<span className="text-indigo-600 dark:text-indigo-400">Drive</span>
            </span>
          </div>

          <p className="text-[10px] font-bold text-slate-450 dark:text-slate-650">
            &copy; {new Date().getFullYear()} CloudDrive Inc. All rights reserved. Secure and encrypted document analytics.
          </p>

          <div className="flex gap-5">
            <Link href="/login" className="text-[10px] font-bold text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors">App Login</Link>
            <a href="#" className="text-[10px] font-bold text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors">Privacy</a>
            <a href="#" className="text-[10px] font-bold text-slate-450 hover:text-slate-700 dark:hover:text-slate-300 uppercase tracking-widest transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
