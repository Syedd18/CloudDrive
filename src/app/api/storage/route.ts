import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';

// Force dynamic rendering for this route (uses cookies/auth)
export const dynamic = 'force-dynamic';

const fileService = new FileService();

// Get storage statistics
async function getStorageHandler(request: AuthenticatedRequest) {
  try {
    const stats = await fileService.getStorageStats(request.user!.userId);
    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Storage stats error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get storage stats' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return requireAuth(request, getStorageHandler);
}
