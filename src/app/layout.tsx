import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CloudDrive — Your workspace. Organized by intelligence.",
  description: "A premium AI-powered workspace and cloud storage solution for your digital life.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "var(--toast-bg, #ffffff)",
                  color: "var(--toast-color, #0f172a)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: 650,
                  boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.08)",
                  border: "1px solid var(--toast-border, #e2e8f0)",
                },
                success: {
                  iconTheme: {
                    primary: "#4f46e5", // Indigo accent
                    secondary: "#ffffff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
