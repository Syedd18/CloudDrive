import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import { shareFileSchema } from '@/lib/validation';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

const fileService = new FileService();

// Get file shares
async function getSharesHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const shares = await prisma.share.findMany({
    where: { fileId: params.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ shares }, { status: 200 });
}

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

// Remove share
async function removeShareHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }

  await prisma.share.delete({
    where: {
      fileId_email: {
        fileId: params.id,
        email,
      },
    },
  });

  return NextResponse.json(
    { message: 'Share removed successfully' },
    { status: 200 }
  );
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => getSharesHandler(req, context))(req));
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => shareFileHandler(req, context))(req));
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => removeShareHandler(req, context))(req));
}
