"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Cloud, Mail, Lock, Eye, EyeOff, ShieldCheck, Sparkles, FolderOpen, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store the token
      localStorage.setItem("token", data.token);
      
      toast.success(isLogin ? "Logged in successfully!" : "Account created successfully!");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      });
      
      if (result?.error) {
        toast.error(`Failed to sign in: ${result.error}`);
      } else if (result?.ok) {
        toast.success("Signed in successfully!");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Exception during sign in:", error);
      toast.error("An error occurred during sign in");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row">
      {/* Left Column: Visual branding and showcase (visible on desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-slate-900 dark:bg-slate-950 text-white flex-col justify-between p-12 relative overflow-hidden border-r border-slate-800">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Brand */}
        <Link href="/landing" className="flex items-center gap-2.5 z-10 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">CloudDrive</span>
        </Link>

        {/* Content Showcase */}
        <div className="my-auto max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Cloud Storage & Workspace</span>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
            Your Files. <br />
            <span className="text-slate-400">Organized by Intelligence.</span>
          </h2>
          
          <p className="text-sm text-slate-400 leading-relaxed font-medium mb-8">
            Unified file search, semantic document queries, native Python code execution via Pyodide, and modern developer integrations. All packaged inside a beautifully responsive Slate Workspace.
          </p>

          {/* Interactive illustration mockup */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-slate-750 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-slate-200">workspace_notebook.py</span>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold">Python Executable</span>
            </div>
            <div className="font-mono text-[11px] text-slate-400 space-y-1">
              <p><span className="text-indigo-400">import</span> pandas <span className="text-indigo-400">as</span> pd</p>
              <p><span className="text-indigo-400">import</span> clouddrive_ai <span className="text-indigo-400">as</span> cd</p>
              <p>data = cd.load_file(<span className="text-amber-500">&quot;q2_report.csv&quot;</span>)</p>
              <p>summary = cd.ai.summarize(data)</p>
              <p className="text-emerald-400 mt-2"># Output: Generation complete in 0.24s</p>
            </div>
          </div>
        </div>

        {/* Trust Indicators Footer */}
        <div className="z-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-800 pt-6">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>AI Summarization</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24">
        {/* Mobile Logo */}
        <Link href="/landing" className="flex items-center gap-2.5 md:hidden mb-8 self-center hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-lg bg-indigo-650 flex items-center justify-center">
            <Cloud className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">CloudDrive</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          {/* Header */}
          <div className="text-left mb-6">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-450 mt-1.5">
              {isLogin 
                ? "Enter your credentials or use your Google account to sign in." 
                : "Join CloudDrive to organize and query your files dynamically."}
            </p>
          </div>

          {/* Social Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2.5 px-4 h-10 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="px-3 bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500">
                Or choose credentials
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <label htmlFor="name" className="block text-[10px] font-bold text-slate-405 text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    required={!isLogin}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-905 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150"
                    placeholder="John Doe"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full h-10 pl-10 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Password
                </label>
                {!isLogin && (
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-550 lowercase">
                    min 8 chars, 1 uppercase, 1 lowercase
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full h-10 pl-10 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 focus:outline-none transition-all duration-150"
                  placeholder={isLogin ? "••••••••" : "Password123"}
                  minLength={isLogin ? 1 : 8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Form Type */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
