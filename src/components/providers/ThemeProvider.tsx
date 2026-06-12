"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = "clouddrive-theme";
const TRANSITION_DURATION = 300;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return getSystemTheme();
  return theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    const initialTheme = stored || "light";
    setThemeState(initialTheme);
    setResolvedTheme(resolveTheme(initialTheme));
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    
    // Enable transitions
    root.classList.add("theme-transitioning");
    setIsTransitioning(true);

    // Apply theme
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        "content",
        resolvedTheme === "dark" ? "#0d1117" : "#ffffff"
      );
    }

    // Remove transition class after animation
    const timer = setTimeout(() => {
      root.classList.remove("theme-transitioning");
      setIsTransitioning(false);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timer);
  }, [resolvedTheme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      isTransitioning,
    }),
    [theme, resolvedTheme, setTheme, toggleTheme, isTransitioning]
  );

  // Always wrap in provider, but hide content until mounted to prevent flash
  return (
    <ThemeContext.Provider value={value}>
      {mounted ? children : <div style={{ visibility: "hidden" }}>{children}</div>}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Theme toggle component for settings
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <div className={className}>
      <div className="flex items-center rounded-xl bg-surface-100 dark:bg-surface-800 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${
                theme === option.value
                  ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-soft"
                  : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
