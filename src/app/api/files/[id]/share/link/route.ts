import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// Get link settings
async function getLinkSettingsHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const file = await prisma.file.findFirst({
    where: {
      id: params.id,
      userId: request.user!.userId,
    },
  });

  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    isPublic: file.isPublic ?? false,
    canEdit: file.publicLinkCanEdit ?? false,
  });
}

// Update link settings
async function updateLinkSettingsHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const body = await request.json();
  const { access, canEdit } = body;

  // Verify ownership
  const file = await prisma.file.findFirst({
    where: {
      id: params.id,
      userId: request.user!.userId,
    },
  });

  if (!file) {
    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );
  }

  const isPublic = access === 'anyone';

  await prisma.file.update({
    where: { id: params.id },
    data: {
      isPublic,
      publicLinkCanEdit: canEdit || false,
    },
  });

  return NextResponse.json({
    message: 'Link settings updated',
    isPublic,
    canEdit: canEdit || false,
  });
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => getLinkSettingsHandler(req, context))(req));
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => updateLinkSettingsHandler(req, context))(req));
}
