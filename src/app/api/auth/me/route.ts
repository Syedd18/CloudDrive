import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';

// Force dynamic rendering for this route (uses cookies/auth)
export const dynamic = 'force-dynamic';

const authService = new AuthService();

// Get current user
async function getCurrentUserHandler(request: AuthenticatedRequest) {
  const user = await authService.getCurrentUser(request.user!.userId);
  return NextResponse.json({ user }, { status: 200 });
}

export async function GET(request: NextRequest) {
  return requireAuth(request, withErrorHandler(getCurrentUserHandler));
}
