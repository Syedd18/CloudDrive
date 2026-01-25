import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';

const fileService = new FileService();

// Empty trash - permanently delete all trashed files
async function emptyTrashHandler(request: AuthenticatedRequest) {
  await fileService.emptyTrash(request.user!.userId);
  return NextResponse.json(
    { message: 'Trash emptied successfully' },
    { status: 200 }
  );
}

export async function DELETE(request: NextRequest) {
  return requireAuth(request, (req) => withErrorHandler(() => emptyTrashHandler(req))(req));
}
