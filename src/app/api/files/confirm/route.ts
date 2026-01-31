import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase';
import { prisma } from '@/lib/prisma';

// Helper to determine file type from MIME type
function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('document') || mimeType.includes('word') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z') || mimeType.includes('tar') || mimeType.includes('gzip')) return 'archive';
  return 'file';
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Confirm upload and create database record
async function confirmUploadHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { filePath, filename, contentType, size, folderId } = body;

    if (!filePath || !filename || !contentType || size === undefined) {
      return NextResponse.json(
        { error: 'filePath, filename, contentType, and size are required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Storage not configured' },
        { status: 500 }
      );
    }

    const userId = request.user!.userId;

    // Verify the file exists in Supabase
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(userId, {
        search: filePath.split('/').pop(),
      });

    if (fileError || !fileData || fileData.length === 0) {
      return NextResponse.json(
        { error: 'File not found in storage. Upload may have failed.' },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    // Create database record
    const file = await prisma.file.create({
      data: {
        name: filename,
        originalName: filename,
        type: getFileType(contentType),
        size: BigInt(size),
        mimeType: contentType,
        s3Key: filePath,
        s3Url: urlData.publicUrl,
        user: { connect: { id: userId } },
        ...(folderId && { parent: { connect: { id: folderId } } }),
      },
    });

    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: Number(file.size),
        mimeType: file.mimeType,
        s3Url: file.s3Url,
        starred: file.starred,
        trashed: file.trashed,
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Confirm upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to confirm upload' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(request, confirmUploadHandler);
}
