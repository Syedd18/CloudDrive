import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import { updateFileSchema } from '@/lib/validation';

interface RouteParams {
  params: {
    id: string;
  };
}

const fileService = new FileService();

// Get single file
async function getFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const file = await fileService.getFileById(params.id, request.user!.userId);
  return NextResponse.json({ file }, { status: 200 });
}

// Update file (rename, star, trash)
async function updateFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  const body = await request.json();
  const validatedData = updateFileSchema.parse(body);

  if (validatedData.trashed === true) {
    await fileService.moveToTrash(params.id, request.user!.userId);
  } else if (validatedData.trashed === false) {
    await fileService.restoreFromTrash(params.id, request.user!.userId);
  } else {
    await fileService.updateFile(
      params.id,
      request.user!.userId,
      validatedData
    );
  }

  return NextResponse.json(
    { message: 'File updated successfully' },
    { status: 200 }
  );
}

// Delete file permanently
async function deleteFileHandler(
  request: AuthenticatedRequest,
  { params }: RouteParams
) {
  await fileService.deleteFile(params.id, request.user!.userId);
  return NextResponse.json(
    { message: 'File deleted permanently' },
    { status: 200 }
  );
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => getFileHandler(req, context))(req));
}

export async function PATCH(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => updateFileHandler(req, context))(req));
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  return requireAuth(request, (req) => withErrorHandler(() => deleteFileHandler(req, context))(req));
}
