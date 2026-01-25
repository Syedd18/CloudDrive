import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function getUserFromRequest(request: NextRequest): JWTPayload | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Helper to manually parse NextAuth session token from cookies
function getSessionTokenFromRequest(request: NextRequest): string | null {
  // NextAuth stores session in either "next-auth.session-token" (production) or "__Secure-next-auth.session-token" (HTTPS)
  const sessionToken = request.cookies.get('next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value;
  return sessionToken || null;
}

export async function getSessionUser(request?: NextRequest): Promise<JWTPayload | null> {
  try {
    // If we have a request, check for NextAuth session token in cookies
    if (request) {
      const sessionToken = getSessionTokenFromRequest(request);
      if (sessionToken) {
        // Query database for session
        const prisma = (await import('./prisma')).default;
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true }
        });
        
        if (session && session.expires > new Date()) {
          return {
            userId: session.user.id,
            email: session.user.email!,
          };
        }
      }
    }
    
    // Fallback to getServerSession for non-request contexts
    const session = await getServerSession(authOptions);
    if (session?.user) {
      return {
        userId: session.user.id as string,
        email: session.user.email as string,
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}
