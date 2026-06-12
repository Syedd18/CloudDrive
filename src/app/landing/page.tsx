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
  BrainCircuit
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Cloud className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">CloudDrive</span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-400">
              <a href="#features" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Features</a>
              <a href="#preview" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Platform</a>
              <a href="#pricing" className="hover:text-slate-900 dark:hover:text-slate-200 transition-colors">Pricing</a>
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="flex items-center justify-center px-4 h-9 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
            >
              Get Started Free
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 px-6 py-4 space-y-4"
            >
              <div className="flex flex-col gap-3">
                <a 
                  href="#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-1"
                >
                  Features
                </a>
                <a 
                  href="#preview" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-1"
                >
                  Platform
                </a>
                <a 
                  href="#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 py-1"
                >
                  Pricing
                </a>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-900">
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300"
                >
                  Sign In
                </Link>
                <Link 
                  href="/login" 
                  className="w-full flex items-center justify-center h-10 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-sm"
                >
                  Get Started Free
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
        {/* Decorative subtle patterns */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
        <div className="absolute top-12 left-10 w-24 h-24 border border-indigo-500/15 rounded-3xl rotate-12 pointer-events-none" />
        <div className="absolute bottom-16 right-16 w-32 h-32 border border-slate-500/10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Personal Storage Redefined</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white max-w-4xl mx-auto"
          >
            Your Workspace. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-500 dark:from-indigo-400 dark:to-indigo-300">
              Organized by Intelligence.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed font-medium"
          >
            CloudDrive combines secure object storage with deep AI document parsing. Ask natural language questions, generate instant text summaries, run code inline, and share securely.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link 
              href="/login" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 h-11 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Get started for free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#preview" 
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 h-11 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <span>See Platform Demo</span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Interactive Platform Preview Tab Area */}
      <section id="preview" className="py-12 bg-white dark:bg-slate-900/40 border-y border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Experience the intelligence</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">Click below to explore interactive features of our file manager dashboard.</p>
          </div>

          {/* Navigation tabs */}
          <div className="flex justify-center border-b border-slate-250 dark:border-slate-800 mb-8 max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab("search")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === "search" 
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Semantic Search
            </button>
            <button 
              onClick={() => setActiveTab("summary")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === "summary" 
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              AI Summarizer
            </button>
            <button 
              onClick={() => setActiveTab("python")}
              className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
                activeTab === "python" 
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400" 
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Python Execution
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl border border-slate-850 p-6 shadow-2xl relative overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "search" && (
                <motion.div 
                  key="search"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Semantic AI Query Engine</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-bold">Try querying below</span>
                  </div>

                  <form onSubmit={handleDemoSearch} className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. 'find database design images or financial sheets'"
                      className="flex-1 h-9 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 placeholder:text-slate-550 focus:border-indigo-500 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      disabled={isSearching}
                      className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                    >
                      {isSearching ? "Searching..." : "Search"}
                    </button>
                  </form>

                  <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 min-h-[120px] flex flex-col justify-center">
                    {searchResults.length === 0 && !isSearching && (
                      <p className="text-xs text-slate-500 text-center font-medium">Type a search term above (e.g. &apos;design&apos; or &apos;results&apos;) and hit Search to see semantic mapping in action.</p>
                    )}
                    {isSearching && (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <span className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-400 rounded-full animate-spin" />
                        <span className="text-xs font-bold">Querying document semantic indexes...</span>
                      </div>
                    )}
                    {searchResults.length > 0 && !isSearching && (
                      <div className="space-y-2">
                        {searchResults.map((res, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-semibold bg-slate-950/45 p-2 rounded-lg border border-slate-850">
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
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">AI Instant Summarizer</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>Source Document (contracts_final.pdf)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
                        &quot;This agreement is entered into on 2026-06-12 between CloudDrive Inc. and partner entities... Section 4.2 details metadata processing warranties. Liability is capped at $15,000 for standard tier accounts, except in cases of gross negligence. Section 9.1 mandates mediation before arbitration in Delaware.&quot;
                      </p>
                    </div>
                    <div className="bg-indigo-950/20 border border-indigo-900/35 rounded-xl p-4 flex flex-col justify-between">
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
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-slate-200">Pyodide Sandbox Workspace</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pb-1.5 border-b border-slate-850">
                      <span>Interactive Python Terminal</span>
                      <span className="text-indigo-400">Status: Sandbox Loaded</span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> <span className="text-indigo-400">import</span> math</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> data = [23.4, 45.1, 12.8, 98.2]</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> mean = sum(data) / len(data)</p>
                      <p><span className="text-slate-600">&gt;&gt;&gt;</span> print(f<span className="text-amber-500">&quot;Average file metrics: &#123;mean&#125;&quot;</span>)</p>
                      <p className="text-emerald-400 mt-2">Average file metrics: 44.875</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Designed for high performance.
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium leading-relaxed">
            Experience cloud storage that does more than just host folders. CloudDrive index engines, sandbox environments, and sharing protocols are built to fit your daily workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <BrainCircuit className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Search & Context</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              Query files using natural language. The AI searches document indices, metadata, and contents to show contextual alignments instantly.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <Code className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Code Editor & Sandbox</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              Write, edit, and compile code files within the integrated Monaco Editor. Run Python scripts locally in-browser using secure Pyodide sandboxes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <Share2 className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Granular Sharing Controls</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              Generate password-protected links, edit permission scopes (viewer/editor), and restrict access with custom expiration thresholds.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <Shield className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Reliability</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              We encrypt all uploaded files in transit and at rest using standard AES-256 protocols. Your files remain yours, entirely secure.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <Database className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Direct Large File Upload</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              Bypass server upload size caps. Files upload directly to secure cloud storage buckets using presigned URLs for reliability.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/35 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Customization</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-semibold">
              Quickly toggle grid and table list views, adjust sidebar layouts, collapse detail inspector panels, and change theme preferences.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-28 bg-slate-100 dark:bg-slate-900/20 border-t border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Simple, transparent pricing.
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 font-medium">
              Choose the tier that matches your cloud storage and processing requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Free</h3>
                <p className="text-xs text-slate-405 text-slate-400 mt-1.5 font-semibold">Perfect for simple file hosting.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$0</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-550 text-indigo-500 flex-shrink-0" />
                    <span>5 GB Cloud Storage</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Standard file sharing</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Monaco Code Editor integration</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white dark:bg-slate-900 border-2 border-indigo-650 dark:border-indigo-400 rounded-2xl p-8 flex flex-col justify-between shadow-md relative">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-2.5 py-0.5 rounded-full bg-indigo-650 text-white text-[10px] font-black uppercase tracking-wider">
                Popular
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workspace Pro</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-semibold">For developers and power users.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">$8</span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">/ month</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-550 text-indigo-500 flex-shrink-0" />
                    <span>100 GB Cloud Storage</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>AI-powered semantic search</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Unlimited AI Summaries & Tags</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Python Code Execution Sandboxes</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-900/60 rounded-2xl p-8 flex flex-col justify-between shadow-sm relative">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1.5 font-semibold">Custom controls and custom billing.</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">Custom</span>
                </div>
                <ul className="mt-8 space-y-4">
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-550 text-indigo-500 flex-shrink-0" />
                    <span>Unlimited cloud storage capacity</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>SAML Single Sign-On (SSO)</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-semibold">
                    <Check className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <span>Dedicated support SLA</span>
                  </li>
                </ul>
              </div>
              <Link 
                href="/login" 
                className="mt-8 w-full flex items-center justify-center h-10 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden border-t border-slate-200/60 dark:border-slate-900/60">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Build your intelligent workspace today.
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-4 max-w-md mx-auto">
            Get started for free. Upgrade whenever you need advanced semantic searches, Python sandboxes, or larger upload volume.
          </p>
          <div className="mt-8 flex justify-center">
            <Link 
              href="/login" 
              className="flex items-center gap-2 px-6 h-11 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200/60 dark:border-slate-900/60 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Cloud className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xs tracking-tight text-slate-900 dark:text-white uppercase">CloudDrive</span>
          </div>

          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-655 text-slate-500">
            &copy; {new Date().getFullYear()} CloudDrive Inc. All rights reserved. Secure and encrypted document analytics.
          </p>

          <div className="flex gap-4">
            <Link href="/login" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider">App Login</Link>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider">Privacy Policy</a>
            <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 uppercase tracking-wider">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
