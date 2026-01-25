import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';

// Force dynamic rendering for this route (uses cookies/auth)
export const dynamic = 'force-dynamic';

const fileService = new FileService();

// Get storage statistics
async function getStorageHandler(request: AuthenticatedRequest) {
  const stats = await fileService.getStorageStats(request.user!.userId);
  return NextResponse.json(stats, { status: 200 });
}

export async function GET(request: NextRequest) {
  return requireAuth(request, withErrorHandler(getStorageHandler));
}
