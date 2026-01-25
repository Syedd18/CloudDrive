import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';

interface RouteParams {
  params: {
    id: string;
  };
}

const fileService = new FileService();

// Get download URL (signed S3 URL)
async function downloadFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const downloadUrl = await fileService.getDownloadUrl(
    params.id,
    request.user!.userId
  );

  return NextResponse.json(
    { downloadUrl },
    { status: 200 }
  );
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => downloadFileHandler(req, context))(req));
}
