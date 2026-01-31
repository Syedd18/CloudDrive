import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { supabaseAdmin, STORAGE_BUCKET } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Get presigned URL for direct upload to Supabase
async function getPresignedUrlHandler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();
    const { filename, contentType, size, folderId } = body;

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    // Check file size limit (50MB for Supabase free tier)
    const maxSize = 50 * 1024 * 1024;
    if (size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size is 50MB` },
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
    const fileExtension = filename.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${uniqueFilename}`;

    // Create a signed URL for upload (valid for 10 minutes)
    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error) {
      console.error('Presign error:', error);
      return NextResponse.json(
        { error: 'Failed to create upload URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      token: data.token,
      filePath,
      folderId: folderId || null,
    });
  } catch (error) {
    console.error('Presign error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return requireAuth(request, getPresignedUrlHandler);
}
