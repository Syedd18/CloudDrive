import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSignedUrlFromSupabase } from '@/lib/supabase';

interface RouteParams {
  params: {
    id: string;
  };
}

// Get shared file info (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        sharedWith: true,
        user: {
          select: {
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if file is publicly shared (either via public link or shared with users)
    const isPubliclyAccessible = (file.isPublic ?? false) || file.sharedWith.length > 0;
    
    if (!isPubliclyAccessible) {
      return NextResponse.json(
        { error: 'This file is not shared' },
        { status: 403 }
      );
    }

    // Generate a signed URL for preview
    let previewUrl = null;
    try {
      previewUrl = await getSignedUrlFromSupabase(file.s3Key, 3600);
    } catch (error) {
      console.error('Failed to generate preview URL:', error);
    }

    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        type: file.type,
        size: Number(file.size),
        mimeType: file.mimeType,
        previewUrl,
        thumbnail: file.thumbnail,
        createdAt: file.createdAt,
        canEdit: (file.isPublic ?? false) ? (file.publicLinkCanEdit ?? false) : false,
        owner: {
          name: file.user.name || 'Unknown',
          avatar: file.user.avatar,
        },
      },
    });
  } catch (error) {
    console.error('Share access error:', error);
    return NextResponse.json(
      { error: 'Failed to access shared file' },
      { status: 500 }
    );
  }
}

// Download shared file
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const file = await prisma.file.findUnique({
      where: { id: params.id },
      include: {
        sharedWith: true,
      },
    });

    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check if file is publicly accessible
    const isPubliclyAccessible = (file.isPublic ?? false) || file.sharedWith.length > 0;
    
    if (!isPubliclyAccessible) {
      return NextResponse.json(
        { error: 'This file is not shared' },
        { status: 403 }
      );
    }

    // Generate download URL
    const downloadUrl = await getSignedUrlFromSupabase(file.s3Key, 3600);

    return NextResponse.json({
      downloadUrl,
      fileName: file.originalName,
    });
  } catch (error) {
    console.error('Share download error:', error);
    return NextResponse.json(
      { error: 'Failed to download shared file' },
      { status: 500 }
    );
  }
}
