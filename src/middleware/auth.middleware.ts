import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, getSessionUser } from '@/lib/auth';
import { UnauthorizedError } from '@/lib/errors';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
  };
}

/**
 * Authentication middleware
 * Verifies JWT token or NextAuth session and attaches user to request
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try JWT token first
    let user = getUserFromRequest(request);
    
    // If no JWT, try NextAuth session
    if (!user) {
      user = await getSessionUser(request);
    }

    if (!user) {
      throw new UnauthorizedError('Authentication required');
    }

    // Attach user to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = user;

    return await handler(authenticatedRequest);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token
 */
export async function optionalAuth(
  request: NextRequest,
  handler: (request: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Try JWT token first
    let user = getUserFromRequest(request);
    
    // If no JWT, try NextAuth session
    if (!user) {
      user = await getSessionUser(request);
    }
    
    const authenticatedRequest = request as AuthenticatedRequest;
    if (user) {
      authenticatedRequest.user = user;
    }

    return await handler(authenticatedRequest);
  } catch (error) {
    // If authentication fails, continue without user
    return await handler(request as AuthenticatedRequest);
  }
}
