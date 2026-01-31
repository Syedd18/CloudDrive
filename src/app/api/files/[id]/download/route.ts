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

// Get download URL with filename info
async function downloadFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const { downloadUrl, filename, mimeType } = await fileService.getDownloadInfo(
    params.id,
    request.user!.userId
  );

  return NextResponse.json(
    { downloadUrl, filename, mimeType },
    { status: 200 }
  );
}

// Direct file download (proxied through server for proper filename)
async function directDownloadHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const { downloadUrl, filename, mimeType } = await fileService.getDownloadInfo(
    params.id,
    request.user!.userId
  );

  // Fetch the file from Supabase
  const fileResponse = await fetch(downloadUrl);
  
  if (!fileResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }

  const fileBuffer = await fileResponse.arrayBuffer();

  // Encode filename for Content-Disposition header (RFC 5987)
  const encodedFilename = encodeURIComponent(filename).replace(/['()]/g, escape).replace(/\*/g, '%2A');
  
  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      'Content-Type': mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodedFilename}`,
      'Content-Length': fileBuffer.byteLength.toString(),
    },
  });
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  // Check if direct download is requested
  const { searchParams } = new URL(request.url);
  const direct = searchParams.get('direct') === 'true';

  if (direct) {
    return requireAuth(request, (req) => withErrorHandler(() => directDownloadHandler(req, context))(req));
  }
  
  return requireAuth(request, (req) => withErrorHandler(() => downloadFileHandler(req, context))(req));
}
