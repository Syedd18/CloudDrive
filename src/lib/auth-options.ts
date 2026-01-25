import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// Only use PrismaAdapter if DATABASE_URL is available
const adapter = process.env.DATABASE_URL ? PrismaAdapter(prisma) : undefined;

export const authOptions: NextAuthOptions = {
  adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user?.id || "";
        session.user.role = (user as any)?.role;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "google") {
        // Verify email is verified
        return (profile as any)?.email_verified === true;
      }
      return true;
    },
  },
  session: {
    strategy: adapter ? "database" : "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

