import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { withErrorHandler } from '@/middleware/error.middleware';
import { fileQuerySchema } from '@/lib/validation';

const fileService = new FileService();

// Upload file
async function uploadFileHandler(request: AuthenticatedRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folderId = formData.get('folderId') as string | null;

  if (!file) {
    return NextResponse.json(
      { error: 'No file provided' },
      { status: 400 }
    );
  }

  // Convert File to Buffer
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await fileService.uploadFile({
    userId: request.user!.userId,
    fileBuffer: buffer,
    filename: file.name,
    mimeType: file.type,
    size: file.size,
    folderId: folderId,
  });

  return NextResponse.json({ file: result }, { status: 201 });
}

// Get files with filtering and pagination
async function getFilesHandler(request: AuthenticatedRequest) {
  const { searchParams } = new URL(request.url);
  
  const queryParams = {
    starred: searchParams.get('starred') || undefined,
    trashed: searchParams.get('trashed') || undefined,
    folderId: searchParams.get('folderId') || undefined,
    search: searchParams.get('search') || undefined,
    type: searchParams.get('type') || undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: searchParams.get('sortOrder') || undefined,
    page: searchParams.get('page') || undefined,
    limit: searchParams.get('limit') || undefined,
  };

  // Validate query parameters
  const validatedParams = fileQuerySchema.parse(queryParams);

  const result = await fileService.getFiles({
    userId: request.user!.userId,
    ...validatedParams,
  });

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  return requireAuth(request, withErrorHandler(uploadFileHandler));
}

export async function GET(request: NextRequest) {
  return requireAuth(request, withErrorHandler(getFilesHandler));
}
