import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import { shareFileSchema } from '@/lib/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

const fileService = new FileService();

// Share file with users
async function shareFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const body = await request.json();
  const validatedData = shareFileSchema.parse(body);

  const shares = await fileService.shareFile(
    params.id,
    request.user!.userId,
    validatedData.emails,
    validatedData.canEdit || false
  );

  return NextResponse.json(
    { shares },
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => shareFileHandler(req, context))(req));
}
