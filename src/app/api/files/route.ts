import { NextRequest, NextResponse } from 'next/server';
import { FileService } from '@/services/file.service';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { fileQuerySchema } from '@/lib/validation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Maximum file size: 50MB
export const maxDuration = 60; // seconds

const fileService = new FileService();

// Upload file
async function uploadFileHandler(request: AuthenticatedRequest) {
  try {
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
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}

// Get files with filtering and pagination
async function getFilesHandler(request: AuthenticatedRequest) {
  try {
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
  } catch (error) {
    console.error('Get files error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get files' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(request, uploadFileHandler);
}

export async function GET(request: NextRequest) {
  return requireAuth(request, getFilesHandler);
}
